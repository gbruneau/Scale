import './style/scale.css';
import $ from 'jquery';
import autoComplete from './script/autocomplete';
import { t9nTranslation, t9nLabel } from './script/t9n';
import { Units, ScaleObjects } from './script/scaleObjects.js';

// Import application build number
import APPbuild from "./version.json";
import { toNormalScientificString } from './script/stringUtils';

import jSonUnits from "./public/Units.json";
import jSonObjects from "./public/Objects.json";
import jSonT9n from "./public/i18n.json"; 
    

/**
 * @typedef {Object} t9nLabel
 * @description Translation label object imported from ./script/t9n
 */

/**
 * @typedef {Object} t9nTranslation
 * @description Translation manager object imported from ./script/t9n
 */


/**
 * Refresh the entire results table.
 * Reads selected objects from #obj1 and #obj2, computes the scale ratio,
 * and rebuilds the table body accordingly.
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
                <td data-label='${languages.getLabel(12)}'>%dis</td>
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
                curRowHtml = curRowHtml.replace("%dis", theObject.IsDistance ? "↦" : "⬤");
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

function translateData() {
    languages.CurLang = $("#lang").val();
    var curLang = languages.CurLang;
    var oList;
    oList = objList.getNameList(curLang);
    $(function () {
        autoComplete(document.getElementById("obj1"), oList);
        autoComplete(document.getElementById("obj2"), oList);
    });
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



// ============ MAIN =========


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
languages.CurLang = languages.UserLang;
/**
 * ScaleObjects collection instance.
 * @type {ScaleObjects}
 */
var objList = new ScaleObjects(unitList);
//var reqUnit = readUnits(unitList, unitURL);

$("#version").text(APPbuild);



var lData = jSonUnits;
$.each(lData, function () {
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
    unitList.addUnit(this.SizeInMeter, newT9nSymbol, newT9nName, newT9nDesc);
});
unitList.sortBySize();

objList = new ScaleObjects(unitList);
var oData = jSonObjects;
$.each(oData, function () {
    objList.addObject(this);
});
for (var i = 0; i < jSonT9n.length; i++) {
    var newLabel = new t9nLabel(
        [
            ["EN", jSonT9n[i].LabelEn],
            ["FR", jSonT9n[i].LabelFr]
        ]);
    languages.addLabel(jSonT9n[i].id, newLabel);
}  

fillLangList();

$("#lang").on("change", function () {
    languages.CurLang = $("#lang").val();
    languages.translateLabels();
    translateData();
});
languages.translateLabels();
translateData();


document.getElementById("obj1").addEventListener("change", refreshTable);
document.getElementById("obj2").addEventListener("change", refreshTable);


 

