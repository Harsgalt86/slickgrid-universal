import { type OperatorString, OperatorType, type SearchTerm } from '../enums/index';
import type { Column, ColumnFilter, CurrentSliderOption, Filter, FilterArguments, FilterCallback, GridOption, OperatorDetail, SlickGrid, SliderType } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
import type { TranslaterService } from '../services/translater.service';
/** A Slider Range Filter written in pure JS, this is only meant to be used as a range filter (with 2 handles lowest & highest values) */
export declare class SliderFilter implements Filter {
    protected readonly translaterService: TranslaterService;
    protected _bindEventService: BindingEventService;
    protected _clearFilterTriggered: boolean;
    protected _currentValue?: number;
    protected _currentValues?: number[];
    protected _shouldTriggerQuery: boolean;
    protected _sliderOptions: CurrentSliderOption;
    protected _operator?: OperatorType | OperatorString;
    protected _filterElm: HTMLDivElement;
    protected _argFilterContainerElm: HTMLDivElement;
    protected _divContainerFilterElm: HTMLDivElement;
    protected _filterContainerElm: HTMLDivElement;
    protected _leftSliderNumberElm?: HTMLSpanElement;
    protected _rightSliderNumberElm?: HTMLSpanElement;
    protected _selectOperatorElm?: HTMLSelectElement;
    protected _sliderRangeContainElm: HTMLDivElement;
    protected _sliderTrackElm: HTMLDivElement;
    protected _sliderLeftInputElm?: HTMLInputElement;
    protected _sliderRightInputElm?: HTMLInputElement;
    protected _sliderTrackFilledColor: string;
    sliderType: SliderType;
    grid: SlickGrid;
    searchTerms: SearchTerm[];
    columnDef: Column;
    callback: FilterCallback;
    constructor(translaterService: TranslaterService);
    /** Getter for the Column Filter */
    get columnFilter(): ColumnFilter;
    /** Getter for the Current Slider Value */
    get currentValue(): number | undefined;
    /** Getter for the Current Slider Values */
    get currentValues(): number[] | undefined;
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator(): OperatorType | OperatorString;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    /** Getter for the current Slider Options */
    get sliderOptions(): CurrentSliderOption | undefined;
    /** Getter for the Filter Operator */
    get operator(): OperatorType | OperatorString;
    /** Setter for the Filter Operator */
    set operator(operator: OperatorType | OperatorString);
    /** Initialize the Filter */
    init(args: FilterArguments): void;
    /** Clear the filter value */
    clear(shouldTriggerQuery?: boolean): void;
    /** destroy the filter */
    destroy(): void;
    /**
     * Render both slider values (low/high) on screen
     * @param leftValue number
     * @param rightValue number
     */
    renderSliderValues(leftValue?: number | string, rightValue?: number | string): void;
    /** get current slider value(s), it could be a single value or an array of 2 values depending on the slider filter type */
    getValues(): number | number[] | undefined;
    /**
     * Set value(s) on the DOM element
     * @params searchTerms
     */
    setValues(values: SearchTerm | SearchTerm[], operator?: OperatorType | OperatorString): void;
    /**
     * Create the Filter DOM element
     * Follows article with few modifications (without tooltip & neither slider track color)
     * https://codingartistweb.com/2021/06/double-range-slider-html-css-javascript/
     * @param searchTerm optional preset search terms
     */
    protected createDomFilterElement(searchTerms?: SearchTerm | SearchTerm[]): HTMLDivElement;
    /** Get the available operator option values to populate the operator select dropdown list */
    protected getOperatorOptionValues(): OperatorDetail[];
    /** handle value change event triggered, trigger filter callback & update "filled" class name */
    protected onValueChanged(e: MouseEvent): void;
    protected changeBothSliderFocuses(isAddingFocus: boolean): void;
    protected slideLeftInputChanged(): void;
    protected slideRightInputChanged(): void;
    protected sliderLeftOrRightChanged(sliderLeftVal: number, sliderRightVal: number): void;
    protected sliderTrackClicked(e: MouseEvent): void;
    protected updateTrackFilledColorWhenEnabled(): void;
}
//# sourceMappingURL=sliderFilter.d.ts.map