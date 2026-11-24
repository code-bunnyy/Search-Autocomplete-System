import { SYSTEM_CONFIG } from "./system.config.js";

const n = 1e6;
export const LOOKUP_TABLE_CONFIG = {
    maxNumberOfPrefixes: n,
    tableSize: n * SYSTEM_CONFIG.numberOfSuggestions,
}