import { t9nLabel } from "./t9n.js";

/**
 * Represents a single measurement unit.
 */
class Unit {
    /**
     * Create a Unit.
     * @param {number} aSizeInMeter Size of the unit in meters.
     * @param {t9nLabel} aT9nUnitSymbol Unit symbol as a translatable label.
     * @param {t9nLabel} aT9nUnitName Unit name as a translatable label.
     * @param {t9nLabel} aT9nUnitDescription Unit description as a translatable label.
     */
    constructor(aSizeInMeter, aT9nUnitSymbol, aT9nUnitName, aT9nUnitDescription) {
        /**
         * Translatable symbol label.
         * @type {t9nLabel}
         */
        this.UnitSymbol = aT9nUnitSymbol;
        /**
         * Size of this unit in meters.
         * @type {number}
         */
        this.SizeInMeter = aSizeInMeter;
        /**
         * Translatable unit name.
         * @type {t9nLabel}
         */
        this.UnitName = aT9nUnitName;
        /**
         * Translatable unit description.
         * @type {t9nLabel}
         */
        this.UnitDesc = aT9nUnitDescription;
    }

    /**
     * Get localized unit symbol.
     * @param {string} aLang Language code (e.g. "FR", "EN").
     * @returns {string} Localized unit symbol.
     */
    getUnitSymbol(aLang) {
        return this.UnitSymbol.Label(aLang);
    }

    /**
     * Get localized unit name.
     * @param {string} aLang Language code (e.g. "FR", "EN").
     * @returns {string} Localized unit name.
     */
    getUnitName(aLang) {
        return this.UnitName.Label(aLang);
    }

    /**
     * Get localized unit description.
     * @param {string} aLang Language code (e.g. "FR", "EN").
     * @returns {string} Localized unit description.
     */
    getUnitDesc(aLang) {
        return this.UnitDesc.Label(aLang);
    }
}


/**
 * Collection and utilities for Units.
 */
class Units {
    /**
     * Construct an empty Units collection.
     */
    constructor() {
        /**
         * Array of Unit instances.
         * @type {Unit[]}
         */
        this.UnitList = [];
    }

    /**
     * Add a new Unit to the collection.
     * @param {number} aSizeInMeter Unit size in meters.
     * @param {t9nLabel} at9nSymbol Unit symbol label.
     * @param {t9nLabel} at9nName Unit name label.
     * @param {t9nLabel} at9nDesc Unit description label.
     * @returns {void}
     */
    addUnit(aSizeInMeter, at9nSymbol, at9nName, at9nDesc) {
        // Ensure size is stored as a Number (prevent lexicographic sort when values are strings)
        let numericSize = Number(aSizeInMeter);
        if (Number.isNaN(numericSize)) numericSize = parseFloat(aSizeInMeter) || 0;
        let newUnit = new Unit(numericSize, at9nSymbol, at9nName, at9nDesc);
        this.UnitList.push(newUnit);
    }

    /**
     * Determine the most appropriate unit for a given size in meters.
     * The list is sorted and the largest unit whose log10(size) is <= log10(aSizeInMeter)
     * is returned.
     * @param {number} aSizeInMeter Value in meters.
     * @returns {Unit} Best matching Unit.
     */
    getBestUnit(aSizeInMeter) {
        this.sortBySize();

        var bestUnit = this.UnitList[0];
        for (var aUnitId = 0; aUnitId < this.UnitList.length; aUnitId++) {
            if (Math.log10(this.UnitList[aUnitId].SizeInMeter) <= Math.log10(aSizeInMeter)) {
                bestUnit = this.UnitList[aUnitId];
            }
        }
        return bestUnit;
    }

    /**
     * Sort UnitList by Size In Meter ascending.
     * @returns {void}
     */
    sortBySize() {
        // Numeric ascending sort (works reliably even if SizeInMeter came as a string)
        this.UnitList.sort(function (a, b) {
            return a.SizeInMeter - b.SizeInMeter;
        });
    }
}

class ScaleObject {
    #Unit;
    #Labelt9n;
    /**
     * Create a ScaleObject from raw JSON and a Units reference.
     * @param {Object} objectJson Raw object data (expects ObjectFr, ObjectEn, SizeInMeter, URL).
     * @param {Units} refUnits Reference Units collection used to select unit.
     */
    constructor(objectJson, refUnits) {
        var newLabel = new t9nLabel([
            ["FR", objectJson.ObjectFr],
            ["EN", objectJson.ObjectEn]
        ]);
        /**
         * Raw base object as read from JSON.
         * @type {Object}
         */
        this.BaseObject = objectJson;
        /**
         * Translatable label for the object name.
         * @type {t9nLabel}
         * @private
         */
        this.#Labelt9n = newLabel;
        /**
         * Size of the object in meters.
         * @type {number}
         */
        this.SizeInMeter = parseFloat(objectJson.SizeInMeter);

        /**
         * Indicates if the object represents a distance (true) or a size (false).
         * @type {boolean}
         */
        this.IsDistance = (objectJson.IsDistance.toLowerCase() === "true");

        /**
         * URL associated with the object.
         * @type {string}
         */
        this.URL = objectJson.URL;
        /**
         * Selected Unit for this object (based on refUnits).
         * @type {Unit}
         * @private
         */
        this.#Unit = refUnits.getBestUnit(this.SizeInMeter);
        /**
         * Size expressed in the selected unit.
         * @type {number}
         */
        this.SizeInUnit = this.SizeInMeter / this.#Unit.SizeInMeter;
    }

    /**
     * Get localized object name.
     * @param {string} aLang Language code (e.g. "FR", "EN").
     * @returns {string} Localized object name.
     */
    getObjectName(aLang) {
        return this.#Labelt9n.Label(aLang);
    }

    /**
     * Get the localized symbol of the object's unit.
     * @param {string} aLang Language code.
     * @returns {string} Localized unit symbol.
     */
    getUnitSymbol(aLang) {
        return this.#Unit.getUnitSymbol(aLang);
    }

    /**
     * Get the localized name of the object's unit.
     * @param {string} aLang Language code.
     * @returns {string} Localized unit name.
     */
    getUnitName(aLang) {
        return this.#Unit.getUnitName(aLang);
    }

    /**
     * Get the localized description of the object's unit.
     * @param {string} aLang Language code.
     * @returns {string} Localized unit description.
     */
    getUnitDesc(aLang) {
        return this.#Unit.getUnitDesc(aLang);
    }
}

class ScaleObjects {
    /**
     * Construct the collection.
     * @param {Units} theUnits Units collection used for conversions.
     */
    constructor(theUnits) {
        /**
         * Array of ScaleObject.
         * @type {ScaleObject[]}
         */
        this.ObjectList = [];
        /**
         * Reference to units collection.
         * @type {Units}
         */
        this.Units = theUnits;
    }

    /**
     * Add an object (from JSON) to the collection.
     * @param {Object} objectJson Object data as JavaScript object.
     * @returns {void}
     */
    addObject(objectJson) {
        var newObj = new ScaleObject(objectJson, this.Units)
        this.ObjectList.push(newObj);
    }

    /**
     * Sort objects by size in meters ascending.
     * @returns {void}
     */
    sortBySize() {
        this.ObjectList.sort(function (a, b) {
            if (a.SizeInMeter < b.SizeInMeter) {
                return -1;
            }
            if (a.SizeInMeter > b.SizeInMeter) {
                return 1;
            }
            return 0;
        });
    }

    /**
     * Sort objects by localized name.
     * @param {string} aLang Language code used for name comparison.
     * @returns {void}
     */
    sortByName(aLang) {
        this.ObjectList.sort(function (a, b) {
            var nameA = a.getObjectName(aLang).toUpperCase();
            var nameB = b.getObjectName(aLang).toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
    }

    /**
     * Find an object by its localized name.
     * @param {string} aName Localized name to search for.
     * @param {string} aLang Language code of the name.
     * @returns {ScaleObject|null} Found ScaleObject or null if not found.
     */
    getObjectByName(aName, aLang) {
        var r = -1;
        var curName;
        for (var i = 0; i < this.ObjectList.length; i++) {
            curName = this.ObjectList[i].getObjectName(aLang);
            if (curName == aName) {
                r = i;
            }
        }
        return r != -1 ? this.ObjectList[r] : null;
    }

    /**
     * Find an object matching a size (with ±10% tolerance).
     * Useful to find an object of similar magnitude for a given size.
     * @param {number} aSizeInMeter Size to match in meters.
     * @returns {ScaleObject|undefined} Matching object or undefined if none.
     */
    getObjectBySize(aSizeInMeter) {
        /**
         * 
         */
        const tolerance = 0.1;
        var minSize = aSizeInMeter * (1 - tolerance);
        var maxSize = aSizeInMeter * (1 + tolerance);
        var i;
        var curObj;
        var resObject;
        for (i = 0; i < this.ObjectList.length; i++) {
            curObj = this.ObjectList[i];
            if ((curObj.SizeInMeter >= minSize)
                && (curObj.SizeInMeter <= maxSize)
            ) {
                resObject = curObj;
            }
        }
        return resObject;
    }

    /**
     * Return an array of localized object names, sorted by name.
     * @param {string} aLang Language code.
     * @returns {string[]} Array of localized names.
     */
    getNameList(aLang) {
        var nameList = [];
        this.sortByName(aLang);
        for (var i = 0; i < this.ObjectList.length; i++) {
            nameList.push(this.ObjectList[i].getObjectName(aLang));
        }
        return nameList;
    }
}


export { Unit, Units , ScaleObject, ScaleObjects };