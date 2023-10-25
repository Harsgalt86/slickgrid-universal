"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickGridMenu = void 0;
const index_1 = require("../enums/index");
const index_2 = require("../services/index");
const extensionCommonUtils_1 = require("../extensions/extensionCommonUtils");
const menuBaseClass_1 = require("../extensions/menuBaseClass");
/**
 * A control to add a Grid Menu with Extra Commands & Column Picker (hambuger menu on top-right of the grid)
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.gridOptions = {
 *     enableGridMenu: true,
 *     gridMenu: {
 *       ... grid menu options ...
 *       commandItems: [{ ...command... }, { ...command... }]
 *     }
 *   }];
 * @class GridMenuControl
 * @constructor
 */
class SlickGridMenu extends menuBaseClass_1.MenuBaseClass {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility, filterService, pubSubService, sharedService, sortService) {
        var _a, _b, _c, _d;
        super(extensionUtility, pubSubService, sharedService);
        this.extensionUtility = extensionUtility;
        this.filterService = filterService;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this.sortService = sortService;
        this._areVisibleColumnDifferent = false;
        this._columns = [];
        this._columnCheckboxes = [];
        this._gridMenuOptions = null;
        this._headerElm = null;
        this._isMenuOpen = false;
        this.onAfterMenuShow = new Slick.Event();
        this.onBeforeMenuShow = new Slick.Event();
        this.onMenuClose = new Slick.Event();
        this.onCommand = new Slick.Event();
        this.onColumnsChanged = new Slick.Event();
        this._defaults = {
            dropSide: 'left',
            showButton: true,
            hideForceFitButton: false,
            hideSyncResizeButton: false,
            forceFitTitle: 'Force fit columns',
            marginBottom: 15,
            menuWidth: 18,
            minHeight: 250,
            contentMinWidth: 0,
            resizeOnShowHeaderRow: false,
            syncResizeTitle: 'Synchronous resize',
            headerColumnValueExtractor: (columnDef) => columnDef.name
        };
        this._menuCssPrefix = 'slick-menu';
        this._menuPluginCssPrefix = 'slick-grid-menu';
        this._camelPluginName = 'gridMenu';
        this._columns = (_a = this.sharedService.allColumns) !== null && _a !== void 0 ? _a : [];
        this._gridUid = (_d = (_c = (_b = this.grid) === null || _b === void 0 ? void 0 : _b.getUID) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : '';
        this.initEventHandlers();
        this.init();
    }
    get addonOptions() {
        return this._gridMenuOptions || {};
    }
    get columns() {
        return this._columns;
    }
    set columns(newColumns) {
        this._columns = newColumns;
    }
    get gridOptions() {
        return this.grid.getOptions() || {};
    }
    initEventHandlers() {
        // when grid columns are reordered then we also need to update/resync our picker column in the same order
        this._eventHandler.subscribe(this.grid.onColumnsReordered, extensionCommonUtils_1.updateColumnPickerOrder.bind(this));
        // subscribe to the grid, when it's destroyed, we should also destroy the Grid Menu
        this._eventHandler.subscribe(this.grid.onBeforeDestroy, this.dispose.bind(this));
        // when a grid optionally changes from a regular grid to a frozen grid, we need to destroy & recreate the grid menu
        // we do this change because the Grid Menu is on the left container for a regular grid, it should however be displayed on the right container for a frozen grid
        this._eventHandler.subscribe(this.grid.onSetOptions, (_e, args) => {
            if (args && args.optionsBefore && args.optionsAfter) {
                const switchedFromRegularToFrozen = (args.optionsBefore.frozenColumn >= 0 && args.optionsAfter.frozenColumn === -1);
                const switchedFromFrozenToRegular = (args.optionsBefore.frozenColumn === -1 && args.optionsAfter.frozenColumn >= 0);
                if (switchedFromRegularToFrozen || switchedFromFrozenToRegular) {
                    this.recreateGridMenu();
                }
            }
        });
    }
    /** Initialize plugin. */
    init() {
        var _a;
        this._gridUid = (_a = this.grid.getUID()) !== null && _a !== void 0 ? _a : '';
        // keep original user grid menu, useful when switching locale to translate
        this._userOriginalGridMenu = { ...this.sharedService.gridOptions.gridMenu };
        this._gridMenuOptions = { ...this._defaults, ...this.getDefaultGridMenuOptions(), ...this.sharedService.gridOptions.gridMenu };
        this.sharedService.gridOptions.gridMenu = this._gridMenuOptions;
        // merge original user grid menu items with internal items
        // then sort all Grid Menu command items (sorted by pointer, no need to use the return)
        const gridMenuCommandItems = this._userOriginalGridMenu.commandItems;
        const originalCommandItems = this._userOriginalGridMenu && Array.isArray(gridMenuCommandItems) ? gridMenuCommandItems : [];
        this._gridMenuOptions.commandItems = [...originalCommandItems, ...this.addGridMenuCustomCommands(originalCommandItems)];
        this.extensionUtility.translateMenuItemsFromTitleKey(this._gridMenuOptions.commandItems || []);
        this.extensionUtility.sortItems(this._gridMenuOptions.commandItems, 'positionOrder');
        this._gridMenuOptions.commandItems = this._gridMenuOptions.commandItems;
        // create the Grid Menu DOM element
        this.createGridMenu();
    }
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose() {
        this.deleteMenu();
        super.dispose();
    }
    deleteMenu() {
        var _a, _b, _c;
        this._bindEventService.unbindAll();
        const gridMenuElm = document.querySelector(`div.slick-grid-menu.${this._gridUid}`);
        if (gridMenuElm) {
            gridMenuElm.style.display = 'none';
        }
        if (this._headerElm) {
            // put back original width (fixes width and frozen+gridMenu on left header)
            this._headerElm.style.width = '100%';
        }
        (_a = this._gridMenuButtonElm) === null || _a === void 0 ? void 0 : _a.remove();
        (_b = this._menuElm) === null || _b === void 0 ? void 0 : _b.remove();
        (_c = this._commandMenuElm) === null || _c === void 0 ? void 0 : _c.remove();
    }
    createColumnPickerContainer() {
        if (this._menuElm) {
            // user could pass a title on top of the columns list
            extensionCommonUtils_1.addColumnTitleElementWhenDefined.call(this, this._menuElm);
            this._listElm = (0, index_2.createDomElement)('div', { className: 'slick-column-picker-list', role: 'menu' });
            // update all columns on any of the column title button click from column picker
            this._bindEventService.bind(this._menuElm, 'click', extensionCommonUtils_1.handleColumnPickerItemClick.bind(this));
        }
    }
    createGridMenu() {
        var _a, _b, _c, _d, _f, _g;
        this._gridUid = (_b = (_a = this._gridUid) !== null && _a !== void 0 ? _a : this.grid.getUID()) !== null && _b !== void 0 ? _b : '';
        const gridUidSelector = this._gridUid ? `.${this._gridUid}` : '';
        const gridMenuWidth = ((_c = this._gridMenuOptions) === null || _c === void 0 ? void 0 : _c.menuWidth) || this._defaults.menuWidth;
        const headerSide = (this.gridOptions.hasOwnProperty('frozenColumn') && this.gridOptions.frozenColumn >= 0) ? 'right' : 'left';
        this._headerElm = document.querySelector(`${gridUidSelector} .slick-header-${headerSide}`);
        if (this._headerElm && this._gridMenuOptions) {
            // resize the header row to include the hamburger menu icon
            this._headerElm.style.width = `calc(100% - ${gridMenuWidth}px)`;
            // if header row is enabled, we also need to resize its width
            const enableResizeHeaderRow = (_d = this._gridMenuOptions.resizeOnShowHeaderRow) !== null && _d !== void 0 ? _d : this._defaults.resizeOnShowHeaderRow;
            if (enableResizeHeaderRow && this.gridOptions.showHeaderRow) {
                const headerRowElm = document.querySelector(`${gridUidSelector} .slick-headerrow`);
                if (headerRowElm) {
                    headerRowElm.style.width = `calc(100% - ${gridMenuWidth}px)`;
                }
            }
            const showButton = (_f = this._gridMenuOptions.showButton) !== null && _f !== void 0 ? _f : this._defaults.showButton;
            if (showButton) {
                this._gridMenuButtonElm = (0, index_2.createDomElement)('button', { className: 'slick-grid-menu-button', ariaLabel: 'Grid Menu' });
                if ((_g = this._gridMenuOptions) === null || _g === void 0 ? void 0 : _g.iconCssClass) {
                    this._gridMenuButtonElm.classList.add(...this._gridMenuOptions.iconCssClass.split(' '));
                }
                this._headerElm.parentElement.insertBefore(this._gridMenuButtonElm, this._headerElm.parentElement.firstChild);
                // show the Grid Menu when hamburger menu is clicked
                this._bindEventService.bind(this._gridMenuButtonElm, 'click', this.showGridMenu.bind(this));
            }
            this.sharedService.gridOptions.gridMenu = { ...this._defaults, ...this._gridMenuOptions };
            // localization support for the picker
            this.translateTitleLabels(this._gridMenuOptions);
            this.translateTitleLabels(this.sharedService.gridOptions.gridMenu);
            this._menuElm = (0, index_2.createDomElement)('div', {
                role: 'menu',
                className: `slick-grid-menu ${this._gridUid}`,
                style: { display: 'none' }
            });
            this._commandMenuElm = (0, index_2.createDomElement)('div', { className: 'slick-menu-command-list', role: 'menu' }, this._menuElm);
            this.recreateCommandList(this._gridMenuOptions, {
                grid: this.grid,
                menu: this._menuElm,
                columns: this.columns,
                allColumns: this.getAllColumns(),
                visibleColumns: this.getVisibleColumns()
            });
            this.createColumnPickerContainer();
            document.body.appendChild(this._menuElm);
            // hide the menu on outside click.
            this._bindEventService.bind(document.body, 'mousedown', this.handleBodyMouseDown.bind(this));
            // destroy the picker if user leaves the page
            this._bindEventService.bind(document.body, 'beforeunload', this.dispose.bind(this));
        }
    }
    /**
     * Get all columns including hidden columns.
     * @returns {Array<Object>} - all columns array
     */
    getAllColumns() {
        return this._columns;
    }
    /**
     * Get only the visible columns.
     * @returns {Array<Object>} - only the visible columns array
     */
    getVisibleColumns() {
        return this.grid.getColumns();
    }
    /**
     * Hide the Grid Menu but only if it does detect as open prior to executing anything.
     * @param event
     * @returns
     */
    hideMenu(event) {
        var _a, _b, _c, _d;
        if (((_b = (_a = this._menuElm) === null || _a === void 0 ? void 0 : _a.style) === null || _b === void 0 ? void 0 : _b.display) === 'block') {
            const callbackArgs = {
                grid: this.grid,
                menu: this._menuElm,
                allColumns: this.columns,
                visibleColumns: this.getVisibleColumns()
            };
            // execute optional callback method defined by the user, if it returns false then we won't go further neither close the menu
            this.pubSubService.publish('onGridMenuMenuClose', callbackArgs);
            if ((typeof ((_c = this._gridMenuOptions) === null || _c === void 0 ? void 0 : _c.onMenuClose) === 'function' && this._gridMenuOptions.onMenuClose(event, callbackArgs) === false) || this.onMenuClose.notify(callbackArgs, null, this).getReturnValue() === false) {
                return;
            }
            this._menuElm.style.display = 'none';
            this._menuElm.setAttribute('aria-expanded', 'false');
            this._isMenuOpen = false;
            // we also want to resize the columns if the user decided to hide certain column(s)
            if (typeof ((_d = this.grid) === null || _d === void 0 ? void 0 : _d.autosizeColumns) === 'function') {
                // make sure that the grid still exist (by looking if the Grid UID is found in the DOM tree)
                const gridUid = this.grid.getUID() || '';
                if (this._areVisibleColumnDifferent && gridUid && document.querySelector(`.${gridUid}`) !== null) {
                    if (this.gridOptions.enableAutoSizeColumns) {
                        this.grid.autosizeColumns();
                    }
                    this._areVisibleColumnDifferent = false;
                }
            }
        }
    }
    /** destroy and recreate the Grid Menu in the DOM */
    recreateGridMenu() {
        this.deleteMenu();
        this.init();
    }
    repositionMenu(e, addonOptions, showMenu = true) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l;
        const targetEvent = (_b = (_a = e === null || e === void 0 ? void 0 : e.touches) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : e;
        if (this._menuElm) {
            let buttonElm = e.target.nodeName === 'BUTTON' ? e.target : e.target.querySelector('button'); // get button element
            if (!buttonElm) {
                buttonElm = e.target.parentElement; // external grid menu might fall in this last case if wrapped in a span/div
            }
            // we need to display the menu to properly calculate its width but we can however make it invisible
            this._menuElm.style.display = 'block';
            this._menuElm.style.opacity = '0';
            const menuIconOffset = (0, index_2.getHtmlElementOffset)(buttonElm);
            const buttonComptStyle = getComputedStyle(buttonElm);
            const buttonWidth = parseInt((_c = buttonComptStyle === null || buttonComptStyle === void 0 ? void 0 : buttonComptStyle.width) !== null && _c !== void 0 ? _c : (_d = this._defaults) === null || _d === void 0 ? void 0 : _d.menuWidth, 10);
            const menuWidth = (_g = (_f = this._menuElm) === null || _f === void 0 ? void 0 : _f.offsetWidth) !== null && _g !== void 0 ? _g : 0;
            const contentMinWidth = (_j = (_h = addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.contentMinWidth) !== null && _h !== void 0 ? _h : this._defaults.contentMinWidth) !== null && _j !== void 0 ? _j : 0;
            const currentMenuWidth = ((contentMinWidth > menuWidth) ? contentMinWidth : (menuWidth)) || 0;
            const nextPositionTop = (_k = menuIconOffset === null || menuIconOffset === void 0 ? void 0 : menuIconOffset.top) !== null && _k !== void 0 ? _k : 0;
            const nextPositionLeft = (_l = menuIconOffset === null || menuIconOffset === void 0 ? void 0 : menuIconOffset.right) !== null && _l !== void 0 ? _l : 0;
            const menuMarginBottom = (((addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.marginBottom) !== undefined) ? addonOptions.marginBottom : this._defaults.marginBottom) || 0;
            const calculatedLeftPosition = (addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.dropSide) === 'right' ? nextPositionLeft - buttonWidth : nextPositionLeft - currentMenuWidth;
            this._menuElm.style.top = `${nextPositionTop + buttonElm.offsetHeight}px`; // top position has to include button height so the menu is placed just below it
            this._menuElm.style.left = `${calculatedLeftPosition}px`;
            if (addonOptions.dropSide === 'left') {
                this._menuElm.classList.remove('dropright');
                this._menuElm.classList.add('dropleft');
            }
            else {
                this._menuElm.classList.remove('dropleft');
                this._menuElm.classList.add('dropright');
            }
            this._menuElm.appendChild(this._listElm);
            if (contentMinWidth > 0) {
                this._menuElm.style.minWidth = `${contentMinWidth}px`;
            }
            // set 'height' when defined OR ELSE use the 'max-height' with available window size and optional margin bottom
            this._menuElm.style.minHeight = (0, index_2.findWidthOrDefault)(addonOptions.minHeight, '');
            if ((addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.height) !== undefined) {
                this._menuElm.style.height = (0, index_2.findWidthOrDefault)(addonOptions.height, '');
            }
            else {
                this._menuElm.style.maxHeight = (0, index_2.findWidthOrDefault)(addonOptions.maxHeight, `${window.innerHeight - targetEvent.clientY - menuMarginBottom}px`);
            }
            this._menuElm.style.display = 'block';
            if (showMenu) {
                this._menuElm.style.opacity = '1'; // restore its visibility
            }
            this._menuElm.setAttribute('aria-expanded', 'true');
            this._menuElm.appendChild(this._listElm);
            this._isMenuOpen = true;
        }
    }
    showGridMenu(e, options) {
        e.preventDefault();
        // empty both the picker list & the command list
        (0, index_2.emptyElement)(this._listElm);
        (0, index_2.emptyElement)(this._commandMenuElm);
        if (this._gridMenuOptions) {
            const callbackArgs = {
                grid: this.grid,
                menu: this._menuElm,
                columns: this.columns,
                allColumns: this.getAllColumns(),
                visibleColumns: this.getVisibleColumns()
            };
            const addonOptions = { ...this._gridMenuOptions, ...options }; // merge optional picker option
            this.recreateCommandList(addonOptions, callbackArgs);
            extensionCommonUtils_1.updateColumnPickerOrder.call(this);
            this._columnCheckboxes = [];
            // run the override function (when defined), if the result is false then we won't go further
            if (addonOptions && !this.extensionUtility.runOverrideFunctionWhenExists(addonOptions.menuUsabilityOverride, callbackArgs)) {
                return;
            }
            // execute optional callback method defined by the user, if it returns false then we won't go further and not open the grid menu
            if (typeof e.stopPropagation === 'function') {
                this.pubSubService.publish('onGridMenuBeforeMenuShow', callbackArgs);
                if ((typeof (addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.onBeforeMenuShow) === 'function' && addonOptions.onBeforeMenuShow(e, callbackArgs) === false) || this.onBeforeMenuShow.notify(callbackArgs, null, this).getReturnValue() === false) {
                    return;
                }
            }
            // load the column & create column picker list
            extensionCommonUtils_1.populateColumnPicker.call(this, addonOptions);
            // calculate the necessary menu height/width and reposition twice because if we do it only once and the grid menu is wider than the original width,
            // it will be offset the 1st time we open the menu but if we do it twice then it will be at the correct position every time
            this.repositionMenu(e, addonOptions, false);
            this.repositionMenu(e, addonOptions, true);
            // execute optional callback method defined by the user
            this.pubSubService.publish('onGridMenuAfterMenuShow', callbackArgs);
            if (typeof (addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.onAfterMenuShow) === 'function') {
                addonOptions.onAfterMenuShow(e, callbackArgs);
            }
            this.onAfterMenuShow.notify(callbackArgs, null, this);
        }
    }
    /** Update the Titles of each sections (command, commandTitle, ...) */
    updateAllTitles(options) {
        var _a, _b, _c, _d;
        if (((_a = this._commandTitleElm) === null || _a === void 0 ? void 0 : _a.textContent) && options.commandTitle) {
            this._commandTitleElm.textContent = ((_c = (_b = this._gridMenuOptions) === null || _b === void 0 ? void 0 : _b.commandItems) === null || _c === void 0 ? void 0 : _c.length) ? options.commandTitle : '';
            this._gridMenuOptions.commandTitle = this._commandTitleElm.textContent;
        }
        if (((_d = this._columnTitleElm) === null || _d === void 0 ? void 0 : _d.textContent) && options.columnTitle) {
            this._columnTitleElm.textContent = options.columnTitle;
            this._gridMenuOptions.columnTitle = options.columnTitle;
        }
    }
    /** Translate the Grid Menu titles and column picker */
    translateGridMenu() {
        var _a;
        // update the properties by pointers, that is the only way to get Grid Menu Control to see the new values
        // we also need to call the control init so that it takes the new Grid object with latest values
        if (this.sharedService.gridOptions.gridMenu) {
            this.sharedService.gridOptions.gridMenu.commandItems = [];
            this.sharedService.gridOptions.gridMenu.commandTitle = '';
            this.sharedService.gridOptions.gridMenu.columnTitle = '';
            this.sharedService.gridOptions.gridMenu.forceFitTitle = '';
            this.sharedService.gridOptions.gridMenu.syncResizeTitle = '';
            // merge original user grid menu items with internal items
            // then sort all Grid Menu command items (sorted by pointer, no need to use the return)
            const originalCommandItems = this._userOriginalGridMenu && Array.isArray(this._userOriginalGridMenu.commandItems) ? this._userOriginalGridMenu.commandItems : [];
            this.sharedService.gridOptions.gridMenu.commandItems = [...originalCommandItems, ...this.addGridMenuCustomCommands(originalCommandItems)];
            this.extensionUtility.translateMenuItemsFromTitleKey(((_a = this._gridMenuOptions) === null || _a === void 0 ? void 0 : _a.commandItems) || []);
            this.extensionUtility.sortItems(this.sharedService.gridOptions.gridMenu.commandItems, 'positionOrder');
            this.translateTitleLabels(this.sharedService.gridOptions.gridMenu);
            this.translateTitleLabels(this._gridMenuOptions);
            // translate all columns (including non-visible)
            this.extensionUtility.translateItems(this._columns, 'nameKey', 'name');
            // update the Titles of each sections (command, commandTitle, ...)
            this.updateAllTitles(this.sharedService.gridOptions.gridMenu);
        }
    }
    translateTitleLabels(gridMenuOptions) {
        if (gridMenuOptions) {
            gridMenuOptions.commandTitle = this.extensionUtility.getPickerTitleOutputString('commandTitle', 'gridMenu');
            gridMenuOptions.columnTitle = this.extensionUtility.getPickerTitleOutputString('columnTitle', 'gridMenu');
            gridMenuOptions.forceFitTitle = this.extensionUtility.getPickerTitleOutputString('forceFitTitle', 'gridMenu');
            gridMenuOptions.syncResizeTitle = this.extensionUtility.getPickerTitleOutputString('syncResizeTitle', 'gridMenu');
        }
    }
    // --
    // protected functions
    // ------------------
    /** Create Grid Menu with Custom Commands if user has enabled Filters and/or uses a Backend Service (OData, GraphQL) */
    addGridMenuCustomCommands(originalCommandItems) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const backendApi = this.gridOptions.backendServiceApi || null;
        const gridMenuCommandItems = [];
        const gridOptions = this.gridOptions;
        const translationPrefix = (0, index_2.getTranslationPrefix)(gridOptions);
        const commandLabels = (_a = this._gridMenuOptions) === null || _a === void 0 ? void 0 : _a.commandLabels;
        // show grid menu: Unfreeze Columns/Rows
        if (this.gridOptions && this._gridMenuOptions && !this._gridMenuOptions.hideClearFrozenColumnsCommand) {
            const commandName = 'clear-pinning';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                gridMenuCommandItems.push({
                    iconCssClass: this._gridMenuOptions.iconClearFrozenColumnsCommand || 'fa fa-times',
                    titleKey: `${translationPrefix}${(_b = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.clearFrozenColumnsCommandKey) !== null && _b !== void 0 ? _b : 'CLEAR_PINNING'}`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 52
                });
            }
        }
        if (this.gridOptions && (this.gridOptions.enableFiltering && !this.sharedService.hideHeaderRowAfterPageLoad)) {
            // show grid menu: Clear all Filters
            if (this.gridOptions && this._gridMenuOptions && !this._gridMenuOptions.hideClearAllFiltersCommand) {
                const commandName = 'clear-filter';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    gridMenuCommandItems.push({
                        iconCssClass: this._gridMenuOptions.iconClearAllFiltersCommand || 'fa fa-filter text-danger',
                        titleKey: `${translationPrefix}${(_c = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.clearAllFiltersCommandKey) !== null && _c !== void 0 ? _c : 'CLEAR_ALL_FILTERS'}`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 50
                    });
                }
            }
            // show grid menu: toggle filter row
            if (this.gridOptions && this._gridMenuOptions && !this._gridMenuOptions.hideToggleFilterCommand) {
                const commandName = 'toggle-filter';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    gridMenuCommandItems.push({
                        iconCssClass: this._gridMenuOptions.iconToggleFilterCommand || 'fa fa-random',
                        titleKey: `${translationPrefix}${(_d = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.toggleFilterCommandKey) !== null && _d !== void 0 ? _d : 'TOGGLE_FILTER_ROW'}`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 53
                    });
                }
            }
            // show grid menu: refresh dataset
            if (backendApi && this.gridOptions && this._gridMenuOptions && !this._gridMenuOptions.hideRefreshDatasetCommand) {
                const commandName = 'refresh-dataset';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    gridMenuCommandItems.push({
                        iconCssClass: this._gridMenuOptions.iconRefreshDatasetCommand || 'fa fa-refresh',
                        titleKey: `${translationPrefix}${(_f = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.refreshDatasetCommandKey) !== null && _f !== void 0 ? _f : 'REFRESH_DATASET'}`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 57
                    });
                }
            }
        }
        if (this.gridOptions.showPreHeaderPanel) {
            // show grid menu: toggle pre-header row
            if (this.gridOptions && this._gridMenuOptions && !this._gridMenuOptions.hideTogglePreHeaderCommand) {
                const commandName = 'toggle-preheader';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    gridMenuCommandItems.push({
                        iconCssClass: this._gridMenuOptions.iconTogglePreHeaderCommand || 'fa fa-random',
                        titleKey: `${translationPrefix}${(_g = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.togglePreHeaderCommandKey) !== null && _g !== void 0 ? _g : 'TOGGLE_PRE_HEADER_ROW'}`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 53
                    });
                }
            }
        }
        if (this.gridOptions.enableSorting) {
            // show grid menu: Clear all Sorting
            if (this.gridOptions && this._gridMenuOptions && !this._gridMenuOptions.hideClearAllSortingCommand) {
                const commandName = 'clear-sorting';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    gridMenuCommandItems.push({
                        iconCssClass: this._gridMenuOptions.iconClearAllSortingCommand || 'fa fa-unsorted text-danger',
                        titleKey: `${translationPrefix}${(_h = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.clearAllSortingCommandKey) !== null && _h !== void 0 ? _h : 'CLEAR_ALL_SORTING'}`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 51
                    });
                }
            }
        }
        // show grid menu: Export to file
        if (((_j = this.gridOptions) === null || _j === void 0 ? void 0 : _j.enableTextExport) && this._gridMenuOptions && !this._gridMenuOptions.hideExportCsvCommand) {
            const commandName = 'export-csv';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                gridMenuCommandItems.push({
                    iconCssClass: this._gridMenuOptions.iconExportCsvCommand || 'fa fa-download',
                    titleKey: `${translationPrefix}${(_k = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.exportCsvCommandKey) !== null && _k !== void 0 ? _k : 'EXPORT_TO_CSV'}`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 54
                });
            }
        }
        // show grid menu: Export to Excel
        if (this.gridOptions && this.gridOptions.enableExcelExport && this._gridMenuOptions && !this._gridMenuOptions.hideExportExcelCommand) {
            const commandName = 'export-excel';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                gridMenuCommandItems.push({
                    iconCssClass: this._gridMenuOptions.iconExportExcelCommand || 'fa fa-file-excel-o text-success',
                    titleKey: `${translationPrefix}${(_l = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.exportExcelCommandKey) !== null && _l !== void 0 ? _l : 'EXPORT_TO_EXCEL'}`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 55
                });
            }
        }
        // show grid menu: export to text file as tab delimited
        if (((_m = this.gridOptions) === null || _m === void 0 ? void 0 : _m.enableTextExport) && this._gridMenuOptions && !this._gridMenuOptions.hideExportTextDelimitedCommand) {
            const commandName = 'export-text-delimited';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                gridMenuCommandItems.push({
                    iconCssClass: this._gridMenuOptions.iconExportTextDelimitedCommand || 'fa fa-download',
                    titleKey: `${translationPrefix}${(_o = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.exportTextDelimitedCommandKey) !== null && _o !== void 0 ? _o : 'EXPORT_TO_TAB_DELIMITED'}`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 56
                });
            }
        }
        // add the custom "Commands" title if there are any commands
        const commandItems = ((_p = this._gridMenuOptions) === null || _p === void 0 ? void 0 : _p.commandItems) || [];
        if (this.gridOptions && this._gridMenuOptions && (Array.isArray(gridMenuCommandItems) && gridMenuCommandItems.length > 0 || (Array.isArray(commandItems) && commandItems.length > 0))) {
            this._gridMenuOptions.commandTitle = this._gridMenuOptions.commandTitle || this.extensionUtility.getPickerTitleOutputString('commandTitle', 'gridMenu');
        }
        return gridMenuCommandItems;
    }
    /**
     * Execute the Grid Menu Custom command callback that was triggered by the onCommand subscribe
     * These are the default internal custom commands
     * @param event
     * @param GridMenuItem args
     */
    executeGridMenuInternalCustomCommands(_e, args) {
        var _a, _b, _c, _d, _f;
        const registeredResources = ((_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.externalRegisteredResources) || [];
        if (args === null || args === void 0 ? void 0 : args.command) {
            switch (args.command) {
                case 'clear-pinning':
                    const visibleColumns = [...this.sharedService.visibleColumns];
                    const newGridOptions = { frozenColumn: -1, frozenRow: -1, frozenBottom: false, enableMouseWheelScrollHandler: false };
                    this.grid.setOptions(newGridOptions);
                    this.sharedService.gridOptions.frozenColumn = newGridOptions.frozenColumn;
                    this.sharedService.gridOptions.frozenRow = newGridOptions.frozenRow;
                    this.sharedService.gridOptions.frozenBottom = newGridOptions.frozenBottom;
                    this.sharedService.gridOptions.enableMouseWheelScrollHandler = newGridOptions.enableMouseWheelScrollHandler;
                    // SlickGrid seems to be somehow resetting the columns to their original positions,
                    // so let's re-fix them to the position we kept as reference
                    if (Array.isArray(visibleColumns)) {
                        this.grid.setColumns(visibleColumns);
                    }
                    // we also need to autosize columns if the option is enabled
                    const gridOptions = this.gridOptions;
                    if (gridOptions.enableAutoSizeColumns) {
                        this.grid.autosizeColumns();
                    }
                    this.pubSubService.publish('onGridMenuClearAllPinning');
                    break;
                case 'clear-filter':
                    this.filterService.clearFilters();
                    this.sharedService.dataView.refresh();
                    this.pubSubService.publish('onGridMenuClearAllFilters');
                    break;
                case 'clear-sorting':
                    this.sortService.clearSorting();
                    this.sharedService.dataView.refresh();
                    this.pubSubService.publish('onGridMenuClearAllSorting');
                    break;
                case 'export-csv':
                    const exportCsvService = registeredResources.find((service) => service.className === 'TextExportService');
                    if (exportCsvService === null || exportCsvService === void 0 ? void 0 : exportCsvService.exportToFile) {
                        exportCsvService.exportToFile({
                            delimiter: index_1.DelimiterType.comma,
                            format: index_1.FileType.csv,
                        });
                    }
                    else {
                        console.error(`[Slickgrid-Universal] You must register the TextExportService to properly use Export to File in the Grid Menu. Example:: this.gridOptions = { enableTextExport: true, registerExternalResources: [new TextExportService()] };`);
                    }
                    break;
                case 'export-excel':
                    const excelService = registeredResources.find((service) => service.className === 'ExcelExportService');
                    if (excelService === null || excelService === void 0 ? void 0 : excelService.exportToExcel) {
                        excelService.exportToExcel();
                    }
                    else {
                        console.error(`[Slickgrid-Universal] You must register the ExcelExportService to properly use Export to Excel in the Grid Menu. Example:: this.gridOptions = { enableExcelExport: true, registerExternalResources: [new ExcelExportService()] };`);
                    }
                    break;
                case 'export-text-delimited':
                    const exportTxtService = registeredResources.find((service) => service.className === 'TextExportService');
                    if (exportTxtService === null || exportTxtService === void 0 ? void 0 : exportTxtService.exportToFile) {
                        exportTxtService.exportToFile({
                            delimiter: index_1.DelimiterType.tab,
                            format: index_1.FileType.txt,
                        });
                    }
                    else {
                        console.error(`[Slickgrid-Universal] You must register the TextExportService to properly use Export to File in the Grid Menu. Example:: this.gridOptions = { enableTextExport: true, registerExternalResources: [new TextExportService()] };`);
                    }
                    break;
                case 'toggle-filter':
                    let showHeaderRow = (_c = (_b = this.gridOptions) === null || _b === void 0 ? void 0 : _b.showHeaderRow) !== null && _c !== void 0 ? _c : false;
                    showHeaderRow = !showHeaderRow; // inverse show header flag
                    this.grid.setHeaderRowVisibility(showHeaderRow);
                    // when displaying header row, we'll call "setColumns" which in terms will recreate the header row filters
                    if (showHeaderRow === true) {
                        this.grid.setColumns(this.sharedService.columnDefinitions);
                        this.grid.scrollColumnIntoView(0); // quick fix to avoid filter being out of sync with horizontal scroll
                    }
                    break;
                case 'toggle-preheader':
                    const showPreHeaderPanel = (_f = (_d = this.gridOptions) === null || _d === void 0 ? void 0 : _d.showPreHeaderPanel) !== null && _f !== void 0 ? _f : false;
                    this.grid.setPreHeaderPanelVisibility(!showPreHeaderPanel);
                    break;
                case 'refresh-dataset':
                    this.extensionUtility.refreshBackendDataset();
                    break;
                default:
                    break;
            }
        }
    }
    /** @return default Grid Menu options */
    getDefaultGridMenuOptions() {
        return {
            commandTitle: undefined,
            columnTitle: this.extensionUtility.getPickerTitleOutputString('columnTitle', 'gridMenu'),
            forceFitTitle: this.extensionUtility.getPickerTitleOutputString('forceFitTitle', 'gridMenu'),
            syncResizeTitle: this.extensionUtility.getPickerTitleOutputString('syncResizeTitle', 'gridMenu'),
            iconCssClass: 'fa fa-bars',
            menuWidth: 18,
            commandItems: [],
            hideClearAllFiltersCommand: false,
            hideRefreshDatasetCommand: false,
            hideToggleFilterCommand: false,
        };
    }
    /** Mouse down handler when clicking anywhere in the DOM body */
    handleBodyMouseDown(event) {
        var _a;
        if ((this._menuElm !== event.target && !((_a = this._menuElm) === null || _a === void 0 ? void 0 : _a.contains(event.target)) && this._isMenuOpen) || event.target.className === 'close') {
            this.hideMenu(event);
        }
    }
    handleMenuItemCommandClick(event, _type, item) {
        var _a, _b;
        if (item === 'divider' || item.command && (item.disabled || item.divider)) {
            return false;
        }
        const callbackArgs = {
            grid: this.grid,
            command: item.command,
            item,
            allColumns: this.columns,
            visibleColumns: this.getVisibleColumns()
        };
        // execute Grid Menu callback with command,
        // we'll also execute optional user defined onCommand callback when provided
        this.executeGridMenuInternalCustomCommands(event, callbackArgs);
        this.pubSubService.publish('onGridMenuCommand', callbackArgs);
        if (typeof ((_a = this._gridMenuOptions) === null || _a === void 0 ? void 0 : _a.onCommand) === 'function') {
            this._gridMenuOptions.onCommand(event, callbackArgs);
        }
        this.onCommand.notify(callbackArgs, null, this);
        // execute action callback when defined
        if (typeof item.action === 'function') {
            item.action.call(this, event, callbackArgs);
        }
        // does the user want to leave open the Grid Menu after executing a command?
        if (!((_b = this._gridMenuOptions) === null || _b === void 0 ? void 0 : _b.leaveOpen) && !event.defaultPrevented) {
            this.hideMenu(event);
        }
        // Stop propagation so that it doesn't register as a header click event.
        event.preventDefault();
        event.stopPropagation();
    }
    /** Re/Create Command List by adding title, close & list of commands */
    recreateCommandList(addonOptions, callbackArgs) {
        var _a;
        // add Close button
        this.populateCommandOrOptionTitle('command', addonOptions, this._commandMenuElm);
        const commandMenuHeaderElm = (_a = this._commandMenuElm.querySelector(`.slick-command-header`)) !== null && _a !== void 0 ? _a : (0, index_2.createDomElement)('div', { className: 'slick-command-header' });
        commandMenuHeaderElm.classList.add('with-close');
        extensionCommonUtils_1.addCloseButtomElement.call(this, commandMenuHeaderElm);
        this._commandMenuElm.appendChild(commandMenuHeaderElm);
        // populate the command list
        this.populateCommandOrOptionItems('command', addonOptions, this._commandMenuElm, (addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.commandItems) || [], callbackArgs, this.handleMenuItemCommandClick);
    }
}
exports.SlickGridMenu = SlickGridMenu;
//# sourceMappingURL=slickGridMenu.js.map