import type { CellRange, GridOption, OnActiveCellChangedEventArgs, RowSelectionModelOption, SlickEventData, SlickEventHandler, SlickGrid } from '../interfaces/index';
import { SlickCellRangeSelector } from '../extensions/slickCellRangeSelector';
export declare class SlickRowSelectionModel {
    protected _addonOptions: RowSelectionModelOption;
    protected _eventHandler: SlickEventHandler;
    protected _grid: SlickGrid;
    protected _ranges: CellRange[];
    protected _selector?: SlickCellRangeSelector;
    protected _defaults: RowSelectionModelOption;
    pluginName: 'RowSelectionModel';
    /** triggered when selected ranges changes */
    onSelectedRangesChanged: import("../interfaces/slickEvent.interface").SlickEvent<CellRange[]>;
    constructor(options?: RowSelectionModelOption);
    get addonOptions(): RowSelectionModelOption;
    get eventHandler(): SlickEventHandler;
    get gridOptions(): GridOption;
    init(grid: SlickGrid): void;
    destroy(): void;
    dispose(): void;
    disposeSelector(): void;
    getCellRangeSelector(): SlickCellRangeSelector | undefined;
    getSelectedRanges(): CellRange[];
    getSelectedRows(): number[];
    refreshSelections(): void;
    setSelectedRows(rows: number[]): void;
    setSelectedRanges(ranges: CellRange[], caller?: string): void;
    protected getRowsRange(from: number, to: number): number[];
    protected handleBeforeCellRangeSelected(e: SlickEventData, cell: {
        row: number;
        cell: number;
    }): boolean | void;
    protected handleCellRangeSelected(_e: SlickEventData, args: {
        range: CellRange;
    }): boolean | void;
    protected handleActiveCellChange(_e: SlickEventData, args: OnActiveCellChangedEventArgs): void;
    protected handleClick(e: MouseEvent): boolean | void;
    protected handleKeyDown(e: SlickEventData): void;
    /** is the column a column Row Move OR Select Row Move */
    isHandlerColumn(columnIndex: number): boolean;
    protected rangesToRows(ranges: CellRange[]): number[];
    protected rowsToRanges(rows: number[]): import("../interfaces/slickRange.interface").SlickRange[];
}
//# sourceMappingURL=slickRowSelectionModel.d.ts.map