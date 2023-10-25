import { type Formatter } from './../interfaces/index';
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
export declare const hyperlinkFormatter: Formatter;
//# sourceMappingURL=hyperlinkFormatter.d.ts.map