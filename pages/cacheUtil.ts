const CACHE = new Map<string,string>();
export function setCache(key:string,value:string){
    let pre = CACHE.get(key)||'';
    CACHE.set(key,pre+value);
    return true;
}

export function getCache(key:string){
    let cache = CACHE.get(key);
    CACHE.delete(key);
    return cache;
}