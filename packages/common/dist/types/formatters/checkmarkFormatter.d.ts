import type { Formatter } from './../interfaces/index';
/**
 * When value is filled, or if the value is a number and is bigger than 0, it will display a Font-Awesome icon (fa-check).
 * The icon will NOT be displayed when the value is any of the following ("false", false, "0", 0, -0.5, null, undefined)
 * Anything else than the condition specified will display the icon, so a text with "00123" will display the icon but "0" will not.
 * Also note that a string ("null", "undefined") will display the icon but (null, undefined) will not, so the typeof is also important
 */
export declare const checkmarkFormatter: Formatter;
//# sourceMappingURL=checkmarkFormatter.d.ts.map