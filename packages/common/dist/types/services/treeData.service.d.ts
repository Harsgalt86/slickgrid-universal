/// <reference types="node" />
import type { BasePubSubService, EventSubscription } from '@slickgrid-universal/event-pub-sub';
import { ToggleStateChangeType, type ToggleStateChangeTypeString } from '../enums/index';
import type { Column, ColumnSort, GridOption, OnClickEventArgs, SlickDataView, SlickEventData, SlickEventHandler, SlickGrid, TreeDataOption, TreeToggledItem, TreeToggleStateChange } from '../interfaces/index';
import type { SharedService } from './shared.service';
import type { SortService } from './sort.service';
export declare class TreeDataService {
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected readonly sortService: SortService;
    protected _lastToggleStateChange: Omit<TreeToggleStateChange, 'fromItemId'>;
    protected _currentToggledItems: TreeToggledItem[];
    protected _grid: SlickGrid;
    protected _eventHandler: SlickEventHandler;
    protected _isLastFullToggleCollapsed: boolean;
    protected _isOneCpuCyclePassed: boolean;
    protected _isTreeDataEnabled: boolean;
    protected _subscriptions: EventSubscription[];
    protected _timer?: NodeJS.Timeout;
    protected _treeDataRecalcHandler: (() => void) | null;
    constructor(pubSubService: BasePubSubService, sharedService: SharedService, sortService: SortService);
    set currentToggledItems(newToggledItems: TreeToggledItem[]);
    get dataset(): any[];
    get datasetHierarchical(): any[] | undefined;
    /** Getter of SlickGrid DataView object */
    get dataView(): SlickDataView;
    /** Getter of the SlickGrid Event Handler */
    get eventHandler(): SlickEventHandler;
    get gridOptions(): GridOption;
    get treeDataOptions(): TreeDataOption | undefined;
    dispose(): void;
    init(grid: SlickGrid): void;
    /**
     * Apply different tree toggle state changes (to ALL rows, the entire dataset) by providing an array of parentIds that are designated as collapsed (or not).
     * User will have to provide an array of `parentId` and `isCollapsed` boolean and the code will only apply the ones that are tagged as collapsed, everything else will be expanded
     * @param {Array<TreeToggledItem>} treeToggledItems - array of parentId which are tagged as changed
     * @param {ToggleStateChangeType} previousFullToggleType - optionally provide the previous full toggle type ('full-expand' or 'full-collapse')
     * @param {Boolean} shouldPreProcessFullToggle - should we pre-process a full toggle on all items? defaults to True
     * @param {Boolean} shouldTriggerEvent - should we trigger a toggled item event? defaults to False
     */
    applyToggledItemStateChanges(treeToggledItems: TreeToggledItem[], previousFullToggleType?: Extract<ToggleStateChangeType, 'full-collapse' | 'full-expand'> | Extract<ToggleStateChangeTypeString, 'full-collapse' | 'full-expand'>, shouldPreProcessFullToggle?: boolean, shouldTriggerEvent?: boolean): void;
    /**
     * Dynamically toggle and change state of certain parent items by providing an array of parentIds that are designated as to be collapsed (or not).
     * User will have to provide an array of `parentId` and `isCollapsed` boolean, only the provided list of items will be toggled and nothing else.
     *
     * NOTE: the `applyToggledItemStateChanges()` method is very similar but on top of toggling the `treeToggledItems` it WILL ALSO collapse everything else.
     * @param {Array<TreeToggledItem>} treeToggledItems - array of parentId which are tagged as changed
     * @param {Boolean} shouldTriggerEvent - should we trigger a toggled item event? defaults to True
     */
    dynamicallyToggleItemState(treeToggledItems: TreeToggledItem[], shouldTriggerEvent?: boolean): void;
    /**
     * Get the current toggle state that includes the type (toggle, full-expand, full-collapse) and toggled items (only applies when it's a parent toggle)
     * @returns {TreeToggleStateChange} treeDataToggledItems - items that were toggled (array of `parentId` and `isCollapsed` flag)
     */
    getCurrentToggleState(): Omit<TreeToggleStateChange, 'fromItemId'>;
    getInitialSort(columnDefinitions: Column[], gridOptions: GridOption): ColumnSort;
    /**
     * Get the full item count of the Tree.
     * When an optional tree level is provided, it will return the count for only that dedicated level (for example providing 0 would return the item count of all parent items)
     * @param {Number} [treeLevel] - optional tree level to get item count from
     * @returns
     */
    getItemCount(treeLevel?: number): number;
    /**
     * Get the current list of Tree Data item(s) that got toggled in the grid (basically the parents that the user clicked on the toggle icon to expand/collapse the child)
     * @returns {Array<TreeToggledItem>} treeDataToggledItems - items that were toggled (array of `parentId` and `isCollapsed` flag)
     */
    getToggledItems(): TreeToggledItem[];
    /** Find the associated property name from the Tree Data option when found or return a default property name that we defined internally */
    getTreeDataOptionPropName(optionName: keyof TreeDataOption): string;
    /** Clear the sorting and set it back to initial sort */
    clearSorting(): void;
    /**
     * Takes a flat dataset, converts it into a hierarchical dataset, sort it by recursion and finally return back the final and sorted flat array
     * @param {Array<Object>} flatDataset - parent/child flat dataset
     * @param {Object} gridOptions - grid options
     * @returns {Array<Object>} - tree dataset
     */
    convertFlatParentChildToTreeDatasetAndSort<P, T extends P & {
        [childrenPropName: string]: T[];
    }>(flatDataset: P[], columnDefinitions: Column[], gridOptions: GridOption): {
        hierarchical: (P & {
            [childrenPropName: string]: P[];
        })[];
        flat: Omit<P & {
            [childrenPropName: string]: P[];
        }, number | typeof Symbol.iterator | "charAt" | "charCodeAt" | "concat" | "indexOf" | "lastIndexOf" | "localeCompare" | "match" | "replace" | "search" | "slice" | "split" | "substring" | "toLowerCase" | "toLocaleLowerCase" | "toUpperCase" | "toLocaleUpperCase" | "trim" | "length" | "substr" | "codePointAt" | "includes" | "endsWith" | "normalize" | "repeat" | "startsWith" | "anchor" | "big" | "blink" | "bold" | "fixed" | "fontcolor" | "fontsize" | "italics" | "link" | "small" | "strike" | "sub" | "sup" | "padStart" | "padEnd" | "trimEnd" | "trimStart" | "trimLeft" | "trimRight" | "matchAll" | "at" | "toString" | "toLocaleString" | "valueOf">[];
    };
    /**
     * Takes a flat dataset, converts it into a hierarchical dataset
     * @param {Array<Object>} flatDataset - parent/child flat dataset
     * @param {Object} gridOptions - grid options
     * @returns {Array<Object>} - tree dataset
     */
    convertFlatParentChildToTreeDataset<P, T extends P & {
        [childrenPropName: string]: P[];
    }>(flatDataset: P[], gridOptions: GridOption): T[];
    /**
     * Dynamically enable (or disable) Tree Totals auto-recalc feature when Aggregators exists
     * @param {Boolean} [enableFeature=true]
     */
    enableAutoRecalcTotalsFeature(enableFeature?: boolean): void;
    /**
     * Recalculate all Tree Data totals, this requires Aggregators to be defined.
     * NOTE: this does **not** take the current filters in consideration
     * @param gridOptions
     */
    recalculateTreeTotals(gridOptions: GridOption): void;
    /**
     * Takes a hierarchical (tree) input array and sort it (if an `initialSort` exist, it will use that to sort)
     * @param {Array<Object>} hierarchicalDataset - inpu
     * @returns {Object} sort result object that includes both the flat & tree data arrays
     */
    sortHierarchicalDataset<T>(hierarchicalDataset: T[], inputColumnSorts?: ColumnSort | ColumnSort[]): {
        hierarchical: T[];
        flat: Omit<T, number | typeof Symbol.iterator | "charAt" | "charCodeAt" | "concat" | "indexOf" | "lastIndexOf" | "localeCompare" | "match" | "replace" | "search" | "slice" | "split" | "substring" | "toLowerCase" | "toLocaleLowerCase" | "toUpperCase" | "toLocaleUpperCase" | "trim" | "length" | "substr" | "codePointAt" | "includes" | "endsWith" | "normalize" | "repeat" | "startsWith" | "anchor" | "big" | "blink" | "bold" | "fixed" | "fontcolor" | "fontsize" | "italics" | "link" | "small" | "strike" | "sub" | "sup" | "padStart" | "padEnd" | "trimEnd" | "trimStart" | "trimLeft" | "trimRight" | "matchAll" | "at" | "toString" | "toLocaleString" | "valueOf">[];
    };
    /**
     * Toggle the collapsed values of all parent items (the ones with children), we can optionally provide a flag to force a collapse or expand
     * @param {Boolean} collapsing - optionally force a collapse/expand (True => collapse all, False => expand all)
     * @param {Boolean} shouldTriggerEvent - defaults to true, should we trigger an event? For example, we could disable this to avoid a Grid State change event.
     * @returns {Promise<void>} - returns a void Promise, the reason we use a Promise is simply to make sure that when we add a spinner, it doesn't start/stop only at the end of the process
     */
    toggleTreeDataCollapse(collapsing: boolean, shouldTriggerEvent?: boolean): Promise<void>;
    protected handleOnCellClick(event: SlickEventData, args: OnClickEventArgs): void;
    protected updateToggledItem(item: any, isCollapsed: boolean): void;
    /**
     * When using Tree Data with Aggregator and auto-recalc flag is enabled, we will define a callback handler
     * @return {Function | undefined} Tree Data totals recalculate callback when enabled
     */
    protected setAutoRecalcTotalsCallbackWhenFeatEnabled(gridOptions: GridOption): (() => void) | null;
}
//# sourceMappingURL=treeData.service.d.ts.map