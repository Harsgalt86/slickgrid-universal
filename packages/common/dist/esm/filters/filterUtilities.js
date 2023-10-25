import { Constants } from '../constants';
import { createDomElement, htmlEncodedStringWithPadding, sanitizeTextByAvailableSanitizer, } from '../services/domUtilities';
import { castObservableToPromise, getDescendantProperty, getTranslationPrefix, } from '../services/utilities';
/**
 * Create and return a select dropdown HTML element with a list of Operators with descriptions
 * @param {Array<Object>} optionValues - list of operators and their descriptions
 * @returns {Object} selectElm - Select Dropdown HTML Element
 */
export function buildSelectOperator(optionValues, gridOptions) {
    const selectElm = createDomElement('select', { className: 'form-control' });
    for (const option of optionValues) {
        selectElm.appendChild(createDomElement('option', {
            value: option.operator,
            innerHTML: sanitizeTextByAvailableSanitizer(gridOptions, `${htmlEncodedStringWithPadding(option.operator, 3)}${option.description}`)
        }));
    }
    return selectElm;
}
/**
 * Get option from filter.params OR filter.filterOptions
 * @deprecated this should be removed when slider filterParams are replaced by filterOptions
 */
export function getFilterOptionByName(columnFilter, optionName, defaultValue, filterName = 'Slider') {
    var _a, _b, _c;
    let outValue;
    if (((_a = columnFilter.filterOptions) === null || _a === void 0 ? void 0 : _a[optionName]) !== undefined) {
        outValue = columnFilter.filterOptions[optionName];
    }
    else if (((_b = columnFilter === null || columnFilter === void 0 ? void 0 : columnFilter.params) === null || _b === void 0 ? void 0 : _b[optionName]) !== undefined) {
        console.warn(`[Slickgrid-Universal] All filter.params from ${filterName} Filter are moving to "filterOptions" for better typing support and "params" will be deprecated in future release.`);
        outValue = (_c = columnFilter === null || columnFilter === void 0 ? void 0 : columnFilter.params) === null || _c === void 0 ? void 0 : _c[optionName];
    }
    return outValue !== null && outValue !== void 0 ? outValue : defaultValue;
}
/**
 * When user use a CollectionAsync we will use the returned collection to render the filter DOM element
 * and reinitialize filter collection with this new collection
 */
export function renderDomElementFromCollectionAsync(collection, columnDef, renderDomElementCallback) {
    var _a, _b;
    const columnFilter = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.filter) !== null && _a !== void 0 ? _a : {};
    const collectionOptions = (_b = columnFilter === null || columnFilter === void 0 ? void 0 : columnFilter.collectionOptions) !== null && _b !== void 0 ? _b : {};
    if (collectionOptions && collectionOptions.collectionInsideObjectProperty) {
        const collectionInsideObjectProperty = collectionOptions.collectionInsideObjectProperty;
        collection = getDescendantProperty(collection, collectionInsideObjectProperty);
    }
    if (!Array.isArray(collection)) {
        throw new Error(`Something went wrong while trying to pull the collection from the "collectionAsync" call in the Filter, the collection is not a valid array.`);
    }
    // copy over the array received from the async call to the "collection" as the new collection to use
    // this has to be BEFORE the `collectionObserver().subscribe` to avoid going into an infinite loop
    columnFilter.collection = collection;
    // recreate Multiple Select after getting async collection
    renderDomElementCallback(collection);
}
export async function renderCollectionOptionsAsync(collectionAsync, columnDef, renderDomElementCallback, rxjs, subscriptions) {
    var _a, _b, _c;
    const columnFilter = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.filter) !== null && _a !== void 0 ? _a : {};
    const collectionOptions = (_b = columnFilter === null || columnFilter === void 0 ? void 0 : columnFilter.collectionOptions) !== null && _b !== void 0 ? _b : {};
    let awaitedCollection = null;
    if (collectionAsync) {
        const isObservable = (_c = rxjs === null || rxjs === void 0 ? void 0 : rxjs.isObservable(collectionAsync)) !== null && _c !== void 0 ? _c : false;
        if (isObservable && rxjs) {
            awaitedCollection = await castObservableToPromise(rxjs, collectionAsync);
        }
        // wait for the "collectionAsync", once resolved we will save it into the "collection"
        const response = await collectionAsync;
        if (Array.isArray(response)) {
            awaitedCollection = response; // from Promise
        }
        else if ((response === null || response === void 0 ? void 0 : response.status) >= 200 && response.status < 300 && typeof response.json === 'function') {
            awaitedCollection = await response['json'](); // from Fetch
        }
        else if (response && response['content']) {
            awaitedCollection = response['content']; // from http-client
        }
        if (!Array.isArray(awaitedCollection) && (collectionOptions === null || collectionOptions === void 0 ? void 0 : collectionOptions.collectionInsideObjectProperty)) {
            const collection = awaitedCollection || response;
            const collectionInsideObjectProperty = collectionOptions.collectionInsideObjectProperty;
            awaitedCollection = getDescendantProperty(collection, collectionInsideObjectProperty || '');
        }
        if (!Array.isArray(awaitedCollection)) {
            throw new Error('Something went wrong while trying to pull the collection from the "collectionAsync" call in the Filter, the collection is not a valid array.');
        }
        // copy over the array received from the async call to the "collection" as the new collection to use
        // this has to be BEFORE the `collectionObserver().subscribe` to avoid going into an infinite loop
        columnFilter.collection = awaitedCollection;
        // recreate Multiple Select after getting async collection
        renderDomElementCallback(awaitedCollection);
        // because we accept Promises & HttpClient Observable only execute once
        // we will re-create an RxJs Subject which will replace the "collectionAsync" which got executed once anyway
        // doing this provide the user a way to call a "collectionAsync.next()"
        if (isObservable) {
            createCollectionAsyncSubject(columnDef, renderDomElementCallback, rxjs, subscriptions);
        }
    }
    return awaitedCollection;
}
/** Create or recreate an Observable Subject and reassign it to the "collectionAsync" object so user can call a "collectionAsync.next()" on it */
export function createCollectionAsyncSubject(columnDef, renderDomElementCallback, rxjs, subscriptions) {
    var _a;
    const columnFilter = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.filter) !== null && _a !== void 0 ? _a : {};
    const newCollectionAsync = rxjs === null || rxjs === void 0 ? void 0 : rxjs.createSubject();
    columnFilter.collectionAsync = newCollectionAsync;
    if (subscriptions && newCollectionAsync) {
        subscriptions.push(newCollectionAsync.subscribe(collection => renderDomElementFromCollectionAsync(collection, columnDef, renderDomElementCallback)));
    }
}
/** Get Locale, Translated or a Default Text if first two aren't detected */
function getOutputText(translationKey, localeText, defaultText, gridOptions, translaterService) {
    var _a;
    if ((gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.enableTranslate) && (translaterService === null || translaterService === void 0 ? void 0 : translaterService.translate)) {
        const translationPrefix = getTranslationPrefix(gridOptions);
        return translaterService.translate(`${translationPrefix}${translationKey}`);
    }
    const locales = gridOptions.locales || Constants.locales;
    return (_a = locales === null || locales === void 0 ? void 0 : locales[localeText]) !== null && _a !== void 0 ? _a : defaultText;
}
/** returns common list of string related operators and their associated translation descriptions */
export function compoundOperatorString(gridOptions, translaterService) {
    return [
        { operator: '', description: getOutputText('CONTAINS', 'TEXT_CONTAINS', 'Contains', gridOptions, translaterService) },
        { operator: '<>', description: getOutputText('NOT_CONTAINS', 'TEXT_NOT_CONTAINS', 'Not Contains', gridOptions, translaterService) },
        { operator: '=', description: getOutputText('EQUALS', 'TEXT_EQUALS', 'Equals', gridOptions, translaterService) },
        { operator: '!=', description: getOutputText('NOT_EQUAL_TO', 'TEXT_NOT_EQUAL_TO', 'Not equal to', gridOptions, translaterService) },
        { operator: 'a*', description: getOutputText('STARTS_WITH', 'TEXT_STARTS_WITH', 'Starts with', gridOptions, translaterService) },
        { operator: '*z', description: getOutputText('ENDS_WITH', 'TEXT_ENDS_WITH', 'Ends with', gridOptions, translaterService) },
    ];
}
/** returns common list of numeric related operators and their associated translation descriptions */
export function compoundOperatorNumeric(gridOptions, translaterService) {
    return [
        { operator: '', description: '' },
        { operator: '=', description: getOutputText('EQUAL_TO', 'TEXT_EQUAL_TO', 'Equal to', gridOptions, translaterService) },
        { operator: '<', description: getOutputText('LESS_THAN', 'TEXT_LESS_THAN', 'Less than', gridOptions, translaterService) },
        { operator: '<=', description: getOutputText('LESS_THAN_OR_EQUAL_TO', 'TEXT_LESS_THAN_OR_EQUAL_TO', 'Less than or equal to', gridOptions, translaterService) },
        { operator: '>', description: getOutputText('GREATER_THAN', 'TEXT_GREATER_THAN', 'Greater than', gridOptions, translaterService) },
        { operator: '>=', description: getOutputText('GREATER_THAN_OR_EQUAL_TO', 'TEXT_GREATER_THAN_OR_EQUAL_TO', 'Greater than or equal to', gridOptions, translaterService) },
        { operator: '<>', description: getOutputText('NOT_EQUAL_TO', 'TEXT_NOT_EQUAL_TO', 'Not equal to', gridOptions, translaterService) }
    ];
}
//# sourceMappingURL=filterUtilities.js.map