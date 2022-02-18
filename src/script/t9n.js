'use strict'; 

/**
 * Translation class for a single
 * label in all the the supported languages
 */
class t9nLabel {
    /**
     * Label property as Key pair for each language using the languager is as a key
     */
    #Labels;
    /**
     * 
     * @param {*} keyPairs 
     */
    constructor(keyPairs) {
        this.#Labels = new Map(keyPairs);
    }
    addLang(aLang, aTranslation) {
        this.#Labels.set(aLang, aTranslation);
    }
    Label(aLang) {
        return this.#Labels.get(aLang);
    }
}

/**
 * Translation Class supporting
 * all the labels in all the supported languages
 */
class t9nTranslation {
    /**
     * Fallback Language if user language is not supported
     */
    #FallbackLanguage = "EN";
    /**
     * Map of all the transltable labels
     */
    #Labels;
    /**
     * @param {Array} langArray Array of languages ID such as ["EN", "FR"]
     */
    constructor(langArray) {
        this.SupportedLanguages = [];
        this.#Labels = new Map();
        for (var u = 0; u < langArray.length; u++) {
            this.SupportedLanguages.push(langArray[u].toUpperCase());
        }
        if (this.SupportedLanguages.length > 0)
            this.#FallbackLanguage = this.SupportedLanguages[0];
        this.CurLang = this.UserLang; /* Default to user language */
    }
    /**
     * Get the user language from the web browser default
     */
    get UserLang() {
        var l = navigator.language.split("-")[0].toUpperCase();
        var r = this.#FallbackLanguage; /* if not supported, fallback language */
        for (var i = 0; i < this.SupportedLanguages.length; i++)
            if (this.SupportedLanguages[i] == l) r = l;
        return r;
    }
    /**
     * Change the current language
     * @param {String} newLang Language ID such as FR ou EN.
     */
    setCurlang(newLang){
        this.CurLang=newLang;
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
     * Retrieve a lable in the current language
     * @param {Number} id Unique ID of the label
     * @returns {String} A translated label in the current language
     */
    getLabel(id) {
        // Get label in current language
        var labelT9N = this.#Labels.get(id);
        if (labelT9N != null) {
            let label = labelT9N.Label(this.CurLang);
            if (label == null) label = labelT9N.Label(this.#FallbackLanguage);
            return label;
        }
    }
}

export {t9nLabel,t9nTranslation}
