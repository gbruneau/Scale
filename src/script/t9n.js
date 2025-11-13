'use strict';

/**
 * Translation class for a single
 * label in all the the supported languages
 * @class 
 */
class t9nLabel {
    /**
     * Label property as Key pair for each language using the languager is as a key
     */
    #Labels;
    /**
     * 
     * @param {*} keyPairs Array of key pair arrays (e.g. [["FR","Bonjour"]["EN","Hello"]])
     */
    constructor(keyPairs) {
        /** 
        @type array of key pair  (e.g. [["FR","Bonjour"]["EN","Hello"]])
        */
        this.#Labels = new Map(keyPairs);
    }
    /**
     * @method addLang add a translation of a label for a language
     * @param {string} aLang  A language code
     * @param {string} aTranslation Translation of the message 
     */
    addLang(aLang, aTranslation) {
        this.#Labels.set(aLang, aTranslation);
    }
    /**
     * @method Label Return a translated label
     * @param {string} aLang A language code (e.g. "FR")
     * @returns 
     */
    Label(aLang) {
        return this.#Labels.get(aLang);
    }
}

/**
 * @class
 * Translation Class supporting
 * all the labels in all the supported languages
 * @property {[strict]} SupportedLanguages Array of supported language codes
 * @property {string} CurLang Current Language Code
 * @property {string} UserLang User default browser language code
 */
class t9nTranslation {
    /**
     * @property {Array} SupportedLanguages Array of supported language codes
     */
    #Labels;
    #FallbackLanguage = "FR";

    /**
     * @param {Array} langArray Array of languages ID such as ["EN", "FR"]
       @param {string} fallbackLanguage Fallback language code if user language is not supported (default to "FR") 
     */
    constructor(langArray, fallbackLanguage = "FR") {

        this.#FallbackLanguage = fallbackLanguage;

        this.SupportedLanguages = [];
        this.#Labels = new Map();
        for (var u = 0; u < langArray.length; u++) {
            this.SupportedLanguages.push(langArray[u].toUpperCase());
        }
        if (this.SupportedLanguages.length > 0)
            this.#FallbackLanguage = this.SupportedLanguages[0];
        /**
         *  @property {string} CurLang Current Language Code
         */
        this.CurLang = this.UserLang; /* Default to user language */
    }

    /**
     * @property {string} UserLang User default browser language code
     */
    get UserLang() {
        const browserLang = (typeof navigator !== "undefined" && navigator.language)
            ? String(navigator.language).split("-")[0].toUpperCase()
            : this.#FallbackLanguage;
        return (this.SupportedLanguages && this.SupportedLanguages.includes(browserLang))
            ? browserLang
            : this.#FallbackLanguage;
    }
    /**
     * Add a label
     * @param {Sting} id unique id of the label
     * @param {t9nLabel} aT9nLabel labels for all the supported languages
     */
    addLabel(id, aT9nLabel) {
        this.#Labels.set(id, aT9nLabel);
    }

    /**
     * Retrieve a label in the selected language
     * @param {Number} id Unique ID of the label
     * @returns {String} A translated label in the selected language
     */
    getLabel(id) {
        // If id is a numeric string, convert to integer so map lookup matches numeric keys
        var key = id;
        if (typeof id === 'string') {
            var maybeInt = parseInt(id, 10);
            if (!Number.isNaN(maybeInt) && String(maybeInt) === id.trim()) {
                key = maybeInt;
            }
        }

        var labelT9N = this.#Labels.get(key);
        if (labelT9N != null) {
            let label = labelT9N.Label(this.CurLang);
            if (label == null) label = labelT9N.Label(this.#FallbackLanguage);
            return label;
        }
        return id;
    }
    /**
     * Utility to translate the labels text content of all the elements matching a query selector
     * @param {*} aQuerySelector  Query selector to find the elements to translate(default to [data-label-id])     
     * @param {*} labelAttr Attribute containing the label ID (default to data-label-id)
     */
    translateLabels(aQuerySelector = "[data-label-id]", labelAttr = "data-label-id") {
        var elements = document.querySelectorAll(aQuerySelector);
        elements.forEach((el) => {
            var id = el.getAttribute(labelAttr);
            var label = this.getLabel(id);
            el.textContent = (label != null) ? label : `*LABEL [${id}]*`;
        });
    }
}

export { t9nLabel, t9nTranslation }
