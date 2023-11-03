"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formatters = void 0;
const index_1 = require("../enums/index");
const formatterUtilities_1 = require("./formatterUtilities");
const alignRightFormatter_1 = require("./alignRightFormatter");
const arrayObjectToCsvFormatter_1 = require("./arrayObjectToCsvFormatter");
const arrayToCsvFormatter_1 = require("./arrayToCsvFormatter");
const boldFormatter_1 = require("./boldFormatter");
const centerFormatter_1 = require("./centerFormatter");
const checkboxFormatter_1 = require("./checkboxFormatter");
const checkmarkFormatter_1 = require("./checkmarkFormatter");
const checkmarkMaterialFormatter_1 = require("./checkmarkMaterialFormatter");
const currencyFormatter_1 = require("./currencyFormatter");
const collectionFormatter_1 = require("./collectionFormatter");
const collectionEditorFormatter_1 = require("./collectionEditorFormatter");
const complexObjectFormatter_1 = require("./complexObjectFormatter");
const decimalFormatter_1 = require("./decimalFormatter");
const deleteIconFormatter_1 = require("./deleteIconFormatter");
const dollarColoredBoldFormatter_1 = require("./dollarColoredBoldFormatter");
const dollarColoredFormatter_1 = require("./dollarColoredFormatter");
const dollarFormatter_1 = require("./dollarFormatter");
const editIconFormatter_1 = require("./editIconFormatter");
const fakeHyperlinkFormatter_1 = require("./fakeHyperlinkFormatter");
const hyperlinkFormatter_1 = require("./hyperlinkFormatter");
const iconFormatter_1 = require("./iconFormatter");
const infoIconFormatter_1 = require("./infoIconFormatter");
const italicFormatter_1 = require("./italicFormatter");
const lowercaseFormatter_1 = require("./lowercaseFormatter");
const maskFormatter_1 = require("./maskFormatter");
const multipleFormatter_1 = require("./multipleFormatter");
const percentFormatter_1 = require("./percentFormatter");
const percentCompleteBarFormatter_1 = require("./percentCompleteBarFormatter");
const percentCompleteBarWithTextFormatter_1 = require("./percentCompleteBarWithTextFormatter");
const percentCompleteFormatter_1 = require("./percentCompleteFormatter");
const percentSymbolFormatter_1 = require("./percentSymbolFormatter");
const progressBarFormatter_1 = require("./progressBarFormatter");
const translateFormatter_1 = require("./translateFormatter");
const treeExportFormatter_1 = require("./treeExportFormatter");
const treeFormatter_1 = require("./treeFormatter");
const treeParseTotalsFormatter_1 = require("./treeParseTotalsFormatter");
const translateBooleanFormatter_1 = require("./translateBooleanFormatter");
const uppercaseFormatter_1 = require("./uppercaseFormatter");
const yesNoFormatter_1 = require("./yesNoFormatter");
/** Provides a list of different Formatters that will change the cell value displayed in the UI */
exports.Formatters = {
    /** Align cell value to the center (alias to Formatters.center) */
    alignCenter: centerFormatter_1.centerFormatter,
    /** Align cell value to the right */
    alignRight: alignRightFormatter_1.alignRightFormatter,
    /**
     * Takes an array of complex objects converts it to a comma delimited string.
     * Requires to pass an array of "propertyNames" in the column definition the generic "params" property
     * For example, if we have an array of user objects that have the property of firstName & lastName then we need to pass in your column definition::
     * params: { propertyNames: ['firtName', 'lastName'] } => 'John Doe, Jane Doe'
     */
    arrayObjectToCsv: arrayObjectToCsvFormatter_1.arrayObjectToCsvFormatter,
    /** Takes an array of string and converts it to a comma delimited string */
    arrayToCsv: arrayToCsvFormatter_1.arrayToCsvFormatter,
    /** show value in bold font weight */
    bold: boldFormatter_1.boldFormatter,
    /** Center a text value horizontally */
    center: centerFormatter_1.centerFormatter,
    /** When value is filled (true), it will display a checkbox Unicode icon */
    checkbox: checkboxFormatter_1.checkboxFormatter,
    /**
     * When value is filled, or if the value is a number and is bigger than 0, it will display a Font-Awesome icon (fa-check).
     * The icon will NOT be displayed when the value is any of the following ("false", false, "0", 0, -0.5, null, undefined)
     * Anything else than the condition specified will display the icon, so a text with "00123" will display the icon but "0" will not.
     * Also note that a string ("null", "undefined") will display the icon but (null, undefined) will not, so the typeof is also important
     */
    checkmark: checkmarkFormatter_1.checkmarkFormatter,
    /**
     * When value is filled, or if the value is a number and is bigger than 0, it will display a Material Design check icon (mdi-check).
     * The icon will NOT be displayed when the value is any of the following ("false", false, "0", 0, -0.5, null, undefined)
     * Anything else than the condition specified will display the icon, so a text with "00123" will display the icon but "0" will not.
     * Also note that a string ("null", "undefined") will display the icon but (null, undefined) will not, so the typeof is also important
     */
    checkmarkMaterial: checkmarkMaterialFormatter_1.checkmarkMaterialFormatter,
    /**
     * Takes a complex data object and return the data under that property (for example: "user.firstName" will return the first name "John")
     * You can pass the complex structure in the "field" (field: "user.firstName") or in the "params" (labelKey: "firstName", params: { complexField: "user" }) properties.
     * For example::
     * this.columnDefs = [{ id: 'username', field: 'user.firstName', ... }]
     * OR this.columnDefs = [{ id: 'username', field: 'user', labelKey: 'firstName', params: { complexField: 'user' }, ... }]
     * OR this.columnDefs = [{ id: 'username', field: 'user', params: { complexField: 'user.firstName' }, ... }]
     */
    complex: complexObjectFormatter_1.complexObjectFormatter,
    complexObject: complexObjectFormatter_1.complexObjectFormatter,
    /**
     * Looks up values from the columnDefinition.params.collection property and displays the label in CSV or string format
     * @example
     * // the grid will display 'foo' and 'bar' and not 1 and 2 from your dataset
     * { params: { collection: [{ value: 1, label: 'foo'}, {value: 2, label: 'bar' }] }}
     * const dataset = [1, 2];
     */
    collection: collectionFormatter_1.collectionFormatter,
    /**
     * Roughly the same as the "collectionFormatter" except that it
     * looks up values from the columnDefinition.editor.collection (instead of params) property and displays the label in CSV or string format
     * @example
     * // the grid will display 'foo' and 'bar' and not 1 and 2 from your dataset
     * { editor: { collection: [{ value: 1, label: 'foo'}, {value: 2, label: 'bar' }] }}
     * const dataset = [1, 2];
     */
    collectionEditor: collectionEditorFormatter_1.collectionEditorFormatter,
    /**
     * Similar to "Formatters.decimal", but it allows you to provide prefixes and suffixes (currencyPrefix, currencySuffix, numberPrefix, numberSuffix)
     * So with this, it allows the user to provide dual prefixes/suffixes via the following params
     * You can pass "minDecimal", "maxDecimal", "decimalSeparator", "thousandSeparator", "numberPrefix", "currencyPrefix", "currencySuffix", and "numberSuffix" to the "params" property.
     * For example:: `{ formatter: Formatters.decimal, params: { minDecimal: 2, maxDecimal: 4, prefix: 'Price ', currencyPrefix: '€', currencySuffix: ' EUR' }}`
     * with value of 33.45 would result into: "Price €33.45 EUR"
     */
    currency: currencyFormatter_1.currencyFormatter,
    /** Takes a Date object and displays it as an ISO Date format (YYYY-MM-DD) */
    dateIso: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateIso, '-'),
    /** Takes a Date object and displays it as an ISO Date+Time format (YYYY-MM-DD HH:mm:ss) */
    dateTimeIso: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeIso, '-'),
    /** Takes a Date object and displays it as an ISO Date+Time (without seconds) format (YYYY-MM-DD HH:mm) */
    dateTimeShortIso: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeShortIso, '-'),
    /** Takes a Date object and displays it as an ISO Date+Time+(am/pm) format (YYYY-MM-DD h:mm:ss a) */
    dateTimeIsoAmPm: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeIsoAmPm, '-'),
    /** Takes a Date object and displays it as an ISO Date+Time+(AM/PM) format (YYYY-MM-DD hh:mm:ss A) */
    dateTimeIsoAM_PM: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeIsoAM_PM, '-'),
    /** Takes a Date object and displays it as an Euro Date format (DD/MM/YYYY) */
    dateEuro: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateEuro, '/'),
    /** Takes a Date object and displays it as an Euro Date format (D/M/YY) */
    dateEuroShort: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateEuroShort, '/'),
    /** Takes a Date object and displays it as an Euro Date+Time format (DD/MM/YYYY HH:mm:ss) */
    dateTimeEuro: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeEuro, '/'),
    /** Takes a Date object and displays it as an Euro Date+Time format (D/M/YY H:m:s) */
    dateTimeEuroShort: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeEuroShort, '/'),
    /** Takes a Date object and displays it as an Euro Date+Time (without seconds) format (DD/MM/YYYY HH:mm) */
    dateTimeShortEuro: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeShortEuro, '/'),
    /** Takes a Date object and displays it as an Euro Date+Time+(am/pm) format (DD/MM/YYYY hh:mm:ss a) */
    dateTimeEuroAmPm: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeEuroAmPm, '/'),
    /** Takes a Date object and displays it as an Euro Date+Time+(AM/PM) format (DD/MM/YYYY hh:mm:ss A) */
    dateTimeEuroAM_PM: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeEuroAM_PM, '/'),
    /** Takes a Date object and displays it as an Euro Date+Time+(am/pm) format (D/M/YY h:m:s a) */
    dateTimeEuroShortAmPm: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeEuroShortAmPm, '/'),
    /** Takes a Date object and displays it as an Euro Date+Time+(am/pm) format (D/M/YY h:m:s A) */
    dateTimeEuroShortAM_PM: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeEuroShortAM_PM, '/'),
    /** Takes a Date object and displays it as an US Date format (MM/DD/YYYY) */
    dateUs: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateUs, '/'),
    /** Takes a Date object and displays it as an US Date+Time format (MM/DD/YYYY HH:mm:ss) */
    dateTimeUs: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeUs, '/'),
    /** Takes a Date object and displays it as an US Date+Time (without seconds) format (MM/DD/YYYY HH:mm:ss) */
    dateTimeShortUs: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeShortUs, '/'),
    /** Takes a Date object and displays it as an US Date+Time+(am/pm) format (MM/DD/YYYY hh:mm:ss a) */
    dateTimeUsAmPm: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeUsAmPm, '/'),
    /** Takes a Date object and displays it as an US Date+Time+(AM/PM) format (MM/DD/YYYY hh:mm:ss A) */
    dateTimeUsAM_PM: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeUsAM_PM, '/'),
    /** Takes a Date object and displays it as an US Date+Time format (M/D/YY H:m:s) */
    dateTimeUsShort: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeUsShort, '/'),
    /** Takes a Date object and displays it as an US Date+Time+(am/pm) format (M/D/YY h:m:s a) */
    dateTimeUsShortAmPm: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeUsShortAmPm, '/'),
    /** Takes a Date object and displays it as an US Date+Time+(AM/PM) format (M/D/YY h:m:s A) */
    dateTimeUsShortAM_PM: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateTimeUsShortAM_PM, '/'),
    /** Takes a Date object and displays it as an US Date format (M/D/YY) */
    dateUsShort: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateUsShort, '/'),
    /** Takes a Date object and displays it as a regular TZ timestamp format (YYYY-MM-DDTHH:mm:ss.SSSZ) */
    dateUtc: (0, formatterUtilities_1.getAssociatedDateFormatter)(index_1.FieldType.dateUtc, '-'),
    /** Displays a Font-Awesome delete icon (fa-trash) */
    deleteIcon: deleteIconFormatter_1.deleteIconFormatter,
    /**
     * Display the value as x decimals formatted, defaults to 2 decimals.
     * You can pass "minDecimal" and/or "maxDecimal" to the "params" property.
     * For example:: `{ formatter: Formatters.decimal, params: { minDecimal: 2, maxDecimal: 4 }}`
     */
    decimal: decimalFormatter_1.decimalFormatter,
    /** Display the value as 2 decimals formatted with dollar sign '$' at the end of of the value */
    dollar: dollarFormatter_1.dollarFormatter,
    /** Display the value as 2 decimals formatted with dollar sign '$' at the end of of the value, change color of text to red/green on negative/positive value */
    dollarColored: dollarColoredFormatter_1.dollarColoredFormatter,
    /** Display the value as 2 decimals formatted with dollar sign '$' at the end of of the value, change color of text to red/green on negative/positive value, show it in bold font weight as well */
    dollarColoredBold: dollarColoredBoldFormatter_1.dollarColoredBoldFormatter,
    /** Displays a Font-Awesome edit icon (fa-pencil) */
    editIcon: editIconFormatter_1.editIconFormatter,
    /** Takes any text value and display it as a fake a hyperlink (only styled as an hyperlink), this can be used in combo with "onCellClick" event */
    fakeHyperlink: fakeHyperlinkFormatter_1.fakeHyperlinkFormatter,
    /**
     * Takes an hyperlink cell value and transforms it into a real hyperlink, given that the value starts with 1 of these (http|ftp|https).
     * The structure will be "<a href="hyperlink">hyperlink</a>"
     *
     * You can optionally change the hyperlink text displayed by using the generic params "hyperlinkText" in the column definition
     * For example: { id: 'link', field: 'link', params: { hyperlinkText: 'Company Website' } } will display "<a href="link">Company Website</a>"
     *
     * You can also optionally provide the hyperlink URL by using the generic params "hyperlinkUrl" in the column definition
     * For example: { id: 'link', field: 'link', params: {  hyperlinkText: 'Company Website', hyperlinkUrl: 'http://www.somewhere.com' } } will display "<a href="http://www.somewhere.com">Company Website</a>"
     */
    hyperlink: hyperlinkFormatter_1.hyperlinkFormatter,
    /** Display whichever icon you want (library agnostic, it could be Font-Awesome or any other) */
    icon: iconFormatter_1.iconFormatter,
    /** Displays a Font-Awesome edit icon (fa-info-circle) */
    infoIcon: infoIconFormatter_1.infoIconFormatter,
    /** show input text value as italic text */
    italic: italicFormatter_1.italicFormatter,
    /** Takes a value and displays it all lowercase */
    lowercase: lowercaseFormatter_1.lowercaseFormatter,
    /**
     * Takes a value display it according to a mask provided
     * e.: 1234567890 with mask "(000) 000-0000" will display "(123) 456-7890"
     */
    mask: maskFormatter_1.maskFormatter,
    /**
     * You can pipe multiple formatters (executed in sequence), use params to pass the list of formatters.
     * Requires to pass an array of "formatters" in the column definition the generic "params" property
     * For example::
     * { field: 'title', formatter: Formatters.multiple, params: { formatters: [ Formatters.lowercase, Formatters.uppercase ] }
     */
    multiple: multipleFormatter_1.multipleFormatter,
    /** Takes a cell value number (between 0.0-1.0) and displays a red (<50) or green (>=50) bar */
    percent: percentFormatter_1.percentFormatter,
    /** Takes a cell value number (between 0.0-100) and displays a red (<50) or green (>=50) bar */
    percentComplete: percentCompleteFormatter_1.percentCompleteFormatter,
    /** Takes a cell value number (between 0-100) and displays a SlickGrid custom "percent-complete-bar" a red (<30), silver (>30 & <70) or green (>=70) bar */
    percentCompleteBar: percentCompleteBarFormatter_1.percentCompleteBarFormatter,
    /** Takes a cell value number (between 0-100) and displays SlickGrid custom "percent-complete-bar" with Text a red (<30), silver (>30 & <70) or green (>=70) bar */
    percentCompleteBarWithText: percentCompleteBarWithTextFormatter_1.percentCompleteBarWithTextFormatter,
    /** Takes a cell value number (between 0-100) and add the "%" after the number */
    percentSymbol: percentSymbolFormatter_1.percentSymbolFormatter,
    /** Takes a cell value number (between 0-100) and displays Bootstrap "progress-bar" a red (<30), silver (>30 & <70) or green (>=70) bar */
    progressBar: progressBarFormatter_1.progressBarFormatter,
    /** Takes a cell value and translates it. Requires an instance of the Translate Service:: `translater: this.translate */
    translate: translateFormatter_1.translateFormatter,
    /** Takes a boolean value, cast it to upperCase string and finally translates it. Requires an instance of the Translate Service:: `translater: this.translate */
    translateBoolean: translateBooleanFormatter_1.translateBooleanFormatter,
    /** Formatter that must be use with a Tree Data column */
    tree: treeFormatter_1.treeFormatter,
    /**
     * Formatter that can be use to parse Tree Data totals and display totals using GroupTotalFormatters.
     * This formatter works with both regular `Formatters` or `GroupTotalFormatters`,
     * it will auto-detect if the current data context has a `__treeTotals` prop,
     * then it will use the `GroupTotalFormatters`, if not then it will try to use regular `Formatters`.
     *
     * This mean that you can provide an array of `Formatters` & `GroupTotalFormatters` and it will use the correct formatter
     * by detecting if the current data context has a `__treeTotals` prop (`GroupTotalFormatters`) or not (regular `Formatter`)
     */
    treeParseTotals: treeParseTotalsFormatter_1.treeParseTotalsFormatter,
    /** Formatter that must be use with a Tree Data column for Exporting the data */
    treeExport: treeExportFormatter_1.treeExportFormatter,
    /** Takes a value and displays it all uppercase */
    uppercase: uppercaseFormatter_1.uppercaseFormatter,
    /** Takes a boolean value and display a string 'Yes' or 'No' */
    yesNo: yesNoFormatter_1.yesNoFormatter
};
//# sourceMappingURL=formatters.index.js.map