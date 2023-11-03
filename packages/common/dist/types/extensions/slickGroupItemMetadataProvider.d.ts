import type { Column, DOMEvent, GroupingFormatterItem, GroupItemMetadataProviderOption, OnClickEventArgs, SlickDataView, SlickEventHandler, SlickGrid } from '../interfaces/index';
/**
 * Provides item metadata for group (Slick.Group) and totals (Slick.Totals) rows produced by the DataView.
 * This metadata overrides the default behavior and formatting of those rows so that they appear and function
 * correctly when processed by the grid.
 *
 * This class also acts as a grid plugin providing event handlers to expand & collapse groups.
 * If "grid.registerPlugin(...)" is not called, expand & collapse will not work.
 */
export declare class SlickGroupItemMetadataProvider {
    protected _eventHandler: SlickEventHandler;
    protected _grid: SlickGrid;
    protected _options: GroupItemMetadataProviderOption;
    protected _defaults: GroupItemMetadataProviderOption;
    constructor();
    /** Getter of the SlickGrid Event Handler */
    get eventHandler(): SlickEventHandler;
    /** Getter of SlickGrid DataView object */
    protected get dataView(): SlickDataView;
    get grid(): SlickGrid;
    init(grid: SlickGrid, inputOptions?: GroupItemMetadataProviderOption): void;
    dispose(): void;
    getOptions(): GroupItemMetadataProviderOption;
    setOptions(inputOptions: GroupItemMetadataProviderOption): void;
    getGroupRowMetadata(item: GroupingFormatterItem): {
        selectable: boolean;
        focusable: boolean | undefined;
        cssClasses: string;
        formatter: false | import("../interfaces/formatter.interface").Formatter | undefined;
        columns: {
            0: {
                colspan: string;
                formatter: import("../interfaces/formatter.interface").Formatter | undefined;
                editor: null;
            };
        };
    };
    getTotalsRowMetadata(item: {
        group: GroupingFormatterItem;
    }): {
        selectable: boolean;
        focusable: boolean | undefined;
        cssClasses: string;
        formatter: import("../interfaces/formatter.interface").Formatter | undefined;
        editor: null;
    };
    protected defaultGroupCellFormatter(_row: number, _cell: number, _value: any, _columnDef: Column, item: any): any;
    protected defaultTotalsCellFormatter(_row: number, _cell: number, _value: any, columnDef: Column, item: any, grid: SlickGrid): string;
    /** Handle a grid cell clicked, it could be a Group that is being collapsed/expanded or do nothing when it's not */
    protected handleGridClick(e: DOMEvent<HTMLDivElement>, args: OnClickEventArgs): void;
    /**
     * Handle a keyboard down event on a grouping cell.
     * TODO:  add -/+ handling
     */
    protected handleGridKeyDown(e: DOMEvent<HTMLDivElement> & {
        keyCode: number;
        which: number;
    }): void;
    protected handleDataViewExpandOrCollapse(item: any): void;
}
//# sourceMappingURL=slickGroupItemMetadataProvider.d.ts.map