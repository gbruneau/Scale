import './style/scale.css';
import $ from 'jquery';
import autoComplete from './script/autocomplete';


import { t9nTranslation, t9nLabel } from './script/t9n';

class Unit {
    constructor(aSizeInMeter, aT9nUnitSymbol, aT9nUnitName, aT9nUnitDescription) {
        this.UnitSymbol = aT9nUnitSymbol;
        this.SizeInMeter = aSizeInMeter;
        this.UnitName = aT9nUnitName;
        this.UnitDesc = aT9nUnitDescription;
    }
    getUnitSymbol(aLang) {
        return this.UnitSymbol.Label(aLang);
    }
    getUnitName(aLang) {
        return this.UnitName.Label(aLang);
    }
    getUnitDesc(aLang) {
        return this.UnitDesc.Label(aLang);
    }
}

class Units {
    constructor() {
        this.UnitList = [];
    }
    addUnit(aSizeInMeter, at9nSymbol, at9nName, at9nDesc) {
        let newUnit = new Unit(aSizeInMeter, at9nSymbol, at9nName, at9nDesc);
        this.UnitList.push(newUnit);
    }
    getBestUnit(aSizeInMeter) {
        this.sortBySize();
        var bestUnit = this.UnitList[0];
        for (var aUnitId = 0; aUnitId < this.UnitList.length; aUnitId++) {
            if (Math.log10(this.UnitList[aUnitId].SizeInMeter) <= Math.log10(aSizeInMeter))
                bestUnit = this.UnitList[aUnitId];
        }
        return bestUnit;
    }
    sortBySize() {
        /* Sort from large to small */
        this.UnitList.sort(function (a, b) {
            if (a.SizeInMeter < b.SizeInMeter) {
                return -1;
            }
            if (a.SizeInMeter > b.SizeInMeter) {
                return 1;
            }
            return 0;
        });
    }
}

// Scale Object
class ScaleObject {
    #Unit;
    #Labelt9n;
    constructor(objectJson, refUnits) {
        var newLabel = new t9nLabel([
            ["FR", objectJson.ObjectFr],
            ["EN", objectJson.ObjectEn]
        ]);
        this.BaseObject = objectJson;
        this.#Labelt9n = newLabel;
        this.SizeInMeter = parseFloat(objectJson.SizeInMeter);
        this.URL = objectJson.URL;
        this.#Unit = refUnits.getBestUnit(this.SizeInMeter);
        this.SizeInUnit = this.SizeInMeter / this.#Unit.SizeInMeter;
    }
    getObjectName(aLang) {
        return this.#Labelt9n.Label(aLang);
    }
    getUnitSymbol(aLang) {
        return this.#Unit.getUnitSymbol(aLang);
    }
    getUnitName(aLang) {
        return this.#Unit.getUnitName(aLang);
    }
    getUnitDesc(aLang) {
        return this.#Unit.getUnitDesc(aLang);
    }


}

class ScaleObjects {
    constructor(refUnits) {
        this.ObjectList = [];
        this.Units = refUnits;
    }
    addObject(objectJson) {
        var newObj = new ScaleObject(objectJson, this.Units)
        this.ObjectList.push(newObj);
    }
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

    getObjectBySize(aSizeInMeter) {
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
    getNameList(aLang) {
        var nameList = [];
        this.sortByName(aLang);
        for (var i = 0; i < this.ObjectList.length; i++) {
            nameList.push(this.ObjectList[i].getObjectName(aLang));
        }
        return nameList;
    }
}

// Get all objects from JASON 
function readObjects(aList, url) {
    return $.getJSON(url, function (data) {
        $.each(data, function () {
            aList.addObject(this);
        })
    });
}

// Get all label from JASON 
// the custom property data-label is used
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


// Get all units from JASON 
function readUnits(aList, url) {
    return $.getJSON(url, function (uData) {
        // Fill the array
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
// Constantes
const objectsURL = "./Objects.JSON";
const labelURL = "./i18n.JSON";
const unitURL = "./Units.JSON";

// Variables globales
var unitList = new Units();
var languages = new t9nTranslation(["EN", "FR"]);
var objList;
var reqUnit = readUnits(unitList, unitURL);

/**
 * Refresh the entire result table
 */
function refreshTable() {
    objList.sortBySize();
    var ob1Name = $("#obj1").val();
    var ob2Name = $("#obj2").val();
    var i;
    var ratioText;
    var objectName, ratioText, objectSizeInM, objectUnit, theObject, objectSizeInUnit, objectUrl;
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
            // Clear the table body
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

                // Buil the HTML statement

                // Determine the section CSS class
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

                // Build the row HTML
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

                // Replace all the markers
                //  %on : object name
                curRowHtml = curRowHtml.replace("%on", objectName);
                //  %osm : object size in meter
                curRowHtml = curRowHtml.replace("%osm", toNormalScientificString(objectSizeInM) + " m");
                //  %osu : object size in unit
                //  %oun : object unit name
                //  %oud : object unit description  
                curRowHtml = curRowHtml.replace("%osu", toNormalScientificString(objectSizeInUnit) + " " + objectUnit);
                curRowHtml = curRowHtml.replace("%oun", theObject.getUnitName(curLang));
                curRowHtml = curRowHtml.replace("%oud", theObject.getUnitDesc(curLang));
                //  %scu : scaled size in unit
                //  %sun : scaled unit name
                //  %sud : scaled unit description  
                curRowHtml = curRowHtml.replace("%scu", toNormalScientificString(scaledSizeInUnit) + " " + scaledUnitSymbol);
                curRowHtml = curRowHtml.replace("%sud", scaledUnitDesc);
                curRowHtml = curRowHtml.replace("%sun", scaledUnitName);
                //  %mon : magnitude object name
                curRowHtml = curRowHtml.replace("%mon", magnitudeObjectName);
                //      
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

function fillLangList() {
    /* Fill the language drop down */
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

function toNormalScientificString(num, digits = 4) {
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
    // if num is between 1000 and 0.0001, use normal notation

    if ((num >= 0.0001) && (num < 10000)) {
        scienceString = num.toPrecision(digits);
    }
    else {
        const expString = num.toExponential();
        // Split into mantissa and exponent parts
        const [mantissa, expPart] = expString.split('e');

        // Convert exponent to superscript
        let superscriptExp = '';
        for (const ch of expPart) {
            superscriptExp += superscripts[ch];
        }
        // Construct the final string
        scienceString = `${Number(mantissa).toPrecision(digits)} x 10${superscriptExp}`;
    }

    return scienceString;

}