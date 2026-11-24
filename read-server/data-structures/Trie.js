import { TrieNode } from './TrieNode.js';
import { PriorityQueue } from "@datastructures-js/priority-queue";
import { SYSTEM_CONFIG } from '../config/system.config.js';
import { selectTopSuggestions } from '../utils/selectTopSuggestions.js';
import { LOOKUP_TABLE_CONFIG } from '../config/lookupTable.config.js';
import { lookupTable } from '../store/LookupTable.js';
import { TRIE_CONFIG } from '../config/trie.config.js';

export class Trie {
    #root = new TrieNode();

    insert(term, index) {
        let currentNode = this.#root;

        for (const character of term) {
            if (!currentNode.hasCharacterEdge(character)) {
                currentNode.addCharacterEdge(character, new TrieNode());
            }

            currentNode = currentNode.getCharacterEdge(character);
        }

        currentNode.setTermIndex(index);
    }

    query(term) {
        let currentNode = this.#root;
        for (const character of term) {
            if (!currentNode.hasCharacterEdge(character)) {
                return { results: [], nodeVisits: 0 };
            }

            currentNode = currentNode.getCharacterEdge(character);
        }

        let results = [], nodeVisits = 0;

        if (currentNode.getLookupTableIndex() !== -1) {
            var start = currentNode.getLookupTableIndex();
            for (let i = start;
                i < start + SYSTEM_CONFIG.numberOfSuggestions;
                i++) {
                    if(lookupTable[i] !== -1) {
                        results.push(lookupTable[i]);
                    }
            }

            return {results, nodeVisits};
        }

        const traverse = (node, depth) => {
            if (depth > TRIE_CONFIG.maxDepthOfSubtreeSearch) return;
            
            nodeVisits++;
            
            if (node.getTermIndex() !== -1) {
                results.push(node.getTermIndex());
            }

            for (const [_, childNode] of node.getAllCharacterEdges()) {
                traverse(childNode, depth + 1);
            }
        };


        traverse(currentNode, 0);

        return { results, nodeVisits };
    }


    nodesCounter(maxDepth = 0) {
        let rootNode = this.#root;
        let nodeCounter = 0;

        const traverse = (node, depth) => {
            if (depth > maxDepth) return;
            nodeCounter++;

            for (const [_, childNode] of node.getAllCharacterEdges()) {
                traverse(childNode, depth + 1);
            }
        };

        traverse(rootNode, 0);

        return nodeCounter;
    }

    assignPrefixLookupTableIndexes() {
        let pq = new PriorityQueue((a, b) => {
            return a.subtreeTermCount - b.subtreeTermCount;
        })

        const traverse = (node) => {
            let termsCount = (node.getTermIndex() === -1) ? 0 : 1;

            for (let [_, childNode] of node.getAllCharacterEdges()) {
                termsCount += traverse(childNode);
            }

            if (node !== this.#root) pq.enqueue({
                subtreeTermCount: termsCount,
                trieNode: node,
            });

            if (pq.size() > LOOKUP_TABLE_CONFIG.maxNumberOfPrefixes) {
                pq.dequeue();
            }

            return termsCount;
        }

        traverse(this.#root);

        let smallestEmptyPosition = 0;

        while (!pq.isEmpty()) {
            let item = pq.dequeue();
            item.trieNode.setLookupTableIndex(smallestEmptyPosition);
            smallestEmptyPosition += SYSTEM_CONFIG.numberOfSuggestions;
        }
    }

    preComputeSuggestions(newLookupTable, new_term_store_array) {

        const preCompute = (node) => {
            let topContenders = [];

            if (node.getTermIndex() !== -1) {
                topContenders.push([node.getTermIndex()]);
            }

            for (let [_, childNode] of node.getAllCharacterEdges()) {
                topContenders.push(preCompute(childNode));
            }

            let topSuggestions = selectTopSuggestions(topContenders, new_term_store_array);

            if (node.getLookupTableIndex() !== -1) {
                let start = node.getLookupTableIndex();
                for (let i = 0; i < topSuggestions.length; i++) {
                    newLookupTable[start + i] = topSuggestions[i];
                }
            }

            return topSuggestions;
        }

        preCompute(this.#root);
    }
}