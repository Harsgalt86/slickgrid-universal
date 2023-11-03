import type { Column, ColumnFilter, Filter, FilterArguments, FilterCallback, GridOption, SlickGrid } from '../interfaces/index';
import { OperatorType, type OperatorString, type SearchTerm } from '../enums/index';
import type { TranslaterService } from '../services/translater.service';
import { BindingEventService } from '../services/bindingEvent.service';
export declare class NativeSelectFilter implements Filter {
    protected readonly translater: TranslaterService;
    protected _bindEventService: BindingEventService;
    protected _clearFilterTriggered: boolean;
    protected _shouldTriggerQuery: boolean;
    protected _currentValues: any | any[];
    filterElm: HTMLSelectElement;
    grid: SlickGrid;
    searchTerms: SearchTerm[];
    columnDef: Column;
    callback: FilterCallback;
    filterContainerElm: HTMLDivElement;
    constructor(translater: TranslaterService);
    /** Getter for the Column Filter itself */
    protected get columnFilter(): ColumnFilter;
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator(): OperatorType | OperatorString;
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get gridOptions(): GridOption;
    /** Getter for the current Operator */
    get operator(): OperatorType | OperatorString;
    /** Setter for the filter operator */
    set operator(operator: OperatorType | OperatorString);
    /**
     * Initialize the Filter
     */
    init(args: FilterArguments): void;
    /**
     * Clear the filter values
     */
    clear(shouldTriggerQuery?: boolean): void;
    /**
     * destroy the filter
     */
    destroy(): void;
    /**
     * Get selected values retrieved from the select element
     * @params selected items
     */
    getValues(): any[];
    /** Set value(s) on the DOM element */
    setValues(values: SearchTerm | SearchTerm[], operator?: OperatorType | OperatorString): void;
    /**
     * Create and return a select dropdown HTML element created from a collection
     * @param {Array<Object>} values - list of option values/labels
     * @returns {Object} selectElm - Select Dropdown HTML Element
     */
    buildFilterSelectFromCollection(collection: any[]): HTMLSelectElement;
    /**
     * From the html template string, create a DOM element
     * @param filterTemplate
     */
    protected createFilterElement(searchTerm?: SearchTerm): HTMLSelectElement;
    protected handleOnChange(e: any): void;
}
//# sourceMappingURL=nativeSelectFilter.d.ts.map