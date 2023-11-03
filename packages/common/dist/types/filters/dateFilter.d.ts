import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import { OperatorType, type OperatorString, type SearchTerm } from '../enums/index';
import type { Column, ColumnFilter, Filter, FilterArguments, FilterCallback, FlatpickrOption, GridOption, OperatorDetail, SlickGrid } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
import type { TranslaterService } from '../services/translater.service';
export declare class DateFilter implements Filter {
    protected readonly translaterService: TranslaterService;
    protected _bindEventService: BindingEventService;
    protected _clearFilterTriggered: boolean;
    protected _currentValue?: string;
    protected _currentDateOrDates?: Date | Date[] | string[];
    protected _currentDateStrings?: string[];
    protected _flatpickrOptions: FlatpickrOption;
    protected _filterElm: HTMLDivElement;
    protected _filterDivInputElm: HTMLDivElement;
    protected _operator: OperatorType | OperatorString;
    protected _selectOperatorElm?: HTMLSelectElement;
    protected _shouldTriggerQuery: boolean;
    inputFilterType: 'compound' | 'range';
    flatInstance: FlatpickrInstance;
    grid: SlickGrid;
    searchTerms: SearchTerm[];
    columnDef: Column;
    callback: FilterCallback;
    filterContainerElm: HTMLDivElement;
    constructor(translaterService: TranslaterService);
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get gridOptions(): GridOption;
    /** Getter for the Column Filter */
    get columnFilter(): ColumnFilter;
    /** Getter for the Current Date(s) selected */
    get currentDateOrDates(): Date | string[] | Date[] | undefined;
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator(): OperatorType | OperatorString;
    /** Getter for the Flatpickr Options */
    get flatpickrOptions(): FlatpickrOption;
    /** Getter for the Filter Operator */
    get operator(): OperatorType | OperatorString;
    /** Setter for the filter operator */
    set operator(operator: OperatorType | OperatorString);
    /**
     * Initialize the Filter
     */
    init(args: FilterArguments): void;
    /**
     * Clear the filter value
     */
    clear(shouldTriggerQuery?: boolean): void;
    /**
     * destroy the filter
     */
    destroy(): void;
    hide(): void;
    show(): void;
    getValues(): Date | string[] | Date[] | undefined;
    /**
     * Set value(s) on the DOM element
     * @params searchTerms
     */
    setValues(values?: SearchTerm[] | SearchTerm, operator?: OperatorType | OperatorString): void;
    protected buildDatePickerInput(searchTerms?: SearchTerm | SearchTerm[]): HTMLDivElement;
    /** Get the available operator option values to populate the operator select dropdown list */
    protected getOperatorOptionValues(): OperatorDetail[];
    /**
     * Create the DOM element
     * @params searchTerms
     */
    protected createDomFilterElement(searchTerms?: SearchTerm | SearchTerm[]): HTMLDivElement;
    protected onTriggerEvent(e: Event | undefined): void;
}
//# sourceMappingURL=dateFilter.d.ts.map