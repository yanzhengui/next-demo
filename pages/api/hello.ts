// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getCache } from '../cacheUtil';

type Data = {
  msg: string,
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let {queryId} = req.query;
  console.log("queryId==>"+queryId);
  if(queryId == null){
    res.status(400).json({ msg: 'error:queryId为空' })
  }else{
    let cache = getCache(queryId[0])||'';
    res.status(200).json({msg:cache});
  }
}
