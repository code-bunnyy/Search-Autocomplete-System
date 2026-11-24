/*
    trienode {
        termIndex: Number : -1 if not a valid term,
        children: Map(),
    }
*/

export class TrieNode {
    #termIndex = -1;
    #lookupTableIndex = -1;
    #characterEdges = {};

    setTermIndex(index) {
        this.#termIndex = index;
    }

    getTermIndex() {
        return this.#termIndex;
    }

    //==================================================

    getLookupTableIndex() {
        return this.#lookupTableIndex;
    }

    setLookupTableIndex(index = -1) {
        this.#lookupTableIndex = index;
    }

    //==================================================

    hasCharacterEdge(character) {
        return Object.hasOwn(this.#characterEdges, character);
    }

    addCharacterEdge(character, node) {
        this.#characterEdges[character] = node;
    }

    getCharacterEdge(character) {
        return this.#characterEdges[character];
    }

    getAllCharacterEdges() {
        return Object.entries(this.#characterEdges);
    }   
}