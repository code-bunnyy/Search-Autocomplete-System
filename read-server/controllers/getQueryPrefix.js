import { termTrie } from "../store/TermTrie.js";
import { termStoreArray } from "../store/TermStoreArray.js";
import { formatString } from "../utils/formatString.js";
import { queryCache } from "../store/QueryLFUCache.js";
import { LFUCacheConfig } from "../config/LFUCache.config.js";

export const getQueryPrefix = (req, res) => {
    const prefix = req.query.prefix;
    const formattedPrefix = formatString(prefix, true);

    if (typeof formattedPrefix !== "string" || !formattedPrefix) {
        return res.status(400).json({
            message: "Query parameter 'prefix' requires valid non-empty string value.",
        });
    }

    let indexes = queryCache.get(formattedPrefix),
        visitedNodes = null;

    if (indexes === undefined) {
        const { results, nodeVisits } = termTrie.query(formattedPrefix);
        
        indexes = results;
        visitedNodes = nodeVisits;

        indexes.sort((a, b) => {
            return termStoreArray[b].priority - termStoreArray[a].priority;
        });

        indexes = indexes.slice(0, 10);

        if(visitedNodes > LFUCacheConfig.minimumNodeVisitsForCaching) {
            queryCache.set(formattedPrefix, indexes);
        }
    }

    const suggestions = indexes.map((index) => termStoreArray[index]);

    return res.status(200).json({
        suggestions,
        visitedNodes,
    });
}
