"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickVanillaGridBundle = void 0;
const lite_1 = require("dequal/lite");
require("flatpickr/dist/l10n/fr");
require("slickgrid/slick.core");
require("slickgrid/slick.interactions");
require("slickgrid/slick.grid");
require("slickgrid/slick.dataview");
const Sortable_ = require("sortablejs");
const Sortable = ((_a = Sortable_ === null || Sortable_ === void 0 ? void 0 : Sortable_['default']) !== null && _a !== void 0 ? _a : Sortable_); // patch for rollup
const common_1 = require("@slickgrid-universal/common");
const event_pub_sub_1 = require("@slickgrid-universal/event-pub-sub");
const empty_warning_component_1 = require("@slickgrid-universal/empty-warning-component");
const custom_footer_component_1 = require("@slickgrid-universal/custom-footer-component");
const pagination_component_1 = require("@slickgrid-universal/pagination-component");
const universalContainer_service_1 = require("../services/universalContainer.service");
// add Sortable to the window object so that SlickGrid lib can use globally
window.Sortable = Sortable;
class SlickVanillaGridBundle {
    get eventHandler() {
        return this._eventHandler;
    }
    get columnDefinitions() {
        return this._columnDefinitions || [];
    }
    set columnDefinitions(columnDefinitions) {
        this._columnDefinitions = columnDefinitions;
        if (this._slickgridInitialized) {
            this.updateColumnDefinitionsList(this._columnDefinitions);
        }
        if (columnDefinitions.length > 0) {
            this.copyColumnWidthsReference(columnDefinitions);
        }
    }
    get dataset() {
        var _a;
        return ((_a = this.dataView) === null || _a === void 0 ? void 0 : _a.getItems()) || [];
    }
    set dataset(newDataset) {
        var _a, _b;
        const prevDatasetLn = this._currentDatasetLength;
        const isDatasetEqual = (0, lite_1.dequal)(newDataset, this.dataset || []);
        const isDeepCopyDataOnPageLoadEnabled = !!((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableDeepCopyDatasetOnPageLoad);
        let data = isDeepCopyDataOnPageLoadEnabled ? (0, common_1.deepCopy)(newDataset || []) : newDataset;
        // when Tree Data is enabled and we don't yet have the hierarchical dataset filled, we can force a convert+sort of the array
        if (this.slickGrid && ((_b = this.gridOptions) === null || _b === void 0 ? void 0 : _b.enableTreeData) && Array.isArray(newDataset) && (newDataset.length > 0 || newDataset.length !== prevDatasetLn || !isDatasetEqual)) {
            this._isDatasetHierarchicalInitialized = false;
            data = this.sortTreeDataset(newDataset, !isDatasetEqual); // if dataset changed, then force a refresh anyway
        }
        this.refreshGridData(data || []);
        this._currentDatasetLength = (newDataset || []).length;
        // expand/autofit columns on first page load
        // we can assume that if the prevDataset was empty then we are on first load
        if (this.slickGrid && this.gridOptions.autoFitColumnsOnFirstLoad && prevDatasetLn === 0) {
            this.slickGrid.autosizeColumns();
        }
    }
    get datasetHierarchical() {
        return this.sharedService.hierarchicalDataset;
    }
    set datasetHierarchical(newHierarchicalDataset) {
        var _a, _b;
        const isDatasetEqual = (0, lite_1.dequal)(newHierarchicalDataset, this.sharedService.hierarchicalDataset || []);
        const prevFlatDatasetLn = this._currentDatasetLength;
        this.sharedService.hierarchicalDataset = newHierarchicalDataset;
        if (newHierarchicalDataset && this.columnDefinitions && ((_a = this.filterService) === null || _a === void 0 ? void 0 : _a.clearFilters)) {
            this.filterService.clearFilters();
        }
        // when a hierarchical dataset is set afterward, we can reset the flat dataset and call a tree data sort that will overwrite the flat dataset
        if (this.dataView && newHierarchicalDataset && this.slickGrid && ((_b = this.sortService) === null || _b === void 0 ? void 0 : _b.processTreeDataInitialSort)) {
            this.sortService.processTreeDataInitialSort();
            // we also need to reset/refresh the Tree Data filters because if we inserted new item(s) then it might not show up without doing this refresh
            // however we need 1 cpu cycle before having the DataView refreshed, so we need to wrap this check in a setTimeout
            setTimeout(() => {
                var _a, _b;
                const flatDatasetLn = (_b = (_a = this.dataView) === null || _a === void 0 ? void 0 : _a.getItemCount()) !== null && _b !== void 0 ? _b : 0;
                if (flatDatasetLn > 0 && (flatDatasetLn !== prevFlatDatasetLn || !isDatasetEqual)) {
                    this.filterService.refreshTreeDataFilters();
                }
            });
        }
        this._isDatasetHierarchicalInitialized = true;
    }
    set eventPubSubService(pubSub) {
        this._eventPubSubService = pubSub;
    }
    get gridOptions() {
        return this._gridOptions || {};
    }
    set gridOptions(options) {
        var _a, _b, _c;
        let mergedOptions;
        // if we already have grid options, when grid was already initialized, we'll merge with those options
        // else we'll merge with global grid options
        if ((_a = this.slickGrid) === null || _a === void 0 ? void 0 : _a.getOptions) {
            mergedOptions = Slick.Utils.extend(true, {}, this.slickGrid.getOptions(), options);
        }
        else {
            mergedOptions = this.mergeGridOptions(options);
        }
        if (((_b = this.sharedService) === null || _b === void 0 ? void 0 : _b.gridOptions) && ((_c = this.slickGrid) === null || _c === void 0 ? void 0 : _c.setOptions)) {
            this.sharedService.gridOptions = mergedOptions;
            this.slickGrid.setOptions(mergedOptions, false, true); // make sure to supressColumnCheck (3rd arg) to avoid problem with changeColumnsArrangement() and custom grid view
            this.slickGrid.reRenderColumns(true); // then call a re-render since we did supressColumnCheck on previous setOptions
        }
        this._gridOptions = mergedOptions;
    }
    get paginationOptions() {
        return this._paginationOptions;
    }
    set paginationOptions(newPaginationOptions) {
        var _a;
        if (newPaginationOptions && this._paginationOptions) {
            this._paginationOptions = { ...this._paginationOptions, ...newPaginationOptions };
        }
        else {
            this._paginationOptions = newPaginationOptions;
        }
        this.gridOptions.pagination = this._paginationOptions;
        this.paginationService.updateTotalItems((_a = newPaginationOptions === null || newPaginationOptions === void 0 ? void 0 : newPaginationOptions.totalItems) !== null && _a !== void 0 ? _a : 0, true);
    }
    get isDatasetInitialized() {
        return this._isDatasetInitialized;
    }
    set isDatasetInitialized(isInitialized) {
        this._isDatasetInitialized = isInitialized;
    }
    get isGridInitialized() {
        return this._isGridInitialized;
    }
    get instances() {
        return this._slickerGridInstances;
    }
    get extensions() {
        return this._extensions;
    }
    get registeredResources() {
        return this._registeredResources;
    }
    /**
     * Slicker Grid Bundle constructor
     * @param {Object} gridParentContainerElm - div HTML DOM element container
     * @param {Array<Column>} columnDefs - Column Definitions
     * @param {Object} options - Grid Options
     * @param {Array<Object>} dataset - Dataset
     * @param {Array<Object>} hierarchicalDataset - Hierarchical Dataset
     * @param {Object} services - Typically only used for Unit Testing when we want to pass Mocked/Stub Services
     */
    constructor(gridParentContainerElm, columnDefs, options, dataset, hierarchicalDataset, services) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        this._currentDatasetLength = 0;
        this._hideHeaderRowAfterPageLoad = false;
        this._isDatasetInitialized = false;
        this._isDatasetHierarchicalInitialized = false;
        this._isGridInitialized = false;
        this._isLocalGrid = true;
        this._isPaginationInitialized = false;
        this._registeredResources = [];
        this._slickgridInitialized = false;
        this.customDataView = false;
        this.totalItems = 0;
        this.subscriptions = [];
        this.showPagination = false;
        // make sure that the grid container doesn't already have the "slickgrid-container" css class
        // if it does then we won't create yet another grid, just stop there
        if (gridParentContainerElm.querySelectorAll('.slickgrid-container').length !== 0) {
            return;
        }
        gridParentContainerElm.classList.add('grid-pane');
        this._gridParentContainerElm = gridParentContainerElm;
        this._gridContainerElm = document.createElement('div');
        this._gridContainerElm.classList.add('slickgrid-container');
        gridParentContainerElm.appendChild(this._gridContainerElm);
        // check if the user wants to hide the header row from the start
        // we only want to do this check once in the constructor
        this._hideHeaderRowAfterPageLoad = ((options === null || options === void 0 ? void 0 : options.showHeaderRow) === false);
        this._columnDefinitions = columnDefs || [];
        if (this._columnDefinitions.length > 0) {
            this.copyColumnWidthsReference(this._columnDefinitions);
        }
        this._gridOptions = this.mergeGridOptions(options || {});
        const isDeepCopyDataOnPageLoadEnabled = !!((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableDeepCopyDatasetOnPageLoad);
        this.universalContainerService = (_b = services === null || services === void 0 ? void 0 : services.universalContainerService) !== null && _b !== void 0 ? _b : new universalContainer_service_1.UniversalContainerService();
        // if user is providing a Translate Service, it has to be passed under the "translater" grid option
        this.translaterService = (_c = services === null || services === void 0 ? void 0 : services.translaterService) !== null && _c !== void 0 ? _c : this._gridOptions.translater;
        // initialize and assign all Service Dependencies
        this._eventPubSubService = (_d = services === null || services === void 0 ? void 0 : services.eventPubSubService) !== null && _d !== void 0 ? _d : new event_pub_sub_1.EventPubSubService(gridParentContainerElm);
        this._eventPubSubService.eventNamingStyle = (_g = (_f = this._gridOptions) === null || _f === void 0 ? void 0 : _f.eventNamingStyle) !== null && _g !== void 0 ? _g : event_pub_sub_1.EventNamingStyle.camelCase;
        const slickgridConfig = new common_1.SlickgridConfig();
        this.backendUtilityService = (_h = services === null || services === void 0 ? void 0 : services.backendUtilityService) !== null && _h !== void 0 ? _h : new common_1.BackendUtilityService();
        this.gridEventService = (_j = services === null || services === void 0 ? void 0 : services.gridEventService) !== null && _j !== void 0 ? _j : new common_1.GridEventService();
        this.sharedService = (_k = services === null || services === void 0 ? void 0 : services.sharedService) !== null && _k !== void 0 ? _k : new common_1.SharedService();
        this.collectionService = (_l = services === null || services === void 0 ? void 0 : services.collectionService) !== null && _l !== void 0 ? _l : new common_1.CollectionService(this.translaterService);
        this.extensionUtility = (_m = services === null || services === void 0 ? void 0 : services.extensionUtility) !== null && _m !== void 0 ? _m : new common_1.ExtensionUtility(this.sharedService, this.backendUtilityService, this.translaterService);
        this.filterFactory = new common_1.FilterFactory(slickgridConfig, this.translaterService, this.collectionService);
        this.filterService = (_o = services === null || services === void 0 ? void 0 : services.filterService) !== null && _o !== void 0 ? _o : new common_1.FilterService(this.filterFactory, this._eventPubSubService, this.sharedService, this.backendUtilityService);
        this.resizerService = (_p = services === null || services === void 0 ? void 0 : services.resizerService) !== null && _p !== void 0 ? _p : new common_1.ResizerService(this._eventPubSubService);
        this.sortService = (_q = services === null || services === void 0 ? void 0 : services.sortService) !== null && _q !== void 0 ? _q : new common_1.SortService(this.sharedService, this._eventPubSubService, this.backendUtilityService);
        this.treeDataService = (_r = services === null || services === void 0 ? void 0 : services.treeDataService) !== null && _r !== void 0 ? _r : new common_1.TreeDataService(this._eventPubSubService, this.sharedService, this.sortService);
        this.paginationService = (_s = services === null || services === void 0 ? void 0 : services.paginationService) !== null && _s !== void 0 ? _s : new common_1.PaginationService(this._eventPubSubService, this.sharedService, this.backendUtilityService);
        this.extensionService = (_t = services === null || services === void 0 ? void 0 : services.extensionService) !== null && _t !== void 0 ? _t : new common_1.ExtensionService(this.extensionUtility, this.filterService, this._eventPubSubService, this.sharedService, this.sortService, this.treeDataService, this.translaterService);
        this.gridStateService = (_u = services === null || services === void 0 ? void 0 : services.gridStateService) !== null && _u !== void 0 ? _u : new common_1.GridStateService(this.extensionService, this.filterService, this._eventPubSubService, this.sharedService, this.sortService, this.treeDataService);
        this.gridService = (_v = services === null || services === void 0 ? void 0 : services.gridService) !== null && _v !== void 0 ? _v : new common_1.GridService(this.gridStateService, this.filterService, this._eventPubSubService, this.paginationService, this.sharedService, this.sortService, this.treeDataService);
        this.groupingService = (_w = services === null || services === void 0 ? void 0 : services.groupingAndColspanService) !== null && _w !== void 0 ? _w : new common_1.GroupingAndColspanService(this.extensionUtility, this._eventPubSubService);
        if (hierarchicalDataset) {
            this.sharedService.hierarchicalDataset = (isDeepCopyDataOnPageLoadEnabled ? (0, common_1.deepCopy)(hierarchicalDataset || []) : hierarchicalDataset) || [];
        }
        const eventHandler = new Slick.EventHandler();
        // register all service instances in the container
        this.universalContainerService.registerInstance('PubSubService', this._eventPubSubService); // external resources require this one registration (ExcelExport, TextExport)
        this.universalContainerService.registerInstance('EventPubSubService', this._eventPubSubService);
        this.universalContainerService.registerInstance('ExtensionUtility', this.extensionUtility);
        this.universalContainerService.registerInstance('FilterService', this.filterService);
        this.universalContainerService.registerInstance('CollectionService', this.collectionService);
        this.universalContainerService.registerInstance('ExtensionService', this.extensionService);
        this.universalContainerService.registerInstance('GridEventService', this.gridEventService);
        this.universalContainerService.registerInstance('GridService', this.gridService);
        this.universalContainerService.registerInstance('GridStateService', this.gridStateService);
        this.universalContainerService.registerInstance('GroupingAndColspanService', this.groupingService);
        this.universalContainerService.registerInstance('PaginationService', this.paginationService);
        this.universalContainerService.registerInstance('ResizerService', this.resizerService);
        this.universalContainerService.registerInstance('SharedService', this.sharedService);
        this.universalContainerService.registerInstance('SortService', this.sortService);
        this.universalContainerService.registerInstance('TranslaterService', this.translaterService);
        this.universalContainerService.registerInstance('TreeDataService', this.treeDataService);
        this.initialization(this._gridContainerElm, eventHandler);
        if (!hierarchicalDataset && !this.gridOptions.backendServiceApi) {
            this.dataset = dataset || [];
            this._currentDatasetLength = this.dataset.length;
        }
    }
    emptyGridContainerElm() {
        var _a, _b;
        const gridContainerId = (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.gridContainerId) !== null && _b !== void 0 ? _b : 'grid1';
        const gridContainerElm = document.querySelector(`#${gridContainerId}`);
        (0, common_1.emptyElement)(gridContainerElm);
    }
    /** Dispose of the Component */
    dispose(shouldEmptyDomElementContainer = false) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        (_a = this._eventPubSubService) === null || _a === void 0 ? void 0 : _a.publish('onBeforeGridDestroy', this.slickGrid);
        (_b = this._eventHandler) === null || _b === void 0 ? void 0 : _b.unsubscribeAll();
        (_c = this._eventPubSubService) === null || _c === void 0 ? void 0 : _c.publish('onAfterGridDestroyed', true);
        // dispose the Services
        (_d = this.extensionService) === null || _d === void 0 ? void 0 : _d.dispose();
        (_f = this.filterService) === null || _f === void 0 ? void 0 : _f.dispose();
        (_g = this.gridEventService) === null || _g === void 0 ? void 0 : _g.dispose();
        (_h = this.gridService) === null || _h === void 0 ? void 0 : _h.dispose();
        (_j = this.gridStateService) === null || _j === void 0 ? void 0 : _j.dispose();
        (_k = this.groupingService) === null || _k === void 0 ? void 0 : _k.dispose();
        (_l = this.paginationService) === null || _l === void 0 ? void 0 : _l.dispose();
        (_m = this.resizerService) === null || _m === void 0 ? void 0 : _m.dispose();
        (_o = this.sortService) === null || _o === void 0 ? void 0 : _o.dispose();
        (_p = this.treeDataService) === null || _p === void 0 ? void 0 : _p.dispose();
        (_q = this.universalContainerService) === null || _q === void 0 ? void 0 : _q.dispose();
        // dispose all registered external resources
        if (Array.isArray(this._registeredResources)) {
            while (this._registeredResources.length > 0) {
                const resource = this._registeredResources.pop();
                if (resource === null || resource === void 0 ? void 0 : resource.dispose) {
                    resource.dispose();
                }
            }
            this._registeredResources = [];
        }
        // dispose the Components
        (_r = this.slickFooter) === null || _r === void 0 ? void 0 : _r.dispose();
        (_s = this.slickEmptyWarning) === null || _s === void 0 ? void 0 : _s.dispose();
        (_t = this.slickPagination) === null || _t === void 0 ? void 0 : _t.dispose();
        (0, common_1.unsubscribeAll)(this.subscriptions);
        (_u = this._eventPubSubService) === null || _u === void 0 ? void 0 : _u.unsubscribeAll();
        (_v = this.dataView) === null || _v === void 0 ? void 0 : _v.setItems([]);
        if (typeof ((_w = this.dataView) === null || _w === void 0 ? void 0 : _w.destroy) === 'function') {
            (_x = this.dataView) === null || _x === void 0 ? void 0 : _x.destroy();
        }
        (_y = this.slickGrid) === null || _y === void 0 ? void 0 : _y.destroy(true);
        this.slickGrid = null;
        (0, common_1.emptyElement)(this._gridContainerElm);
        (0, common_1.emptyElement)(this._gridParentContainerElm);
        (_z = this._gridContainerElm) === null || _z === void 0 ? void 0 : _z.remove();
        (_0 = this._gridParentContainerElm) === null || _0 === void 0 ? void 0 : _0.remove();
        if (this.backendServiceApi) {
            for (const prop of Object.keys(this.backendServiceApi)) {
                this.backendServiceApi[prop] = null;
            }
            this.backendServiceApi = undefined;
        }
        for (const prop of Object.keys(this.columnDefinitions)) {
            this.columnDefinitions[prop] = null;
        }
        for (const prop of Object.keys(this.sharedService)) {
            this.sharedService[prop] = null;
        }
        this.datasetHierarchical = undefined;
        this._columnDefinitions = [];
        // we could optionally also empty the content of the grid container DOM element
        if (shouldEmptyDomElementContainer) {
            this.emptyGridContainerElm();
        }
        (_1 = this._eventPubSubService) === null || _1 === void 0 ? void 0 : _1.dispose();
        this._slickerGridInstances = null;
    }
    initialization(gridContainerElm, eventHandler) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        // when detecting a frozen grid, we'll automatically enable the mousewheel scroll handler so that we can scroll from both left/right frozen containers
        if (this.gridOptions && ((this.gridOptions.frozenRow !== undefined && this.gridOptions.frozenRow >= 0) || this.gridOptions.frozenColumn !== undefined && this.gridOptions.frozenColumn >= 0) && this.gridOptions.enableMouseWheelScrollHandler === undefined) {
            this.gridOptions.enableMouseWheelScrollHandler = true;
        }
        // create the slickgrid container and add it to the user's grid container
        this._gridContainerElm = gridContainerElm;
        this._eventPubSubService.publish('onBeforeGridCreate', true);
        this._eventHandler = eventHandler;
        this._gridOptions = this.mergeGridOptions(this._gridOptions || {});
        this.backendServiceApi = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.backendServiceApi;
        this._isLocalGrid = !this.backendServiceApi; // considered a local grid if it doesn't have a backend service set
        this._eventPubSubService.eventNamingStyle = (_c = (_b = this._gridOptions) === null || _b === void 0 ? void 0 : _b.eventNamingStyle) !== null && _c !== void 0 ? _c : event_pub_sub_1.EventNamingStyle.camelCase;
        this._paginationOptions = (_d = this.gridOptions) === null || _d === void 0 ? void 0 : _d.pagination;
        this.createBackendApiInternalPostProcessCallback(this._gridOptions);
        if (!this.customDataView) {
            const dataviewInlineFilters = (_h = (_g = (_f = this._gridOptions) === null || _f === void 0 ? void 0 : _f.dataView) === null || _g === void 0 ? void 0 : _g.inlineFilters) !== null && _h !== void 0 ? _h : false;
            let dataViewOptions = { inlineFilters: dataviewInlineFilters };
            if (this.gridOptions.draggableGrouping || this.gridOptions.enableGrouping) {
                this.groupItemMetadataProvider = new common_1.SlickGroupItemMetadataProvider();
                this.sharedService.groupItemMetadataProvider = this.groupItemMetadataProvider;
                dataViewOptions = { ...dataViewOptions, groupItemMetadataProvider: this.groupItemMetadataProvider };
            }
            this.dataView = new Slick.Data.DataView(dataViewOptions);
            this._eventPubSubService.publish('onDataviewCreated', this.dataView);
        }
        // get any possible Services that user want to register which don't require SlickGrid to be instantiated
        // RxJS Resource is in this lot because it has to be registered before anything else and doesn't require SlickGrid to be initialized
        this.preRegisterResources();
        // for convenience to the user, we provide the property "editor" as an Slickgrid-Universal editor complex object
        // however "editor" is used internally by SlickGrid for it's own Editor Factory
        // so in our lib we will swap "editor" and copy it into a new property called "internalColumnEditor"
        // then take back "editor.model" and make it the new "editor" so that SlickGrid Editor Factory still works
        this._columnDefinitions = this.swapInternalEditorToSlickGridFactoryEditor(this._columnDefinitions || []);
        // if the user wants to automatically add a Custom Editor Formatter, we need to call the auto add function again
        if (this._gridOptions.autoAddCustomEditorFormatter) {
            (0, common_1.autoAddEditorFormatterToColumnsWithEditor)(this._columnDefinitions, this._gridOptions.autoAddCustomEditorFormatter);
        }
        // save reference for all columns before they optionally become hidden/visible
        this.sharedService.allColumns = this._columnDefinitions;
        this.sharedService.visibleColumns = this._columnDefinitions;
        // TODO: revisit later, this is conflicting with Grid State & Presets
        // before certain extentions/plugins potentially adds extra columns not created by the user itself (RowMove, RowDetail, RowSelections)
        // we'll subscribe to the event and push back the change to the user so they always use full column defs array including extra cols
        // this.subscriptions.push(
        //   this._eventPubSubService.subscribe<{ columns: Column[]; pluginName: string }>('onPluginColumnsChanged', data => {
        //     this._columnDefinitions = this.columnDefinitions = data.columns;
        //   })
        // );
        // after subscribing to potential columns changed, we are ready to create these optional extensions
        // when we did find some to create (RowMove, RowDetail, RowSelections), it will automatically modify column definitions (by previous subscribe)
        this.extensionService.createExtensionsBeforeGridCreation(this._columnDefinitions, this._gridOptions);
        // if user entered some Pinning/Frozen "presets", we need to apply them in the grid options
        if ((_j = this.gridOptions.presets) === null || _j === void 0 ? void 0 : _j.pinning) {
            this.gridOptions = { ...this.gridOptions, ...this.gridOptions.presets.pinning };
        }
        this.slickGrid = new Slick.Grid(gridContainerElm, this.dataView, this._columnDefinitions, this._gridOptions);
        this.sharedService.dataView = this.dataView;
        this.sharedService.slickGrid = this.slickGrid;
        this.sharedService.gridContainerElement = this._gridContainerElm;
        this.extensionService.bindDifferentExtensions();
        this.bindDifferentHooks(this.slickGrid, this._gridOptions, this.dataView);
        this._slickgridInitialized = true;
        // when it's a frozen grid, we need to keep the frozen column id for reference if we ever show/hide column from ColumnPicker/GridMenu afterward
        const frozenColumnIndex = (_l = (_k = this._gridOptions) === null || _k === void 0 ? void 0 : _k.frozenColumn) !== null && _l !== void 0 ? _l : -1;
        if (frozenColumnIndex >= 0 && frozenColumnIndex <= this._columnDefinitions.length && this._columnDefinitions.length > 0) {
            this.sharedService.frozenVisibleColumnId = (_o = (_m = this._columnDefinitions[frozenColumnIndex]) === null || _m === void 0 ? void 0 : _m.id) !== null && _o !== void 0 ? _o : '';
        }
        // get any possible Services that user want to register
        this.registerResources();
        // initialize the SlickGrid grid
        this.slickGrid.init();
        // initialized the resizer service only after SlickGrid is initialized
        // if we don't we end up binding our resize to a grid element that doesn't yet exist in the DOM and the resizer service will fail silently (because it has a try/catch that unbinds the resize without throwing back)
        this.resizerService.init(this.slickGrid, this._gridParentContainerElm);
        // user could show a custom footer with the data metrics (dataset length and last updated timestamp)
        if (!this.gridOptions.enablePagination && this.gridOptions.showCustomFooter && this.gridOptions.customFooterOptions) {
            this.slickFooter = new custom_footer_component_1.SlickFooterComponent(this.slickGrid, this.gridOptions.customFooterOptions, this._eventPubSubService, this.translaterService);
            this.slickFooter.renderFooter(this._gridParentContainerElm);
        }
        // load the data in the DataView (unless it's a hierarchical dataset, if so it will be loaded after the initial tree sort)
        if (Array.isArray(this.dataset)) {
            const initialDataset = ((_p = this.gridOptions) === null || _p === void 0 ? void 0 : _p.enableTreeData) ? this.sortTreeDataset(this.dataset) : this.dataset;
            (_q = this.dataView) === null || _q === void 0 ? void 0 : _q.setItems(initialDataset, this._gridOptions.datasetIdPropertyName);
        }
        // if you don't want the items that are not visible (due to being filtered out or being on a different page)
        // to stay selected, pass 'false' to the second arg
        const selectionModel = (_s = (_r = this.slickGrid) === null || _r === void 0 ? void 0 : _r.getSelectionModel) === null || _s === void 0 ? void 0 : _s.call(_r);
        if (selectionModel && ((_t = this._gridOptions) === null || _t === void 0 ? void 0 : _t.dataView) && this._gridOptions.dataView.hasOwnProperty('syncGridSelection')) {
            // if we are using a Backend Service, we will do an extra flag check, the reason is because it might have some unintended behaviors
            // with the BackendServiceApi because technically the data in the page changes the DataView on every page change.
            let preservedRowSelectionWithBackend = false;
            if (this._gridOptions.backendServiceApi && this._gridOptions.dataView.hasOwnProperty('syncGridSelectionWithBackendService')) {
                preservedRowSelectionWithBackend = this._gridOptions.dataView.syncGridSelectionWithBackendService;
            }
            const syncGridSelection = this._gridOptions.dataView.syncGridSelection;
            if (typeof syncGridSelection === 'boolean') {
                let preservedRowSelection = syncGridSelection;
                if (!this._isLocalGrid) {
                    // when using BackendServiceApi, we'll be using the "syncGridSelectionWithBackendService" flag BUT "syncGridSelection" must also be set to True
                    preservedRowSelection = syncGridSelection && preservedRowSelectionWithBackend;
                }
                (_u = this.dataView) === null || _u === void 0 ? void 0 : _u.syncGridSelection(this.slickGrid, preservedRowSelection);
            }
            else if (typeof syncGridSelection === 'object') {
                (_v = this.dataView) === null || _v === void 0 ? void 0 : _v.syncGridSelection(this.slickGrid, syncGridSelection.preserveHidden, syncGridSelection.preserveHiddenOnSelectionChange);
            }
        }
        this.slickGrid.invalidate();
        if (((_x = (_w = this.dataView) === null || _w === void 0 ? void 0 : _w.getLength()) !== null && _x !== void 0 ? _x : 0) > 0) {
            if (!this._isDatasetInitialized && (this._gridOptions.enableCheckboxSelector || this._gridOptions.enableRowSelection)) {
                this.loadRowSelectionPresetWhenExists();
            }
            this.loadFilterPresetsWhenDatasetInitialized();
            this._isDatasetInitialized = true;
        }
        // user might want to hide the header row on page load but still have `enableFiltering: true`
        // if that is the case, we need to hide the headerRow ONLY AFTER all filters got created & dataView exist
        if (this._hideHeaderRowAfterPageLoad) {
            this.showHeaderRow(false);
            this.sharedService.hideHeaderRowAfterPageLoad = this._hideHeaderRowAfterPageLoad;
        }
        // on cell click, mainly used with the columnDef.action callback
        this.gridEventService.bindOnBeforeEditCell(this.slickGrid);
        this.gridEventService.bindOnCellChange(this.slickGrid);
        this.gridEventService.bindOnClick(this.slickGrid);
        // bind the Backend Service API callback functions only after the grid is initialized
        // because the preProcess() and onInit() might get triggered
        if ((_y = this.gridOptions) === null || _y === void 0 ? void 0 : _y.backendServiceApi) {
            this.bindBackendCallbackFunctions(this.gridOptions);
        }
        // publish & dispatch certain events
        this._eventPubSubService.publish('onGridCreated', this.slickGrid);
        // after the DataView is created & updated execute some processes & dispatch some events
        if (!this.customDataView) {
            this.executeAfterDataviewCreated(this.gridOptions);
        }
        // bind resize ONLY after the dataView is ready
        this.bindResizeHook(this.slickGrid, this.gridOptions);
        // once the grid is created, we'll return its instance (we do this to return Transient Services from DI)
        this._slickerGridInstances = {
            // Slick Grid & DataView objects
            dataView: this.dataView,
            slickGrid: this.slickGrid,
            // public methods
            dispose: this.dispose.bind(this),
            // return all available Services (non-singleton)
            backendService: (_0 = (_z = this.gridOptions) === null || _z === void 0 ? void 0 : _z.backendServiceApi) === null || _0 === void 0 ? void 0 : _0.service,
            eventPubSubService: this._eventPubSubService,
            filterService: this.filterService,
            gridEventService: this.gridEventService,
            gridStateService: this.gridStateService,
            gridService: this.gridService,
            groupingService: this.groupingService,
            extensionService: this.extensionService,
            extensionUtility: this.extensionUtility,
            paginationService: this.paginationService,
            resizerService: this.resizerService,
            sortService: this.sortService,
            treeDataService: this.treeDataService,
        };
        // addons (SlickGrid extra plugins/controls)
        this._extensions = (_1 = this.extensionService) === null || _1 === void 0 ? void 0 : _1.extensionList;
        // all instances (SlickGrid, DataView & all Services)
        this._eventPubSubService.publish('onSlickerGridCreated', this.instances);
        this._isGridInitialized = true;
    }
    mergeGridOptions(gridOptions) {
        const options = Slick.Utils.extend(true, {}, common_1.GlobalGridOptions, gridOptions);
        // also make sure to show the header row if user have enabled filtering
        if (options.enableFiltering && !options.showHeaderRow) {
            options.showHeaderRow = options.enableFiltering;
        }
        // using copy extend to do a deep clone has an unwanted side on objects and pageSizes but ES6 spread has other worst side effects
        // so we will just overwrite the pageSizes when needed, this is the only one causing issues so far.
        // On a deep extend, Object and Array are extended, but object wrappers on primitive types such as String, Boolean, and Number are not.
        if ((options === null || options === void 0 ? void 0 : options.pagination) && (gridOptions.enablePagination || gridOptions.backendServiceApi) && gridOptions.pagination && Array.isArray(gridOptions.pagination.pageSizes)) {
            options.pagination.pageSizes = gridOptions.pagination.pageSizes;
        }
        // when we use Pagination on Local Grid, it doesn't seem to work without enableFiltering
        // so we'll enable the filtering but we'll keep the header row hidden
        if (this.sharedService && !options.enableFiltering && options.enablePagination && this._isLocalGrid) {
            options.enableFiltering = true;
            options.showHeaderRow = false;
            this._hideHeaderRowAfterPageLoad = true;
            this.sharedService.hideHeaderRowAfterPageLoad = true;
        }
        return options;
    }
    /**
     * Define our internal Post Process callback, it will execute internally after we get back result from the Process backend call
     * For now, this is GraphQL Service ONLY feature and it will basically
     * refresh the Dataset & Pagination without having the user to create his own PostProcess every time
     */
    createBackendApiInternalPostProcessCallback(gridOptions) {
        const backendApi = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.backendServiceApi;
        if (backendApi === null || backendApi === void 0 ? void 0 : backendApi.service) {
            const backendApiService = backendApi.service;
            // internalPostProcess only works (for now) with a GraphQL Service, so make sure it is of that type
            if ( /* backendApiService instanceof GraphqlService || */typeof backendApiService.getDatasetName === 'function') {
                backendApi.internalPostProcess = (processResult) => {
                    const datasetName = (backendApi && backendApiService && typeof backendApiService.getDatasetName === 'function') ? backendApiService.getDatasetName() : '';
                    if (processResult && processResult.data && processResult.data[datasetName]) {
                        const data = processResult.data[datasetName].hasOwnProperty('nodes') ? processResult.data[datasetName].nodes : processResult.data[datasetName];
                        const totalCount = processResult.data[datasetName].hasOwnProperty('totalCount') ? processResult.data[datasetName].totalCount : processResult.data[datasetName].length;
                        this.refreshGridData(data, totalCount || 0);
                    }
                };
            }
        }
    }
    bindDifferentHooks(grid, gridOptions, dataView) {
        var _a, _b;
        // if user is providing a Translate Service, we need to add our PubSub Service (but only after creating all dependencies)
        // so that we can later subscribe to the "onLanguageChange" event and translate any texts whenever that get triggered
        if (gridOptions.enableTranslate && ((_a = this.translaterService) === null || _a === void 0 ? void 0 : _a.addPubSubMessaging)) {
            this.translaterService.addPubSubMessaging(this._eventPubSubService);
        }
        // translate them all on first load, then on each language change
        if (gridOptions.enableTranslate) {
            this.extensionService.translateAllExtensions();
            this.translateColumnHeaderTitleKeys();
            this.translateColumnGroupKeys();
        }
        // on locale change, we have to manually translate the Headers, GridMenu
        this.subscriptions.push(this._eventPubSubService.subscribe('onLanguageChange', () => {
            if (gridOptions.enableTranslate) {
                this.extensionService.translateAllExtensions();
                this.translateColumnHeaderTitleKeys();
                this.translateColumnGroupKeys();
                if (gridOptions.createPreHeaderPanel && !gridOptions.enableDraggableGrouping) {
                    this.groupingService.translateGroupingAndColSpan();
                }
            }
        }));
        // if user set an onInit Backend, we'll run it right away (and if so, we also need to run preProcess, internalPostProcess & postProcess)
        if (gridOptions.backendServiceApi) {
            const backendApi = gridOptions.backendServiceApi;
            if ((_b = backendApi === null || backendApi === void 0 ? void 0 : backendApi.service) === null || _b === void 0 ? void 0 : _b.init) {
                backendApi.service.init(backendApi.options, gridOptions.pagination, this.slickGrid, this.sharedService);
            }
        }
        if (dataView && grid) {
            // expose all Slick Grid Events through dispatch
            for (const prop in grid) {
                if (grid.hasOwnProperty(prop) && prop.startsWith('on')) {
                    this._eventHandler.subscribe(grid[prop], (event, args) => {
                        var _a, _b;
                        const gridEventName = this._eventPubSubService.getEventNameByNamingConvention(prop, (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.defaultSlickgridEventPrefix) !== null && _b !== void 0 ? _b : '');
                        return this._eventPubSubService.dispatchCustomEvent(gridEventName, { eventData: event, args });
                    });
                }
            }
            // expose all Slick DataView Events through dispatch
            for (const prop in dataView) {
                if (dataView.hasOwnProperty(prop) && prop.startsWith('on')) {
                    this._eventHandler.subscribe(dataView[prop], (event, args) => {
                        var _a, _b;
                        const dataViewEventName = this._eventPubSubService.getEventNameByNamingConvention(prop, (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.defaultSlickgridEventPrefix) !== null && _b !== void 0 ? _b : '');
                        return this._eventPubSubService.dispatchCustomEvent(dataViewEventName, { eventData: event, args });
                    });
                }
            }
            // after all events are exposed
            // we can bind external filter (backend) when available or default onFilter (dataView)
            if (gridOptions.enableFiltering) {
                this.filterService.init(grid);
                // bind external filter (backend) unless specified to use the local one
                if (gridOptions.backendServiceApi && !gridOptions.backendServiceApi.useLocalFiltering) {
                    this.filterService.bindBackendOnFilter(grid);
                }
                else {
                    this.filterService.bindLocalOnFilter(grid);
                }
            }
            // bind external sorting (backend) when available or default onSort (dataView)
            if (gridOptions.enableSorting) {
                // bind external sorting (backend) unless specified to use the local one
                if (gridOptions.backendServiceApi && !gridOptions.backendServiceApi.useLocalSorting) {
                    this.sortService.bindBackendOnSort(grid);
                }
                else {
                    this.sortService.bindLocalOnSort(grid);
                }
            }
            // When data changes in the DataView, we need to refresh the metrics and/or display a warning if the dataset is empty
            this._eventHandler.subscribe(dataView.onRowCountChanged, () => {
                var _a, _b, _c;
                grid.invalidate();
                this.handleOnItemCountChanged(((_a = this.dataView) === null || _a === void 0 ? void 0 : _a.getFilteredItemCount()) || 0, (_c = (_b = this.dataView) === null || _b === void 0 ? void 0 : _b.getItemCount()) !== null && _c !== void 0 ? _c : 0);
            });
            this._eventHandler.subscribe(dataView.onSetItemsCalled, (_e, args) => {
                var _a, _b;
                this.handleOnItemCountChanged(((_a = this.dataView) === null || _a === void 0 ? void 0 : _a.getFilteredItemCount()) || 0, args.itemCount);
                // when user has resize by content enabled, we'll force a full width calculation since we change our entire dataset
                if (args.itemCount > 0 && (this.gridOptions.autosizeColumnsByCellContentOnFirstLoad || this.gridOptions.enableAutoResizeColumnsByCellContent)) {
                    this.resizerService.resizeColumnsByCellContent(!((_b = this.gridOptions) === null || _b === void 0 ? void 0 : _b.resizeByContentOnlyOnFirstLoad));
                }
            });
            // when filtering data with local dataset, we need to update each row else it will not always show correctly in the UI
            // also don't use "invalidateRows" since it destroys the entire row and as bad user experience when updating a row
            if (gridOptions && gridOptions.enableFiltering && !gridOptions.enableRowDetailView) {
                this._eventHandler.subscribe(dataView.onRowsChanged, (_e, args) => {
                    if ((args === null || args === void 0 ? void 0 : args.rows) && Array.isArray(args.rows)) {
                        args.rows.forEach((row) => grid.updateRow(row));
                        grid.render();
                    }
                });
            }
            // when column are reordered, we need to update the visibleColumn array
            this._eventHandler.subscribe(grid.onColumnsReordered, (_e, args) => {
                this.sharedService.hasColumnsReordered = true;
                this.sharedService.visibleColumns = args.impactedColumns;
            });
            // load any presets if any (after dataset is initialized)
            this.loadColumnPresetsWhenDatasetInitialized();
            this.loadFilterPresetsWhenDatasetInitialized();
        }
        // did the user add a colspan callback? If so, hook it into the DataView getItemMetadata
        if ((gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.colspanCallback) && (dataView === null || dataView === void 0 ? void 0 : dataView.getItem) && (dataView === null || dataView === void 0 ? void 0 : dataView.getItemMetadata)) {
            dataView.getItemMetadata = (rowNumber) => {
                let callbackResult = null;
                if (gridOptions.colspanCallback) {
                    callbackResult = gridOptions.colspanCallback(dataView.getItem(rowNumber));
                }
                return callbackResult;
            };
        }
    }
    bindBackendCallbackFunctions(gridOptions) {
        var _a, _b, _c, _d, _f, _g;
        const backendApi = gridOptions.backendServiceApi;
        const backendApiService = backendApi === null || backendApi === void 0 ? void 0 : backendApi.service;
        const serviceOptions = (_a = backendApiService === null || backendApiService === void 0 ? void 0 : backendApiService.options) !== null && _a !== void 0 ? _a : {};
        const isExecuteCommandOnInit = (!serviceOptions) ? false : ((serviceOptions === null || serviceOptions === void 0 ? void 0 : serviceOptions.hasOwnProperty('executeProcessCommandOnInit')) ? serviceOptions['executeProcessCommandOnInit'] : true);
        if (backendApiService) {
            // update backend filters (if need be) BEFORE the query runs (via the onInit command a few lines below)
            // if user entered some any "presets", we need to reflect them all in the grid
            if (gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.presets) {
                // Filters "presets"
                if (backendApiService.updateFilters && Array.isArray(gridOptions.presets.filters) && gridOptions.presets.filters.length > 0) {
                    backendApiService.updateFilters(gridOptions.presets.filters, true);
                }
                // Sorters "presets"
                if (backendApiService.updateSorters && Array.isArray(gridOptions.presets.sorters) && gridOptions.presets.sorters.length > 0) {
                    // when using multi-column sort, we can have multiple but on single sort then only grab the first sort provided
                    const sortColumns = ((_b = this._gridOptions) === null || _b === void 0 ? void 0 : _b.multiColumnSort) ? gridOptions.presets.sorters : gridOptions.presets.sorters.slice(0, 1);
                    backendApiService.updateSorters(undefined, sortColumns);
                }
                // Pagination "presets"
                if (backendApiService.updatePagination && gridOptions.presets.pagination) {
                    const { pageNumber, pageSize } = gridOptions.presets.pagination;
                    backendApiService.updatePagination(pageNumber, pageSize);
                }
            }
            else {
                const columnFilters = this.filterService.getColumnFilters();
                if (columnFilters && backendApiService.updateFilters) {
                    backendApiService.updateFilters(columnFilters, false);
                }
            }
            // execute onInit command when necessary
            if (backendApi && backendApiService && (backendApi.onInit || isExecuteCommandOnInit)) {
                const query = (typeof backendApiService.buildQuery === 'function') ? backendApiService.buildQuery() : '';
                const process = isExecuteCommandOnInit ? ((_d = (_c = backendApi.process) === null || _c === void 0 ? void 0 : _c.call(backendApi, query)) !== null && _d !== void 0 ? _d : null) : ((_g = (_f = backendApi.onInit) === null || _f === void 0 ? void 0 : _f.call(backendApi, query)) !== null && _g !== void 0 ? _g : null);
                // wrap this inside a setTimeout to avoid timing issue since the gridOptions needs to be ready before running this onInit
                setTimeout(() => {
                    var _a, _b, _c, _d;
                    const backendUtilityService = this.backendUtilityService;
                    // keep start time & end timestamps & return it after process execution
                    const startTime = new Date();
                    // run any pre-process, if defined, for example a spinner
                    if (backendApi.preProcess) {
                        backendApi.preProcess();
                    }
                    // the processes can be a Promise (like Http)
                    const totalItems = (_c = (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.pagination) === null || _b === void 0 ? void 0 : _b.totalItems) !== null && _c !== void 0 ? _c : 0;
                    if (process instanceof Promise) {
                        process
                            .then((processResult) => backendUtilityService.executeBackendProcessesCallback(startTime, processResult, backendApi, totalItems))
                            .catch((error) => backendUtilityService.onBackendError(error, backendApi));
                    }
                    else if (process && ((_d = this.rxjs) === null || _d === void 0 ? void 0 : _d.isObservable(process))) {
                        this.subscriptions.push(process.subscribe((processResult) => backendUtilityService.executeBackendProcessesCallback(startTime, processResult, backendApi, totalItems), (error) => backendUtilityService.onBackendError(error, backendApi)));
                    }
                });
            }
        }
    }
    bindResizeHook(grid, options) {
        if ((options.autoFitColumnsOnFirstLoad && options.autosizeColumnsByCellContentOnFirstLoad) || (options.enableAutoSizeColumns && options.enableAutoResizeColumnsByCellContent)) {
            throw new Error(`[Slickgrid-Universal] You cannot enable both autosize/fit viewport & resize by content, you must choose which resize technique to use. You can enable these 2 options ("autoFitColumnsOnFirstLoad" and "enableAutoSizeColumns") OR these other 2 options ("autosizeColumnsByCellContentOnFirstLoad" and "enableAutoResizeColumnsByCellContent").`);
        }
        if (grid && options.autoFitColumnsOnFirstLoad && options.enableAutoSizeColumns && typeof grid.autosizeColumns === 'function') {
            // expand/autofit columns on first page load
            grid.autosizeColumns();
        }
        // auto-resize grid on browser resize (optionally provide grid height or width)
        if (options.gridHeight || options.gridWidth) {
            this.resizerService.resizeGrid(0, { height: options.gridHeight, width: options.gridWidth });
        }
        else {
            this.resizerService.resizeGrid();
        }
        if (grid && (options === null || options === void 0 ? void 0 : options.enableAutoResize)) {
            if (options.autoFitColumnsOnFirstLoad && options.enableAutoSizeColumns && typeof grid.autosizeColumns === 'function') {
                grid.autosizeColumns();
            }
        }
    }
    executeAfterDataviewCreated(gridOptions) {
        var _a;
        // if user entered some Sort "presets", we need to reflect them all in the DOM
        if (gridOptions.enableSorting) {
            if (gridOptions.presets && Array.isArray(gridOptions.presets.sorters)) {
                // when using multi-column sort, we can have multiple but on single sort then only grab the first sort provided
                const sortColumns = ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.multiColumnSort) ? gridOptions.presets.sorters : gridOptions.presets.sorters.slice(0, 1);
                this.sortService.loadGridSorters(sortColumns);
            }
        }
    }
    /**
     * On a Pagination changed, we will trigger a Grid State changed with the new pagination info
     * Also if we use Row Selection or the Checkbox Selector with a Backend Service (Odata, GraphQL), we need to reset any selection
     */
    paginationChanged(pagination) {
        var _a, _b, _c;
        const isSyncGridSelectionEnabled = (_b = (_a = this.gridStateService) === null || _a === void 0 ? void 0 : _a.needToPreserveRowSelection()) !== null && _b !== void 0 ? _b : false;
        if (this.slickGrid && !isSyncGridSelectionEnabled && ((_c = this._gridOptions) === null || _c === void 0 ? void 0 : _c.backendServiceApi) && (this.gridOptions.enableRowSelection || this.gridOptions.enableCheckboxSelector)) {
            this.slickGrid.setSelectedRows([]);
        }
        const { pageNumber, pageSize } = pagination;
        if (this.sharedService) {
            if (pageSize !== undefined && pageNumber !== undefined) {
                this.sharedService.currentPagination = { pageNumber, pageSize };
            }
        }
        this._eventPubSubService.publish('onGridStateChanged', {
            change: { newValues: { pageNumber, pageSize }, type: common_1.GridStateType.pagination },
            gridState: this.gridStateService.getCurrentGridState()
        });
    }
    /**
     * When dataset changes, we need to refresh the entire grid UI & possibly resize it as well
     * @param dataset
     */
    refreshGridData(dataset, totalCount) {
        var _a, _b, _c, _d, _f;
        // local grid, check if we need to show the Pagination
        // if so then also check if there's any presets and finally initialize the PaginationService
        // a local grid with Pagination presets will potentially have a different total of items, we'll need to get it from the DataView and update our total
        if (this.slickGrid && this._gridOptions) {
            if (this._gridOptions.enablePagination && this._isLocalGrid) {
                this.showPagination = true;
                this.loadLocalGridPagination(dataset);
            }
            if (this._gridOptions.enableEmptyDataWarningMessage && Array.isArray(dataset)) {
                const finalTotalCount = totalCount || dataset.length;
                this.displayEmptyDataWarning(finalTotalCount < 1);
            }
            if (Array.isArray(dataset) && this.slickGrid && ((_a = this.dataView) === null || _a === void 0 ? void 0 : _a.setItems)) {
                this.dataView.setItems(dataset, this._gridOptions.datasetIdPropertyName);
                if (!this._gridOptions.backendServiceApi && !this._gridOptions.enableTreeData) {
                    this.dataView.reSort();
                }
                if (dataset.length > 0) {
                    if (!this._isDatasetInitialized) {
                        this.loadFilterPresetsWhenDatasetInitialized();
                        if (this._gridOptions.enableCheckboxSelector) {
                            this.loadRowSelectionPresetWhenExists();
                        }
                    }
                    this._isDatasetInitialized = true;
                }
                if (dataset) {
                    this.slickGrid.invalidate();
                }
                // display the Pagination component only after calling this refresh data first, we call it here so that if we preset pagination page number it will be shown correctly
                this.showPagination = (this._gridOptions && (this._gridOptions.enablePagination || (this._gridOptions.backendServiceApi && this._gridOptions.enablePagination === undefined))) ? true : false;
                if (this._paginationOptions && ((_b = this._gridOptions) === null || _b === void 0 ? void 0 : _b.pagination) && ((_c = this._gridOptions) === null || _c === void 0 ? void 0 : _c.backendServiceApi)) {
                    const paginationOptions = this.setPaginationOptionsWhenPresetDefined(this._gridOptions, this._paginationOptions);
                    // when we have a totalCount use it, else we'll take it from the pagination object
                    // only update the total items if it's different to avoid refreshing the UI
                    const totalRecords = (totalCount !== undefined) ? totalCount : ((_f = (_d = this._gridOptions) === null || _d === void 0 ? void 0 : _d.pagination) === null || _f === void 0 ? void 0 : _f.totalItems);
                    if (totalRecords !== undefined && totalRecords !== this.totalItems) {
                        this.totalItems = +totalRecords;
                    }
                    // initialize the Pagination Service with new pagination options (which might have presets)
                    if (!this._isPaginationInitialized) {
                        this.initializePaginationService(paginationOptions);
                    }
                    else {
                        // update the pagination service with the new total
                        this.paginationService.updateTotalItems(this.totalItems);
                    }
                }
                // resize the grid inside a slight timeout, in case other DOM element changed prior to the resize (like a filter/pagination changed)
                if (this.slickGrid && this._gridOptions.enableAutoResize) {
                    const delay = this._gridOptions.autoResize && this._gridOptions.autoResize.delay;
                    this.resizerService.resizeGrid(delay || 10);
                }
            }
        }
    }
    /**
     * Dynamically change or update the column definitions list.
     * We will re-render the grid so that the new header and data shows up correctly.
     * If using translater, we also need to trigger a re-translate of the column headers
     */
    updateColumnDefinitionsList(newColumnDefinitions) {
        var _a, _b, _c;
        if (this.slickGrid && this._gridOptions && Array.isArray(newColumnDefinitions)) {
            // map/swap the internal library Editor to the SlickGrid Editor factory
            newColumnDefinitions = this.swapInternalEditorToSlickGridFactoryEditor(newColumnDefinitions);
            // if the user wants to automatically add a Custom Editor Formatter, we need to call the auto add function again
            if (this._gridOptions.autoAddCustomEditorFormatter) {
                (0, common_1.autoAddEditorFormatterToColumnsWithEditor)(newColumnDefinitions, this._gridOptions.autoAddCustomEditorFormatter);
            }
            if (this._gridOptions.enableTranslate) {
                this.extensionService.translateColumnHeaders(false, newColumnDefinitions);
            }
            else {
                this.extensionService.renderColumnHeaders(newColumnDefinitions, true);
            }
            if (this.slickGrid && ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableAutoSizeColumns)) {
                this.slickGrid.autosizeColumns();
            }
            else if (((_b = this._gridOptions) === null || _b === void 0 ? void 0 : _b.enableAutoResizeColumnsByCellContent) && ((_c = this.resizerService) === null || _c === void 0 ? void 0 : _c.resizeColumnsByCellContent)) {
                this.resizerService.resizeColumnsByCellContent();
            }
        }
    }
    /**
     * Show the filter row displayed on first row, we can optionally pass false to hide it.
     * @param showing
     */
    showHeaderRow(showing = true) {
        var _a;
        (_a = this.slickGrid) === null || _a === void 0 ? void 0 : _a.setHeaderRowVisibility(showing, false);
        if (this.slickGrid && showing === true && this._isGridInitialized) {
            this.slickGrid.setColumns(this.columnDefinitions);
        }
        return showing;
    }
    /**
     * Check if there's any Pagination Presets defined in the Grid Options,
     * if there are then load them in the paginationOptions object
     */
    setPaginationOptionsWhenPresetDefined(gridOptions, paginationOptions) {
        var _a;
        if (((_a = gridOptions.presets) === null || _a === void 0 ? void 0 : _a.pagination) && paginationOptions && !this._isPaginationInitialized) {
            paginationOptions.pageSize = gridOptions.presets.pagination.pageSize;
            paginationOptions.pageNumber = gridOptions.presets.pagination.pageNumber;
        }
        return paginationOptions;
    }
    // --
    // protected functions
    // ------------------
    /**
     * Loop through all column definitions and copy the original optional `width` properties optionally provided by the user.
     * We will use this when doing a resize by cell content, if user provided a `width` it won't override it.
     */
    copyColumnWidthsReference(columnDefinitions) {
        columnDefinitions.forEach(col => col.originalWidth = col.width);
    }
    displayEmptyDataWarning(showWarning = true) {
        var _a;
        (_a = this.slickEmptyWarning) === null || _a === void 0 ? void 0 : _a.showEmptyDataMessage(showWarning);
    }
    /** When data changes in the DataView, we'll refresh the metrics and/or display a warning if the dataset is empty */
    handleOnItemCountChanged(currentPageRowItemCount, totalItemCount) {
        var _a;
        this._currentDatasetLength = totalItemCount;
        this.metrics = {
            startTime: new Date(),
            endTime: new Date(),
            itemCount: currentPageRowItemCount,
            totalItemCount
        };
        // if custom footer is enabled, then we'll update its metrics
        if (this.slickFooter) {
            this.slickFooter.metrics = this.metrics;
        }
        // when using local (in-memory) dataset, we'll display a warning message when filtered data is empty
        if (this._isLocalGrid && ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableEmptyDataWarningMessage)) {
            this.displayEmptyDataWarning(currentPageRowItemCount === 0);
        }
    }
    /** Initialize the Pagination Service once */
    initializePaginationService(paginationOptions) {
        if (this.slickGrid && this.gridOptions) {
            this.paginationData = {
                gridOptions: this.gridOptions,
                paginationService: this.paginationService,
            };
            this.paginationService.totalItems = this.totalItems;
            this.paginationService.init(this.slickGrid, paginationOptions, this.backendServiceApi);
            this.subscriptions.push(this._eventPubSubService.subscribe('onPaginationChanged', paginationChanges => this.paginationChanged(paginationChanges)), this._eventPubSubService.subscribe('onPaginationVisibilityChanged', visibility => {
                var _a, _b, _c;
                this.showPagination = (_a = visibility === null || visibility === void 0 ? void 0 : visibility.visible) !== null && _a !== void 0 ? _a : false;
                if ((_b = this.gridOptions) === null || _b === void 0 ? void 0 : _b.backendServiceApi) {
                    (_c = this.backendUtilityService) === null || _c === void 0 ? void 0 : _c.refreshBackendDataset(this.gridOptions);
                }
                this.renderPagination(this.showPagination);
            }));
            // also initialize (render) the pagination component
            this.renderPagination();
            this._isPaginationInitialized = true;
        }
    }
    /**
     * Render (or dispose) the Pagination Component, user can optionally provide False (to not show it) which will in term dispose of the Pagination,
     * also while disposing we can choose to omit the disposable of the Pagination Service (if we are simply toggling the Pagination, we want to keep the Service alive)
     * @param {Boolean} showPagination - show (new render) or not (dispose) the Pagination
     * @param {Boolean} shouldDisposePaginationService - when disposing the Pagination, do we also want to dispose of the Pagination Service? (defaults to True)
     */
    renderPagination(showPagination = true) {
        var _a;
        if (((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enablePagination) && !this._isPaginationInitialized && showPagination) {
            this.slickPagination = new pagination_component_1.SlickPaginationComponent(this.paginationService, this._eventPubSubService, this.sharedService, this.translaterService);
            this.slickPagination.renderPagination(this._gridParentContainerElm);
            this._isPaginationInitialized = true;
        }
        else if (!showPagination) {
            if (this.slickPagination) {
                this.slickPagination.dispose();
            }
            this._isPaginationInitialized = false;
        }
    }
    /** Load the Editor Collection asynchronously and replace the "collection" property when Promise resolves */
    loadEditorCollectionAsync(column) {
        var _a;
        const collectionAsync = (column === null || column === void 0 ? void 0 : column.editor).collectionAsync;
        (column === null || column === void 0 ? void 0 : column.editor).disabled = true; // disable the Editor DOM element, we'll re-enable it after receiving the collection with "updateEditorCollection()"
        if (collectionAsync instanceof Promise) {
            // wait for the "collectionAsync", once resolved we will save it into the "collection"
            // the collectionAsync can be of 3 types HttpClient, HttpFetch or a Promise
            collectionAsync.then((response) => {
                if (Array.isArray(response)) {
                    this.updateEditorCollection(column, response); // from Promise
                }
                else if ((response === null || response === void 0 ? void 0 : response.status) >= 200 && response.status < 300 && typeof response.json === 'function') {
                    if (response.bodyUsed) {
                        console.warn(`[SlickGrid-Universal] The response body passed to collectionAsync was already read.`
                            + `Either pass the dataset from the Response or clone the response first using response.clone()`);
                    }
                    else {
                        // from Fetch
                        response.json().then(data => this.updateEditorCollection(column, data));
                    }
                }
                else if (response === null || response === void 0 ? void 0 : response.content) {
                    this.updateEditorCollection(column, response['content']); // from http-client
                }
            });
        }
        else if ((_a = this.rxjs) === null || _a === void 0 ? void 0 : _a.isObservable(collectionAsync)) {
            // wrap this inside a setTimeout to avoid timing issue since updateEditorCollection requires to call SlickGrid getColumns() method
            setTimeout(() => {
                this.subscriptions.push(collectionAsync.subscribe((resolvedCollection) => this.updateEditorCollection(column, resolvedCollection)));
            });
        }
    }
    insertDynamicPresetColumns(columnId, gridPresetColumns) {
        if (this._columnDefinitions) {
            const columnPosition = this._columnDefinitions.findIndex(c => c.id === columnId);
            if (columnPosition >= 0) {
                const dynColumn = this._columnDefinitions[columnPosition];
                if ((dynColumn === null || dynColumn === void 0 ? void 0 : dynColumn.id) === columnId && !gridPresetColumns.some(c => c.id === columnId)) {
                    columnPosition > 0
                        ? gridPresetColumns.splice(columnPosition, 0, dynColumn)
                        : gridPresetColumns.unshift(dynColumn);
                }
            }
        }
    }
    /** Load any possible Columns Grid Presets */
    loadColumnPresetsWhenDatasetInitialized() {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k;
        // if user entered some Columns "presets", we need to reflect them all in the grid
        if (this.slickGrid && this.gridOptions.presets && Array.isArray(this.gridOptions.presets.columns) && this.gridOptions.presets.columns.length > 0) {
            const gridPresetColumns = this.gridStateService.getAssociatedGridColumns(this.slickGrid, this.gridOptions.presets.columns);
            if (gridPresetColumns && Array.isArray(gridPresetColumns) && gridPresetColumns.length > 0 && Array.isArray(this._columnDefinitions)) {
                // make sure that the dynamic columns are included in presets (1.Row Move, 2. Row Selection, 3. Row Detail)
                if (this.gridOptions.enableRowMoveManager) {
                    const rmmColId = (_c = (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.rowMoveManager) === null || _b === void 0 ? void 0 : _b.columnId) !== null && _c !== void 0 ? _c : '_move';
                    this.insertDynamicPresetColumns(rmmColId, gridPresetColumns);
                }
                if (this.gridOptions.enableCheckboxSelector) {
                    const chkColId = (_g = (_f = (_d = this.gridOptions) === null || _d === void 0 ? void 0 : _d.checkboxSelector) === null || _f === void 0 ? void 0 : _f.columnId) !== null && _g !== void 0 ? _g : '_checkbox_selector';
                    this.insertDynamicPresetColumns(chkColId, gridPresetColumns);
                }
                if (this.gridOptions.enableRowDetailView) {
                    const rdvColId = (_k = (_j = (_h = this.gridOptions) === null || _h === void 0 ? void 0 : _h.rowDetailView) === null || _j === void 0 ? void 0 : _j.columnId) !== null && _k !== void 0 ? _k : '_detail_selector';
                    this.insertDynamicPresetColumns(rdvColId, gridPresetColumns);
                }
                // keep copy the original optional `width` properties optionally provided by the user.
                // We will use this when doing a resize by cell content, if user provided a `width` it won't override it.
                gridPresetColumns.forEach(col => col.originalWidth = col.width);
                // finally set the new presets columns (including checkbox selector if need be)
                this.slickGrid.setColumns(gridPresetColumns);
                this.sharedService.visibleColumns = gridPresetColumns;
            }
        }
    }
    /** Load any possible Filters Grid Presets */
    loadFilterPresetsWhenDatasetInitialized() {
        var _a, _b, _c;
        if (this.gridOptions && !this.customDataView) {
            // if user entered some Filter "presets", we need to reflect them all in the DOM
            // also note that a presets of Tree Data Toggling will also call this method because Tree Data toggling does work with data filtering
            // (collapsing a parent will basically use Filter for hidding (aka collapsing) away the child underneat it)
            if (this.gridOptions.presets && (Array.isArray(this.gridOptions.presets.filters) || Array.isArray((_b = (_a = this.gridOptions.presets) === null || _a === void 0 ? void 0 : _a.treeData) === null || _b === void 0 ? void 0 : _b.toggledItems))) {
                this.filterService.populateColumnFilterSearchTermPresets(((_c = this.gridOptions.presets) === null || _c === void 0 ? void 0 : _c.filters) || []);
            }
        }
    }
    /**
     * local grid, check if we need to show the Pagination
     * if so then also check if there's any presets and finally initialize the PaginationService
     * a local grid with Pagination presets will potentially have a different total of items, we'll need to get it from the DataView and update our total
     */
    loadLocalGridPagination(dataset) {
        var _a;
        if (this.gridOptions && this._paginationOptions) {
            this.totalItems = Array.isArray(dataset) ? dataset.length : 0;
            if (this._paginationOptions && ((_a = this.dataView) === null || _a === void 0 ? void 0 : _a.getPagingInfo)) {
                const slickPagingInfo = this.dataView.getPagingInfo();
                if ((slickPagingInfo === null || slickPagingInfo === void 0 ? void 0 : slickPagingInfo.hasOwnProperty('totalRows')) && this._paginationOptions.totalItems !== slickPagingInfo.totalRows) {
                    this.totalItems = (slickPagingInfo === null || slickPagingInfo === void 0 ? void 0 : slickPagingInfo.totalRows) || 0;
                }
            }
            this._paginationOptions.totalItems = this.totalItems;
            const paginationOptions = this.setPaginationOptionsWhenPresetDefined(this.gridOptions, this._paginationOptions);
            this.initializePaginationService(paginationOptions);
        }
    }
    /** Load any Row Selections into the DataView that were presets by the user */
    loadRowSelectionPresetWhenExists() {
        var _a, _b, _c;
        // if user entered some Row Selections "presets"
        const presets = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.presets;
        const selectionModel = (_c = (_b = this.slickGrid) === null || _b === void 0 ? void 0 : _b.getSelectionModel) === null || _c === void 0 ? void 0 : _c.call(_b);
        const enableRowSelection = this.gridOptions && (this.gridOptions.enableCheckboxSelector || this.gridOptions.enableRowSelection);
        if (this.slickGrid && this.dataView && enableRowSelection && selectionModel && (presets === null || presets === void 0 ? void 0 : presets.rowSelection) && (Array.isArray(presets.rowSelection.gridRowIndexes) || Array.isArray(presets.rowSelection.dataContextIds))) {
            let dataContextIds = presets.rowSelection.dataContextIds;
            let gridRowIndexes = presets.rowSelection.gridRowIndexes;
            // maps the IDs to the Grid Rows and vice versa, the "dataContextIds" has precedence over the other
            if (Array.isArray(dataContextIds) && dataContextIds.length > 0) {
                gridRowIndexes = this.dataView.mapIdsToRows(dataContextIds) || [];
            }
            else if (Array.isArray(gridRowIndexes) && gridRowIndexes.length > 0) {
                dataContextIds = this.dataView.mapRowsToIds(gridRowIndexes) || [];
            }
            // apply row selection when defined as grid presets
            if (this.slickGrid && Array.isArray(gridRowIndexes)) {
                this.slickGrid.setSelectedRows(gridRowIndexes);
                this.dataView.setSelectedIds(dataContextIds || [], {
                    isRowBeingAdded: true,
                    shouldTriggerEvent: false,
                    applyRowSelectionToGrid: true
                });
            }
        }
    }
    /** Pre-Register any Resource that don't require SlickGrid to be instantiated (for example RxJS Resource) */
    preRegisterResources() {
        this._registeredResources = this.gridOptions.registerExternalResources || [];
        // bind & initialize all Components/Services that were tagged as enabled
        // register all services by executing their init method and providing them with the Grid object
        if (Array.isArray(this._registeredResources)) {
            for (const resource of this._registeredResources) {
                if ((resource === null || resource === void 0 ? void 0 : resource.className) === 'RxJsResource') {
                    this.registerRxJsResource(resource);
                }
            }
        }
    }
    registerResources() {
        // at this point, we consider all the registered services as external services, anything else registered afterward aren't external
        if (Array.isArray(this._registeredResources)) {
            this.sharedService.externalRegisteredResources = this._registeredResources;
        }
        // push all other Services that we want to be registered
        this._registeredResources.push(this.gridService, this.gridStateService);
        // when using Grouping/DraggableGrouping/Colspan register its Service
        if (this.gridOptions.createPreHeaderPanel && !this.gridOptions.enableDraggableGrouping) {
            this._registeredResources.push(this.groupingService);
        }
        // when using Tree Data View, register its Service
        if (this.gridOptions.enableTreeData) {
            this._registeredResources.push(this.treeDataService);
        }
        // when user enables translation, we need to translate Headers on first pass & subsequently in the bindDifferentHooks
        if (this.gridOptions.enableTranslate) {
            this.extensionService.translateColumnHeaders();
        }
        // also initialize (render) the empty warning component
        this.slickEmptyWarning = new empty_warning_component_1.SlickEmptyWarningComponent();
        this._registeredResources.push(this.slickEmptyWarning);
        // bind & initialize all Components/Services that were tagged as enabled
        // register all services by executing their init method and providing them with the Grid object
        if (Array.isArray(this._registeredResources)) {
            for (const resource of this._registeredResources) {
                if (this.slickGrid && typeof resource.init === 'function') {
                    resource.init(this.slickGrid, this.universalContainerService);
                }
            }
        }
    }
    /** Register the RxJS Resource in all necessary services which uses */
    registerRxJsResource(resource) {
        this.rxjs = resource;
        this.backendUtilityService.addRxJsResource(this.rxjs);
        this.filterFactory.addRxJsResource(this.rxjs);
        this.filterService.addRxJsResource(this.rxjs);
        this.sortService.addRxJsResource(this.rxjs);
        this.paginationService.addRxJsResource(this.rxjs);
        this.universalContainerService.registerInstance('RxJsFacade', this.rxjs);
        this.universalContainerService.registerInstance('RxJsResource', this.rxjs);
    }
    /**
     * Takes a flat dataset with parent/child relationship, sort it (via its tree structure) and return the sorted flat array
     * @returns {Array<Object>} sort flat parent/child dataset
     */
    sortTreeDataset(flatDatasetInput, forceGridRefresh = false) {
        var _a, _b;
        const prevDatasetLn = this._currentDatasetLength;
        let sortedDatasetResult;
        let flatDatasetOutput = [];
        // if the hierarchical dataset was already initialized then no need to re-convert it, we can use it directly from the shared service ref
        if (this._isDatasetHierarchicalInitialized && this.datasetHierarchical) {
            sortedDatasetResult = this.treeDataService.sortHierarchicalDataset(this.datasetHierarchical);
            flatDatasetOutput = sortedDatasetResult.flat;
        }
        else if (Array.isArray(flatDatasetInput) && flatDatasetInput.length > 0) {
            if ((_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.treeDataOptions) === null || _b === void 0 ? void 0 : _b.initialSort) {
                // else we need to first convert the flat dataset to a hierarchical dataset and then sort
                sortedDatasetResult = this.treeDataService.convertFlatParentChildToTreeDatasetAndSort(flatDatasetInput, this._columnDefinitions || [], this.gridOptions);
                this.sharedService.hierarchicalDataset = sortedDatasetResult.hierarchical;
                flatDatasetOutput = sortedDatasetResult.flat;
            }
            else {
                // else we assume that the user provided an array that is already sorted (user's responsability)
                // and so we can simply convert the array to a tree structure and we're done, no need to sort
                this.sharedService.hierarchicalDataset = this.treeDataService.convertFlatParentChildToTreeDataset(flatDatasetInput, this.gridOptions);
                flatDatasetOutput = flatDatasetInput || [];
            }
        }
        // if we add/remove item(s) from the dataset, we need to also refresh our tree data filters
        if (flatDatasetInput.length > 0 && (forceGridRefresh || flatDatasetInput.length !== prevDatasetLn)) {
            this.filterService.refreshTreeDataFilters(flatDatasetOutput);
        }
        return flatDatasetOutput;
    }
    /**
     * For convenience to the user, we provide the property "editor" as an Slickgrid-Universal editor complex object
     * however "editor" is used internally by SlickGrid for it's own Editor Factory
     * so in our lib we will swap "editor" and copy it into a new property called "internalColumnEditor"
     * then take back "editor.model" and make it the new "editor" so that SlickGrid Editor Factory still works
     */
    swapInternalEditorToSlickGridFactoryEditor(columnDefinitions) {
        const columns = Array.isArray(columnDefinitions) ? columnDefinitions : [];
        if (columns.some(col => `${col.id}`.includes('.'))) {
            console.error('[Slickgrid-Universal] Make sure that none of your Column Definition "id" property includes a dot in its name because that will cause some problems with the Editors. For example if your column definition "field" property is "user.firstName" then use "firstName" as the column "id".');
        }
        return columns.map((column) => {
            var _a;
            // on every Editor that have a "collectionAsync", resolve the data and assign it to the "collection" property
            if ((_a = column.editor) === null || _a === void 0 ? void 0 : _a.collectionAsync) {
                this.loadEditorCollectionAsync(column);
            }
            // if there's already an internalColumnEditor we'll use it, else it would be inside the editor
            const columnEditor = column.internalColumnEditor || column.editor;
            return { ...column, editor: columnEditor === null || columnEditor === void 0 ? void 0 : columnEditor.model, internalColumnEditor: { ...columnEditor } };
        });
    }
    /** translate all columns (including hidden columns) */
    translateColumnHeaderTitleKeys() {
        this.extensionUtility.translateItems(this.sharedService.allColumns, 'nameKey', 'name');
    }
    /** translate all column groups (including hidden columns) */
    translateColumnGroupKeys() {
        this.extensionUtility.translateItems(this.sharedService.allColumns, 'columnGroupKey', 'columnGroup');
    }
    /**
     * Update the "internalColumnEditor.collection" property.
     * Since this is called after the async call resolves, the pointer will not be the same as the "column" argument passed.
     * Once we found the new pointer, we will reassign the "editor" and "collection" to the "internalColumnEditor" so it has newest collection
     */
    updateEditorCollection(column, newCollection) {
        column.editor.collection = newCollection;
        column.editor.disabled = false;
        if (this.slickGrid) {
            // find the new column reference pointer & re-assign the new editor to the internalColumnEditor
            if (Array.isArray(this.columnDefinitions)) {
                const columnRef = this.columnDefinitions.find((col) => col.id === column.id);
                if (columnRef) {
                    columnRef.internalColumnEditor = column.editor;
                }
            }
            // get current Editor, remove it from the DOm then re-enable it and re-render it with the new collection.
            const currentEditor = this.slickGrid.getCellEditor();
            if ((currentEditor === null || currentEditor === void 0 ? void 0 : currentEditor.disable) && (currentEditor === null || currentEditor === void 0 ? void 0 : currentEditor.renderDomElement)) {
                if (typeof currentEditor.destroy === 'function') {
                    currentEditor.destroy();
                }
                currentEditor.disable(false);
                currentEditor.renderDomElement(newCollection);
            }
        }
    }
}
exports.SlickVanillaGridBundle = SlickVanillaGridBundle;
//# sourceMappingURL=slick-vanilla-grid-bundle.js.map