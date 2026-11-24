export class LFUCache {
    #capacity;
    #entries = new Map();
    #frequencyBuckets = new Map();
    #minFrequency = 0;

    constructor(capacity) {
        this.#capacity = capacity;
    }

    get(key) {
        const entry = this.#entries.get(key);

        if (!entry) return undefined;

        this.#increaseFrequency(key, entry);

        return entry.value;
    }

    set(key, value) {
        if (this.#capacity <= 0) return;

        const entry = this.#entries.get(key);

        if (entry) {
            entry.value = value;
            this.#increaseFrequency(key, entry);
            return;
        }

        if (this.#entries.size >= this.#capacity) {
            this.#evictLeastFrequentlyUsed();
        }

        this.#entries.set(key, {
            value,
            frequency: 1,
        });

        this.#getFrequencyBucket(1).set(key, true);
        this.#minFrequency = 1;
    }

    clear() {
        this.#entries.clear();
        this.#frequencyBuckets.clear();
        this.#minFrequency = 0;
    }

    #increaseFrequency(key, entry) {
        const oldFrequency = entry.frequency;
        const oldBucket = this.#frequencyBuckets.get(oldFrequency);

        oldBucket.delete(key);

        if (oldBucket.size === 0) {
            this.#frequencyBuckets.delete(oldFrequency);

            if (this.#minFrequency === oldFrequency) {
                this.#minFrequency++;
            }
        }

        entry.frequency++;
        this.#getFrequencyBucket(entry.frequency).set(key, true);
    }

    #evictLeastFrequentlyUsed() {
        const bucket = this.#frequencyBuckets.get(this.#minFrequency);
        const keyToEvict = bucket.keys().next().value;

        bucket.delete(keyToEvict);
        this.#entries.delete(keyToEvict);

        if (bucket.size === 0) {
            this.#frequencyBuckets.delete(this.#minFrequency);
        }
    }

    #getFrequencyBucket(frequency) {
        if (!this.#frequencyBuckets.has(frequency)) {
            this.#frequencyBuckets.set(frequency, new Map());
        }

        return this.#frequencyBuckets.get(frequency);
    }
}