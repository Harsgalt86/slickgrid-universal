"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionService = void 0;
const index_1 = require("../enums/index");
const index_2 = require("../extensions/index");
class ExtensionService {
    get extensionList() {
        return this._extensionList;
    }
    get gridOptions() {
        return this.sharedService.gridOptions || {};
    }
    constructor(extensionUtility, filterService, pubSubService, sharedService, sortService, treeDataService, translaterService) {
        this.extensionUtility = extensionUtility;
        this.filterService = filterService;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this.sortService = sortService;
        this.treeDataService = treeDataService;
        this.translaterService = translaterService;
        this._extensionCreatedList = {};
        this._extensionList = {};
    }
    /** Dispose of all the controls & plugins */
    dispose() {
        var _a;
        this.sharedService.visibleColumns = [];
        // dispose of each control/plugin & reset the list
        for (const extensionName of Object.keys(this._extensionList)) {
            if (this._extensionList.hasOwnProperty(extensionName)) {
                const extension = this._extensionList[extensionName];
                if ((_a = extension === null || extension === void 0 ? void 0 : extension.instance) === null || _a === void 0 ? void 0 : _a.dispose) {
                    extension.instance.dispose();
                }
            }
        }
        for (const key of Object.keys(this._extensionList)) {
            delete this._extensionList[key];
        }
        this._cellMenuPlugin = null;
        this._cellExcelCopyManagerPlugin = null;
        this._checkboxSelectColumn = null;
        this._contextMenuPlugin = null;
        this._columnPickerControl = null;
        this._draggleGroupingPlugin = null;
        this._gridMenuControl = null;
        this._groupItemMetadataProviderService = null;
        this._headerMenuPlugin = null;
        this._rowMoveManagerPlugin = null;
        this._rowSelectionModel = null;
        this._extensionCreatedList = null;
        this._extensionList = null;
    }
    /**
     * Get an external plugin Extension
     * @param {String} name
     * @param {Object} extension
     */
    addExtensionToList(name, extension) {
        this._extensionList[name] = extension;
    }
    /** Get all columns (includes visible and non-visible) */
    getAllColumns() {
        return this.sharedService.allColumns || [];
    }
    /** Get only visible columns */
    getVisibleColumns() {
        return this.sharedService.visibleColumns || [];
    }
    /**
     * Get an Extension that was created by calling its "create" method (there are only 3 extensions which uses this method)
     *  @param name
     */
    getCreatedExtensionByName(name) {
        var _a;
        if ((_a = this._extensionCreatedList) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(name)) {
            return this._extensionCreatedList[name];
        }
        return undefined;
    }
    /**
     * Get an Extension by it's name.
     * NOTE: it's preferable to @use `getExtensionInstanceByName` if you just want the instance since it will automatically infer the extension.
     * @param name
     */
    getExtensionByName(name) {
        var _a;
        return (_a = this._extensionList) === null || _a === void 0 ? void 0 : _a[name];
    }
    /**
     * Get Extension Instance by its name.
     * @param name
     */
    getExtensionInstanceByName(name) {
        var _a;
        return (_a = this.getExtensionByName(name)) === null || _a === void 0 ? void 0 : _a.instance;
    }
    /** Auto-resize all the column in the grid to fit the grid width */
    autoResizeColumns() {
        this.sharedService.slickGrid.autosizeColumns();
    }
    /** Bind/Create different Controls or Plugins after the Grid is created */
    bindDifferentExtensions() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        if (this.gridOptions) {
            // make sure all columns are translated before creating ColumnPicker/GridMenu Controls
            // this is to avoid having hidden columns not being translated on first load
            if (this.gridOptions.enableTranslate) {
                this.translateItems(this.sharedService.allColumns, 'nameKey', 'name');
            }
            // Auto Tooltip Plugin
            if (this.gridOptions.enableAutoTooltip) {
                const instance = new index_2.SlickAutoTooltip((_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.autoTooltipOptions);
                this.sharedService.slickGrid.registerPlugin(instance);
                this._extensionList[index_1.ExtensionName.autoTooltip] = { name: index_1.ExtensionName.autoTooltip, instance };
            }
            // Cell External Copy Manager Plugin (Excel Like)
            if (this.gridOptions.enableExcelCopyBuffer) {
                this._cellExcelCopyManagerPlugin = new index_2.SlickCellExcelCopyManager();
                this._cellExcelCopyManagerPlugin.init(this.sharedService.slickGrid, this.sharedService.gridOptions.excelCopyBufferOptions);
                if ((_b = this.gridOptions.excelCopyBufferOptions) === null || _b === void 0 ? void 0 : _b.onExtensionRegistered) {
                    this.gridOptions.excelCopyBufferOptions.onExtensionRegistered(this._cellExcelCopyManagerPlugin);
                }
                this._extensionList[index_1.ExtensionName.cellExternalCopyManager] = { name: index_1.ExtensionName.cellExternalCopyManager, instance: this._cellExcelCopyManagerPlugin };
            }
            // (Action) Cell Menu Plugin
            if (this.gridOptions.enableCellMenu) {
                this._cellMenuPlugin = new index_2.SlickCellMenu(this.extensionUtility, this.pubSubService, this.sharedService);
                if ((_c = this.gridOptions.cellMenu) === null || _c === void 0 ? void 0 : _c.onExtensionRegistered) {
                    this.gridOptions.cellMenu.onExtensionRegistered(this._cellMenuPlugin);
                }
                this._extensionList[index_1.ExtensionName.cellMenu] = { name: index_1.ExtensionName.cellMenu, instance: this._cellMenuPlugin };
            }
            // Row Selection Plugin
            // this extension should be registered BEFORE the CheckboxSelector, RowDetail or RowMoveManager since it can be use by these 2 plugins
            if (!this._rowSelectionModel && (this.gridOptions.enableRowSelection || this.gridOptions.enableCheckboxSelector || this.gridOptions.enableRowDetailView || this.gridOptions.enableRowMoveManager)) {
                if (!this._rowSelectionModel || !this.sharedService.slickGrid.getSelectionModel()) {
                    const rowSelectionOptions = (_d = this.gridOptions.rowSelectionOptions) !== null && _d !== void 0 ? _d : {};
                    if (this.gridOptions.enableRowMoveManager && ((_e = this.gridOptions.rowMoveManager) === null || _e === void 0 ? void 0 : _e.dragToSelect) !== false) {
                        rowSelectionOptions.dragToSelect = true;
                    }
                    this._rowSelectionModel = new index_2.SlickRowSelectionModel(rowSelectionOptions);
                    this.sharedService.slickGrid.setSelectionModel(this._rowSelectionModel);
                }
                this._extensionList[index_1.ExtensionName.rowSelection] = { name: index_1.ExtensionName.rowSelection, instance: this._rowSelectionModel };
            }
            // Checkbox Selector Plugin
            if (this.gridOptions.enableCheckboxSelector) {
                this._checkboxSelectColumn = this._checkboxSelectColumn || new index_2.SlickCheckboxSelectColumn(this.pubSubService, this.gridOptions.checkboxSelector);
                this._checkboxSelectColumn.init(this.sharedService.slickGrid);
                const createdExtension = this.getCreatedExtensionByName(index_1.ExtensionName.checkboxSelector); // get the instance from when it was really created earlier
                const instance = createdExtension && createdExtension.instance;
                if (instance) {
                    this._extensionList[index_1.ExtensionName.checkboxSelector] = { name: index_1.ExtensionName.checkboxSelector, instance: this._checkboxSelectColumn };
                }
            }
            // Column Picker Control
            if (this.gridOptions.enableColumnPicker) {
                this._columnPickerControl = new index_2.SlickColumnPicker(this.extensionUtility, this.pubSubService, this.sharedService);
                if ((_f = this.gridOptions.columnPicker) === null || _f === void 0 ? void 0 : _f.onExtensionRegistered) {
                    this.gridOptions.columnPicker.onExtensionRegistered(this._columnPickerControl);
                }
                this._extensionList[index_1.ExtensionName.columnPicker] = { name: index_1.ExtensionName.columnPicker, instance: this._columnPickerControl };
            }
            // Context Menu Control
            if (this.gridOptions.enableContextMenu) {
                this._contextMenuPlugin = new index_2.SlickContextMenu(this.extensionUtility, this.pubSubService, this.sharedService, this.treeDataService);
                if ((_g = this.gridOptions.contextMenu) === null || _g === void 0 ? void 0 : _g.onExtensionRegistered) {
                    this.gridOptions.contextMenu.onExtensionRegistered(this._contextMenuPlugin);
                }
                this._extensionList[index_1.ExtensionName.contextMenu] = { name: index_1.ExtensionName.contextMenu, instance: this._contextMenuPlugin };
            }
            // Draggable Grouping Plugin
            if (this.gridOptions.enableDraggableGrouping) {
                if (this._draggleGroupingPlugin) {
                    this._draggleGroupingPlugin.init(this.sharedService.slickGrid, this.gridOptions.draggableGrouping);
                    if ((_h = this.gridOptions.draggableGrouping) === null || _h === void 0 ? void 0 : _h.onExtensionRegistered) {
                        this.gridOptions.draggableGrouping.onExtensionRegistered(this._draggleGroupingPlugin);
                    }
                    this._extensionList[index_1.ExtensionName.contextMenu] = { name: index_1.ExtensionName.contextMenu, instance: this._draggleGroupingPlugin };
                }
                this._extensionList[index_1.ExtensionName.draggableGrouping] = { name: index_1.ExtensionName.draggableGrouping, instance: this._draggleGroupingPlugin };
            }
            // Grid Menu Control
            if (this.gridOptions.enableGridMenu) {
                this._gridMenuControl = new index_2.SlickGridMenu(this.extensionUtility, this.filterService, this.pubSubService, this.sharedService, this.sortService);
                if ((_j = this.gridOptions.gridMenu) === null || _j === void 0 ? void 0 : _j.onExtensionRegistered) {
                    this.gridOptions.gridMenu.onExtensionRegistered(this._gridMenuControl);
                }
                this._extensionList[index_1.ExtensionName.gridMenu] = { name: index_1.ExtensionName.gridMenu, instance: this._gridMenuControl };
            }
            // Grouping Plugin
            // register the group item metadata provider to add expand/collapse group handlers
            if (this.gridOptions.enableDraggableGrouping || this.gridOptions.enableGrouping) {
                this._groupItemMetadataProviderService = this._groupItemMetadataProviderService ? this._groupItemMetadataProviderService : new index_2.SlickGroupItemMetadataProvider();
                this._groupItemMetadataProviderService.init(this.sharedService.slickGrid);
                this._extensionList[index_1.ExtensionName.groupItemMetaProvider] = { name: index_1.ExtensionName.groupItemMetaProvider, instance: this._groupItemMetadataProviderService };
            }
            // Header Button Plugin
            if (this.gridOptions.enableHeaderButton) {
                const headerButtonPlugin = new index_2.SlickHeaderButtons(this.extensionUtility, this.pubSubService, this.sharedService);
                if ((_k = this.gridOptions.headerButton) === null || _k === void 0 ? void 0 : _k.onExtensionRegistered) {
                    this.gridOptions.headerButton.onExtensionRegistered(headerButtonPlugin);
                }
                this._extensionList[index_1.ExtensionName.headerButton] = { name: index_1.ExtensionName.headerButton, instance: headerButtonPlugin };
            }
            // Header Menu Plugin
            if (this.gridOptions.enableHeaderMenu) {
                this._headerMenuPlugin = new index_2.SlickHeaderMenu(this.extensionUtility, this.filterService, this.pubSubService, this.sharedService, this.sortService);
                if ((_l = this.gridOptions.headerMenu) === null || _l === void 0 ? void 0 : _l.onExtensionRegistered) {
                    this.gridOptions.headerMenu.onExtensionRegistered(this._headerMenuPlugin);
                }
                this._extensionList[index_1.ExtensionName.headerMenu] = { name: index_1.ExtensionName.headerMenu, instance: this._headerMenuPlugin };
            }
            // Row Move Manager Plugin
            if (this.gridOptions.enableRowMoveManager) {
                this._rowMoveManagerPlugin = this._rowMoveManagerPlugin || new index_2.SlickRowMoveManager(this.pubSubService);
                this._rowMoveManagerPlugin.init(this.sharedService.slickGrid, this.gridOptions.rowMoveManager);
                const createdExtension = this.getCreatedExtensionByName(index_1.ExtensionName.rowMoveManager); // get the instance from when it was really created earlier
                const instance = createdExtension === null || createdExtension === void 0 ? void 0 : createdExtension.instance;
                if (instance) {
                    this._extensionList[index_1.ExtensionName.rowMoveManager] = { name: index_1.ExtensionName.rowMoveManager, instance: this._rowMoveManagerPlugin };
                }
            }
        }
    }
    /**
     * Bind/Create certain plugins before the Grid creation to avoid having odd behaviors.
     * Mostly because the column definitions might change after the grid creation, so we want to make sure to add it before then
     * @param columnDefinitions
     * @param gridOptions
     */
    createExtensionsBeforeGridCreation(columnDefinitions, gridOptions) {
        var _a, _b, _c, _d;
        const featureWithColumnIndexPositions = [];
        // the following 3 features might have `columnIndexPosition` that we need to respect their column order, we will execute them by their sort order further down
        // we push them into a array and we'll process them by their position (if provided, else use same order that they were inserted)
        if (gridOptions.enableCheckboxSelector) {
            if (!this.getCreatedExtensionByName(index_1.ExtensionName.checkboxSelector)) {
                this._checkboxSelectColumn = new index_2.SlickCheckboxSelectColumn(this.pubSubService, this.sharedService.gridOptions.checkboxSelector);
                featureWithColumnIndexPositions.push({ name: index_1.ExtensionName.checkboxSelector, extension: this._checkboxSelectColumn, columnIndexPosition: (_b = (_a = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.checkboxSelector) === null || _a === void 0 ? void 0 : _a.columnIndexPosition) !== null && _b !== void 0 ? _b : featureWithColumnIndexPositions.length });
            }
        }
        if (gridOptions.enableRowMoveManager) {
            if (!this.getCreatedExtensionByName(index_1.ExtensionName.rowMoveManager)) {
                this._rowMoveManagerPlugin = new index_2.SlickRowMoveManager(this.pubSubService);
                featureWithColumnIndexPositions.push({ name: index_1.ExtensionName.rowMoveManager, extension: this._rowMoveManagerPlugin, columnIndexPosition: (_d = (_c = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.rowMoveManager) === null || _c === void 0 ? void 0 : _c.columnIndexPosition) !== null && _d !== void 0 ? _d : featureWithColumnIndexPositions.length });
            }
        }
        // since some features could have a `columnIndexPosition`, we need to make sure these indexes are respected in the column definitions
        this.createExtensionByTheirColumnIndex(featureWithColumnIndexPositions, columnDefinitions, gridOptions);
        if (gridOptions.enableDraggableGrouping) {
            if (!this.getCreatedExtensionByName(index_1.ExtensionName.draggableGrouping)) {
                this._draggleGroupingPlugin = new index_2.SlickDraggableGrouping(this.extensionUtility, this.pubSubService, this.sharedService);
                if (this._draggleGroupingPlugin) {
                    gridOptions.enableColumnReorder = this._draggleGroupingPlugin.setupColumnReorder.bind(this._draggleGroupingPlugin);
                    this._extensionCreatedList[index_1.ExtensionName.draggableGrouping] = { name: index_1.ExtensionName.draggableGrouping, instance: this._draggleGroupingPlugin };
                }
            }
        }
    }
    /** Hide a column from the grid */
    hideColumn(column) {
        var _a, _b;
        if (typeof ((_b = (_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.slickGrid) === null || _b === void 0 ? void 0 : _b.getColumns) === 'function') {
            const columnIndex = this.sharedService.slickGrid.getColumnIndex(column.id);
            this.sharedService.visibleColumns = this.removeColumnByIndex(this.sharedService.slickGrid.getColumns(), columnIndex);
            this.sharedService.slickGrid.setColumns(this.sharedService.visibleColumns);
        }
    }
    /** Refresh the dataset through the Backend Service */
    refreshBackendDataset(gridOptions) {
        this.extensionUtility.refreshBackendDataset(gridOptions);
    }
    /**
     * Remove a column from the grid by it's index in the grid
     * @param columns input
     * @param index
     */
    removeColumnByIndex(columns, index) {
        if (Array.isArray(columns)) {
            return columns.filter((_el, i) => index !== i);
        }
        return columns;
    }
    /** Translate all possible Extensions at once */
    translateAllExtensions() {
        this.translateCellMenu();
        this.translateColumnHeaders();
        this.translateColumnPicker();
        this.translateContextMenu();
        this.translateGridMenu();
        this.translateHeaderMenu();
    }
    /** Translate the Cell Menu titles, we need to loop through all column definition to re-translate them */
    translateCellMenu() {
        var _a, _b;
        (_b = (_a = this._cellMenuPlugin) === null || _a === void 0 ? void 0 : _a.translateCellMenu) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    /** Translate the Column Picker and it's last 2 checkboxes */
    translateColumnPicker() {
        var _a;
        if ((_a = this._columnPickerControl) === null || _a === void 0 ? void 0 : _a.translateColumnPicker) {
            this._columnPickerControl.translateColumnPicker();
        }
    }
    /** Translate the Context Menu titles, we need to loop through all column definition to re-translate them */
    translateContextMenu() {
        var _a, _b;
        (_b = (_a = this._contextMenuPlugin) === null || _a === void 0 ? void 0 : _a.translateContextMenu) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    /**
     * Translate the Header Menu titles, we need to loop through all column definition to re-translate them
     */
    translateGridMenu() {
        var _a, _b;
        (_b = (_a = this._gridMenuControl) === null || _a === void 0 ? void 0 : _a.translateGridMenu) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    /**
     * Translate the Header Menu titles, we need to loop through all column definition to re-translate them
     */
    translateHeaderMenu() {
        var _a, _b;
        (_b = (_a = this._headerMenuPlugin) === null || _a === void 0 ? void 0 : _a.translateHeaderMenu) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    /**
     * Translate manually the header titles.
     * We could optionally pass a locale (that will change currently loaded locale), else it will use current locale
     * @param locale to use
     * @param new column definitions (optional)
     */
    translateColumnHeaders(locale, newColumnDefinitions) {
        var _a, _b, _c;
        if (this.sharedService && this.gridOptions && this.gridOptions.enableTranslate && (!this.translaterService || !this.translaterService.translate)) {
            throw new Error('[Slickgrid-Universal] requires a Translate Service to be installed and configured when the grid option "enableTranslate" is enabled.');
        }
        if (locale && ((_a = this.translaterService) === null || _a === void 0 ? void 0 : _a.use)) {
            this.translaterService.use(locale);
        }
        let columnDefinitions = newColumnDefinitions;
        if (!columnDefinitions) {
            columnDefinitions = this.sharedService.columnDefinitions;
        }
        this.translateItems(columnDefinitions, 'nameKey', 'name');
        this.translateItems(this.sharedService.allColumns, 'nameKey', 'name');
        // re-render the column headers
        this.renderColumnHeaders(columnDefinitions, Array.isArray(newColumnDefinitions));
        (_c = (_b = this._gridMenuControl) === null || _b === void 0 ? void 0 : _b.translateGridMenu) === null || _c === void 0 ? void 0 : _c.call(_b);
    }
    /**
     * Render (or re-render) the column headers from column definitions.
     * calling setColumns() will trigger a grid re-render
     */
    renderColumnHeaders(newColumnDefinitions, forceColumnDefinitionsOverwrite = false) {
        var _a;
        let collection = newColumnDefinitions;
        if (!collection) {
            collection = this.sharedService.columnDefinitions;
        }
        if (Array.isArray(collection) && this.sharedService.slickGrid && this.sharedService.slickGrid.setColumns) {
            if (collection.length > this.sharedService.allColumns.length || forceColumnDefinitionsOverwrite) {
                this.sharedService.allColumns = collection;
            }
            this.sharedService.slickGrid.setColumns(collection);
        }
        // replace Column Picker columns with newer data which includes new translations
        if (this.gridOptions.enableColumnPicker && this._columnPickerControl) {
            this._columnPickerControl.columns = this.sharedService.allColumns;
        }
        // replace the Grid Menu columns array list
        if (this.gridOptions.enableGridMenu && this._gridMenuControl) {
            this._gridMenuControl.columns = (_a = this.sharedService.allColumns) !== null && _a !== void 0 ? _a : [];
            this._gridMenuControl.recreateGridMenu();
        }
    }
    //
    // protected functions
    // -------------------
    /**
     * Some extension (feature) have specific `columnIndexPosition` that the developer want to use, we need to make sure these indexes are respected in the column definitions in the order provided.
     * The following 3 features could have that optional `columnIndexPosition` and we need to respect their column order, we will first sort by their optional order and only after we will create them by their specific order.
     * We'll process them by their position (if provided, else use same order that they were inserted)
     * @param featureWithIndexPositions
     * @param columnDefinitions
     * @param gridOptions
     */
    createExtensionByTheirColumnIndex(featureWithIndexPositions, columnDefinitions, gridOptions) {
        // 1- first step is to sort them by their index position
        featureWithIndexPositions.sort((feat1, feat2) => feat1.columnIndexPosition - feat2.columnIndexPosition);
        // 2- second step, we can now proceed to create each extension/addon and that will position them accordingly in the column definitions list
        featureWithIndexPositions.forEach(feature => {
            const instance = feature.extension.create(columnDefinitions, gridOptions);
            if (instance) {
                this._extensionCreatedList[feature.name] = { name: feature.name, instance };
            }
        });
    }
    /** Translate an array of items from an input key and assign translated value to the output key */
    translateItems(items, inputKey, outputKey) {
        var _a, _b, _c;
        if (((_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.enableTranslate) && !((_b = this.translaterService) === null || _b === void 0 ? void 0 : _b.translate)) {
            throw new Error('[Slickgrid-Universal] requires a Translate Service to be installed and configured when the grid option "enableTranslate" is enabled.');
        }
        if (Array.isArray(items)) {
            for (const item of items) {
                if (item[inputKey]) {
                    item[outputKey] = (_c = this.translaterService) === null || _c === void 0 ? void 0 : _c.translate(item[inputKey]);
                }
            }
        }
    }
}
exports.ExtensionService = ExtensionService;
//# sourceMappingURL=extension.service.js.map