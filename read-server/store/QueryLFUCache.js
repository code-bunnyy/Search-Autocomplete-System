import { LFUCache } from "../data-structures/LFUCache.js";
import { LFUCacheConfig } from "../config/LFUCache.config.js";


export const queryCache = new LFUCache(LFUCacheConfig.cacheCapacity);
