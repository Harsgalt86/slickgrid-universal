"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowScrollPosition = exports.sanitizeTextByAvailableSanitizer = exports.sanitizeHtmlToText = exports.htmlEncodedStringWithPadding = exports.htmlEntityDecode = exports.htmlEncode = exports.findWidthOrDefault = exports.findFirstElementAttribute = exports.getSelectorStringFromElement = exports.getElementProp = exports.getInnerSize = exports.getHtmlElementOffset = exports.getElementOffsetRelativeToParent = exports.emptyElement = exports.destroyObjectDomElementProps = exports.createDomElement = exports.calculateAvailableSpace = exports.buildMultipleSelectDataCollection = void 0;
const DOMPurify_ = require("dompurify");
const DOMPurify = ((_a = DOMPurify_ === null || DOMPurify_ === void 0 ? void 0 : DOMPurify_['default']) !== null && _a !== void 0 ? _a : DOMPurify_); // patch for rollup
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
function buildMultipleSelectDataCollection(type, collection, columnDef, grid, isMultiSelect = false, translaterService, searchTerms) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    const columnId = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.id) !== null && _a !== void 0 ? _a : '';
    const gridOptions = grid.getOptions();
    const columnFilterOrEditor = (_b = (type === 'editor' ? columnDef === null || columnDef === void 0 ? void 0 : columnDef.internalColumnEditor : columnDef === null || columnDef === void 0 ? void 0 : columnDef.filter)) !== null && _b !== void 0 ? _b : {};
    const collectionOptions = (_c = columnFilterOrEditor === null || columnFilterOrEditor === void 0 ? void 0 : columnFilterOrEditor.collectionOptions) !== null && _c !== void 0 ? _c : {};
    const separatorBetweenLabels = (_d = collectionOptions === null || collectionOptions === void 0 ? void 0 : collectionOptions.separatorBetweenTextLabels) !== null && _d !== void 0 ? _d : '';
    const enableTranslateLabel = (_e = columnFilterOrEditor === null || columnFilterOrEditor === void 0 ? void 0 : columnFilterOrEditor.enableTranslateLabel) !== null && _e !== void 0 ? _e : false;
    const isTranslateEnabled = (_f = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.enableTranslate) !== null && _f !== void 0 ? _f : false;
    const isRenderHtmlEnabled = (_g = columnFilterOrEditor === null || columnFilterOrEditor === void 0 ? void 0 : columnFilterOrEditor.enableRenderHtml) !== null && _g !== void 0 ? _g : false;
    const sanitizedOptions = (_h = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.sanitizeHtmlOptions) !== null && _h !== void 0 ? _h : {};
    const labelName = (_k = (_j = columnFilterOrEditor === null || columnFilterOrEditor === void 0 ? void 0 : columnFilterOrEditor.customStructure) === null || _j === void 0 ? void 0 : _j.label) !== null && _k !== void 0 ? _k : 'label';
    const labelPrefixName = (_m = (_l = columnFilterOrEditor === null || columnFilterOrEditor === void 0 ? void 0 : columnFilterOrEditor.customStructure) === null || _l === void 0 ? void 0 : _l.labelPrefix) !== null && _m !== void 0 ? _m : 'labelPrefix';
    const labelSuffixName = (_p = (_o = columnFilterOrEditor === null || columnFilterOrEditor === void 0 ? void 0 : columnFilterOrEditor.customStructure) === null || _o === void 0 ? void 0 : _o.labelSuffix) !== null && _p !== void 0 ? _p : 'labelSuffix';
    const optionLabel = (_r = (_q = columnFilterOrEditor === null || columnFilterOrEditor === void 0 ? void 0 : columnFilterOrEditor.customStructure) === null || _q === void 0 ? void 0 : _q.optionLabel) !== null && _r !== void 0 ? _r : 'value';
    const valueName = (_t = (_s = columnFilterOrEditor === null || columnFilterOrEditor === void 0 ? void 0 : columnFilterOrEditor.customStructure) === null || _s === void 0 ? void 0 : _s.value) !== null && _t !== void 0 ? _t : 'value';
    const selectElement = createDomElement('select', { className: 'ms-filter search-filter' });
    const extraCssClasses = type === 'filter' ? ['search-filter', `filter-${columnId}`] : ['select-editor', `editor-${columnId}`];
    selectElement.classList.add(...extraCssClasses);
    selectElement.multiple = isMultiSelect;
    const dataCollection = [];
    let hasFoundSearchTerm = false;
    // collection could be an Array of Strings OR Objects
    if (Array.isArray(collection)) {
        if (collection.every((x) => typeof x === 'number' || typeof x === 'string')) {
            for (const option of collection) {
                const selectOption = { text: option, value: option };
                if (type === 'filter' && Array.isArray(searchTerms)) {
                    selectOption.selected = (searchTerms.findIndex(term => term === option) >= 0); // when filter search term is found then select it in dropdown
                }
                dataCollection.push(selectOption);
                // if there's at least 1 Filter search term found, we will add the "filled" class for styling purposes
                // on a single select, we'll also make sure the single value is not an empty string to consider this being filled
                if ((selectOption.selected && isMultiSelect) || (selectOption.selected && !isMultiSelect && option !== '')) {
                    hasFoundSearchTerm = true;
                }
            }
        }
        else {
            // array of objects will require a label/value pair unless a customStructure is passed
            collection.forEach((option) => {
                if (option === undefined || (typeof option === 'object' && option[labelName] === undefined && option.labelKey === undefined)) {
                    throw new Error(`[Slickgrid-Universal] Select Filter/Editor collection with value/label (or value/labelKey when using Locale) is required to populate the Select list, for example:: { filter: model: Filters.multipleSelect, collection: [ { value: '1', label: 'One' } ]')`);
                }
                const labelKey = (option.labelKey || option[labelName]);
                const labelText = ((option.labelKey || (enableTranslateLabel && translaterService)) && labelKey && isTranslateEnabled) ? translaterService === null || translaterService === void 0 ? void 0 : translaterService.translate(labelKey || ' ') : labelKey;
                let prefixText = option[labelPrefixName] || '';
                let suffixText = option[labelSuffixName] || '';
                let selectOptionLabel = option.hasOwnProperty(optionLabel) ? option[optionLabel] : '';
                if (selectOptionLabel === null || selectOptionLabel === void 0 ? void 0 : selectOptionLabel.toString) {
                    selectOptionLabel = selectOptionLabel.toString().replace(/\"/g, '\''); // replace double quotes by single quotes to avoid interfering with regular html
                }
                // also translate prefix/suffix if enableTranslateLabel is true and text is a string
                prefixText = (enableTranslateLabel && translaterService && prefixText && typeof prefixText === 'string') ? translaterService.translate(prefixText || ' ') : prefixText;
                suffixText = (enableTranslateLabel && translaterService && suffixText && typeof suffixText === 'string') ? translaterService.translate(suffixText || ' ') : suffixText;
                selectOptionLabel = (enableTranslateLabel && translaterService && selectOptionLabel && typeof selectOptionLabel === 'string') ? translaterService.translate(selectOptionLabel || ' ') : selectOptionLabel;
                // add to a temp array for joining purpose and filter out empty text
                const tmpOptionArray = [prefixText, (typeof labelText === 'string' || typeof labelText === 'number') ? labelText.toString() : labelText, suffixText].filter((text) => text);
                let optionText = tmpOptionArray.join(separatorBetweenLabels);
                const selectOption = { text: '', value: '' };
                // if user specifically wants to render html text, he needs to opt-in else it will be stripped out by default
                // also, the 3rd party lib will saninitze any html code unless it's encoded, so we'll do that
                if (isRenderHtmlEnabled) {
                    // sanitize any unauthorized html tags like script and others
                    // for the remaining allowed tags we'll permit all attributes
                    optionText = sanitizeTextByAvailableSanitizer(gridOptions, optionText, sanitizedOptions);
                }
                selectOption.text = optionText;
                // html text of each select option
                let selectOptionValue = option[valueName];
                if (selectOptionValue === undefined || selectOptionValue === null) {
                    selectOptionValue = '';
                }
                if (type === 'filter' && Array.isArray(searchTerms)) {
                    selectOption.selected = (searchTerms.findIndex(term => `${term}` === `${option[valueName]}`) >= 0); // when filter search term is found then select it in dropdown
                }
                selectOption.value = `${selectOptionValue !== null && selectOptionValue !== void 0 ? selectOptionValue : ''}`; // we'll convert every value to string for better equality checks
                dataCollection.push(selectOption);
                // if there's a search term, we will add the "filled" class for styling purposes
                // on a single select, we'll also make sure the single value is not an empty string to consider this being filled
                if ((selectOption.selected && isMultiSelect) || (selectOption.selected && !isMultiSelect && option[valueName] !== '')) {
                    hasFoundSearchTerm = true;
                }
            });
        }
    }
    return { selectElement, dataCollection, hasFoundSearchTerm };
}
exports.buildMultipleSelectDataCollection = buildMultipleSelectDataCollection;
/** calculate available space for each side of the DOM element */
function calculateAvailableSpace(element) {
    var _a, _b, _c, _d;
    let bottom = 0;
    let top = 0;
    let left = 0;
    let right = 0;
    const windowHeight = (_a = window.innerHeight) !== null && _a !== void 0 ? _a : 0;
    const windowWidth = (_b = window.innerWidth) !== null && _b !== void 0 ? _b : 0;
    const scrollPosition = windowScrollPosition();
    const pageScrollTop = scrollPosition.top;
    const pageScrollLeft = scrollPosition.left;
    const elmOffset = getHtmlElementOffset(element);
    if (elmOffset) {
        const elementOffsetTop = (_c = elmOffset.top) !== null && _c !== void 0 ? _c : 0;
        const elementOffsetLeft = (_d = elmOffset.left) !== null && _d !== void 0 ? _d : 0;
        top = elementOffsetTop - pageScrollTop;
        bottom = windowHeight - (elementOffsetTop - pageScrollTop);
        left = elementOffsetLeft - pageScrollLeft;
        right = windowWidth - (elementOffsetLeft - pageScrollLeft);
    }
    return { top, bottom, left, right };
}
exports.calculateAvailableSpace = calculateAvailableSpace;
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
function createDomElement(tagName, elementOptions, appendToParent) {
    const elm = document.createElement(tagName);
    if (elementOptions) {
        Object.keys(elementOptions).forEach((elmOptionKey) => {
            if (elmOptionKey === 'innerHTML') {
                console.warn(`[Slickgrid-Universal] For better CSP (Content Security Policy) support, do not use "innerHTML" directly in "createDomElement('${tagName}', { innerHTML: 'some html'})", ` +
                    `it is better as separate assignment: "const elm = createDomElement('span'); elm.innerHTML = 'some html';"`);
            }
            const elmValue = elementOptions[elmOptionKey];
            if (typeof elmValue === 'object') {
                Object.assign(elm[elmOptionKey], elmValue);
            }
            else {
                elm[elmOptionKey] = elementOptions[elmOptionKey];
            }
        });
    }
    if (appendToParent === null || appendToParent === void 0 ? void 0 : appendToParent.appendChild) {
        appendToParent.appendChild(elm);
    }
    return elm;
}
exports.createDomElement = createDomElement;
/**
 * Loop through all properties of an object and nullify any properties that are instanceof HTMLElement,
 * if we detect an array then use recursion to go inside it and apply same logic
 * @param obj - object containing 1 or more properties with DOM Elements
 */
function destroyObjectDomElementProps(obj) {
    if (obj) {
        for (const key of Object.keys(obj)) {
            if (Array.isArray(obj[key])) {
                destroyObjectDomElementProps(obj[key]);
            }
            if (obj[key] instanceof HTMLElement) {
                obj[key] = null;
            }
        }
    }
}
exports.destroyObjectDomElementProps = destroyObjectDomElementProps;
/**
 * Empty a DOM element by removing all of its DOM element children leaving with an empty element (basically an empty shell)
 * @return {object} element - updated element
 */
function emptyElement(element) {
    if (element === null || element === void 0 ? void 0 : element.firstChild) {
        while (element.firstChild) {
            if (element.lastChild) {
                element.removeChild(element.lastChild);
            }
        }
    }
    return element;
}
exports.emptyElement = emptyElement;
/** Get offset of HTML element relative to a parent element */
function getElementOffsetRelativeToParent(parentElm, childElm) {
    if (!parentElm || !childElm) {
        return undefined;
    }
    const parentPos = parentElm.getBoundingClientRect();
    const childPos = childElm.getBoundingClientRect();
    return {
        top: childPos.top - parentPos.top,
        right: childPos.right - parentPos.right,
        bottom: childPos.bottom - parentPos.bottom,
        left: childPos.left - parentPos.left,
    };
}
exports.getElementOffsetRelativeToParent = getElementOffsetRelativeToParent;
/** Get HTML element offset with pure JS */
function getHtmlElementOffset(element) {
    var _a;
    if (!element) {
        return undefined;
    }
    const rect = (_a = element === null || element === void 0 ? void 0 : element.getBoundingClientRect) === null || _a === void 0 ? void 0 : _a.call(element);
    let top = 0;
    let left = 0;
    let bottom = 0;
    let right = 0;
    if ((rect === null || rect === void 0 ? void 0 : rect.top) !== undefined && rect.left !== undefined) {
        top = rect.top + window.pageYOffset;
        left = rect.left + window.pageXOffset;
        right = rect.right;
        bottom = rect.bottom;
    }
    return { top, left, bottom, right };
}
exports.getHtmlElementOffset = getHtmlElementOffset;
function getInnerSize(elm, type) {
    let size = 0;
    if (elm) {
        const clientSize = type === 'height' ? 'clientHeight' : 'clientWidth';
        const sides = type === 'height' ? ['top', 'bottom'] : ['left', 'right'];
        size = elm[clientSize];
        for (const side of sides) {
            size -= (parseFloat(getElementProp(elm, `padding-${side}`)) || 0);
        }
    }
    return size;
}
exports.getInnerSize = getInnerSize;
function getElementProp(elm, property) {
    return window.getComputedStyle(elm, null).getPropertyValue(property);
}
exports.getElementProp = getElementProp;
function getSelectorStringFromElement(elm) {
    let selector = '';
    if (elm === null || elm === void 0 ? void 0 : elm.localName) {
        selector = (elm === null || elm === void 0 ? void 0 : elm.className) ? `${elm.localName}.${Array.from(elm.classList).join('.')}` : elm.localName;
    }
    return selector;
}
exports.getSelectorStringFromElement = getSelectorStringFromElement;
function findFirstElementAttribute(inputElm, attributes) {
    if (inputElm) {
        for (const attribute of attributes) {
            const attrData = inputElm.getAttribute(attribute);
            if (attrData) {
                return attrData;
            }
        }
    }
    return null;
}
exports.findFirstElementAttribute = findFirstElementAttribute;
/**
 * Provide a width as a number or a string and find associated value in valid css style format or use default value when provided (or "auto" otherwise).
 * @param {Number|String} inputWidth - input width, could be a string or number
 * @param {Number | String} defaultValue [defaultValue=auto] - optional default value or use "auto" when nothing is provided
 * @returns {String} string output
 */
function findWidthOrDefault(inputWidth, defaultValue = 'auto') {
    return (/^[0-9]+$/i.test(`${inputWidth}`) ? `${+inputWidth}px` : inputWidth) || defaultValue;
}
exports.findWidthOrDefault = findWidthOrDefault;
/**
 * HTML encode using a plain <div>
 * Create a in-memory div, set it's inner text(which a div can encode)
 * then grab the encoded contents back out.  The div never exists on the page.
 * @param {String} inputValue - input value to be encoded
 * @return {String}
 */
function htmlEncode(inputValue) {
    const val = typeof inputValue === 'string' ? inputValue : String(inputValue);
    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;',
    };
    return (val || '').toString().replace(/[&<>"']/g, (s) => entityMap[s]);
}
exports.htmlEncode = htmlEncode;
/**
 * Decode text into html entity
 * @param string text: input text
 * @param string text: output text
 */
function htmlEntityDecode(input) {
    return input.replace(/&#(\d+);/g, (_match, dec) => {
        return String.fromCharCode(dec);
    });
}
exports.htmlEntityDecode = htmlEntityDecode;
/**
 * Encode string to html special char and add html space padding defined
 * @param {string} inputStr - input string
 * @param {number} paddingLength - padding to add
 */
function htmlEncodedStringWithPadding(inputStr, paddingLength) {
    const inputStrLn = inputStr.length;
    let outputStr = htmlEncode(inputStr);
    if (inputStrLn < paddingLength) {
        for (let i = inputStrLn; i < paddingLength; i++) {
            outputStr += `&nbsp;`;
        }
    }
    return outputStr;
}
exports.htmlEncodedStringWithPadding = htmlEncodedStringWithPadding;
/**
 * Sanitize, return only the text without HTML tags
 * @input htmlString
 * @return text
 */
function sanitizeHtmlToText(htmlString) {
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;
    return temp.textContent || temp.innerText || '';
}
exports.sanitizeHtmlToText = sanitizeHtmlToText;
/**
 * Sanitize possible dirty html string (remove any potential XSS code like scripts and others), we will use 2 possible sanitizer
 * 1. optional sanitizer method defined in the grid options
 * 2. DOMPurify sanitizer (defaults)
 * @param gridOptions: grid options
 * @param dirtyHtml: dirty html string
 * @param domPurifyOptions: optional DOMPurify options when using that sanitizer
 */
function sanitizeTextByAvailableSanitizer(gridOptions, dirtyHtml, domPurifyOptions) {
    let sanitizedText = dirtyHtml;
    if (typeof (gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.sanitizer) === 'function') {
        sanitizedText = gridOptions.sanitizer(dirtyHtml || '');
    }
    else if (typeof (DOMPurify === null || DOMPurify === void 0 ? void 0 : DOMPurify.sanitize) === 'function') {
        sanitizedText = (DOMPurify.sanitize(dirtyHtml || '', domPurifyOptions || { RETURN_TRUSTED_TYPE: true }) || '').toString();
    }
    return sanitizedText;
}
exports.sanitizeTextByAvailableSanitizer = sanitizeTextByAvailableSanitizer;
/**
 * Get the Window Scroll top/left Position
 * @returns
 */
function windowScrollPosition() {
    return {
        left: window.pageXOffset || document.documentElement.scrollLeft || 0,
        top: window.pageYOffset || document.documentElement.scrollTop || 0,
    };
}
exports.windowScrollPosition = windowScrollPosition;
//# sourceMappingURL=domUtilities.js.map