import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { rebuildTrie } from "./rebuildTrie.js";

const s3 = new S3Client({ region: "ap-southeast-2" });

let loadedETag = null;
let syncInProgress = false;

const logWithTimestamp = (message) => {
    const timestamp = new Date().toLocaleString();

    console.log(`\x1b[33m[${timestamp}]\x1b[0m ${message}`);
};

export const syncTrieIfChanged = async () => {
    if (syncInProgress) return;

    syncInProgress = true;
    logWithTimestamp("Checking S3 for terms file updates.");

    try {
        const { ETag } = await s3.send(
            new HeadObjectCommand({
                Bucket: process.env.S3_BUCKET_PATH,
                Key: "terms/terms.jsonl.gz",
            })
        );

        if (ETag === loadedETag) {
            logWithTimestamp("Terms file in AWS S3 has not changed, continuing with existing data.");
            return; // File has not changed
        }

        await rebuildTrie();
        loadedETag = ETag;

        logWithTimestamp("Trie updated from S3.");
    } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Trie sync failed:`, error);
        throw error;
    } finally {
        syncInProgress = false;
    }
};
