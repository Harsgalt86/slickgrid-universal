import { OptionRowData } from 'multiple-select-vanilla';
import * as DOMPurify_ from 'dompurify';
import type { InferDOMType, SearchTerm } from '../enums/index';
import type { Column, GridOption, HtmlElementPosition, SlickGrid } from '../interfaces/index';
import type { TranslaterService } from './translater.service';
/**
 * Create the HTML DOM Element for a Select Editor or Filter, this is specific to these 2 types only and the unit tests are directly under them
 * @param {String} type - type of select DOM element to build, can be either 'editor' or 'filter'
 * @param {Array<Object>} collection - array of items to build the select html options
 * @param {Array<Object>} columnDef - column definition object
 * @param {Object} grid - Slick Grid object
 * @param {Boolean} isMultiSelect - are we building a multiple select element (false means it's a single select)
 * @param {Object} translaterService - optional Translater Service
 * @param {Array<*>} searchTerms - optional array of search term (used by the "filter" type only)
 * @returns object with 2 properties for the select element & a boolean value telling us if any of the search terms were found and selected in the dropdown
 */
export declare function buildMultipleSelectDataCollection(type: 'editor' | 'filter', collection: any[], columnDef: Column, grid: SlickGrid, isMultiSelect?: boolean, translaterService?: TranslaterService, searchTerms?: SearchTerm[]): {
    selectElement: HTMLSelectElement;
    dataCollection: OptionRowData[];
    hasFoundSearchTerm: boolean;
};
/** calculate available space for each side of the DOM element */
export declare function calculateAvailableSpace(element: HTMLElement): {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
/**
 * Create a DOM Element with any optional attributes or properties.
 * It will only accept valid DOM element properties that `createElement` would accept.
 * For example: `createDomElement('div', { className: 'my-css-class' })`,
 * for style or dataset you need to use nested object `{ style: { display: 'none' }}
 * The last argument is to optionally append the created element to a parent container element.
 * @param {String} tagName - html tag
 * @param {Object} options - element properties
 * @param {[Element]} appendToParent - parent element to append to
 */
export declare function createDomElement<T extends keyof HTMLElementTagNameMap, K extends keyof HTMLElementTagNameMap[T]>(tagName: T, elementOptions?: {
    [P in K]: InferDOMType<HTMLElementTagNameMap[T][P]>;
}, appendToParent?: Element): HTMLElementTagNameMap[T];
/**
 * Loop through all properties of an object and nullify any properties that are instanceof HTMLElement,
 * if we detect an array then use recursion to go inside it and apply same logic
 * @param obj - object containing 1 or more properties with DOM Elements
 */
export declare function destroyObjectDomElementProps(obj: any): void;
/**
 * Empty a DOM element by removing all of its DOM element children leaving with an empty element (basically an empty shell)
 * @return {object} element - updated element
 */
export declare function emptyElement<T extends Element = Element>(element?: T | null): T | undefined | null;
/** Get offset of HTML element relative to a parent element */
export declare function getElementOffsetRelativeToParent(parentElm: HTMLElement | null, childElm: HTMLElement | null): {
    top: number;
    right: number;
    bottom: number;
    left: number;
} | undefined;
/** Get HTML element offset with pure JS */
export declare function getHtmlElementOffset(element?: HTMLElement): HtmlElementPosition | undefined;
export declare function getInnerSize(elm: HTMLElement, type: 'height' | 'width'): number;
export declare function getElementProp(elm: HTMLElement, property: string): string;
export declare function getSelectorStringFromElement(elm?: HTMLElement | null): string;
export declare function findFirstElementAttribute(inputElm: Element | null | undefined, attributes: string[]): string | null;
/**
 * Provide a width as a number or a string and find associated value in valid css style format or use default value when provided (or "auto" otherwise).
 * @param {Number|String} inputWidth - input width, could be a string or number
 * @param {Number | String} defaultValue [defaultValue=auto] - optional default value or use "auto" when nothing is provided
 * @returns {String} string output
 */
export declare function findWidthOrDefault(inputWidth?: number | string, defaultValue?: string): string;
/**
 * HTML encode using a plain <div>
 * Create a in-memory div, set it's inner text(which a div can encode)
 * then grab the encoded contents back out.  The div never exists on the page.
 * @param {String} inputValue - input value to be encoded
 * @return {String}
 */
export declare function htmlEncode(inputValue: string): string;
/**
 * Decode text into html entity
 * @param string text: input text
 * @param string text: output text
 */
export declare function htmlEntityDecode(input: string): string;
/**
 * Encode string to html special char and add html space padding defined
 * @param {string} inputStr - input string
 * @param {number} paddingLength - padding to add
 */
export declare function htmlEncodedStringWithPadding(inputStr: string, paddingLength: number): string;
/**
 * Sanitize, return only the text without HTML tags
 * @input htmlString
 * @return text
 */
export declare function sanitizeHtmlToText(htmlString: string): string;
/**
 * Sanitize possible dirty html string (remove any potential XSS code like scripts and others), we will use 2 possible sanitizer
 * 1. optional sanitizer method defined in the grid options
 * 2. DOMPurify sanitizer (defaults)
 * @param gridOptions: grid options
 * @param dirtyHtml: dirty html string
 * @param domPurifyOptions: optional DOMPurify options when using that sanitizer
 */
export declare function sanitizeTextByAvailableSanitizer(gridOptions: GridOption, dirtyHtml: string, domPurifyOptions?: DOMPurify_.Config): string;
/**
 * Get the Window Scroll top/left Position
 * @returns
 */
export declare function windowScrollPosition(): {
    left: number;
    top: number;
};
//# sourceMappingURL=domUtilities.d.ts.map