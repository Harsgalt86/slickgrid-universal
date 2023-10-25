import { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { Column, ExtensionModel, GridOption, SlickRowDetailView } from '../interfaces/index';
import { type ExtensionList, ExtensionName, type InferExtensionByName, type SlickControlList, type SlickPluginList } from '../enums/index';
import type { SharedService } from './shared.service';
import type { TranslaterService } from './translater.service';
import { ExtensionUtility, SlickCellExcelCopyManager, SlickCellMenu, SlickCheckboxSelectColumn, SlickColumnPicker, SlickContextMenu, SlickDraggableGrouping, SlickGridMenu, SlickGroupItemMetadataProvider, SlickHeaderMenu, SlickRowMoveManager, SlickRowSelectionModel } from '../extensions/index';
import type { FilterService } from './filter.service';
import type { SortService } from './sort.service';
import type { TreeDataService } from './treeData.service';
interface ExtensionWithColumnIndexPosition {
    name: ExtensionName;
    columnIndexPosition: number;
    extension: SlickCheckboxSelectColumn | SlickRowDetailView | SlickRowMoveManager;
}
export declare class ExtensionService {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly filterService: FilterService;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected readonly sortService: SortService;
    protected readonly treeDataService: TreeDataService;
    protected readonly translaterService?: TranslaterService | undefined;
    protected _extensionCreatedList: ExtensionList<any>;
    protected _extensionList: ExtensionList<any>;
    protected _cellMenuPlugin?: SlickCellMenu;
    protected _cellExcelCopyManagerPlugin?: SlickCellExcelCopyManager;
    protected _checkboxSelectColumn?: SlickCheckboxSelectColumn;
    protected _contextMenuPlugin?: SlickContextMenu;
    protected _columnPickerControl?: SlickColumnPicker;
    protected _draggleGroupingPlugin?: SlickDraggableGrouping;
    protected _gridMenuControl?: SlickGridMenu;
    protected _groupItemMetadataProviderService?: SlickGroupItemMetadataProvider;
    protected _headerMenuPlugin?: SlickHeaderMenu;
    protected _rowMoveManagerPlugin?: SlickRowMoveManager;
    protected _rowSelectionModel?: SlickRowSelectionModel;
    get extensionList(): ExtensionList<any>;
    get gridOptions(): GridOption;
    constructor(extensionUtility: ExtensionUtility, filterService: FilterService, pubSubService: BasePubSubService, sharedService: SharedService, sortService: SortService, treeDataService: TreeDataService, translaterService?: TranslaterService | undefined);
    /** Dispose of all the controls & plugins */
    dispose(): void;
    /**
     * Get an external plugin Extension
     * @param {String} name
     * @param {Object} extension
     */
    addExtensionToList<T = any>(name: ExtensionName, extension: {
        name: ExtensionName;
        instance: T;
    }): void;
    /** Get all columns (includes visible and non-visible) */
    getAllColumns(): Column[];
    /** Get only visible columns */
    getVisibleColumns(): Column[];
    /**
     * Get an Extension that was created by calling its "create" method (there are only 3 extensions which uses this method)
     *  @param name
     */
    getCreatedExtensionByName<P extends (SlickControlList | SlickPluginList) = any>(name: ExtensionName): ExtensionModel<P> | undefined;
    /**
     * Get an Extension by it's name.
     * NOTE: it's preferable to @use `getExtensionInstanceByName` if you just want the instance since it will automatically infer the extension.
     * @param name
     */
    getExtensionByName<P extends (SlickControlList | SlickPluginList) = any>(name: ExtensionName): ExtensionModel<P> | undefined;
    /**
     * Get Extension Instance by its name.
     * @param name
     */
    getExtensionInstanceByName<T extends ExtensionName>(name: T): InferExtensionByName<T>;
    /** Auto-resize all the column in the grid to fit the grid width */
    autoResizeColumns(): void;
    /** Bind/Create different Controls or Plugins after the Grid is created */
    bindDifferentExtensions(): void;
    /**
     * Bind/Create certain plugins before the Grid creation to avoid having odd behaviors.
     * Mostly because the column definitions might change after the grid creation, so we want to make sure to add it before then
     * @param columnDefinitions
     * @param gridOptions
     */
    createExtensionsBeforeGridCreation(columnDefinitions: Column[], gridOptions: GridOption): void;
    /** Hide a column from the grid */
    hideColumn(column: Column): void;
    /** Refresh the dataset through the Backend Service */
    refreshBackendDataset(gridOptions?: GridOption): void;
    /**
     * Remove a column from the grid by it's index in the grid
     * @param columns input
     * @param index
     */
    removeColumnByIndex(columns: Column[], index: number): Column[];
    /** Translate all possible Extensions at once */
    translateAllExtensions(): void;
    /** Translate the Cell Menu titles, we need to loop through all column definition to re-translate them */
    translateCellMenu(): void;
    /** Translate the Column Picker and it's last 2 checkboxes */
    translateColumnPicker(): void;
    /** Translate the Context Menu titles, we need to loop through all column definition to re-translate them */
    translateContextMenu(): void;
    /**
     * Translate the Header Menu titles, we need to loop through all column definition to re-translate them
     */
    translateGridMenu(): void;
    /**
     * Translate the Header Menu titles, we need to loop through all column definition to re-translate them
     */
    translateHeaderMenu(): void;
    /**
     * Translate manually the header titles.
     * We could optionally pass a locale (that will change currently loaded locale), else it will use current locale
     * @param locale to use
     * @param new column definitions (optional)
     */
    translateColumnHeaders(locale?: boolean | string, newColumnDefinitions?: Column[]): void;
    /**
     * Render (or re-render) the column headers from column definitions.
     * calling setColumns() will trigger a grid re-render
     */
    renderColumnHeaders(newColumnDefinitions?: Column[], forceColumnDefinitionsOverwrite?: boolean): void;
    /**
     * Some extension (feature) have specific `columnIndexPosition` that the developer want to use, we need to make sure these indexes are respected in the column definitions in the order provided.
     * The following 3 features could have that optional `columnIndexPosition` and we need to respect their column order, we will first sort by their optional order and only after we will create them by their specific order.
     * We'll process them by their position (if provided, else use same order that they were inserted)
     * @param featureWithIndexPositions
     * @param columnDefinitions
     * @param gridOptions
     */
    protected createExtensionByTheirColumnIndex(featureWithIndexPositions: ExtensionWithColumnIndexPosition[], columnDefinitions: Column[], gridOptions: GridOption): void;
    /** Translate an array of items from an input key and assign translated value to the output key */
    protected translateItems(items: any[], inputKey: string, outputKey: string): void;
}
export {};
//# sourceMappingURL=extension.service.d.ts.map