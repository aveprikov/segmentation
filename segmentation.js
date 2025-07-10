/**
 * SegmAB, segmenting website visitors
 * Copyright (c) 2020-present, Andrey Veprikov
 *
 * This source code is licensed under the MIT license available here - 
 * https://raw.githubusercontent.com/aveprikov/segmentation/main/LICENSE
 */

"use strict";

(() => {
    /**
     * Visitor segmentation handler using localStorage.
     */
    class Segmentation {
        /**
         * @param {object} config - Configuration object
         * @param {string} config.prefix - Storage key prefix
         * @param {number} config.segments_number - Number of audience segments (2–26)
         * @param {number} config.days - Number of days the segment persists
         * @throws {TypeError|Error} If parameters are missing or invalid
         */
        constructor(config) {
            if (!config || typeof config !== "object" || Array.isArray(config)) {
                throw new TypeError("Invalid config: expected a non-array object");
            }

            const { prefix, segments_number, days } = config;

            if (typeof prefix !== "string" || !prefix.length)
                throw new Error('"prefix" must be a non-empty string');
            if (!Number.isInteger(segments_number) || segments_number < 2 || segments_number > 26)
                throw new Error('"segments_number" must be an integer between 2 and 26');
            if (!Number.isInteger(days) || days <= 0)
                throw new Error('"days" must be a positive integer');

            /** @private */
            this.prefix = prefix;
            /** @private */
            this.segmentsNumber = segments_number;
            /** @private */
            this.days = days;
        }

        /**
         * Gets the localStorage key used to store the segment.
         * @returns {string}
         */
        get storageKey() {
            return `${this.prefix}VisitorSegment`;
        }

        /**
         * Generates an array of segment identifiers (A–Z).
         * @returns {string[]}
         */
        getAlphabet() {
            return Array.from({ length: this.segmentsNumber }, (_, i) =>
                (10 + i).toString(36).toUpperCase()
            );
        }

        /**
         * Stores the segment value in localStorage with expiration.
         * @param {string} value - Segment identifier
         */
        setLocalStorage(value) {
            localStorage.setItem(this.storageKey, value);
            localStorage.setItem(
                `${this.storageKey}_expiration`,
                (Date.now() + this.days * 864e5).toString()
            );
        }

        /**
         * Retrieves the stored segment if not expired.
         * @returns {string|null}
         */
        getLocalStorage() {
            const exp = parseInt(localStorage.getItem(`${this.storageKey}_expiration`), 10);
            if (Date.now() < exp) {
                return localStorage.getItem(this.storageKey);
            } else {
                this.removeLocalStorage();
                return null;
            }
        }

        /**
         * Removes the segment and its expiration from localStorage.
         */
        removeLocalStorage() {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(`${this.storageKey}_expiration`);
        }

        /**
         * Creates a new segment identifier and stores it.
         * @returns {string} The created segment ID
         */
        createSegment() {
            const msDigit = new Date().getMilliseconds().toString(this.segmentsNumber).slice(-1);
            const alphabet = this.getAlphabet();
            const segment = alphabet[parseInt(msDigit, this.segmentsNumber)];
            this.setLocalStorage(segment);
            return segment;
        }

        /**
         * Gets or creates a segment, and calls back if provided.
         * @param {function(string):void} [callback] - Optional callback with segment
         * @returns {string} Segment ID
         */
        getSegment(callback) {
            let segment = this.getLocalStorage();
            const alphabet = this.getAlphabet();
            if (!segment || !alphabet.includes(segment)) {
                segment = this.createSegment();
            }
            if (typeof callback === "function") callback(segment);
            return segment;
        }
    }

    /**
     * Global entry point for segmentation.
     * Compatible with usage:
     * segmab({ prefix, segments_number, days }, callback)
     *
     * @param {object} config - Configuration object
     * @param {function(string):void} [callback] - Optional callback
     * @returns {string} Segment
     */
    const segmab = (...args) => {
        const [config, callback] = args;
        const instance = new Segmentation(config);
        return instance.getSegment(callback);
    };

    window.segmab = segmab;
})();
