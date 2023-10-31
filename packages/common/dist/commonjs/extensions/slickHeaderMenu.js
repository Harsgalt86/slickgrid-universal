"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickHeaderMenu = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const index_1 = require("../enums/index");
const index_2 = require("../services/index");
const menuBaseClass_1 = require("./menuBaseClass");
/**
 * A plugin to add drop-down menus to column headers.
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.columnDefinitions = [{
 *     id: 'myColumn', name: 'My column',
 *     header: {
 *       menu: {
 *         commandItems: [{ ...menu item options... }, { ...menu item options... }]
 *       }
 *     }
 *   }];
 */
class SlickHeaderMenu extends menuBaseClass_1.MenuBaseClass {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility, filterService, pubSubService, sharedService, sortService) {
        super(extensionUtility, pubSubService, sharedService);
        this.extensionUtility = extensionUtility;
        this.filterService = filterService;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this.sortService = sortService;
        this._subMenuParentId = '';
        this._defaults = {
            autoAlign: true,
            autoAlignOffset: 0,
            buttonCssClass: null,
            buttonImage: null,
            minWidth: 100,
            hideColumnHideCommand: false,
            hideSortCommands: false,
            title: '',
            subMenuOpenByEvent: 'mouseover',
        };
        this.pluginName = 'HeaderMenu';
        this._menuCssPrefix = 'slick-menu';
        this._menuPluginCssPrefix = 'slick-header-menu';
        this._camelPluginName = 'headerMenu';
        this.sharedService.gridOptions.headerMenu = this.addHeaderMenuCustomCommands(this.sharedService.columnDefinitions);
        this.init(sharedService.gridOptions.headerMenu);
    }
    /** Initialize plugin. */
    init(headerMenuOptions) {
        this._addonOptions = { ...this._defaults, ...headerMenuOptions };
        // when setColumns is called (could be via toggle filtering/sorting or anything else),
        // we need to recreate header menu items custom commands array before the `onHeaderCellRendered` gets called
        this._eventHandler.subscribe(this.grid.onBeforeSetColumns, (e, args) => {
            this.sharedService.gridOptions.headerMenu = this.addHeaderMenuCustomCommands(args.newColumns);
        });
        this._eventHandler.subscribe(this.grid.onHeaderCellRendered, this.handleHeaderCellRendered.bind(this));
        this._eventHandler.subscribe(this.grid.onBeforeHeaderCellDestroy, this.handleBeforeHeaderCellDestroy.bind(this));
        // force the grid to re-render the header after the events are hooked up.
        this.grid.setColumns(this.grid.getColumns());
        // hide the menu when clicking outside the grid
        this._bindEventService.bind(document.body, 'mousedown', this.handleBodyMouseDown.bind(this), { capture: true });
    }
    /** Dispose (destroy) of the plugin */
    dispose() {
        var _a;
        super.dispose();
        this._menuElm = this._menuElm || document.body.querySelector(`.slick-header-menu${this.gridUidSelector}`);
        (_a = this._menuElm) === null || _a === void 0 ? void 0 : _a.remove();
        this._activeHeaderColumnElm = undefined;
    }
    /** Hide a column from the grid */
    hideColumn(column) {
        var _a, _b, _c;
        if ((_b = (_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.slickGrid) === null || _b === void 0 ? void 0 : _b.getColumnIndex) {
            const columnIndex = this.sharedService.slickGrid.getColumnIndex(column.id);
            const currentVisibleColumns = this.sharedService.slickGrid.getColumns();
            // if we're using frozen columns, we need to readjust pinning when the new hidden column is on the left pinning container
            // we need to do this because SlickGrid freezes by index and has no knowledge of the columns themselves
            const frozenColumnIndex = (_c = this.sharedService.gridOptions.frozenColumn) !== null && _c !== void 0 ? _c : -1;
            if (frozenColumnIndex >= 0 && frozenColumnIndex >= columnIndex) {
                this.sharedService.gridOptions.frozenColumn = frozenColumnIndex - 1;
                this.sharedService.slickGrid.setOptions({ frozenColumn: this.sharedService.gridOptions.frozenColumn });
            }
            // then proceed with hiding the column in SlickGrid & trigger an event when done
            const visibleColumns = (0, utils_1.arrayRemoveItemByIndex)(currentVisibleColumns, columnIndex);
            this.sharedService.visibleColumns = visibleColumns;
            this.sharedService.slickGrid.setColumns(visibleColumns);
            this.pubSubService.publish('onHeaderMenuHideColumns', { columns: visibleColumns, hiddenColumn: column });
        }
    }
    /** Hide the Header Menu */
    hideMenu() {
        var _a, _b;
        this.disposeSubMenus();
        (_a = this._menuElm) === null || _a === void 0 ? void 0 : _a.remove();
        this._menuElm = undefined;
        (_b = this._activeHeaderColumnElm) === null || _b === void 0 ? void 0 : _b.classList.remove('slick-header-column-active');
    }
    repositionSubMenu(e, item, level, columnDef) {
        // creating sub-menu, we'll also pass level & the item object since we might have "subMenuTitle" to show
        const subMenuElm = this.createCommandMenu(item.commandItems || item.items || [], columnDef, level + 1, item);
        document.body.appendChild(subMenuElm);
        this.repositionMenu(e, subMenuElm);
    }
    repositionMenu(e, menuElm) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k;
        const buttonElm = e.target; // get header button createElement
        const isSubMenu = menuElm.classList.contains('slick-submenu');
        const parentElm = isSubMenu
            ? e.target.closest('.slick-menu-item')
            : buttonElm;
        const relativePos = (0, index_2.getElementOffsetRelativeToParent)(this.sharedService.gridContainerElement, buttonElm);
        const gridPos = this.grid.getGridPosition();
        const menuWidth = menuElm.offsetWidth;
        const parentOffset = (0, index_2.getHtmlElementOffset)(parentElm);
        let menuOffsetLeft = isSubMenu ? (_a = parentOffset === null || parentOffset === void 0 ? void 0 : parentOffset.left) !== null && _a !== void 0 ? _a : 0 : (_b = relativePos === null || relativePos === void 0 ? void 0 : relativePos.left) !== null && _b !== void 0 ? _b : 0;
        let menuOffsetTop = isSubMenu
            ? (_c = parentOffset === null || parentOffset === void 0 ? void 0 : parentOffset.top) !== null && _c !== void 0 ? _c : 0
            : ((_d = relativePos === null || relativePos === void 0 ? void 0 : relativePos.top) !== null && _d !== void 0 ? _d : 0) + ((_g = (_f = this.addonOptions) === null || _f === void 0 ? void 0 : _f.menuOffsetTop) !== null && _g !== void 0 ? _g : 0) + buttonElm.clientHeight;
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
        // when auto-align is set, it will calculate whether it has enough space in the viewport to show the drop menu on the right (default)
        // if there isn't enough space on the right, it will automatically align the drop menu to the left
        // to simulate an align left, we actually need to know the width of the drop menu
        if (isSubMenu && parentElm) {
            // sub-menu
            const subMenuPosCalc = menuOffsetLeft + Number(menuWidth) + parentElm.clientWidth; // calculate coordinate at caller element far right
            const browserWidth = document.documentElement.clientWidth;
            const dropSide = (subMenuPosCalc >= gridPos.width || subMenuPosCalc >= browserWidth) ? 'left' : 'right';
            if (dropSide === 'left') {
                menuElm.classList.remove('dropright');
                menuElm.classList.add('dropleft');
                menuOffsetLeft -= menuWidth;
            }
            else {
                menuElm.classList.remove('dropleft');
                menuElm.classList.add('dropright');
                menuOffsetLeft += parentElm.offsetWidth;
            }
        }
        else {
            // parent menu
            menuOffsetLeft = (_h = relativePos === null || relativePos === void 0 ? void 0 : relativePos.left) !== null && _h !== void 0 ? _h : 0;
            if (this.addonOptions.autoAlign && ((gridPos === null || gridPos === void 0 ? void 0 : gridPos.width) && (menuOffsetLeft + ((_j = menuElm.clientWidth) !== null && _j !== void 0 ? _j : 0)) >= gridPos.width)) {
                menuOffsetLeft = menuOffsetLeft + buttonElm.clientWidth - menuElm.clientWidth + (((_k = this.addonOptions) === null || _k === void 0 ? void 0 : _k.autoAlignOffset) || 0);
            }
        }
        // ready to reposition the menu
        menuElm.style.top = `${menuOffsetTop}px`;
        menuElm.style.left = `${menuOffsetLeft}px`;
        // mark the header as active to keep the highlighting.
        this._activeHeaderColumnElm = this.grid.getContainerNode().querySelector(`:not(.slick-preheader-panel) >.slick-header-columns`);
        if (this._activeHeaderColumnElm) {
            this._activeHeaderColumnElm.classList.add('slick-header-column-active');
        }
    }
    /** Translate the Header Menu titles, we need to loop through all column definition to re-translate them */
    translateHeaderMenu() {
        var _a;
        if ((_a = this.sharedService.gridOptions) === null || _a === void 0 ? void 0 : _a.headerMenu) {
            this.resetHeaderMenuTranslations(this.sharedService.visibleColumns);
        }
    }
    // --
    // event handlers
    // ------------------
    /**
     * Event handler when column title header are being rendered
     * @param {Object} event - The event
     * @param {Object} args - object arguments
     */
    handleHeaderCellRendered(_e, args) {
        var _a;
        const column = args.column;
        const menu = (_a = column.header) === null || _a === void 0 ? void 0 : _a.menu;
        if (menu === null || menu === void 0 ? void 0 : menu.items) {
            console.warn('[Slickgrid-Universal] Header Menu "items" property was deprecated in favor of "commandItems" to align with all other Menu plugins.');
        }
        if (menu && args.node) {
            // run the override function (when defined), if the result is false we won't go further
            if (!this.extensionUtility.runOverrideFunctionWhenExists(this.addonOptions.menuUsabilityOverride, args)) {
                return;
            }
            const headerButtonDivElm = (0, index_2.createDomElement)('div', { className: 'slick-header-menu-button', ariaLabel: 'Header Menu' }, args.node);
            if (this.addonOptions.buttonCssClass) {
                headerButtonDivElm.classList.add(...this.addonOptions.buttonCssClass.split(' '));
            }
            if (this.addonOptions.tooltip) {
                headerButtonDivElm.title = this.addonOptions.tooltip;
            }
            // show the header menu dropdown list of commands
            this._bindEventService.bind(headerButtonDivElm, 'click', ((e) => {
                this.disposeAllMenus(); // make there's only 1 parent menu opened at a time
                this.createParentMenu(e, args.column, menu);
            }));
        }
    }
    /**
     * Event handler before the header cell is being destroyed
     * @param {Object} event - The event
     * @param {Object} args.column - The column definition
     */
    handleBeforeHeaderCellDestroy(_e, args) {
        var _a;
        const column = args.column;
        if ((_a = column.header) === null || _a === void 0 ? void 0 : _a.menu) {
            // Removing buttons will also clean up any event handlers and data.
            // NOTE: If you attach event handlers directly or using a different framework,
            //       you must also clean them up here to avoid events leaking.
            args.node.querySelectorAll('.slick-header-menu-button').forEach(elm => elm.remove());
        }
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
            if (this._menuElm !== e.target && !isMenuClicked && !e.defaultPrevented || (e.target.className === 'close' && parentMenuElm)) {
                this.hideMenu();
            }
        }
    }
    handleMenuItemCommandClick(event, _type, item, level = 0, columnDef) {
        var _a;
        if (item !== 'divider' && !item.disabled && !item.divider) {
            const command = item.command || '';
            if (command && !item.commandItems && !item.items) {
                const callbackArgs = {
                    grid: this.grid,
                    command: item.command,
                    column: columnDef,
                    item,
                };
                // execute Grid Menu callback with command,
                // we'll also execute optional user defined onCommand callback when provided
                this.executeHeaderMenuInternalCommands(event, callbackArgs);
                this.pubSubService.publish('onHeaderMenuCommand', callbackArgs);
                if (typeof ((_a = this.addonOptions) === null || _a === void 0 ? void 0 : _a.onCommand) === 'function') {
                    this.addonOptions.onCommand(event, callbackArgs);
                }
                // execute action callback when defined
                if (typeof item.action === 'function') {
                    item.action.call(this, event, callbackArgs);
                }
                // does the user want to leave open the Grid Menu after executing a command?
                if (!event.defaultPrevented) {
                    this.hideMenu();
                }
                // Stop propagation so that it doesn't register as a header click event.
                event.preventDefault();
                event.stopPropagation();
            }
            else if (item.commandItems || item.items) {
                this.repositionSubMenu(event, item, level, columnDef);
            }
        }
    }
    handleMenuItemMouseOver(e, _type, item, level = 0, columnDef) {
        if (item !== 'divider' && !item.disabled && !item.divider) {
            if (item.commandItems || item.items) {
                this.repositionSubMenu(e, item, level, columnDef);
            }
            else if (level === 0) {
                this.disposeSubMenus();
            }
        }
    }
    // --
    // protected functions
    // ------------------
    /**
     * Create Header Menu with Custom Commands if user has enabled Header Menu
     * @param gridOptions
     * @param columnDefinitions
     * @return header menu
     */
    addHeaderMenuCustomCommands(columnDefinitions) {
        const gridOptions = this.sharedService.gridOptions;
        const headerMenuOptions = gridOptions.headerMenu || {};
        const translationPrefix = (0, index_2.getTranslationPrefix)(gridOptions);
        if (Array.isArray(columnDefinitions) && gridOptions.enableHeaderMenu) {
            columnDefinitions.forEach((columnDef) => {
                var _a, _b, _c, _d, _f, _g;
                if (columnDef && !columnDef.excludeFromHeaderMenu) {
                    if (!columnDef.header) {
                        columnDef.header = {
                            menu: {
                                commandItems: []
                            }
                        };
                    }
                    else if (!columnDef.header.menu) {
                        // we might have header buttons without header menu,
                        // so only initialize the header menu without overwrite header buttons
                        columnDef.header.menu = { commandItems: [] };
                    }
                    const columnHeaderMenuItems = (_g = (_c = (_b = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.header) === null || _a === void 0 ? void 0 : _a.menu) === null || _b === void 0 ? void 0 : _b.commandItems) !== null && _c !== void 0 ? _c : (_f = (_d = columnDef === null || columnDef === void 0 ? void 0 : columnDef.header) === null || _d === void 0 ? void 0 : _d.menu) === null || _f === void 0 ? void 0 : _f.items) !== null && _g !== void 0 ? _g : [];
                    // Freeze Column (pinning)
                    let hasFrozenOrResizeCommand = false;
                    if (headerMenuOptions && !headerMenuOptions.hideFreezeColumnsCommand) {
                        hasFrozenOrResizeCommand = true;
                        if (!columnHeaderMenuItems.some(item => item !== 'divider' && (item === null || item === void 0 ? void 0 : item.command) === 'freeze-columns')) {
                            columnHeaderMenuItems.push({
                                iconCssClass: headerMenuOptions.iconFreezeColumns || 'fa fa-thumb-tack',
                                titleKey: `${translationPrefix}FREEZE_COLUMNS`,
                                command: 'freeze-columns',
                                positionOrder: 47
                            });
                        }
                    }
                    // Column Resize by Content (column autofit)
                    if (headerMenuOptions && !headerMenuOptions.hideColumnResizeByContentCommand && this.sharedService.gridOptions.enableColumnResizeOnDoubleClick) {
                        hasFrozenOrResizeCommand = true;
                        if (!columnHeaderMenuItems.some(item => item !== 'divider' && (item === null || item === void 0 ? void 0 : item.command) === 'column-resize-by-content')) {
                            columnHeaderMenuItems.push({
                                iconCssClass: headerMenuOptions.iconColumnResizeByContentCommand || 'fa fa-arrows-h',
                                titleKey: `${translationPrefix}COLUMN_RESIZE_BY_CONTENT`,
                                command: 'column-resize-by-content',
                                positionOrder: 48
                            });
                        }
                    }
                    // add a divider (separator) between the top freeze columns commands and the rest of the commands
                    if (hasFrozenOrResizeCommand && !columnHeaderMenuItems.some(item => item !== 'divider' && item.positionOrder === 49)) {
                        columnHeaderMenuItems.push({ divider: true, command: '', positionOrder: 49 });
                    }
                    // Sorting Commands
                    if (gridOptions.enableSorting && columnDef.sortable && headerMenuOptions && !headerMenuOptions.hideSortCommands) {
                        if (!columnHeaderMenuItems.some(item => item !== 'divider' && (item === null || item === void 0 ? void 0 : item.command) === 'sort-asc')) {
                            columnHeaderMenuItems.push({
                                iconCssClass: headerMenuOptions.iconSortAscCommand || 'fa fa-sort-asc',
                                titleKey: `${translationPrefix}SORT_ASCENDING`,
                                command: 'sort-asc',
                                positionOrder: 50
                            });
                        }
                        if (!columnHeaderMenuItems.some(item => item !== 'divider' && (item === null || item === void 0 ? void 0 : item.command) === 'sort-desc')) {
                            columnHeaderMenuItems.push({
                                iconCssClass: headerMenuOptions.iconSortDescCommand || 'fa fa-sort-desc',
                                titleKey: `${translationPrefix}SORT_DESCENDING`,
                                command: 'sort-desc',
                                positionOrder: 51
                            });
                        }
                        // add a divider (separator) between the top sort commands and the other clear commands
                        if (!columnHeaderMenuItems.some(item => item !== 'divider' && item.positionOrder === 52)) {
                            columnHeaderMenuItems.push({ divider: true, command: '', positionOrder: 52 });
                        }
                        if (!headerMenuOptions.hideClearSortCommand && !columnHeaderMenuItems.some(item => item !== 'divider' && (item === null || item === void 0 ? void 0 : item.command) === 'clear-sort')) {
                            columnHeaderMenuItems.push({
                                iconCssClass: headerMenuOptions.iconClearSortCommand || 'fa fa-unsorted',
                                titleKey: `${translationPrefix}REMOVE_SORT`,
                                command: 'clear-sort',
                                positionOrder: 54
                            });
                        }
                    }
                    // Filtering Commands
                    if (gridOptions.enableFiltering && columnDef.filterable && headerMenuOptions && !headerMenuOptions.hideFilterCommand) {
                        if (!headerMenuOptions.hideClearFilterCommand && !columnHeaderMenuItems.some(item => item !== 'divider' && (item === null || item === void 0 ? void 0 : item.command) === 'clear-filter')) {
                            columnHeaderMenuItems.push({
                                iconCssClass: headerMenuOptions.iconClearFilterCommand || 'fa fa-filter',
                                titleKey: `${translationPrefix}REMOVE_FILTER`,
                                command: 'clear-filter',
                                positionOrder: 53
                            });
                        }
                    }
                    // Hide Column Command
                    if (headerMenuOptions && !headerMenuOptions.hideColumnHideCommand && !columnHeaderMenuItems.some(item => item !== 'divider' && (item === null || item === void 0 ? void 0 : item.command) === 'hide-column')) {
                        columnHeaderMenuItems.push({
                            iconCssClass: headerMenuOptions.iconColumnHideCommand || 'fa fa-times',
                            titleKey: `${translationPrefix}HIDE_COLUMN`,
                            command: 'hide-column',
                            positionOrder: 55
                        });
                    }
                    this.extensionUtility.translateMenuItemsFromTitleKey(columnHeaderMenuItems);
                    this.extensionUtility.sortItems(columnHeaderMenuItems, 'positionOrder');
                }
            });
        }
        return headerMenuOptions;
    }
    /** Clear the Filter on the current column (if it's actually filtered) */
    clearColumnFilter(event, args) {
        if (args === null || args === void 0 ? void 0 : args.column) {
            this.filterService.clearFilterByColumnId(event, args.column.id);
        }
    }
    /** Clear the Sort on the current column (if it's actually sorted) */
    clearColumnSort(event, args) {
        if ((args === null || args === void 0 ? void 0 : args.column) && this.sharedService) {
            this.sortService.clearSortByColumnId(event, args.column.id);
        }
    }
    /** Execute the Header Menu Commands that was triggered by the onCommand subscribe */
    executeHeaderMenuInternalCommands(event, args) {
        var _a;
        if (args === null || args === void 0 ? void 0 : args.command) {
            switch (args.command) {
                case 'hide-column':
                    this.hideColumn(args.column);
                    if ((_a = this.sharedService.gridOptions) === null || _a === void 0 ? void 0 : _a.enableAutoSizeColumns) {
                        this.sharedService.slickGrid.autosizeColumns();
                    }
                    break;
                case 'clear-filter':
                    this.clearColumnFilter(event, args);
                    break;
                case 'clear-sort':
                    this.clearColumnSort(event, args);
                    break;
                case 'column-resize-by-content':
                    this.pubSubService.publish('onHeaderMenuColumnResizeByContent', { columnId: args.column.id });
                    break;
                case 'freeze-columns':
                    const visibleColumns = [...this.sharedService.visibleColumns];
                    const columnPosition = visibleColumns.findIndex(col => col.id === args.column.id);
                    const newGridOptions = { frozenColumn: columnPosition, enableMouseWheelScrollHandler: true };
                    // to circumvent a bug in SlickGrid core lib, let's keep the columns positions ref and re-apply them after calling setOptions
                    // the bug is highlighted in this issue comment:: https://github.com/6pac/SlickGrid/issues/592#issuecomment-822885069
                    const previousColumnDefinitions = this.sharedService.slickGrid.getColumns();
                    this.sharedService.slickGrid.setOptions(newGridOptions, false, true); // suppress the setColumns (3rd argument) since we'll do that ourselves
                    this.sharedService.gridOptions.frozenColumn = newGridOptions.frozenColumn;
                    this.sharedService.gridOptions.enableMouseWheelScrollHandler = newGridOptions.enableMouseWheelScrollHandler;
                    this.sharedService.frozenVisibleColumnId = args.column.id;
                    // to freeze columns, we need to take only the visible columns and we also need to use setColumns() when some of them are hidden
                    // to make sure that we only use the visible columns, not doing this will have the undesired effect of showing back some of the hidden columns
                    if (this.sharedService.hasColumnsReordered || (Array.isArray(visibleColumns) && Array.isArray(this.sharedService.allColumns) && visibleColumns.length !== this.sharedService.allColumns.length)) {
                        this.sharedService.slickGrid.setColumns(visibleColumns);
                    }
                    else {
                        // to circumvent a bug in SlickGrid core lib re-apply same column definitions that were backend up before calling setOptions()
                        this.sharedService.slickGrid.setColumns(previousColumnDefinitions);
                    }
                    // we also need to autosize columns if the option is enabled
                    const gridOptions = this.sharedService.slickGrid.getOptions();
                    if (gridOptions.enableAutoSizeColumns) {
                        this.sharedService.slickGrid.autosizeColumns();
                    }
                    break;
                case 'sort-asc':
                case 'sort-desc':
                    const isSortingAsc = (args.command === 'sort-asc');
                    this.sortColumn(event, args, isSortingAsc);
                    break;
                default:
                    break;
            }
        }
    }
    createParentMenu(e, columnDef, menu) {
        var _a, _b, _c, _d, _f;
        // let the user modify the menu or cancel altogether,
        // or provide alternative menu implementation.
        const callbackArgs = {
            grid: this.grid,
            column: columnDef,
            menu
        };
        // execute optional callback method defined by the user, if it returns false then we won't go further and not open the grid menu
        if (typeof e.stopPropagation === 'function') {
            this.pubSubService.publish('onHeaderMenuBeforeMenuShow', callbackArgs);
            if (typeof ((_a = this.addonOptions) === null || _a === void 0 ? void 0 : _a.onBeforeMenuShow) === 'function' && ((_b = this.addonOptions) === null || _b === void 0 ? void 0 : _b.onBeforeMenuShow(e, callbackArgs)) === false) {
                return;
            }
        }
        // create 1st parent menu container & reposition it
        this._menuElm = this.createCommandMenu((menu.commandItems || menu.items), columnDef);
        (_c = this.grid.getContainerNode()) === null || _c === void 0 ? void 0 : _c.appendChild(this._menuElm);
        this.repositionMenu(e, this._menuElm);
        // execute optional callback method defined by the user
        this.pubSubService.publish('onHeaderMenuAfterMenuShow', callbackArgs);
        if (typeof ((_d = this.addonOptions) === null || _d === void 0 ? void 0 : _d.onAfterMenuShow) === 'function' && ((_f = this.addonOptions) === null || _f === void 0 ? void 0 : _f.onAfterMenuShow(e, callbackArgs)) === false) {
            return;
        }
        // Stop propagation so that it doesn't register as a header click event.
        e.preventDefault();
        e.stopPropagation();
    }
    /** Create the menu or sub-menu(s) but without the column picker which is a separate single process */
    createCommandMenu(commandItems, columnDef, level = 0, item) {
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
        const menuClasses = `${this.menuCssClass} slick-menu-level-${level} ${this.gridUid}`;
        const bodyMenuElm = document.body.querySelector(`.${this.menuCssClass}.slick-menu-level-${level}${this.gridUidSelector}`);
        // return menu/sub-menu if it's already opened unless we are on different sub-menu tree if so close them all
        if (bodyMenuElm) {
            if (bodyMenuElm.dataset.subMenuParent === subMenuId) {
                return bodyMenuElm;
            }
            this.disposeSubMenus();
        }
        const menuElm = (0, index_2.createDomElement)('div', {
            ariaExpanded: 'true',
            ariaLabel: level > 1 ? 'SubMenu' : 'Header Menu',
            role: 'menu',
            className: menuClasses,
            style: { minWidth: `${this.addonOptions.minWidth}px` },
        });
        if (level > 0) {
            menuElm.classList.add('slick-submenu');
            if (subMenuId) {
                menuElm.dataset.subMenuParent = subMenuId;
            }
        }
        const commandMenuElm = (0, index_2.createDomElement)('div', { className: `${this._menuCssPrefix}-command-list`, role: 'menu' }, menuElm);
        const callbackArgs = {
            grid: this.grid,
            column: columnDef,
            level,
            menu: { commandItems }
        };
        // when creating sub-menu also add its sub-menu title when exists
        if (item && level > 0) {
            this.addSubMenuTitleWhenExists(item, commandMenuElm); // add sub-menu title when exists
        }
        this.populateCommandOrOptionItems('command', this.addonOptions, commandMenuElm, commandItems, callbackArgs, this.handleMenuItemCommandClick, this.handleMenuItemMouseOver);
        // increment level for possible next sub-menus if exists
        level++;
        return menuElm;
    }
    /**
     * Reset all the internal Menu options which have text to translate
     * @param header menu object
     */
    resetHeaderMenuTranslations(columnDefinitions) {
        columnDefinitions.forEach((columnDef) => {
            var _a, _b, _c, _d, _f;
            if (((_c = (_b = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.header) === null || _a === void 0 ? void 0 : _a.menu) === null || _b === void 0 ? void 0 : _b.commandItems) !== null && _c !== void 0 ? _c : (_f = (_d = columnDef === null || columnDef === void 0 ? void 0 : columnDef.header) === null || _d === void 0 ? void 0 : _d.menu) === null || _f === void 0 ? void 0 : _f.items) && !columnDef.excludeFromHeaderMenu) {
                const columnHeaderMenuItems = columnDef.header.menu.commandItems || columnDef.header.menu.items || [];
                this.extensionUtility.translateMenuItemsFromTitleKey(columnHeaderMenuItems);
            }
        });
    }
    /** Sort the current column */
    sortColumn(event, args, isSortingAsc = true) {
        if (args === null || args === void 0 ? void 0 : args.column) {
            // get previously sorted columns
            const columnDef = args.column;
            // 1- get the sort columns without the current column, in the case of a single sort that would equal to an empty array
            const tmpSortedColumns = !this.sharedService.gridOptions.multiColumnSort ? [] : this.sortService.getCurrentColumnSorts(columnDef.id + '');
            let emitterType = index_1.EmitterType.local;
            // 2- add to the column array, the new sorted column by the header menu
            tmpSortedColumns.push({ columnId: columnDef.id, sortCol: columnDef, sortAsc: isSortingAsc });
            if (this.sharedService.gridOptions.backendServiceApi) {
                this.sortService.onBackendSortChanged(event, { multiColumnSort: true, sortCols: tmpSortedColumns, grid: this.sharedService.slickGrid });
                emitterType = index_1.EmitterType.remote;
            }
            else if (this.sharedService.dataView) {
                this.sortService.onLocalSortChanged(this.sharedService.slickGrid, tmpSortedColumns);
                emitterType = index_1.EmitterType.local;
            }
            else {
                // when using customDataView, we will simply send it as a onSort event with notify
                args.grid.onSort.notify(tmpSortedColumns);
            }
            // update the sharedService.slickGrid sortColumns array which will at the same add the visual sort icon(s) on the UI
            const newSortColumns = tmpSortedColumns.map(col => {
                var _a, _b, _c;
                return {
                    columnId: (_b = (_a = col === null || col === void 0 ? void 0 : col.sortCol) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '',
                    sortAsc: (_c = col === null || col === void 0 ? void 0 : col.sortAsc) !== null && _c !== void 0 ? _c : true,
                };
            });
            // add sort icon in UI
            this.sharedService.slickGrid.setSortColumns(newSortColumns);
            // if we have an emitter type set, we will emit a sort changed
            // for the Grid State Service to see the change.
            // We also need to pass current sorters changed to the emitSortChanged method
            if (emitterType) {
                const currentLocalSorters = [];
                newSortColumns.forEach((sortCol) => {
                    currentLocalSorters.push({
                        columnId: `${sortCol.columnId}`,
                        direction: sortCol.sortAsc ? 'ASC' : 'DESC'
                    });
                });
                this.sortService.emitSortChanged(emitterType, currentLocalSorters);
            }
        }
    }
}
exports.SlickHeaderMenu = SlickHeaderMenu;
//# sourceMappingURL=slickHeaderMenu.js.map