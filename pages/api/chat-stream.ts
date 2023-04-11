import { createParser } from "eventsource-parser";
import { NextRequest } from "next/server";
import { setCache } from "../cacheUtil";

async function createStream(req: NextRequest,uuid:string) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let apiKey = process.env.OPENAI_API_KEY;

  const userApiKey = req.headers.get("token");
  if (userApiKey) {
    apiKey = userApiKey;
    console.log("[Stream] using user api key");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
    body: req.body,
  });

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: any) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            setCache(uuid,"[DONE]");
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            setCache(uuid,text);
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream;
}

export default function POST(req: NextRequest) {
  try {
    let uuid = Math.round(Math.random()*1000000000).toString();
    createStream(req,uuid);
    return new Response(uuid);
  } catch (error) {
    console.error("[Chat Stream]", error);
  }
}

export const config = {
  runtime: "edge",
};
