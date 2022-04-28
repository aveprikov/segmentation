/**
 * SegmAB, segmenting website visitors
 * Copyright (c) 2020-present, Andrey Veprikov
 *
 * This source code is licensed under the MIT license available here - 
 * https://raw.githubusercontent.com/aveprikov/segmentation/main/LICENSE
 */

"use strict";
(() => {
    window["segmab"] = window["segmab"] || function () { window["segmab"].queue = window["segmab"].queue || [...arguments] };

    if (!Array.prototype.flat) {
        Array.prototype.flat = function () {
            let deep = arguments.length == 0 ? 0 : arguments[0];
            return deep > 0
                ?
                this.reduce((arr, item) => arr.concat(Array.isArray(item) ? item.flat(deep - 1) : item), [])
                :
                this.slice();
        }
    }

    let Core = {
        getSegmentCookieName() {
            return `${this["prefix"]}VisitorSegment`;
        },

        getAlphabet(count) {
            let start = 9;
            return [...Array(count)].map(x => (++start).toString(36).toUpperCase());
        },

        createCookie(name, value, days) {
            let expires = '';
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = `expires=${date.toGMTString()}`;
            }

            document.cookie = `${encodeURI(name)}=${encodeURI(value)}; ${expires}; domain=; path=/`;
        },

        readCookie(name) {
            const nameEQ = encodeURI(name) + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trim();
                if (c.indexOf(nameEQ) === 0) return decodeURI(c.substring(nameEQ.length, c.length)).toUpperCase();
            }
            return null;
        },

        createSegment(segmentsCount) {
            const date = new Date();
            const segment = this.getAlphabet(segmentsCount)[parseInt(date.getMilliseconds().toString(segmentsCount).slice(-1), segmentsCount)];
            this.createCookie(this.getSegmentCookieName(), segment, this["days"]);
            return segment;
        },

        getSegment(callback) {
            if (typeof this["prefix"] != "string" || this["prefix"].length == 0) {
                throw "The \"prefix\" parameter shouldn't be an empty string";
            }

            if (typeof this["segments_number"] != "number" || this["segments_number"] < 2 || this["segments_number"] > 26 || !Number.isInteger(this["segments_number"])) {
                throw "The \"segments_number\" parameter should be an integer number between 2 and 26";
            }

            if (typeof this["days"] != "number" || this["days"] < 0 || !Number.isInteger(this["days"])) {
                throw "The \"days\" parameter should be an integer number greater than or equal to zero";
            }

            let segment = this.readCookie(this.getSegmentCookieName());
            if (!segment || !(this.getAlphabet(this["segments_number"]).indexOf(segment) + 1)) {
                segment = this.createSegment(this["segments_number"]);
            }
            if (typeof callback == "function") callback(segment);

            return segment;
        }
    };

    const queue = window["segmab"].queue;
    (window["segmab"] = function (command) {
        command = [...arguments].flat(Infinity);
        if (typeof command == "undefined" || typeof command[0] == "undefined") return;
        Core = { ...Core, ...command[0] };
        return Core.getSegment(command[1]);
    })([queue]);
})();
