import 'flatpickr/dist/l10n/fr';
import 'slickgrid/slick.core';
import 'slickgrid/slick.interactions';
import 'slickgrid/slick.grid';
import 'slickgrid/slick.dataview';
import type { BackendServiceApi, Column, ExtensionList, ExternalResource, GridOption, Metrics, Pagination, ServicePagination, SlickDataView, SlickEventHandler, SlickGrid, Subscription, RxJsFacade } from '@slickgrid-universal/common';
import { SlickGroupItemMetadataProvider, BackendUtilityService, CollectionService, ExtensionService, ExtensionUtility, FilterFactory, FilterService, GridEventService, GridService, GridStateService, GroupingAndColspanService, Observable, PaginationService, ResizerService, SharedService, SortService, TranslaterService, TreeDataService } from '@slickgrid-universal/common';
import { EventPubSubService } from '@slickgrid-universal/event-pub-sub';
import { SlickEmptyWarningComponent } from '@slickgrid-universal/empty-warning-component';
import { SlickFooterComponent } from '@slickgrid-universal/custom-footer-component';
import { SlickPaginationComponent } from '@slickgrid-universal/pagination-component';
import { SlickerGridInstance } from '../interfaces/slickerGridInstance.interface';
import { UniversalContainerService } from '../services/universalContainer.service';
export declare class SlickVanillaGridBundle {
    protected _currentDatasetLength: number;
    protected _eventPubSubService: EventPubSubService;
    protected _columnDefinitions?: Column[];
    protected _gridOptions?: GridOption;
    protected _gridContainerElm: HTMLElement;
    protected _gridParentContainerElm: HTMLElement;
    protected _hideHeaderRowAfterPageLoad: boolean;
    protected _isDatasetInitialized: boolean;
    protected _isDatasetHierarchicalInitialized: boolean;
    protected _isGridInitialized: boolean;
    protected _isLocalGrid: boolean;
    protected _isPaginationInitialized: boolean;
    protected _eventHandler: SlickEventHandler;
    protected _extensions: ExtensionList<any> | undefined;
    protected _paginationOptions: Pagination | undefined;
    protected _registeredResources: ExternalResource[];
    protected _slickgridInitialized: boolean;
    protected _slickerGridInstances: SlickerGridInstance | undefined;
    backendServiceApi: BackendServiceApi | undefined;
    dataView?: SlickDataView;
    slickGrid?: SlickGrid;
    metrics?: Metrics;
    customDataView: boolean;
    paginationData?: {
        gridOptions: GridOption;
        paginationService: PaginationService;
    };
    totalItems: number;
    groupItemMetadataProvider?: SlickGroupItemMetadataProvider;
    resizerService: ResizerService;
    subscriptions: Subscription[];
    showPagination: boolean;
    extensionUtility: ExtensionUtility;
    backendUtilityService: BackendUtilityService;
    collectionService: CollectionService;
    extensionService: ExtensionService;
    filterFactory: FilterFactory;
    filterService: FilterService;
    gridClass: string;
    gridClassName: string;
    gridEventService: GridEventService;
    gridService: GridService;
    gridStateService: GridStateService;
    groupingService: GroupingAndColspanService;
    paginationService: PaginationService;
    rxjs?: RxJsFacade;
    sharedService: SharedService;
    sortService: SortService;
    translaterService: TranslaterService | undefined;
    treeDataService: TreeDataService;
    universalContainerService: UniversalContainerService;
    slickEmptyWarning: SlickEmptyWarningComponent | undefined;
    slickFooter: SlickFooterComponent | undefined;
    slickPagination: SlickPaginationComponent | undefined;
    get eventHandler(): SlickEventHandler;
    get columnDefinitions(): Column[];
    set columnDefinitions(columnDefinitions: Column[]);
    get dataset(): any[];
    set dataset(newDataset: any[]);
    get datasetHierarchical(): any[] | undefined;
    set datasetHierarchical(newHierarchicalDataset: any[] | undefined);
    set eventPubSubService(pubSub: EventPubSubService);
    get gridOptions(): GridOption;
    set gridOptions(options: GridOption);
    get paginationOptions(): Pagination | undefined;
    set paginationOptions(newPaginationOptions: Pagination | undefined);
    get isDatasetInitialized(): boolean;
    set isDatasetInitialized(isInitialized: boolean);
    get isGridInitialized(): boolean;
    get instances(): SlickerGridInstance | undefined;
    get extensions(): ExtensionList<any> | undefined;
    get registeredResources(): any[];
    /**
     * Slicker Grid Bundle constructor
     * @param {Object} gridParentContainerElm - div HTML DOM element container
     * @param {Array<Column>} columnDefs - Column Definitions
     * @param {Object} options - Grid Options
     * @param {Array<Object>} dataset - Dataset
     * @param {Array<Object>} hierarchicalDataset - Hierarchical Dataset
     * @param {Object} services - Typically only used for Unit Testing when we want to pass Mocked/Stub Services
     */
    constructor(gridParentContainerElm: HTMLElement, columnDefs?: Column[], options?: GridOption, dataset?: any[], hierarchicalDataset?: any[], services?: {
        backendUtilityService?: BackendUtilityService;
        collectionService?: CollectionService;
        eventPubSubService?: EventPubSubService;
        extensionService?: ExtensionService;
        extensionUtility?: ExtensionUtility;
        filterService?: FilterService;
        gridEventService?: GridEventService;
        gridService?: GridService;
        gridStateService?: GridStateService;
        groupingAndColspanService?: GroupingAndColspanService;
        paginationService?: PaginationService;
        resizerService?: ResizerService;
        rxjs?: RxJsFacade;
        sharedService?: SharedService;
        sortService?: SortService;
        treeDataService?: TreeDataService;
        translaterService?: TranslaterService;
        universalContainerService?: UniversalContainerService;
    });
    emptyGridContainerElm(): void;
    /** Dispose of the Component */
    dispose(shouldEmptyDomElementContainer?: boolean): void;
    initialization(gridContainerElm: HTMLElement, eventHandler: SlickEventHandler): void;
    mergeGridOptions(gridOptions: GridOption): GridOption;
    /**
     * Define our internal Post Process callback, it will execute internally after we get back result from the Process backend call
     * For now, this is GraphQL Service ONLY feature and it will basically
     * refresh the Dataset & Pagination without having the user to create his own PostProcess every time
     */
    createBackendApiInternalPostProcessCallback(gridOptions: GridOption): void;
    bindDifferentHooks(grid: SlickGrid, gridOptions: GridOption, dataView: SlickDataView): void;
    bindBackendCallbackFunctions(gridOptions: GridOption): void;
    bindResizeHook(grid: SlickGrid, options: GridOption): void;
    executeAfterDataviewCreated(gridOptions: GridOption): void;
    /**
     * On a Pagination changed, we will trigger a Grid State changed with the new pagination info
     * Also if we use Row Selection or the Checkbox Selector with a Backend Service (Odata, GraphQL), we need to reset any selection
     */
    paginationChanged(pagination: ServicePagination): void;
    /**
     * When dataset changes, we need to refresh the entire grid UI & possibly resize it as well
     * @param dataset
     */
    refreshGridData(dataset: any[], totalCount?: number): void;
    /**
     * Dynamically change or update the column definitions list.
     * We will re-render the grid so that the new header and data shows up correctly.
     * If using translater, we also need to trigger a re-translate of the column headers
     */
    updateColumnDefinitionsList(newColumnDefinitions: Column[]): void;
    /**
     * Show the filter row displayed on first row, we can optionally pass false to hide it.
     * @param showing
     */
    showHeaderRow(showing?: boolean): boolean;
    /**
     * Check if there's any Pagination Presets defined in the Grid Options,
     * if there are then load them in the paginationOptions object
     */
    setPaginationOptionsWhenPresetDefined(gridOptions: GridOption, paginationOptions: Pagination): Pagination;
    /**
     * Loop through all column definitions and copy the original optional `width` properties optionally provided by the user.
     * We will use this when doing a resize by cell content, if user provided a `width` it won't override it.
     */
    protected copyColumnWidthsReference(columnDefinitions: Column[]): void;
    protected displayEmptyDataWarning(showWarning?: boolean): void;
    /** When data changes in the DataView, we'll refresh the metrics and/or display a warning if the dataset is empty */
    protected handleOnItemCountChanged(currentPageRowItemCount: number, totalItemCount: number): void;
    /** Initialize the Pagination Service once */
    protected initializePaginationService(paginationOptions: Pagination): void;
    /**
     * Render (or dispose) the Pagination Component, user can optionally provide False (to not show it) which will in term dispose of the Pagination,
     * also while disposing we can choose to omit the disposable of the Pagination Service (if we are simply toggling the Pagination, we want to keep the Service alive)
     * @param {Boolean} showPagination - show (new render) or not (dispose) the Pagination
     * @param {Boolean} shouldDisposePaginationService - when disposing the Pagination, do we also want to dispose of the Pagination Service? (defaults to True)
     */
    protected renderPagination(showPagination?: boolean): void;
    /** Load the Editor Collection asynchronously and replace the "collection" property when Promise resolves */
    protected loadEditorCollectionAsync(column: Column): void;
    protected insertDynamicPresetColumns(columnId: string, gridPresetColumns: Column[]): void;
    /** Load any possible Columns Grid Presets */
    protected loadColumnPresetsWhenDatasetInitialized(): void;
    /** Load any possible Filters Grid Presets */
    protected loadFilterPresetsWhenDatasetInitialized(): void;
    /**
     * local grid, check if we need to show the Pagination
     * if so then also check if there's any presets and finally initialize the PaginationService
     * a local grid with Pagination presets will potentially have a different total of items, we'll need to get it from the DataView and update our total
     */
    protected loadLocalGridPagination(dataset?: any[]): void;
    /** Load any Row Selections into the DataView that were presets by the user */
    protected loadRowSelectionPresetWhenExists(): void;
    /** Pre-Register any Resource that don't require SlickGrid to be instantiated (for example RxJS Resource) */
    protected preRegisterResources(): void;
    protected registerResources(): void;
    /** Register the RxJS Resource in all necessary services which uses */
    protected registerRxJsResource(resource: RxJsFacade): void;
    /**
     * Takes a flat dataset with parent/child relationship, sort it (via its tree structure) and return the sorted flat array
     * @returns {Array<Object>} sort flat parent/child dataset
     */
    protected sortTreeDataset<T>(flatDatasetInput: T[], forceGridRefresh?: boolean): T[];
    /**
     * For convenience to the user, we provide the property "editor" as an Slickgrid-Universal editor complex object
     * however "editor" is used internally by SlickGrid for it's own Editor Factory
     * so in our lib we will swap "editor" and copy it into a new property called "internalColumnEditor"
     * then take back "editor.model" and make it the new "editor" so that SlickGrid Editor Factory still works
     */
    protected swapInternalEditorToSlickGridFactoryEditor(columnDefinitions: Column[]): {
        editor: any;
        internalColumnEditor: {
            alwaysSaveOnEnterKey?: boolean | undefined;
            ariaLabel?: string | undefined;
            collectionAsync?: Promise<any> | Observable<any> | undefined;
            collection?: any[] | undefined;
            collectionFilterBy?: import("@slickgrid-universal/common").CollectionFilterBy | import("@slickgrid-universal/common").CollectionFilterBy[] | undefined;
            collectionOptions?: import("@slickgrid-universal/common").CollectionOption | undefined;
            collectionOverride?: ((collectionInput: any[], args: import("@slickgrid-universal/common").CollectionOverrideArgs) => any[]) | undefined;
            collectionSortBy?: import("@slickgrid-universal/common").CollectionSortBy | import("@slickgrid-universal/common").CollectionSortBy[] | undefined;
            complexObjectPath?: string | undefined;
            compositeEditorFormOrder?: number | undefined;
            customStructure?: import("@slickgrid-universal/common").CollectionCustomStructure | undefined;
            decimal?: number | undefined;
            disabled?: boolean | undefined;
            editorOptions?: any;
            enableRenderHtml?: boolean | undefined;
            enableTranslateLabel?: boolean | undefined;
            errorMessage?: string | undefined;
            massUpdate?: boolean | undefined;
            maxLength?: number | undefined;
            maxValue?: string | number | undefined;
            minLength?: number | undefined;
            minValue?: string | number | undefined;
            model?: any;
            placeholder?: string | undefined;
            operatorConditionalType?: "inclusive" | "exclusive" | undefined;
            queryField?: string | undefined;
            required?: boolean | undefined;
            serializeComplexValueFormat?: "object" | "flat" | undefined;
            title?: string | undefined;
            type?: "string" | "number" | "boolean" | "object" | "text" | "unknown" | "integer" | "float" | "date" | "dateIso" | "dateUtc" | "dateTime" | "dateTimeIso" | "dateTimeIsoAmPm" | "dateTimeIsoAM_PM" | "dateTimeShortIso" | "dateEuro" | "dateEuroShort" | "dateTimeShortEuro" | "dateTimeEuro" | "dateTimeEuroAmPm" | "dateTimeEuroAM_PM" | "dateTimeEuroShort" | "dateTimeEuroShortAmPm" | "dateTimeEuroShortAM_PM" | "dateUs" | "dateUsShort" | "dateTimeShortUs" | "dateTimeUs" | "dateTimeUsAmPm" | "dateTimeUsAM_PM" | "dateTimeUsShort" | "dateTimeUsShortAmPm" | "dateTimeUsShortAM_PM" | "password" | "readonly" | undefined;
            validator?: import("@slickgrid-universal/common").EditorValidator | undefined;
            valueStep?: string | number | undefined;
            params?: any;
        };
        alwaysRenderColumn?: boolean | undefined;
        asyncPostRender?: ((domCellNode: any, row: number, dataContext: any, columnDef: Column<any>) => void) | undefined;
        asyncPostRenderCleanup?: ((node: HTMLElement, rowIdx: number, column: Column<any>) => void) | undefined;
        autoParseInputFilterOperator?: boolean | undefined;
        behavior?: string | undefined;
        cannotTriggerInsert?: boolean | undefined;
        cellAttrs?: any;
        cellMenu?: import("@slickgrid-universal/common").CellMenu | undefined;
        columnGroup?: string | undefined;
        columnGroupKey?: string | undefined;
        colspan?: number | "*" | undefined;
        cssClass?: string | undefined;
        customTooltip?: import("@slickgrid-universal/common").CustomTooltipOption<any> | undefined;
        dataKey?: string | undefined;
        defaultSortAsc?: boolean | undefined;
        denyPaste?: boolean | undefined;
        disableTooltip?: boolean | undefined;
        excelExportOptions?: import("@slickgrid-universal/common").ColumnExcelExportOption | undefined;
        excludeFromColumnPicker?: boolean | undefined;
        excludeFromExport?: boolean | undefined;
        excludeFromGridMenu?: boolean | undefined;
        excludeFromQuery?: boolean | undefined;
        excludeFromHeaderMenu?: boolean | undefined;
        exportColumnWidth?: number | undefined;
        exportCustomFormatter?: import("@slickgrid-universal/common").Formatter<any> | undefined;
        exportCustomGroupTotalsFormatter?: import("@slickgrid-universal/common").GroupTotalsFormatter | undefined;
        exportWithFormatter?: boolean | undefined;
        exportCsvForceToKeepAsString?: boolean | undefined;
        field: string;
        fields?: string[] | undefined;
        filter?: import("@slickgrid-universal/common").ColumnFilter | undefined;
        filterable?: boolean | undefined;
        filterSearchType?: "string" | "number" | "boolean" | "object" | "text" | "unknown" | "integer" | "float" | "date" | "dateIso" | "dateUtc" | "dateTime" | "dateTimeIso" | "dateTimeIsoAmPm" | "dateTimeIsoAM_PM" | "dateTimeShortIso" | "dateEuro" | "dateEuroShort" | "dateTimeShortEuro" | "dateTimeEuro" | "dateTimeEuroAmPm" | "dateTimeEuroAM_PM" | "dateTimeEuroShort" | "dateTimeEuroShortAmPm" | "dateTimeEuroShortAM_PM" | "dateUs" | "dateUsShort" | "dateTimeShortUs" | "dateTimeUs" | "dateTimeUsAmPm" | "dateTimeUsAM_PM" | "dateTimeUsShort" | "dateTimeUsShortAmPm" | "dateTimeUsShortAM_PM" | "password" | "readonly" | undefined;
        focusable?: boolean | undefined;
        formatter?: import("@slickgrid-universal/common").Formatter<any> | undefined;
        formatterOverride?: {
            ReturnsTextOnly?: boolean | undefined;
        } | ((row: number, cell: number, val: any, columnDef: Column<any>, item: any, grid: SlickGrid) => import("@slickgrid-universal/common").Formatter<any>) | undefined;
        grouping?: import("@slickgrid-universal/common").Grouping<any> | undefined;
        groupTotalsExcelExportOptions?: import("@slickgrid-universal/common").GroupTotalExportOption | undefined;
        groupTotalsFormatter?: import("@slickgrid-universal/common").GroupTotalsFormatter | undefined;
        header?: import("@slickgrid-universal/common").HeaderButtonsOrMenu | undefined;
        headerCellAttrs?: any;
        headerCssClass?: string | undefined;
        id: string | number;
        labelKey?: string | undefined;
        maxWidth?: number | undefined;
        minWidth?: number | undefined;
        originalWidth?: number | undefined;
        name?: string | undefined;
        nameCompositeEditor?: string | undefined;
        nameKey?: string | undefined;
        nameCompositeEditorKey?: string | undefined;
        onBeforeEditCell?: ((e: import("@slickgrid-universal/common").SlickEventData, args: import("@slickgrid-universal/common").OnEventArgs) => void) | undefined;
        onCellChange?: ((e: import("@slickgrid-universal/common").SlickEventData, args: import("@slickgrid-universal/common").OnEventArgs) => void) | undefined;
        onCellClick?: ((e: import("@slickgrid-universal/common").SlickEventData, args: import("@slickgrid-universal/common").OnEventArgs) => void) | undefined;
        outputType?: "string" | "number" | "boolean" | "object" | "text" | "unknown" | "integer" | "float" | "date" | "dateIso" | "dateUtc" | "dateTime" | "dateTimeIso" | "dateTimeIsoAmPm" | "dateTimeIsoAM_PM" | "dateTimeShortIso" | "dateEuro" | "dateEuroShort" | "dateTimeShortEuro" | "dateTimeEuro" | "dateTimeEuroAmPm" | "dateTimeEuroAM_PM" | "dateTimeEuroShort" | "dateTimeEuroShortAmPm" | "dateTimeEuroShortAM_PM" | "dateUs" | "dateUsShort" | "dateTimeShortUs" | "dateTimeUs" | "dateTimeUsAmPm" | "dateTimeUsAM_PM" | "dateTimeUsShort" | "dateTimeUsShortAmPm" | "dateTimeUsShortAM_PM" | "password" | "readonly" | undefined;
        saveOutputType?: "string" | "number" | "boolean" | "object" | "text" | "unknown" | "integer" | "float" | "date" | "dateIso" | "dateUtc" | "dateTime" | "dateTimeIso" | "dateTimeIsoAmPm" | "dateTimeIsoAM_PM" | "dateTimeShortIso" | "dateEuro" | "dateEuroShort" | "dateTimeShortEuro" | "dateTimeEuro" | "dateTimeEuroAmPm" | "dateTimeEuroAM_PM" | "dateTimeEuroShort" | "dateTimeEuroShortAmPm" | "dateTimeEuroShortAM_PM" | "dateUs" | "dateUsShort" | "dateTimeShortUs" | "dateTimeUs" | "dateTimeUsAmPm" | "dateTimeUsAM_PM" | "dateTimeUsShort" | "dateTimeUsShortAmPm" | "dateTimeUsShortAM_PM" | "password" | "readonly" | undefined;
        params?: any;
        previousWidth?: number | undefined;
        queryField?: string | undefined;
        queryFieldNameGetterFn?: ((dataContext: any) => string) | undefined;
        queryFieldFilter?: string | undefined;
        queryFieldSorter?: string | undefined;
        resizable?: boolean | undefined;
        resizeAlwaysRecalculateWidth?: boolean | undefined;
        resizeCalcWidthRatio?: number | undefined;
        resizeCharWidthInPx?: number | undefined;
        resizeMaxWidthThreshold?: number | undefined;
        resizeExtraWidthPadding?: number | undefined;
        rerenderOnResize?: boolean | undefined;
        sanitizeDataExport?: boolean | undefined;
        selectable?: boolean | undefined;
        sortable?: boolean | undefined;
        sortComparer?: import("@slickgrid-universal/common").SortComparer | undefined;
        toolTip?: string | undefined;
        treeTotalsFormatter?: import("@slickgrid-universal/common").GroupTotalsFormatter | undefined;
        type?: "string" | "number" | "boolean" | "object" | "text" | "unknown" | "integer" | "float" | "date" | "dateIso" | "dateUtc" | "dateTime" | "dateTimeIso" | "dateTimeIsoAmPm" | "dateTimeIsoAM_PM" | "dateTimeShortIso" | "dateEuro" | "dateEuroShort" | "dateTimeShortEuro" | "dateTimeEuro" | "dateTimeEuroAmPm" | "dateTimeEuroAM_PM" | "dateTimeEuroShort" | "dateTimeEuroShortAmPm" | "dateTimeEuroShortAM_PM" | "dateUs" | "dateUsShort" | "dateTimeShortUs" | "dateTimeUs" | "dateTimeUsAmPm" | "dateTimeUsAM_PM" | "dateTimeUsShort" | "dateTimeUsShortAmPm" | "dateTimeUsShortAM_PM" | "password" | "readonly" | undefined;
        unselectable?: boolean | undefined;
        validator?: import("@slickgrid-universal/common").EditorValidator | undefined;
        valueCouldBeUndefined?: boolean | undefined;
        width?: number | undefined;
        widthRequest?: number | undefined;
    }[];
    /** translate all columns (including hidden columns) */
    protected translateColumnHeaderTitleKeys(): void;
    /** translate all column groups (including hidden columns) */
    protected translateColumnGroupKeys(): void;
    /**
     * Update the "internalColumnEditor.collection" property.
     * Since this is called after the async call resolves, the pointer will not be the same as the "column" argument passed.
     * Once we found the new pointer, we will reassign the "editor" and "collection" to the "internalColumnEditor" so it has newest collection
     */
    protected updateEditorCollection<T = any>(column: Column<T>, newCollection: T[]): void;
}
//# sourceMappingURL=slick-vanilla-grid-bundle.d.ts.map