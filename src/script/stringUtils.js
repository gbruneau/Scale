
/**
 * Format a number either in normal notation or in a readable scientific form.
 * - If num is between 0.0001 (inclusive) and 10000 (exclusive), returns normal notation with toPrecision(digits).
 * - Otherwise returns "mantissa x 10^exponent" with exponent using Unicode superscripts.
 * @param {number} aNumber Number to format.
 * @param {number} [digits=4] Number of significant digits (default 4).
 * @returns {string} Formatted string, e.g. "9.999 x 10⁹".
 */
export function toNormalScientificString(aNumber, digits = 4) {
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

    var scienceString = "";
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
