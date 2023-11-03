import type { CellRange, OnActiveCellChangedEventArgs, SlickDataView, SlickEventHandler, SlickGrid } from '../interfaces/index';
import { SlickCellRangeSelector } from './index';
export interface CellSelectionModelOption {
    selectActiveCell?: boolean;
    cellRangeSelector: SlickCellRangeSelector;
}
export declare class SlickCellSelectionModel {
    protected _addonOptions?: CellSelectionModelOption;
    protected _cachedPageRowCount: number;
    protected _eventHandler: SlickEventHandler;
    protected _dataView?: SlickDataView;
    protected _grid: SlickGrid;
    protected _prevSelectedRow?: number;
    protected _prevKeyDown: string;
    protected _ranges: CellRange[];
    protected _selector: SlickCellRangeSelector;
    protected _defaults: {
        selectActiveCell: boolean;
    };
    onSelectedRangesChanged: import("../interfaces/slickEvent.interface").SlickEvent<CellRange[]>;
    pluginName: 'CellSelectionModel';
    constructor(options?: {
        selectActiveCell: boolean;
        cellRangeSelector: SlickCellRangeSelector;
    });
    get addonOptions(): CellSelectionModelOption | undefined;
    get cellRangeSelector(): SlickCellRangeSelector;
    get eventHandler(): SlickEventHandler;
    init(grid: SlickGrid): void;
    destroy(): void;
    dispose(): void;
    getSelectedRanges(): CellRange[];
    /**
     * Get the number of rows displayed in the viewport
     * Note that the row count is an approximation because it is a calculated value using this formula (viewport / rowHeight = rowCount),
     * the viewport must also be displayed for this calculation to work.
     * @return {Number} rowCount
     */
    getViewportRowCount(): number;
    hasDataView(): boolean;
    rangesAreEqual(range1: CellRange[], range2: CellRange[]): boolean;
    refreshSelections(): void;
    removeInvalidRanges(ranges: CellRange[]): CellRange[];
    /** Provide a way to force a recalculation of page row count (for example on grid resize) */
    resetPageRowCount(): void;
    setSelectedRanges(ranges: CellRange[], caller?: string): void;
    protected handleActiveCellChange(_e: Event, args: OnActiveCellChangedEventArgs): void;
    protected handleBeforeCellRangeSelected(e: any): boolean | void;
    protected handleCellRangeSelected(_e: any, args: {
        range: CellRange;
    }): void;
    protected isKeyAllowed(key: string): boolean;
    protected handleKeyDown(e: KeyboardEvent): void;
}
//# sourceMappingURL=slickCellSelectionModel.d.ts.map