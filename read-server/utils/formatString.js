export const formatString = (value, convertToLowerCase = false) => {
    if (typeof value !== "string") {
        return value;
    }

    value = value.trim().replace(/\s+/g, " ");

    if(convertToLowerCase) value = value.toLowerCase();

    return value;
}