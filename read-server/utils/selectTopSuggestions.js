import { PriorityQueue } from "@datastructures-js/priority-queue";
import { SYSTEM_CONFIG } from "../config/system.config.js";

export const selectTopSuggestions = (lists, new_term_store_array) => {
    const pq = new PriorityQueue((a, b) => {
        return new_term_store_array[b.termIndex].priority -
            new_term_store_array[a.termIndex].priority;
    })

    let n = lists.length, result = [];
    let currIndex = new Int16Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        if (currIndex[i] < lists[i].length) {
            pq.enqueue({
                termIndex: lists[i][currIndex[i]],
                listId: i,
            });
            currIndex[i]++;
        }
    }

    while (!pq.isEmpty() &&
        result.length < SYSTEM_CONFIG.numberOfSuggestions) {
        let {termIndex, listId} = pq.dequeue();
        result.push(termIndex);
        
        if(currIndex[listId] < lists[listId].length) {
            pq.enqueue({
                termIndex: lists[listId][currIndex[listId]],
                listId
            });
            currIndex[listId]++;
        }
    }

    return result;
}