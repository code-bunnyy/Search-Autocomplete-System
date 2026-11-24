import { formatString } from "./formatString.js";

export const validTerm = (term) => {
    if (typeof term !== "string") return false;

    term = formatString(term);

    if(term.length <= 0 || term.length > 50) return false;
    else return true;
}