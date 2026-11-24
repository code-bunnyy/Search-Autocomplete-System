import { Trie } from "../data-structures/Trie.js"

let termTrie = new Trie();

export const updateTermTrie = (newTrie) => {
    termTrie = newTrie;
}

export { termTrie };
