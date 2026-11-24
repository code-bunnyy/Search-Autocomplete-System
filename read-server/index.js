import "dotenv/config";
import express from "express";
import cors from "cors";

import queryRoutes from "./routes/query.routes.js";

import { syncTrieIfChanged } from "./controllers/syncTrie.js";
import { SYSTEM_CONFIG } from "./config/system.config.js";


const app = express();
const PORT = process.env.PORT || 5000;
const TRIE_UPDATE_INTERVAL_MS = SYSTEM_CONFIG.trieUpdatePollingPeriod * 60 * 1000;

app.use(cors());
app.use(express.json());

await syncTrieIfChanged();


app.use("/api/query", queryRoutes);


app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});

setInterval(() => {
    syncTrieIfChanged().catch(() => {});
}, TRIE_UPDATE_INTERVAL_MS)