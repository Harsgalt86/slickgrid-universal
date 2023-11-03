import { MultipleSelectInstance, MultipleSelectOption, OptionRowData } from 'multiple-select-vanilla';
import { type OperatorString, OperatorType, type SearchTerm } from '../enums/index';
import type { CollectionCustomStructure, CollectionOption, Column, ColumnFilter, Filter, FilterArguments, FilterCallback, GridOption, Locale, SlickGrid } from './../interfaces/index';
import type { CollectionService } from '../services/collection.service';
import { type RxJsFacade, type Subscription, type TranslaterService } from '../services/index';
export declare class SelectFilter implements Filter {
    protected readonly translaterService: TranslaterService;
    protected readonly collectionService: CollectionService;
    protected readonly rxjs?: RxJsFacade | undefined;
    protected _isMultipleSelect: boolean;
    protected _collectionLength: number;
    protected _locales: Locale;
    protected _msInstance?: MultipleSelectInstance;
    protected _shouldTriggerQuery: boolean;
    /** DOM Element Name, useful for auto-detecting positioning (dropup / dropdown) */
    elementName: string;
    /** Filter Multiple-Select options */
    filterElmOptions: Partial<MultipleSelectOption>;
    /** The DOM element */
    filterElm?: HTMLElement;
    grid: SlickGrid;
    searchTerms: SearchTerm[] | undefined;
    columnDef: Column;
    callback: FilterCallback;
    defaultOptions: Partial<MultipleSelectOption>;
    isFilled: boolean;
    labelName: string;
    labelPrefixName: string;
    labelSuffixName: string;
    optionLabel: string;
    valueName: string;
    enableTranslateLabel: boolean;
    subscriptions: Subscription[];
    filterContainerElm: HTMLDivElement;
    /**
     * Initialize the Filter
     */
    constructor(translaterService: TranslaterService, collectionService: CollectionService, rxjs?: RxJsFacade | undefined, isMultipleSelect?: boolean);
    /** Getter for the Collection Options */
    protected get collectionOptions(): CollectionOption;
    /** Getter for the Filter Operator */
    get columnFilter(): ColumnFilter;
    /** Getter for the Custom Structure if exist */
    get customStructure(): CollectionCustomStructure | undefined;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator(): OperatorType | OperatorString;
    /** Getter to know if the current filter is a multiple-select (false means it's a single select) */
    get isMultipleSelect(): boolean;
    get msInstance(): MultipleSelectInstance | undefined;
    get selectOptions(): Partial<MultipleSelectOption>;
    /** Getter for the Filter Operator */
    get operator(): OperatorType | OperatorString;
    /** Setter for the filter operator */
    set operator(operator: OperatorType | OperatorString);
    /** Initialize the filter template */
    init(args: FilterArguments): Promise<any[]>;
    /** Clear the filter values */
    clear(shouldTriggerQuery?: boolean): void;
    /** destroy the filter */
    destroy(): void;
    /**
     * Get selected values retrieved from the multiple-selected element
     * @params selected items
     */
    getValues(): any[];
    /** Set value(s) on the DOM element */
    setValues(values: SearchTerm | SearchTerm[], operator?: OperatorType | OperatorString): void;
    /**
     * user might want to filter certain items of the collection
     * @param inputCollection
     * @return outputCollection filtered and/or sorted collection
     */
    protected filterCollection(inputCollection: any[]): any[];
    /**
     * user might want to sort the collection in a certain way
     * @param inputCollection
     * @return outputCollection filtered and/or sorted collection
     */
    protected sortCollection(inputCollection: any[]): any[];
    /**
     * Subscribe to both CollectionObserver & PropertyObserver with BindingEngine.
     * They each have their own purpose, the "propertyObserver" will trigger once the collection is replaced entirely
     * while the "collectionObverser" will trigger on collection changes (`push`, `unshift`, `splice`, ...)
     */
    protected watchCollectionChanges(): void;
    renderDomElement(inputCollection: any[]): void;
    /** Create a blank entry that can be added to the collection. It will also reuse the same collection structure provided by the user */
    protected createBlankEntry(): any;
    /**
     * From the Select DOM Element created earlier, create a Multiple/Single Select Filter using the multiple-select-vanilla.js lib
     * @param {Object} selectElement
     */
    protected createFilterElement(selectElement: HTMLSelectElement, dataCollection: OptionRowData[]): void;
    protected initMultipleSelectTemplate(): void;
    protected onTriggerEvent(): void;
    /** Set value(s) on the DOM element */
    protected updateFilterStyle(isFilled: boolean): void;
}
//# sourceMappingURL=selectFilter.d.ts.map