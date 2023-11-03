import type { OperatorString } from '../enums/index';
import type { Column, ColumnFilter, GridOption } from '../interfaces/index';
import type { Observable, RxJsFacade, Subject, Subscription } from '../services/rxjsFacade';
import type { TranslaterService } from '../services/translater.service';
/**
 * Create and return a select dropdown HTML element with a list of Operators with descriptions
 * @param {Array<Object>} optionValues - list of operators and their descriptions
 * @returns {Object} selectElm - Select Dropdown HTML Element
 */
export declare function buildSelectOperator(optionValues: Array<{
    operator: OperatorString;
    description: string;
}>, gridOptions: GridOption): HTMLSelectElement;
/**
 * Get option from filter.params OR filter.filterOptions
 * @deprecated this should be removed when slider filterParams are replaced by filterOptions
 */
export declare function getFilterOptionByName<T, K extends keyof T>(columnFilter: ColumnFilter, optionName: K, defaultValue?: any, filterName?: string): T[K] | undefined;
/**
 * When user use a CollectionAsync we will use the returned collection to render the filter DOM element
 * and reinitialize filter collection with this new collection
 */
export declare function renderDomElementFromCollectionAsync(collection: any[], columnDef: Column, renderDomElementCallback: (collection: any) => void): void;
export declare function renderCollectionOptionsAsync(collectionAsync: Promise<any | any[]> | Observable<any | any[]> | Subject<any | any[]>, columnDef: Column, renderDomElementCallback: (collection: any) => void, rxjs?: RxJsFacade, subscriptions?: Subscription[]): Promise<any[]>;
/** Create or recreate an Observable Subject and reassign it to the "collectionAsync" object so user can call a "collectionAsync.next()" on it */
export declare function createCollectionAsyncSubject(columnDef: Column, renderDomElementCallback: (collection: any) => void, rxjs?: RxJsFacade, subscriptions?: Subscription[]): void;
/** returns common list of string related operators and their associated translation descriptions */
export declare function compoundOperatorString(gridOptions: GridOption, translaterService?: TranslaterService): {
    operator: OperatorString;
    description: string;
}[];
/** returns common list of numeric related operators and their associated translation descriptions */
export declare function compoundOperatorNumeric(gridOptions: GridOption, translaterService?: TranslaterService): {
    operator: OperatorString;
    description: string;
}[];
//# sourceMappingURL=filterUtilities.d.ts.map