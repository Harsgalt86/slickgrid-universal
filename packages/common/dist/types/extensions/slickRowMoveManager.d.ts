import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { UsabilityOverrideFn } from '../enums/usabilityOverrideFn.type';
import type { Column, DragRowMove, FormatterResultObject, GridOption, RowMoveManager, RowMoveManagerOption, SlickEventData, SlickEventHandler, SlickGrid } from '../interfaces/index';
/**
 * Row Move Manager options:
 *    cssClass:             A CSS class to be added to the menu item container.
 *    columnId:             Column definition id (defaults to "_move")
 *    cancelEditOnDrag:     Do we want to cancel any Editing while dragging a row (defaults to false)
 *    disableRowSelection:  Do we want to disable the row selection? (defaults to false)
 *    singleRowMove:        Do we want a single row move? Setting this to false means that it's a multple row move (defaults to false)
 *    width:                Width of the column
 *    usabilityOverride:    Callback method that user can override the default behavior of the row being moveable or not
 *
 */
export declare class SlickRowMoveManager {
    protected readonly pubSubService: BasePubSubService;
    protected _addonOptions: RowMoveManager;
    protected _canvas: HTMLElement;
    protected _dragging: boolean;
    protected _eventHandler: SlickEventHandler;
    protected _grid: SlickGrid;
    protected _handler: SlickEventHandler;
    protected _usabilityOverride?: UsabilityOverrideFn;
    protected _defaults: RowMoveManagerOption;
    onBeforeMoveRows: import("../interfaces/slickEvent.interface").SlickEvent<{
        grid: SlickGrid;
        rows: number[];
        insertBefore: number;
    }>;
    onMoveRows: import("../interfaces/slickEvent.interface").SlickEvent<{
        grid: SlickGrid;
        rows: number[];
        insertBefore: number;
    }>;
    pluginName: 'RowMoveManager';
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(pubSubService: BasePubSubService);
    get addonOptions(): RowMoveManagerOption;
    get eventHandler(): SlickEventHandler;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    /** Initialize plugin. */
    init(grid: SlickGrid, options?: RowMoveManager): void;
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose(): void;
    /**
     * Create the plugin before the Grid creation to avoid having odd behaviors.
     * Mostly because the column definitions might change after the grid creation, so we want to make sure to add it before then
     */
    create(columnDefinitions: Column[], gridOptions: GridOption): SlickRowMoveManager | null;
    getColumnDefinition(): Column;
    /**
     * Method that user can pass to override the default behavior or making every row moveable.
     * In order word, user can choose which rows to be an available as moveable (or not) by providing his own logic show/hide icon and usability.
     * @param overrideFn: override function callback
     */
    usabilityOverride(overrideFn: UsabilityOverrideFn): void;
    setOptions(newOptions: RowMoveManagerOption): void;
    protected handleDragInit(e: SlickEventData): void;
    protected handleDragEnd(e: SlickEventData, dd: DragRowMove): void;
    protected handleDrag(e: SlickEventData, dd: DragRowMove): boolean | void;
    protected handleDragStart(event: SlickEventData, dd: DragRowMove): boolean | void;
    protected checkUsabilityOverride(row: number, dataContext: any, grid: SlickGrid): boolean;
    protected moveIconFormatter(row: number, cell: number, value: any, column: Column, dataContext: any, grid: SlickGrid): FormatterResultObject | string;
}
//# sourceMappingURL=slickRowMoveManager.d.ts.map