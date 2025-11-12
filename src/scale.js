import './style/scale.css';
import $ from 'jquery';
import autoComplete from './script/autocomplete';

import { t9nTranslation, t9nLabel } from './script/t9n';

/**
 * @typedef {Object} t9nLabel
 * @description Translation label object imported from ./script/t9n
 */

/**
 * @typedef {Object} t9nTranslation
 * @description Translation manager object imported from ./script/t9n
 */

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
            if (Math.log10(this.UnitList[aUnitId].SizeInMeter) <= Math.log10(aSizeInMeter))
            {
                bestUnit = this.UnitList[aUnitId];
            }
        }
        console.log(`size=${aSizeInMeter}  unit=${JSON.stringify(bestUnit)}`)
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

/**
 * Represents an object with scaled representations.
 */
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

/**
 * Collection of ScaleObject instances and helper methods.
 */
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

/**
 * Read objects from a JSON URL and populate a ScaleObjects collection.
 * @param {ScaleObjects} aList Target collection to populate.
 * @param {string} url URL of the JSON resource.
 * @returns {JQuery.jqXHR} jqXHR promise returned by $.getJSON.
 */
function readObjects(aList, url) {
    return $.getJSON(url, function (data) {
        $.each(data, function () {
            aList.addObject(this);
        })
    });
}

/**
 * Read translation labels from a JSON URL and add them to a t9nTranslation instance.
 * @param {t9nTranslation} langs Translation manager to populate.
 * @param {string} url URL of the labels JSON.
 * @returns {JQuery.jqXHR} jqXHR promise returned by $.getJSON.
 */
function readLabels(langs, url) {
    return $.getJSON(url, function (lData) {
        $.each(lData, function () {
            var newLabel = new t9nLabel(
                [
                    ["EN", this.LabelEn],
                    ["FR", this.LabelFr]
                ]);
            langs.addLabel(this.id, newLabel);
        });
    });
}

/**
 * Read unit definitions from a JSON URL and populate a Units collection.
 * @param {Units} aList Units collection to populate.
 * @param {string} url URL of the units JSON.
 * @returns {JQuery.jqXHR} jqXHR promise returned by $.getJSON.
 */
function readUnits(aList, url) {
    return $.getJSON(url, function (uData) {
        $.each(uData, function () {
            var newT9nSymbol = new t9nLabel(
                [
                    ["FR", this.UnitSymbolFr],
                    ["EN", this.UnitSymbolEn]
                ]);
            var newT9nDesc = new t9nLabel(
                [
                    ["FR", this.UnitDescFr],
                    ["EN", this.UnitDescEn]
                ]);
            var newT9nName = new t9nLabel(
                [
                    ["FR", this.UnitNameFr],
                    ["EN", this.UnitNameEn]
                ]);
            aList.addUnit(this.SizeInMeter, newT9nSymbol, newT9nName, newT9nDesc);
        });
    });
}

// ============ MAIN =========
// Constants for JSON resources
const objectsURL = "./Objects.JSON";
const labelURL = "./i18n.JSON";
const unitURL = "./Units.JSON";

// Global variables
/**
 * Units collection used globally.
 * @type {Units}
 */
var unitList = new Units();
/**
 * Translation manager instance.
 * @type {t9nTranslation}
 */
var languages = new t9nTranslation(["EN", "FR"]);
/**
 * ScaleObjects collection instance.
 * @type {ScaleObjects}
 */
var objList = new ScaleObjects(unitList);
var reqUnit = readUnits(unitList, unitURL);

/**
 * Refresh the entire results table.
 * Reads selected objects from #obj1 and #obj2, computes the scale ratio,
 * and rebuilds the table body accordingly.
 * @returns {void}
 */
function refreshTable() {
    objList.sortBySize();
    var ob1Name = $("#obj1").val();
    var ob2Name = $("#obj2").val();
    var i;
    var ratioText;
    var objectName, objectSizeInM, objectUnit, theObject, objectSizeInUnit, objectUrl;
    var scaledSizeInM, scaledUnit, scaledUnitSymbol, scaledSizeInUnit, scaledUnitDesc, scaledUnitName;
    var sectionCssClass, curRowHtml;
    var magnitudeObjectName, objectMatchingScale;

    var curLang = languages.CurLang;
    if (ob1Name != "" & ob2Name != "") {
        let obj1 = objList.getObjectByName(ob1Name, curLang);
        let obj2 = objList.getObjectByName(ob2Name, curLang);

        if ((obj1 != null) && (obj2 != null)) {
            var ratio = obj2.SizeInMeter / obj1.SizeInMeter;
            // Display ratio
            if (ratio < 1)
                ratioText = "🠗  1 : " + toNormalScientificString(1 / ratio);
            else
                ratioText = "🠕  " + toNormalScientificString(ratio) + " : 1";
            $("#fldRatio").text(ratioText);
            // Clear existing table body
            $("tbody").remove();

            var htmlRowTemplate = `<tr>
                <td data-label='${languages.getLabel(6)}'><a href='%url' target='_blank'>%on</a></td>
                <td data-label='${languages.getLabel(9)}'>%osm</td>
                <td data-label='${languages.getLabel(7)}' title='%oun: %oud'>%osu</td>
                <td data-label='${languages.getLabel(8)}' title='%sun: %sud'>%scu</td>
                <td data-label='${languages.getLabel(10)}'>%mon</td>
                </tr>`;

            var oldSectionCssClass = 'scMicro';
            var htmlTableBody = "";

            for (var i = 0; i < objList.ObjectList.length; i++) {
                theObject = objList.ObjectList[i];
                objectName = theObject.getObjectName(curLang);
                objectSizeInM = parseFloat(theObject.SizeInMeter);
                objectUnit = theObject.getUnitSymbol(curLang);
                objectSizeInUnit = theObject.SizeInUnit;
                objectUrl = theObject.URL;

                scaledSizeInM = objectSizeInM * ratio;
                scaledUnit = objList.Units.getBestUnit(scaledSizeInM);
                scaledUnitSymbol = scaledUnit.getUnitSymbol(curLang);
                scaledUnitDesc = scaledUnit.getUnitDesc(curLang);
                scaledUnitName = scaledUnit.getUnitName(curLang);
                scaledSizeInUnit = scaledSizeInM / scaledUnit.SizeInMeter;

                // Determine CSS section based on size
                if (objectSizeInM <= 4e-5)
                    sectionCssClass = 'scMicro'
                else if (objectSizeInM < 1000)
                    sectionCssClass = 'scHuman'
                else if (objectSizeInM <= 1.2e+7)
                    sectionCssClass = 'scTravel'
                else if (objectSizeInM <= 1e+10)
                    sectionCssClass = 'scPlanet'
                else if (objectSizeInM <= 3e+16)
                    sectionCssClass = 'scSolar'
                else if (objectSizeInM <= 1.25e+21)
                    sectionCssClass = 'scGalaxy'
                else
                    sectionCssClass = 'scCosmic'

                // Build the row HTML and group into tbody sections
                if (i == 0)
                    curRowHtml = "<tbody class='" + oldSectionCssClass + "'>" + htmlRowTemplate
                else
                    if (sectionCssClass != oldSectionCssClass) {
                        curRowHtml = "</tbody><tbody class='" + sectionCssClass + "'>" + htmlRowTemplate
                        oldSectionCssClass = sectionCssClass;
                    }
                    else
                        curRowHtml = htmlRowTemplate

                objectMatchingScale = objList.getObjectBySize(scaledSizeInM);
                if (objectMatchingScale != null)
                    magnitudeObjectName = objectMatchingScale.getObjectName(curLang);
                else
                    magnitudeObjectName = "";

                // Replace template markers with actual values
                curRowHtml = curRowHtml.replace("%on", objectName);
                curRowHtml = curRowHtml.replace("%osm", toNormalScientificString(objectSizeInM) + " m");
                curRowHtml = curRowHtml.replace("%osu", toNormalScientificString(objectSizeInUnit) + " " + objectUnit);
                curRowHtml = curRowHtml.replace("%oun", theObject.getUnitName(curLang));
                curRowHtml = curRowHtml.replace("%oud", theObject.getUnitDesc(curLang));
                curRowHtml = curRowHtml.replace("%scu", toNormalScientificString(scaledSizeInUnit) + " " + scaledUnitSymbol);
                curRowHtml = curRowHtml.replace("%sud", scaledUnitDesc);
                curRowHtml = curRowHtml.replace("%sun", scaledUnitName);
                curRowHtml = curRowHtml.replace("%mon", magnitudeObjectName);
                curRowHtml = curRowHtml.replace("%url", objectUrl);
                curRowHtml = curRowHtml.replace("%cl", sectionCssClass);

                if (i + 1 == objList.length)
                    curRowHtml += "</tbody>"
                htmlTableBody += curRowHtml;
            }
            $("tfoot").before(htmlTableBody);
        }
    }
}

/**
 * Update all displayed labels according to the current language.
 * Also refreshes autocomplete lists for object input fields.
 * @returns {void}
 */
function refreshLabels() {
    languages.CurLang = $("#lang").val();
    var curLang = languages.CurLang;
    var oList;
    oList = objList.getNameList(curLang);
    $(function () {
        autoComplete(document.getElementById("obj1"), oList);
        autoComplete(document.getElementById("obj2"), oList);
    });

    $("[data-label-id]").each(function () {
        var id = parseInt($(this).attr("data-label-id"));
        var label = languages.getLabel(id);
        $(this).text(label);
    })
}

/**
 * Populate the language dropdown (#lang) with supported languages.
 * @returns {void}
 */
function fillLangList() {
    for (var i = 0; i < languages.SupportedLanguages.length; i++) {
        var optName = languages.SupportedLanguages[i];
        var html = "<option value='" + optName + "'>" + optName + "</option>";
        $("#lang").append(html);
    }
    $("#lang").val(languages.CurLang);
}

reqUnit.done(function () {
    unitList.sortBySize();
    var reqLabel = readLabels(languages, labelURL);
    reqLabel.done(function () {
        objList = new ScaleObjects(unitList);
        var reqObject = readObjects(objList, objectsURL);
        reqObject.done(function () {
            fillLangList();
            refreshLabels();
            $("#lang").on("change", function () {
                refreshLabels();
            });

            document.getElementById("obj1").addEventListener("change", refreshTable);
            document.getElementById("obj2").addEventListener("change", refreshTable);
        });
    });
});

/**
 * Format a number either in normal notation or in a readable scientific form.
 * - If num is between 0.0001 (inclusive) and 10000 (exclusive), returns normal notation with toPrecision(digits).
 * - Otherwise returns "mantissa x 10^exponent" with exponent using Unicode superscripts.
 * @param {number} aNumber Number to format.
 * @param {number} [digits=4] Number of significant digits (default 4).
 * @returns {string} Formatted string, e.g. "9.999 x 10⁹".
 */
function toNormalScientificString(aNumber, digits = 4) {
    const superscripts = {
        '0': '⁰',
        '1': '¹',
        '2': '²',
        '3': '³',
        '4': '⁴',
        '5': '⁵',
        '6': '⁶',
        '7': '⁷',
        '8': '⁸',
        '9': '⁹',
        '-': '⁻',
        '+': ''
    };

    var scienceString = ""
    // Use normal notation for numbers in the readable range
    if ((aNumber >= 0.0001) && (aNumber < 10000)) {
        scienceString = aNumber.toPrecision(digits);
    }
    else {
        const expString = aNumber.toExponential();
        // Split into mantissa and exponent parts
        const [mantissa, expPart] = expString.split('e');

        // Convert exponent characters to superscript
        let superscriptExp = '';
        for (const ch of expPart) {
            superscriptExp += superscripts[ch];
        }
        // Build final string
        scienceString = `${Number(mantissa).toPrecision(digits)} x 10${superscriptExp}`;
    }

    return scienceString;
}