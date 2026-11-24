import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import zlib from "node:zlib";
import readline from "node:readline";

import "dotenv/config.js";

import { Trie } from "../data-structures/Trie.js";

import { validTerm } from "../utils/validTerm.js";
import { formatString } from "../utils/formatString.js";

import { PRIORITY_WEIGHTS } from "../config/priorityModel.config.js";

import { updateTermTrie } from "../store/TermTrie.js";
import { updateTermStoreArray } from "../store/TermStoreArray.js";
import { queryCache } from "../store/QueryLFUCache.js";
import { LOOKUP_TABLE_CONFIG } from "../config/lookupTable.config.js";
import { setLookupTable } from "../store/LookupTable.js";

export const rebuildTrie = async () => {
    try {
        const s3 = new S3Client({ region: "ap-southeast-2" });

        console.log("Bucket Path : ", process.env.S3_BUCKET_PATH);
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_PATH,
            Key: "terms/terms.jsonl.gz",
        });

        const { Body } = await s3.send(command);

        const lines = readline.createInterface({
            input: Body.pipe(zlib.createGunzip()),
            crlfDelay: Infinity,
        });

        const new_term_store_array = [];

        let maxRecencyValue = 0,
            maxPopularityValue = 0;

        for await (const line of lines) {
            if (!line.trim()) continue;
            const item = JSON.parse(line);

            if (!validTerm(item.term)) continue;

            item.term = formatString(item.term);
            new_term_store_array.push(item);
            maxRecencyValue = Math.max(maxRecencyValue, item.R)
            maxPopularityValue = Math.max(maxPopularityValue, item.P);
        }

        const new_trie = new Trie();

        new_term_store_array.forEach((item, index) => {
            let normalizedPopularity = (maxPopularityValue === 0)
                ? item.P
                : (item.P / maxPopularityValue);
            let normalizedRecency = (maxRecencyValue === 0)
                ? item.R
                : (item.R / maxRecencyValue);

            item.priority = 
                PRIORITY_WEIGHTS.recency * normalizedRecency +
                PRIORITY_WEIGHTS.popularity * normalizedPopularity +
                PRIORITY_WEIGHTS.ctr * item.CTR;

            new_trie.insert(formatString(item.term, true), index);
        });

        
        let newLookupTable = new Int32Array(LOOKUP_TABLE_CONFIG.tableSize).fill(-1);

        new_trie.assignPrefixLookupTableIndexes()
        new_trie.preComputeSuggestions(newLookupTable, new_term_store_array);

        setLookupTable(newLookupTable);
        updateTermTrie(new_trie);
        updateTermStoreArray(new_term_store_array);
        queryCache.clear();

        console.log("Trie rebuilt successfully");
    }

    catch (error) {
        console.error("Error rebuilding trie:", error);
        throw error;
    }
}
