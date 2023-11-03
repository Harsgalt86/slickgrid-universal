import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { CheckboxSelectorOption, Column, DOMMouseOrTouchEvent, GridOption, SelectableOverrideCallback, SlickDataView, SlickEventData, SlickEventHandler, SlickGrid } from '../interfaces/index';
import { SlickRowSelectionModel } from './slickRowSelectionModel';
import { BindingEventService } from '../services/bindingEvent.service';
export declare class SlickCheckboxSelectColumn<T = any> {
    protected readonly pubSubService: BasePubSubService;
    pluginName: 'CheckboxSelectColumn';
    protected _defaults: CheckboxSelectorOption;
    protected _addonOptions: CheckboxSelectorOption;
    protected _bindEventService: BindingEventService;
    protected _checkboxColumnCellIndex: number | null;
    protected _dataView: SlickDataView;
    protected _eventHandler: SlickEventHandler;
    protected _headerRowNode?: HTMLElement;
    protected _grid: SlickGrid;
    protected _isSelectAllChecked: boolean;
    protected _isUsingDataView: boolean;
    protected _rowSelectionModel?: SlickRowSelectionModel;
    protected _selectableOverride?: SelectableOverrideCallback<T> | number;
    protected _selectAll_UID: number;
    protected _selectedRowsLookup: any;
    constructor(pubSubService: BasePubSubService, options?: CheckboxSelectorOption);
    get addonOptions(): CheckboxSelectorOption;
    get headerRowNode(): HTMLElement | undefined;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    get selectAllUid(): number;
    set selectedRowsLookup(selectedRows: any);
    init(grid: SlickGrid): void;
    dispose(): void;
    /**
     * Create the plugin before the Grid creation to avoid having odd behaviors.
     * Mostly because the column definitions might change after the grid creation, so we want to make sure to add it before then
     */
    create(columnDefinitions: Column[], gridOptions: GridOption): SlickCheckboxSelectColumn | null;
    getOptions(): CheckboxSelectorOption;
    setOptions(options: CheckboxSelectorOption): void;
    deSelectRows(rowArray: number[]): void;
    selectRows(rowArray: number[]): void;
    getColumnDefinition(): Column;
    hideSelectAllFromColumnHeaderTitleRow(): void;
    hideSelectAllFromColumnHeaderFilterRow(): void;
    /**
     * Toggle a row selection by providing a row number
     * @param {Number} row - grid row number to toggle
     */
    toggleRowSelection(row: number): void;
    /**
     *  Toggle a row selection and also provide the event that triggered it
     * @param {Object} event - event that triggered the row selection change
     * @param {Number} row - grid row number to toggle
     * @returns
     */
    toggleRowSelectionWithEvent(event: Event | null, row: number): void;
    /**
     * Method that user can pass to override the default behavior or making every row a selectable row.
     * In order word, user can choose which rows to be selectable or not by providing his own logic.
     * @param overrideFn: override function callback
     */
    selectableOverride(overrideFn: SelectableOverrideCallback<T>): void;
    protected addCheckboxToFilterHeaderRow(grid: SlickGrid): void;
    protected checkboxSelectionFormatter(row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid: SlickGrid): string | null;
    protected checkSelectableOverride(row: number, dataContext: any, grid: SlickGrid): boolean;
    protected createUID(): number;
    protected getCheckboxColumnCellIndex(): number;
    protected handleDataViewSelectedIdsChanged(): void;
    protected handleClick(e: DOMMouseOrTouchEvent<HTMLInputElement>, args: {
        row: number;
        cell: number;
        grid: SlickGrid;
    }): void;
    protected handleHeaderClick(e: DOMMouseOrTouchEvent<HTMLInputElement>, args: {
        column: Column;
        node: HTMLDivElement;
        grid: SlickGrid;
    }): void;
    protected handleKeyDown(e: SlickEventData, args: any): void;
    protected handleSelectedRowsChanged(): void;
    protected renderSelectAllCheckbox(isSelectAllChecked: boolean): void;
}
//# sourceMappingURL=slickCheckboxSelectColumn.d.ts.map