/** Provides a list of different Formatters that will change the cell value displayed in the UI */
export declare const GroupTotalFormatters: {
    /**
     * Average all the column totals
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    avgTotals: import("..").GroupTotalsFormatter;
    /**
     * Average all the column totals and display currency prefix/suffix via "groupFormatterCurrencyPrefix" and/or "groupFormatterCurrencySuffix"
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    avgTotalsCurrency: import("..").GroupTotalsFormatter;
    /**
     * Average all the column totals and display '$' at the end of the value
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    avgTotalsDollar: import("..").GroupTotalsFormatter;
    /**
     * Average all the column totals and display '%' at the end of the value
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    avgTotalsPercentage: import("..").GroupTotalsFormatter;
    /**
     * Show max value of all the column totals
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    maxTotals: import("..").GroupTotalsFormatter;
    /**
     * Show min value of all the column totals
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    minTotals: import("..").GroupTotalsFormatter;
    /**
     * Sums up all the column totals
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g.: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotals: import("..").GroupTotalsFormatter;
    /**
     * Sums up all the column totals and display it in bold font weight
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsBold: import("..").GroupTotalsFormatter;
    /**
     * Sums up all the column totals, change color of text to red/green on negative/positive value
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsColored: import("..").GroupTotalsFormatter;
    /**
     * Sums up all the column totals and display currency
     * Extra options available in "params":: "groupFormatterPrefix", "groupFormatterSuffix", "groupFormatterCurrencyPrefix" and/or "groupFormatterCurrencySuffix"
     * e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsCurrency: import("..").GroupTotalsFormatter;
    /**
     * Sums up all the column totals and display currency with color of red/green text on negative/positive values
     * Extra options available in "params":: "groupFormatterPrefix", "groupFormatterSuffix", "groupFormatterCurrencyPrefix" and/or "groupFormatterCurrencySuffix"
     * e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsCurrencyColored: import("..").GroupTotalsFormatter;
    /**
     * Sums up all the column totals and display dollar sign
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsDollar: import("..").GroupTotalsFormatter;
    /**
     * Sums up all the column totals and display dollar sign and show it in bold font weight
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsDollarBold: import("..").GroupTotalsFormatter;
    /**
     * Sums up all the column totals, change color of text to red/green on negative/positive value
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsDollarColored: import("..").GroupTotalsFormatter;
    /**
     * Sums up all the column totals, change color of text to red/green on negative/positive value, show it in bold font weight as well
     * Extra options available in "params":: "groupFormatterPrefix" and "groupFormatterSuffix", e.g: params: { groupFormatterPrefix: '<i>Total</i>: ', groupFormatterSuffix: '$' }
     */
    sumTotalsDollarColoredBold: import("..").GroupTotalsFormatter;
};
//# sourceMappingURL=groupingFormatters.index.d.ts.map