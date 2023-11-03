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
        this._commandMenuElm = null;
        this._headerElm = null;
        this._isMenuOpen = false;
        this._subMenuParentId = '';
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
            subMenuOpenByEvent: 'mouseover',
            headerColumnValueExtractor: (columnDef) => columnDef.name
        };
        // public events
        this.onAfterMenuShow = new Slick.Event();
        this.onBeforeMenuShow = new Slick.Event();
        this.onMenuClose = new Slick.Event();
        this.onCommand = new Slick.Event();
        this.onColumnsChanged = new Slick.Event();
        this._menuCssPrefix = 'slick-menu';
        this._menuPluginCssPrefix = 'slick-grid-menu';
        this._camelPluginName = 'gridMenu';
        this._columns = (_a = this.sharedService.allColumns) !== null && _a !== void 0 ? _a : [];
        this._gridUid = (_d = (_c = (_b = this.grid) === null || _b === void 0 ? void 0 : _b.getUID) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : '';
        this.initEventHandlers();
        this.init();
    }
    get addonOptions() {
        return this._addonOptions || {};
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
    get gridUidSelector() {
        return this.gridUid ? `.${this.gridUid}` : '';
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
        this._addonOptions = { ...this._defaults, ...this.getDefaultGridMenuOptions(), ...this.sharedService.gridOptions.gridMenu };
        this.sharedService.gridOptions.gridMenu = this._addonOptions;
        // merge original user grid menu items with internal items
        // then sort all Grid Menu command items (sorted by pointer, no need to use the return)
        const gridMenuCommandItems = this._userOriginalGridMenu.commandItems;
        const originalCommandItems = this._userOriginalGridMenu && Array.isArray(gridMenuCommandItems) ? gridMenuCommandItems : [];
        this._addonOptions.commandItems = [...originalCommandItems, ...this.addGridMenuCustomCommands(originalCommandItems)];
        this.extensionUtility.translateMenuItemsFromTitleKey(this._addonOptions.commandItems || [], 'commandItems');
        this.extensionUtility.sortItems(this._addonOptions.commandItems, 'positionOrder');
        this._addonOptions.commandItems = this._addonOptions.commandItems;
        // create the Grid Menu DOM element
        this.createGridMenu();
    }
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose() {
        this.deleteMenu();
        super.dispose();
    }
    deleteMenu() {
        var _a, _b;
        this._bindEventService.unbindAll();
        (_a = this._menuElm) === null || _a === void 0 ? void 0 : _a.remove();
        this._menuElm = null;
        (_b = this._gridMenuButtonElm) === null || _b === void 0 ? void 0 : _b.remove();
        if (this._headerElm) {
            // put back grid header original width (fixes width and frozen+gridMenu on left header)
            this._headerElm.style.width = '100%';
        }
    }
    createColumnPickerContainer() {
        if (this._menuElm) {
            // user could pass a title on top of the columns list
            extensionCommonUtils_1.addColumnTitleElementWhenDefined.call(this, this._menuElm);
            this._listElm = (0, index_2.createDomElement)('div', { className: 'slick-column-picker-list', role: 'menu' });
            // update all columns on any of the column title button click from column picker
            this._bindEventService.bind(this._menuElm, 'click', extensionCommonUtils_1.handleColumnPickerItemClick.bind(this), undefined, 'parent-menu');
        }
    }
    /** Create parent grid menu container */
    createGridMenu() {
        var _a, _b, _c, _d;
        const gridUidSelector = this._gridUid ? `.${this._gridUid}` : '';
        const gridMenuWidth = ((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.menuWidth) || this._defaults.menuWidth;
        const headerSide = (this.gridOptions.hasOwnProperty('frozenColumn') && this.gridOptions.frozenColumn >= 0) ? 'right' : 'left';
        const gridContainer = this.grid.getContainerNode();
        this._headerElm = gridContainer.querySelector(`.slick-header-${headerSide}`);
        if (this._headerElm && this._addonOptions) {
            // resize the header row to include the hamburger menu icon
            this._headerElm.style.width = `calc(100% - ${gridMenuWidth}px)`;
            // if header row is enabled, we also need to resize its width
            const enableResizeHeaderRow = (_b = this._addonOptions.resizeOnShowHeaderRow) !== null && _b !== void 0 ? _b : this._defaults.resizeOnShowHeaderRow;
            if (enableResizeHeaderRow && this.gridOptions.showHeaderRow) {
                const headerRowElm = gridContainer.querySelector(`${gridUidSelector} .slick-headerrow`);
                if (headerRowElm) {
                    headerRowElm.style.width = `calc(100% - ${gridMenuWidth}px)`;
                }
            }
            const showButton = (_c = this._addonOptions.showButton) !== null && _c !== void 0 ? _c : this._defaults.showButton;
            if (showButton) {
                this._gridMenuButtonElm = (0, index_2.createDomElement)('button', { className: 'slick-grid-menu-button', ariaLabel: 'Grid Menu' });
                if ((_d = this._addonOptions) === null || _d === void 0 ? void 0 : _d.iconCssClass) {
                    this._gridMenuButtonElm.classList.add(...this._addonOptions.iconCssClass.split(' '));
                }
                this._headerElm.parentElement.insertBefore(this._gridMenuButtonElm, this._headerElm.parentElement.firstChild);
                // show the Grid Menu when hamburger menu is clicked
                this._bindEventService.bind(this._gridMenuButtonElm, 'click', this.showGridMenu.bind(this));
            }
            this.sharedService.gridOptions.gridMenu = { ...this._defaults, ...this._addonOptions };
            // localization support for the picker
            this.translateTitleLabels(this._addonOptions);
            this.translateTitleLabels(this.sharedService.gridOptions.gridMenu);
            // hide the menu on outside click.
            this._bindEventService.bind(document.body, 'mousedown', this.handleBodyMouseDown.bind(this));
            // destroy the picker if user leaves the page
            this._bindEventService.bind(document.body, 'beforeunload', this.dispose.bind(this));
        }
    }
    /** Create the menu or sub-menu(s) but without the column picker which is a separate single process */
    createCommandMenu(commandItems, level = 0, item) {
        // to avoid having multiple sub-menu trees opened
        // we need to somehow keep trace of which parent menu the tree belongs to
        // and we should keep ref of only the first sub-menu parent, we can use the command name (remove any whitespaces though)
        const subMenuCommand = item === null || item === void 0 ? void 0 : item.command;
        let subMenuId = (level === 1 && subMenuCommand) ? subMenuCommand.replace(/\s/g, '') : '';
        if (subMenuId) {
            this._subMenuParentId = subMenuId;
        }
        if (level > 1) {
            subMenuId = this._subMenuParentId;
        }
        const menuClasses = `${this.menuCssClass} slick-menu-level-${level} ${this._gridUid}`;
        const bodyMenuElm = document.body.querySelector(`.${this.menuCssClass}.slick-menu-level-${level}${this.gridUidSelector}`);
        // return menu/sub-menu if it's already opened unless we are on different sub-menu tree if so close them all
        if (bodyMenuElm) {
            if (bodyMenuElm.dataset.subMenuParent === subMenuId) {
                return bodyMenuElm;
            }
            this.disposeSubMenus();
        }
        const menuElm = (0, index_2.createDomElement)('div', {
            role: 'menu',
            className: menuClasses,
            ariaLabel: level > 1 ? 'SubMenu' : 'Grid Menu'
        });
        if (level > 0) {
            menuElm.classList.add('slick-submenu');
            if (subMenuId) {
                menuElm.dataset.subMenuParent = subMenuId;
            }
        }
        const callbackArgs = {
            grid: this.grid,
            menu: this._menuElm,
            columns: this.columns,
            allColumns: this.getAllColumns(),
            visibleColumns: this.getVisibleColumns(),
            level
        };
        this._commandMenuElm = this.recreateCommandList(commandItems, menuElm, callbackArgs, item);
        // increment level for possible next sub-menus if exists
        level++;
        return menuElm;
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
        var _a, _b, _c;
        const callbackArgs = {
            grid: this.grid,
            menu: this._menuElm,
            allColumns: this.columns,
            visibleColumns: this.getVisibleColumns()
        };
        // execute optional callback method defined by the user, if it returns false then we won't go further neither close the menu
        this.pubSubService.publish('onGridMenuMenuClose', callbackArgs);
        if ((typeof ((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.onMenuClose) === 'function' && this._addonOptions.onMenuClose(event, callbackArgs) === false) || this.onMenuClose.notify(callbackArgs, null, this).getReturnValue() === false) {
            return;
        }
        this._isMenuOpen = false;
        // we also want to resize the columns if the user decided to hide certain column(s)
        if (typeof ((_b = this.grid) === null || _b === void 0 ? void 0 : _b.autosizeColumns) === 'function') {
            // make sure that the grid still exist (by looking if the Grid UID is found in the DOM tree)
            const gridUid = this.grid.getUID() || '';
            if (this._areVisibleColumnDifferent && gridUid && document.querySelector(`.${gridUid}`) !== null) {
                if (this.gridOptions.enableAutoSizeColumns) {
                    this.grid.autosizeColumns();
                }
                this._areVisibleColumnDifferent = false;
            }
        }
        // dispose of all sub-menus from the DOM and unbind all listeners
        this.disposeSubMenus();
        (_c = this._menuElm) === null || _c === void 0 ? void 0 : _c.remove();
        this._menuElm = null;
    }
    /** destroy and recreate the Grid Menu in the DOM */
    recreateGridMenu() {
        this.deleteMenu();
        this.init();
    }
    repositionMenu(e, menuElm, buttonElm, addonOptions) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m;
        const targetEvent = (_b = (_a = e === null || e === void 0 ? void 0 : e.touches) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : e;
        const isSubMenu = menuElm.classList.contains('slick-submenu');
        const parentElm = isSubMenu
            ? e.target.closest('.slick-menu-item')
            : targetEvent.target;
        if (parentElm) {
            const iconButtonElm = buttonElm || this._gridMenuButtonElm;
            const menuIconOffset = (0, index_2.getHtmlElementOffset)(buttonElm); // get button offset position
            const parentOffset = (0, index_2.getHtmlElementOffset)(parentElm);
            const gridMenuOptions = addonOptions !== null && addonOptions !== void 0 ? addonOptions : this._addonOptions;
            const buttonComptStyle = getComputedStyle(iconButtonElm);
            const buttonWidth = parseInt((_c = buttonComptStyle === null || buttonComptStyle === void 0 ? void 0 : buttonComptStyle.width) !== null && _c !== void 0 ? _c : (_d = this._defaults) === null || _d === void 0 ? void 0 : _d.menuWidth, 10);
            const menuWidth = (_f = menuElm === null || menuElm === void 0 ? void 0 : menuElm.offsetWidth) !== null && _f !== void 0 ? _f : 0;
            const contentMinWidth = (_h = (_g = gridMenuOptions === null || gridMenuOptions === void 0 ? void 0 : gridMenuOptions.contentMinWidth) !== null && _g !== void 0 ? _g : this._defaults.contentMinWidth) !== null && _h !== void 0 ? _h : 0;
            const currentMenuWidth = ((contentMinWidth > menuWidth) ? contentMinWidth : (menuWidth)) || 0;
            const nextPositionTop = (_j = menuIconOffset === null || menuIconOffset === void 0 ? void 0 : menuIconOffset.top) !== null && _j !== void 0 ? _j : 0;
            const nextPositionLeft = (_k = menuIconOffset === null || menuIconOffset === void 0 ? void 0 : menuIconOffset.right) !== null && _k !== void 0 ? _k : 0;
            let menuOffsetLeft;
            let menuOffsetTop;
            if (isSubMenu) {
                menuOffsetTop = (_l = parentOffset === null || parentOffset === void 0 ? void 0 : parentOffset.top) !== null && _l !== void 0 ? _l : 0;
                menuOffsetLeft = (_m = parentOffset === null || parentOffset === void 0 ? void 0 : parentOffset.left) !== null && _m !== void 0 ? _m : 0;
            }
            else {
                menuOffsetTop = nextPositionTop + iconButtonElm.offsetHeight; // top position has to include button height so the menu is placed just below it
                menuOffsetLeft = (gridMenuOptions === null || gridMenuOptions === void 0 ? void 0 : gridMenuOptions.dropSide) === 'right'
                    ? nextPositionLeft - buttonWidth
                    : nextPositionLeft - currentMenuWidth;
            }
            // for sub-menus only, auto-adjust drop position (up/down)
            //  we first need to see what position the drop will be located (defaults to bottom)
            if (isSubMenu) {
                // since we reposition menu below slick cell, we need to take it in consideration and do our calculation from that element
                const menuHeight = (menuElm === null || menuElm === void 0 ? void 0 : menuElm.clientHeight) || 0;
                const { bottom: availableSpaceBottom, top: availableSpaceTop } = (0, index_2.calculateAvailableSpace)(parentElm);
                const dropPosition = ((availableSpaceBottom < menuHeight) && (availableSpaceTop > availableSpaceBottom)) ? 'top' : 'bottom';
                if (dropPosition === 'top') {
                    menuElm.classList.remove('dropdown');
                    menuElm.classList.add('dropup');
                    menuOffsetTop -= (menuHeight - parentElm.clientHeight);
                }
                else {
                    menuElm.classList.remove('dropup');
                    menuElm.classList.add('dropdown');
                }
            }
            // auto-align side (left/right)
            const gridPos = this.grid.getGridPosition();
            let subMenuPosCalc = menuOffsetLeft + Number(menuWidth); // calculate coordinate at caller element far right
            if (isSubMenu) {
                subMenuPosCalc += parentElm.clientWidth;
            }
            const browserWidth = document.documentElement.clientWidth;
            const dropSide = (subMenuPosCalc >= gridPos.width || subMenuPosCalc >= browserWidth) ? 'left' : 'right';
            if (dropSide === 'left' || (!isSubMenu && (gridMenuOptions === null || gridMenuOptions === void 0 ? void 0 : gridMenuOptions.dropSide) === 'left')) {
                menuElm.classList.remove('dropright');
                menuElm.classList.add('dropleft');
                if (isSubMenu) {
                    menuOffsetLeft -= Number(menuWidth);
                }
            }
            else {
                menuElm.classList.remove('dropleft');
                menuElm.classList.add('dropright');
                if (isSubMenu) {
                    menuOffsetLeft += parentElm.offsetWidth;
                }
            }
            menuElm.style.top = `${menuOffsetTop}px`;
            menuElm.style.left = `${menuOffsetLeft}px`;
            if (contentMinWidth > 0) {
                menuElm.style.minWidth = `${contentMinWidth}px`;
            }
            menuElm.style.opacity = '1';
            menuElm.style.display = 'block';
        }
    }
    /** Open the Grid Menu */
    openGridMenu() {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, composed: false });
        Object.defineProperty(clickEvent, 'target', { writable: true, configurable: true, value: (0, index_2.createDomElement)('button', { className: 'slick-grid-menu-button' }) });
        this.showGridMenu(clickEvent);
    }
    /** show Grid Menu from the click event, which in theory will recreate the grid menu in the DOM */
    showGridMenu(e, options) {
        var _a, _b, _c, _d, _f;
        const targetEvent = (_b = (_a = e === null || e === void 0 ? void 0 : e.touches) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : e;
        e.preventDefault();
        // empty the entire menu so that it's recreated every time it opens
        (0, index_2.emptyElement)(this._menuElm);
        (_c = this._menuElm) === null || _c === void 0 ? void 0 : _c.remove();
        if (this._addonOptions) {
            const callbackArgs = {
                grid: this.grid,
                menu: this._menuElm,
                columns: this.columns,
                allColumns: this.getAllColumns(),
                visibleColumns: this.getVisibleColumns()
            };
            const addonOptions = { ...this._addonOptions, ...options }; // merge optional picker option
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
            this._menuElm = this.createCommandMenu((_f = (_d = this._addonOptions) === null || _d === void 0 ? void 0 : _d.commandItems) !== null && _f !== void 0 ? _f : []);
            this.createColumnPickerContainer();
            extensionCommonUtils_1.updateColumnPickerOrder.call(this);
            this._columnCheckboxes = [];
            // load the column & create column picker list
            extensionCommonUtils_1.populateColumnPicker.call(this, addonOptions);
            document.body.appendChild(this._menuElm);
            // calculate the necessary menu height/width and reposition twice because if we do it only once and the grid menu is wider than the original width,
            // it will be offset the 1st time we open the menu but if we do it twice then it will be at the correct position every time
            this._menuElm.style.opacity = '0';
            const menuMarginBottom = (((addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.marginBottom) !== undefined) ? addonOptions.marginBottom : this._defaults.marginBottom) || 0;
            // set 'height' when defined OR ELSE use the 'max-height' with available window size and optional margin bottom
            this._menuElm.style.minHeight = (0, index_2.findWidthOrDefault)(addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.minHeight, '');
            if ((addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.height) !== undefined) {
                this._menuElm.style.height = (0, index_2.findWidthOrDefault)(addonOptions.height, '');
            }
            else {
                this._menuElm.style.maxHeight = (0, index_2.findWidthOrDefault)(addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.maxHeight, `${window.innerHeight - targetEvent.clientY - menuMarginBottom}px`);
            }
            let buttonElm = e.target.nodeName === 'BUTTON' ? e.target : e.target.querySelector('button'); // get button element
            if (!buttonElm) {
                buttonElm = e.target.parentElement; // external grid menu might fall in this last case if wrapped in a span/div
            }
            this._menuElm.setAttribute('aria-expanded', 'true');
            this._menuElm.appendChild(this._listElm);
            // once we have both lists (commandItems + columnPicker), we are ready to reposition the menu since its height/width should be calculated by then
            this.repositionMenu(e, this._menuElm, buttonElm, addonOptions);
            this._isMenuOpen = true;
            // execute optional callback method defined by the user
            this.pubSubService.publish('onGridMenuAfterMenuShow', callbackArgs);
            if (typeof (addonOptions === null || addonOptions === void 0 ? void 0 : addonOptions.onAfterMenuShow) === 'function') {
                addonOptions.onAfterMenuShow(e, callbackArgs);
            }
            this.onAfterMenuShow.notify(callbackArgs, null, this);
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
            this.extensionUtility.translateMenuItemsFromTitleKey(((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.commandItems) || [], 'commandItems');
            this.extensionUtility.sortItems(this.sharedService.gridOptions.gridMenu.commandItems, 'positionOrder');
            this.translateTitleLabels(this.sharedService.gridOptions.gridMenu);
            this.translateTitleLabels(this._addonOptions);
            // translate all columns (including non-visible)
            this.extensionUtility.translateItems(this._columns, 'nameKey', 'name');
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
        const commandLabels = (_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.commandLabels;
        // show grid menu: Unfreeze Columns/Rows
        if (this.gridOptions && this._addonOptions && !this._addonOptions.hideClearFrozenColumnsCommand) {
            const commandName = 'clear-pinning';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                gridMenuCommandItems.push({
                    iconCssClass: this._addonOptions.iconClearFrozenColumnsCommand || 'fa fa-times',
                    titleKey: `${translationPrefix}${(_b = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.clearFrozenColumnsCommandKey) !== null && _b !== void 0 ? _b : 'CLEAR_PINNING'}`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 52
                });
            }
        }
        if (this.gridOptions && (this.gridOptions.enableFiltering && !this.sharedService.hideHeaderRowAfterPageLoad)) {
            // show grid menu: Clear all Filters
            if (this.gridOptions && this._addonOptions && !this._addonOptions.hideClearAllFiltersCommand) {
                const commandName = 'clear-filter';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    gridMenuCommandItems.push({
                        iconCssClass: this._addonOptions.iconClearAllFiltersCommand || 'fa fa-filter text-danger',
                        titleKey: `${translationPrefix}${(_c = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.clearAllFiltersCommandKey) !== null && _c !== void 0 ? _c : 'CLEAR_ALL_FILTERS'}`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 50
                    });
                }
            }
            // show grid menu: toggle filter row
            if (this.gridOptions && this._addonOptions && !this._addonOptions.hideToggleFilterCommand) {
                const commandName = 'toggle-filter';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    gridMenuCommandItems.push({
                        iconCssClass: this._addonOptions.iconToggleFilterCommand || 'fa fa-random',
                        titleKey: `${translationPrefix}${(_d = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.toggleFilterCommandKey) !== null && _d !== void 0 ? _d : 'TOGGLE_FILTER_ROW'}`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 53
                    });
                }
            }
            // show grid menu: refresh dataset
            if (backendApi && this.gridOptions && this._addonOptions && !this._addonOptions.hideRefreshDatasetCommand) {
                const commandName = 'refresh-dataset';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    gridMenuCommandItems.push({
                        iconCssClass: this._addonOptions.iconRefreshDatasetCommand || 'fa fa-refresh',
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
            if (this.gridOptions && this._addonOptions && !this._addonOptions.hideTogglePreHeaderCommand) {
                const commandName = 'toggle-preheader';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    gridMenuCommandItems.push({
                        iconCssClass: this._addonOptions.iconTogglePreHeaderCommand || 'fa fa-random',
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
            if (this.gridOptions && this._addonOptions && !this._addonOptions.hideClearAllSortingCommand) {
                const commandName = 'clear-sorting';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    gridMenuCommandItems.push({
                        iconCssClass: this._addonOptions.iconClearAllSortingCommand || 'fa fa-unsorted text-danger',
                        titleKey: `${translationPrefix}${(_h = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.clearAllSortingCommandKey) !== null && _h !== void 0 ? _h : 'CLEAR_ALL_SORTING'}`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 51
                    });
                }
            }
        }
        // show grid menu: Export to file
        if (((_j = this.gridOptions) === null || _j === void 0 ? void 0 : _j.enableTextExport) && this._addonOptions && !this._addonOptions.hideExportCsvCommand) {
            const commandName = 'export-csv';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                gridMenuCommandItems.push({
                    iconCssClass: this._addonOptions.iconExportCsvCommand || 'fa fa-download',
                    titleKey: `${translationPrefix}${(_k = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.exportCsvCommandKey) !== null && _k !== void 0 ? _k : 'EXPORT_TO_CSV'}`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 54
                });
            }
        }
        // show grid menu: Export to Excel
        if (this.gridOptions && this.gridOptions.enableExcelExport && this._addonOptions && !this._addonOptions.hideExportExcelCommand) {
            const commandName = 'export-excel';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                gridMenuCommandItems.push({
                    iconCssClass: this._addonOptions.iconExportExcelCommand || 'fa fa-file-excel-o text-success',
                    titleKey: `${translationPrefix}${(_l = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.exportExcelCommandKey) !== null && _l !== void 0 ? _l : 'EXPORT_TO_EXCEL'}`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 55
                });
            }
        }
        // show grid menu: export to text file as tab delimited
        if (((_m = this.gridOptions) === null || _m === void 0 ? void 0 : _m.enableTextExport) && this._addonOptions && !this._addonOptions.hideExportTextDelimitedCommand) {
            const commandName = 'export-text-delimited';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                gridMenuCommandItems.push({
                    iconCssClass: this._addonOptions.iconExportTextDelimitedCommand || 'fa fa-download',
                    titleKey: `${translationPrefix}${(_o = commandLabels === null || commandLabels === void 0 ? void 0 : commandLabels.exportTextDelimitedCommandKey) !== null && _o !== void 0 ? _o : 'EXPORT_TO_TAB_DELIMITED'}`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 56
                });
            }
        }
        // add the custom "Commands" title if there are any commands
        const commandItems = ((_p = this._addonOptions) === null || _p === void 0 ? void 0 : _p.commandItems) || [];
        if (this.gridOptions && this._addonOptions && (Array.isArray(gridMenuCommandItems) && gridMenuCommandItems.length > 0 || (Array.isArray(commandItems) && commandItems.length > 0))) {
            this._addonOptions.commandTitle = this._addonOptions.commandTitle || this.extensionUtility.getPickerTitleOutputString('commandTitle', 'gridMenu');
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
    handleBodyMouseDown(e) {
        if (this.menuElement) {
            let isMenuClicked = false;
            const parentMenuElm = e.target.closest(`.${this.menuCssClass}`);
            // did we click inside the menu or any of its sub-menu(s)
            if (this.menuElement.contains(e.target) || parentMenuElm) {
                isMenuClicked = true;
            }
            if ((this._isMenuOpen && this.menuElement !== e.target && !isMenuClicked && !e.defaultPrevented) || (e.target.className === 'close' && parentMenuElm)) {
                this.hideMenu(e);
            }
        }
    }
    handleMenuItemCommandClick(event, _type, item, level = 0) {
        var _a, _b;
        if (item !== 'divider' && !item.disabled && !item.divider) {
            const command = item.command || '';
            if (command && !item.commandItems) {
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
                if (typeof ((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.onCommand) === 'function') {
                    this._addonOptions.onCommand(event, callbackArgs);
                }
                this.onCommand.notify(callbackArgs, null, this);
                // execute action callback when defined
                if (typeof item.action === 'function') {
                    item.action.call(this, event, callbackArgs);
                }
                // does the user want to leave open the Grid Menu after executing a command?
                if (!((_b = this._addonOptions) === null || _b === void 0 ? void 0 : _b.leaveOpen) && !event.defaultPrevented) {
                    this.hideMenu(event);
                }
                // Stop propagation so that it doesn't register as a header click event.
                event.preventDefault();
                event.stopPropagation();
            }
            else if (item.commandItems) {
                this.repositionSubMenu(event, item, level);
            }
        }
    }
    handleMenuItemMouseOver(e, _type, item, level = 0) {
        if (item !== 'divider' && !item.disabled && !item.divider) {
            if (item.commandItems) {
                this.repositionSubMenu(e, item, level);
            }
            else if (level === 0) {
                this.disposeSubMenus();
            }
        }
    }
    /** Re/Create Command List by adding title, close & list of commands */
    recreateCommandList(commandItems, menuElm, callbackArgs, item) {
        var _a;
        // -- Command List section
        const level = callbackArgs.level || 0;
        if (commandItems.length > 0) {
            const commandMenuElm = (0, index_2.createDomElement)('div', { className: `${this._menuCssPrefix}-command-list`, role: 'menu' }, menuElm);
            if (level === 0) {
                this.populateCommandOrOptionTitle('command', this.addonOptions, commandMenuElm, level);
                const commandMenuHeaderElm = (_a = menuElm.querySelector(`.slick-command-header`)) !== null && _a !== void 0 ? _a : (0, index_2.createDomElement)('div', { className: 'slick-command-header' });
                commandMenuHeaderElm.classList.add('with-close');
                extensionCommonUtils_1.addCloseButtomElement.call(this, commandMenuHeaderElm);
                commandMenuElm.appendChild(commandMenuHeaderElm);
            }
            // when creating sub-menu also add its sub-menu title when exists
            if (item && level > 0) {
                this.addSubMenuTitleWhenExists(item, commandMenuElm); // add sub-menu title when exists
            }
            this.populateCommandOrOptionItems('command', this._addonOptions, commandMenuElm, commandItems, callbackArgs, this.handleMenuItemCommandClick, this.handleMenuItemMouseOver);
            return commandMenuElm;
        }
        return null;
    }
    repositionSubMenu(e, item, level) {
        // creating sub-menu, we'll also pass level & the item object since we might have "subMenuTitle" to show
        const commandItems = (item === null || item === void 0 ? void 0 : item.commandItems) || [];
        const subMenuElm = this.createCommandMenu(commandItems, level + 1, item);
        subMenuElm.style.display = 'block';
        document.body.appendChild(subMenuElm);
        this.repositionMenu(e, subMenuElm);
    }
}
exports.SlickGridMenu = SlickGridMenu;
//# sourceMappingURL=slickGridMenu.js.map