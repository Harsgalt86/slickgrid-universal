import type { Formatter } from '../interfaces/index';
/**
 * This Formatters allow the user to provide any currency symbol (as symbol prefix/suffix) and also provide extra text prefix/suffix.
 * So with this, it allows the user to provide dual prefixes/suffixes via the following params
 * You can pass "minDecimal", "maxDecimal", "decimalSeparator", "thousandSeparator", "numberPrefix", "currencyPrefix", "currencySuffix", and "numberSuffix" to the "params" property.
 * For example:: `{ formatter: Formatters.decimal, params: { minDecimal: 2, maxDecimal: 4, prefix: 'Price ', currencyPrefix: '€', currencySuffix: ' EUR' }}`
 * with value of 33.45 would result into: "Price €33.45 EUR"
 */
export declare const currencyFormatter: Formatter;
//# sourceMappingURL=currencyFormatter.d.ts.map