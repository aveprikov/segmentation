"use strict";
(customSettings => {
    if (typeof customSettings.prefix != "string" || customSettings.prefix.length == 0) {
        throw "The \"prefix\" parameter shouldn't be an empty string";
    };

    ({
        ...{
            GetSegmentCookieName() {
                return `${this["prefix"]}VisitorSegment`;
            },

            GetAlphabet(count) {
                let start = 9;
                return Array.apply(null, Array(count)).map(x => (++start).toString(36).toUpperCase());
            },
        
            GetMainDomain() {
                const host = document.location.hostname;
                const hostParts = host.split('.');
                if (hostParts.length > 1) 
                    return hostParts.slice(-2).join('.');
                else
                    return host;
            },

            CreateCookie(name, value, days) {
                let expires = '';
                if (days) {
                    const date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "expires=" + date.toGMTString();
                }

                const domain = "domain=." + this.GetMainDomain();
                document.cookie = `${encodeURI(name)}=${encodeURI(value)}; ${expires}; ${domain}; path=/`;
            },

            ReadCookie(name) {
                const nameEQ = encodeURI(name) + "=";
                const ca = document.cookie.split(';');
                for (let i = 0; i < ca.length; i++) {
                    let c = ca[i].trim();
                    if (c.indexOf(nameEQ) === 0) return decodeURI(c.substring(nameEQ.length, c.length)).toUpperCase();
                }
                return null;
            },

            CreateSegment(segmentsCount) {
                const date = new Date();
                const segment = this.GetAlphabet(segmentsCount)[parseInt(date.getMilliseconds().toString(segmentsCount).slice(-1), segmentsCount)];
                this.CreateCookie(this.GetSegmentCookieName(), segment, this["days"]);
                return segment;
            },

            SetGoogleAnalytics(name, segment) {
                if (typeof ga != "undefined" && name.length > 0) ga("set", name, segment);
            },

            GetSegment() {
                if (typeof this["segments_number"] != "number" || this["segments_number"] < 2 || this["segments_number"] > 26) {
                    throw "The \"segments_number\" parameter should be a number between 2 and 26";
                }

                if (typeof this["days"] != "number" || this["days"] < 0) {
                    throw "The \"days\" parameter should be a number greater than or equal to zero";
                }

                let segment = this.ReadCookie(this.GetSegmentCookieName());
                if (!segment || !(this.GetAlphabet(this["segments_number"]).indexOf(segment) + 1)) {
                    segment = this.CreateSegment(this["segments_number"]);
                }
                window[`${this["prefix"]}_segment`] = segment;
                this.SetGoogleAnalytics(this["ga_dimension"], segment);
            }
        },
        ...customSettings
    }).GetSegment();

})({
    "segments_number": 3,
    "ga_dimension": "dimension1",
    "prefix": "custom",
    "days": 0
});
