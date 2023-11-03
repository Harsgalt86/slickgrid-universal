/// <reference types="node" />
import type { Column, ColumnFilter, Filter, FilterArguments, FilterCallback, GridOption, OperatorDetail, SlickGrid } from '../interfaces/index';
import { OperatorType, type OperatorString, type SearchTerm } from '../enums/index';
import { BindingEventService } from '../services/bindingEvent.service';
import { type TranslaterService } from '../services';
export declare class InputFilter implements Filter {
    protected readonly translaterService: TranslaterService;
    protected _bindEventService: BindingEventService;
    protected _currentValue?: number | string;
    protected _debounceTypingDelay: number;
    protected _shouldTriggerQuery: boolean;
    protected _inputType: string;
    protected _timer?: NodeJS.Timeout;
    protected _cellContainerElm: HTMLDivElement;
    protected _filterContainerElm: HTMLDivElement;
    protected _filterInputElm: HTMLInputElement;
    protected _selectOperatorElm?: HTMLSelectElement;
    inputFilterType: 'single' | 'compound';
    grid: SlickGrid;
    searchTerms: SearchTerm[];
    columnDef: Column;
    callback: FilterCallback;
    constructor(translaterService: TranslaterService);
    /** Getter for the Column Filter */
    get columnFilter(): ColumnFilter;
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator(): OperatorType | OperatorString;
    /** Getter of input type (text, number, password) */
    get inputType(): string;
    /** Setter of input type (text, number, password) */
    set inputType(type: string);
    /** Getter for the Filter Operator */
    get operator(): OperatorType | OperatorString;
    /** Setter for the Filter Operator */
    set operator(operator: OperatorType | OperatorString);
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get gridOptions(): GridOption;
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
    getValues(): string;
    /** Set value(s) on the DOM element */
    setValues(values: SearchTerm | SearchTerm[], operator?: OperatorType | OperatorString): void;
    /**
     * When loading the search string from the outside into the input text field, we should also add the prefix/suffix of the operator.
     * We do this so that if it was loaded by a Grid Presets then we should also add the operator into the search string
     * Let's take these 3 examples:
     * 1. (operator: '>=', searchTerms:[55]) should display as ">=55"
     * 2. (operator: 'StartsWith', searchTerms:['John']) should display as "John*"
     * 3. (operator: 'EndsWith', searchTerms:['John']) should display as "*John"
     * @param operator - operator string
     */
    protected addOptionalOperatorIntoSearchString(inputValue: SearchTerm, operator: OperatorType | OperatorString): string;
    /** Get the available operator option values to populate the operator select dropdown list */
    protected getCompoundOperatorOptionValues(): OperatorDetail[];
    /**
     * From the html template string, create a DOM element
     * @param {Object} searchTerm - filter search term
     * @returns {Object} DOM element filter
     */
    protected createDomFilterElement(searchTerm?: SearchTerm): void;
    /**
     * Event handler to cover the following (keyup, change, mousewheel & spinner)
     * We will trigger the Filter Service callback from this handler
     */
    protected onTriggerEvent(event?: MouseEvent | KeyboardEvent, isClearFilterEvent?: boolean): void;
}
//# sourceMappingURL=inputFilter.d.ts.map