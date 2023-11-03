"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupTotalFormatters = void 0;
const avgTotalsPercentageFormatter_1 = require("./avgTotalsPercentageFormatter");
const avgTotalsDollarFormatter_1 = require("./avgTotalsDollarFormatter");
const avgTotalsCurrencyFormatter_1 = require("./avgTotalsCurrencyFormatter");
const avgTotalsFormatter_1 = require("./avgTotalsFormatter");
const minTotalsFormatter_1 = require("./minTotalsFormatter");
const maxTotalsFormatter_1 = require("./maxTotalsFormatter");
const sumTotalsColoredFormatter_1 = require("./sumTotalsColoredFormatter");
const sumTotalsCurrencyFormatter_1 = require("./sumTotalsCurrencyFormatter");
const sumTotalsCurrencyColoredFormatter_1 = require("./sumTotalsCurrencyColoredFormatter");
const sumTotalsDollarColoredBoldFormatter_1 = require("./sumTotalsDollarColoredBoldFormatter");
const sumTotalsDollarColoredFormatter_1 = require("./sumTotalsDollarColoredFormatter");
const sumTotalsDollarBoldFormatter_1 = require("./sumTotalsDollarBoldFormatter");
const sumTotalsDollarFormatter_1 = require("./sumTotalsDollarFormatter");
const sumTotalsFormatter_1 = require("./sumTotalsFormatter");
const sumTotalsBoldFormatter_1 = require("./sumTotalsBoldFormatter");
/** Provides a list of different Formatters that will change the cell value displayed in the UI */
exports.GroupTotalFormatters = {
    /**
     * Average all the column totals
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    avgTotals: avgTotalsFormatter_1.avgTotalsFormatter,
    /**
     * Average all the column totals and display currency prefix/suffix via "groupFormatterCurrencyPrefix" and/or "groupFormatterCurrencySuffix"
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    avgTotalsCurrency: avgTotalsCurrencyFormatter_1.avgTotalsCurrencyFormatter,
    /**
     * Average all the column totals and display '$' at the end of the value
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    avgTotalsDollar: avgTotalsDollarFormatter_1.avgTotalsDollarFormatter,
    /**
     * Average all the column totals and display '%' at the end of the value
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    avgTotalsPercentage: avgTotalsPercentageFormatter_1.avgTotalsPercentageFormatter,
    /**
     * Show max value of all the column totals
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    maxTotals: maxTotalsFormatter_1.maxTotalsFormatter,
    /**
     * Show min value of all the column totals
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    minTotals: minTotalsFormatter_1.minTotalsFormatter,
    /**
     * Sums up all the column totals
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotals: sumTotalsFormatter_1.sumTotalsFormatter,
    /**
     * Sums up all the column totals and display it in bold font weight
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsBold: sumTotalsBoldFormatter_1.sumTotalsBoldFormatter,
    /**
     * Sums up all the column totals, change color of text to red/green on negative/positive value
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsColored: sumTotalsColoredFormatter_1.sumTotalsColoredFormatter,
    /**
     * Sums up all the column totals and display currency
     * Extra options available in "params":: "groupFormatterPrefix", "groupFormatterSuffix", "groupFormatterCurrencyPrefix" and/or "groupFormatterCurrencySuffix"
     * e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsCurrency: sumTotalsCurrencyFormatter_1.sumTotalsCurrencyFormatter,
    /**
     * Sums up all the column totals and display currency with color of red/green text on negative/positive values
     * Extra options available in "params":: "groupFormatterPrefix", "groupFormatterSuffix", "groupFormatterCurrencyPrefix" and/or "groupFormatterCurrencySuffix"
     * e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsCurrencyColored: sumTotalsCurrencyColoredFormatter_1.sumTotalsCurrencyColoredFormatter,
    /**
     * Sums up all the column totals and display dollar sign
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsDollar: sumTotalsDollarFormatter_1.sumTotalsDollarFormatter,
    /**
     * Sums up all the column totals and display dollar sign and show it in bold font weight
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsDollarBold: sumTotalsDollarBoldFormatter_1.sumTotalsDollarBoldFormatter,
    /**
     * Sums up all the column totals, change color of text to red/green on negative/positive value
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsDollarColored: sumTotalsDollarColoredFormatter_1.sumTotalsDollarColoredFormatter,
    /**
     * Sums up all the column totals, change color of text to red/green on negative/positive value, show it in bold font weight as well
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsDollarColoredBold: sumTotalsDollarColoredBoldFormatter_1.sumTotalsDollarColoredBoldFormatter,
};
//# sourceMappingURL=groupingFormatters.index.js.map