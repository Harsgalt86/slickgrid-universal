/// <reference types="node" />
import type { CellRange, CellRangeSelectorOption, DOMMouseOrTouchEvent, DragPosition, DragRange, GridOption, MouseOffsetViewport, OnScrollEventArgs, SlickEventData, SlickEventHandler, SlickGrid } from '../interfaces/index';
import { SlickCellRangeDecorator } from './index';
export declare class SlickCellRangeSelector {
    protected _activeCanvas?: HTMLElement;
    protected _addonOptions: CellRangeSelectorOption;
    protected _currentlySelectedRange: DragRange | null;
    protected _canvas: HTMLElement;
    protected _decorator: SlickCellRangeDecorator;
    protected _dragging: boolean;
    protected _eventHandler: SlickEventHandler;
    protected _grid: SlickGrid;
    protected _gridOptions: GridOption;
    protected _gridUid: string;
    protected _columnOffset: number;
    protected _rowOffset: number;
    protected _isRightCanvas: boolean;
    protected _isBottomCanvas: boolean;
    protected _activeViewport: HTMLElement;
    protected _autoScrollTimerId?: NodeJS.Timeout;
    protected _draggingMouseOffset: MouseOffsetViewport;
    protected _moveDistanceForOneCell: {
        x: number;
        y: number;
    };
    protected _xDelayForNextCell: number;
    protected _yDelayForNextCell: number;
    protected _viewportHeight: number;
    protected _viewportWidth: number;
    protected _isRowMoveRegistered: boolean;
    protected _scrollLeft: number;
    protected _scrollTop: number;
    protected _defaults: CellRangeSelectorOption;
    pluginName: 'CellRangeSelector';
    onBeforeCellRangeSelected: import("../interfaces/slickEvent.interface").SlickEvent<{
        row: number;
        cell: number;
    }>;
    onCellRangeSelecting: import("../interfaces/slickEvent.interface").SlickEvent<{
        range: CellRange;
    }>;
    onCellRangeSelected: import("../interfaces/slickEvent.interface").SlickEvent<{
        range: CellRange;
    }>;
    constructor(options?: Partial<CellRangeSelectorOption>);
    get addonOptions(): CellRangeSelectorOption;
    get eventHandler(): SlickEventHandler;
    /** Getter for the grid uid */
    get gridUid(): string;
    get gridUidSelector(): string;
    init(grid: SlickGrid): void;
    destroy(): void;
    /** Dispose the plugin. */
    dispose(): void;
    getCellDecorator(): SlickCellRangeDecorator;
    getCurrentRange(): DragRange | null;
    getMouseOffsetViewport(e: SlickEventData, dd: DragPosition): MouseOffsetViewport;
    stopIntervalTimer(): void;
    protected handleDrag(e: SlickEventData, dd: DragPosition): void;
    protected handleDragOutsideViewport(): void;
    protected handleDragToNewPosition(xNeedUpdate: boolean, yNeedUpdate: boolean): void;
    protected handleDragTo(e: {
        pageX: number;
        pageY: number;
    }, dd: DragPosition): void;
    protected handleDragEnd(e: any, dd: DragPosition): void;
    protected handleDragInit(e: Event): void;
    protected handleDragStart(e: DOMMouseOrTouchEvent<HTMLDivElement>, dd: DragPosition): HTMLElement | undefined;
    protected handleScroll(_e: DOMMouseOrTouchEvent<HTMLDivElement>, args: OnScrollEventArgs): void;
}
//# sourceMappingURL=slickCellRangeSelector.d.ts.map