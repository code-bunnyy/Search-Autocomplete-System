import { LOOKUP_TABLE_CONFIG } from "../config/lookupTable.config.js";

let lookupTable = new Int32Array(LOOKUP_TABLE_CONFIG.tableSize).fill(-1);

export const setLookupTable = (newLookupTable) => {
    lookupTable = newLookupTable;
}

export { lookupTable };