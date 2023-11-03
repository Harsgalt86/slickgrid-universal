import type { BasePubSubService, EventSubscription } from '@slickgrid-universal/event-pub-sub';
import SortableInstance from 'sortablejs';
import type { ExtensionUtility } from '../extensions/extensionUtility';
import type { Column, DraggableGrouping, DraggableGroupingOption, GridOption, Grouping, GroupingGetterFunction, SlickDataView, SlickEvent, SlickEventHandler, SlickGrid } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
import type { SharedService } from '../services/shared.service';
/**
 *
 * Draggable Grouping contributed by:  Muthukumar Selconstasu
 *  muthukumar{dot}se{at}gmail{dot}com
 *  github.com/muthukumarse/Slickgrid
 *
 * NOTES:
 *     This plugin provides the Draggable Grouping feature
 *
 * A plugin to add drop-down menus to column headers.
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.columnDefinitions = [{
 *     id: 'cost', name: 'Cost', field: 'cost',
 *     grouping: {
 *       getter: 'cost',
 *       formatter: (g) => `Cost: ${g.value} <span style="color:green">(${g.count} items)</span>`,
 *       aggregators: [new Aggregators.Sum('cost')],
 *       aggregateCollapsed: true,
 *       collapsed: true
 *     }
 *   }];
 */
export declare class SlickDraggableGrouping {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected _addonOptions: DraggableGrouping;
    protected _bindingEventService: BindingEventService;
    protected _droppableInstance?: SortableInstance;
    protected _dropzoneElm: HTMLDivElement;
    protected _dropzonePlaceholderElm: HTMLDivElement;
    protected _eventHandler: SlickEventHandler;
    protected _grid?: SlickGrid;
    protected _gridColumns: Column[];
    protected _gridUid: string;
    protected _groupToggler?: HTMLDivElement;
    protected _reorderedColumns: Column[];
    protected _sortableLeftInstance?: SortableInstance;
    protected _sortableRightInstance?: SortableInstance;
    protected _subscriptions: EventSubscription[];
    protected _defaults: DraggableGroupingOption;
    columnsGroupBy: Column[];
    onGroupChanged: SlickEvent;
    pluginName: 'DraggableGrouping';
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility: ExtensionUtility, pubSubService: BasePubSubService, sharedService: SharedService);
    get addonOptions(): DraggableGroupingOption;
    /** Getter of SlickGrid DataView object */
    get dataView(): SlickDataView;
    get dropboxElement(): HTMLDivElement;
    get droppableInstance(): SortableInstance | undefined;
    get sortableLeftInstance(): SortableInstance | undefined;
    get sortableRightInstance(): SortableInstance | undefined;
    get eventHandler(): SlickEventHandler;
    get grid(): SlickGrid;
    get gridOptions(): GridOption;
    /** Getter for the grid uid */
    get gridUid(): string;
    get gridContainer(): HTMLDivElement;
    /** Initialize plugin. */
    init(grid: SlickGrid, groupingOptions?: DraggableGrouping): this;
    /** Dispose the plugin. */
    dispose(): void;
    clearDroppedGroups(): void;
    destroySortableInstances(): void;
    setAddonOptions(options: Partial<DraggableGroupingOption>): void;
    setColumns(cols: Column[]): void;
    setDroppedGroups(groupingInfo: Array<string | GroupingGetterFunction> | string): void;
    /**
     * Setup the column reordering
     * NOTE: this function is a standalone function and is called externally and does not have access to `this` instance
     * @param grid - slick grid object
     * @param headers - slick grid column header elements
     * @param _headerColumnWidthDiff - header column width difference
     * @param setColumns - callback to reassign columns
     * @param setupColumnResize - callback to setup the column resize
     * @param columns - columns array
     * @param getColumnIndex - callback to find index of a column
     * @param uid - grid UID
     * @param trigger - callback to execute when triggering a column grouping
     */
    setupColumnReorder(grid: SlickGrid, headers: any, _headerColumnWidthDiff: any, setColumns: (columns: Column[]) => void, setupColumnResize: () => void, _columns: Column[], getColumnIndex: (columnId: string) => number, _uid: string, trigger: (slickEvent: SlickEvent, data?: any) => void): {
        sortableLeftInstance: SortableInstance;
        sortableRightInstance: SortableInstance;
    };
    protected addColumnGroupBy(column: Column): void;
    protected addGroupByRemoveClickHandler(id: string | number, groupRemoveIconElm: HTMLDivElement, headerColumnElm: HTMLDivElement, entry: any): void;
    protected addGroupSortClickHandler(col: Column, groupSortContainerElm: HTMLDivElement): void;
    protected getGroupBySortIcon(groupSortContainerElm: HTMLDivElement, sortAsc?: boolean): void;
    protected handleGroupByDrop(containerElm: HTMLDivElement, headerColumnElm: HTMLDivElement): void;
    protected toggleGroupAll({ grouping }: Column, collapsed?: boolean): void;
    protected removeFromArray(arrayToModify: any[], itemToRemove: any): any[];
    protected removeGroupBy(id: string | number, _hdrColumnElm: HTMLDivElement, entry: any): void;
    protected addDragOverDropzoneListeners(): void;
    protected setupColumnDropbox(): void;
    protected toggleGroupToggler(targetElm: Element | null, collapsing?: boolean, shouldExecuteDataViewCommand?: boolean): void;
    protected updateGroupBy(originator: string): void;
    /** call notify on slickgrid event and execute onGroupChanged callback when defined as a function by the user */
    protected triggerOnGroupChangedEvent(args: {
        caller?: string;
        groupColumns: Grouping[];
    }): void;
}
//# sourceMappingURL=slickDraggableGrouping.d.ts.map