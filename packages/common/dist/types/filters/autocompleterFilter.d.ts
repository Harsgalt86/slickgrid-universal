import type { AutocompleteItem } from 'autocompleter';
import { OperatorType, type OperatorString, type SearchTerm } from '../enums/index';
import type { AutocompleterOption, AutocompleteSearchItem, CollectionCustomStructure, CollectionOption, Column, ColumnFilter, DOMEvent, Filter, FilterArguments, FilterCallback, GridOption, Locale, SlickGrid } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
import type { CollectionService } from '../services/collection.service';
import type { TranslaterService } from '../services/translater.service';
import type { RxJsFacade, Subscription } from '../services/rxjsFacade';
export declare class AutocompleterFilter<T extends AutocompleteItem = any> implements Filter {
    protected readonly translaterService: TranslaterService;
    protected readonly collectionService: CollectionService;
    protected readonly rxjs?: RxJsFacade | undefined;
    protected _autocompleterOptions: Partial<AutocompleterOption<T>>;
    protected _bindEventService: BindingEventService;
    protected _clearFilterTriggered: boolean;
    protected _collection?: any[];
    protected _filterElm: HTMLInputElement;
    protected _instance: any;
    protected _locales: Locale;
    protected _shouldTriggerQuery: boolean;
    /** DOM Element Name, useful for auto-detecting positioning (dropup / dropdown) */
    elementName: string;
    grid: SlickGrid;
    searchTerms: SearchTerm[];
    columnDef: Column;
    callback: FilterCallback;
    isFilled: boolean;
    isItemSelected: boolean;
    filterContainerElm: HTMLDivElement;
    /** The property name for labels in the collection */
    labelName: string;
    /** The property name for a prefix that can be added to the labels in the collection */
    labelPrefixName: string;
    /** The property name for a suffix that can be added to the labels in the collection */
    labelSuffixName: string;
    /** The property name for values in the collection */
    optionLabel: string;
    /** The property name for values in the collection */
    valueName: string;
    enableTranslateLabel: boolean;
    subscriptions: Subscription[];
    /**
     * Initialize the Filter
     */
    constructor(translaterService: TranslaterService, collectionService: CollectionService, rxjs?: RxJsFacade | undefined);
    /** Getter for the Autocomplete Option */
    get autocompleterOptions(): any;
    /** Getter for the Collection Options */
    protected get collectionOptions(): CollectionOption;
    /** Getter for the Collection Used by the Filter */
    get collection(): any[] | undefined;
    /** Getter for the Filter Operator */
    get columnFilter(): ColumnFilter;
    /** Getter for the Editor DOM Element */
    get filterDomElement(): any;
    get filterOptions(): any;
    /** Getter for the Custom Structure if exist */
    get customStructure(): CollectionCustomStructure | undefined;
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator(): OperatorType | OperatorString;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    /** Kraaden AutoComplete instance */
    get instance(): any;
    /** Getter of the Operator to use when doing the filter comparing */
    get operator(): OperatorType | OperatorString;
    /** Setter for the filter operator */
    set operator(operator: OperatorType | OperatorString);
    /**
     * Initialize the filter template
     */
    init(args: FilterArguments): Promise<unknown>;
    /**
     * Clear the filter value
     */
    clear(shouldTriggerQuery?: boolean): void;
    /**
     * destroy the filter
     */
    destroy(): void;
    getValues(): string;
    /** Set value(s) on the DOM element  */
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
    renderDomElement(collection?: any[]): void;
    /**
     * Create the autocomplete filter DOM element
     * @param collection
     * @param searchTerm
     * @returns
     */
    protected createFilterElement(collection?: any[], searchTerm?: SearchTerm): HTMLInputElement;
    handleSelect(item: AutocompleteSearchItem): boolean;
    protected handleOnInputChange(e: DOMEvent<HTMLInputElement>): void;
    protected renderRegularItem(item: T): HTMLDivElement;
    protected renderCustomItem(item: T): HTMLDivElement;
    protected renderCollectionItem(item: any): HTMLDivElement;
    /**
     * Trim whitespaces when option is enabled globally or on the filter itself
     * @param value - value found which could be a string or an object
     * @returns - trimmed value when it is a string and the feature is enabled
     */
    protected trimWhitespaceWhenEnabled(value: any): any;
}
//# sourceMappingURL=autocompleterFilter.d.ts.map