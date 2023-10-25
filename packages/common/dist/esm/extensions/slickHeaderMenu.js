import { arrayRemoveItemByIndex } from '@slickgrid-universal/utils';
import { EmitterType } from '../enums/index';
import { createDomElement, emptyElement, getElementOffsetRelativeToParent, getTranslationPrefix } from '../services/index';
import { MenuBaseClass } from './menuBaseClass';
/**
 * A plugin to add drop-down menus to column headers.
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.columnDefinitions = [{
 *     id: 'myColumn', name: 'My column',
 *     header: {
 *       menu: {
 *         items: [{ ...menu item options... }, { ...menu item options... }]
 *       }
 *     }
 *   }];
 */
export class SlickHeaderMenu extends MenuBaseClass {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility, filterService, pubSubService, sharedService, sortService) {
        super(extensionUtility, pubSubService, sharedService);
        this.extensionUtility = extensionUtility;
        this.filterService = filterService;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this.sortService = sortService;
        this._defaults = {
            autoAlign: true,
            autoAlignOffset: 0,
            buttonCssClass: null,
            buttonImage: null,
            minWidth: 100,
            hideColumnHideCommand: false,
            hideSortCommands: false,
            title: '',
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
        this._bindEventService.bind(document.body, 'mousedown', this.handleBodyMouseDown.bind(this));
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
            const visibleColumns = arrayRemoveItemByIndex(currentVisibleColumns, columnIndex);
            this.sharedService.visibleColumns = visibleColumns;
            this.sharedService.slickGrid.setColumns(visibleColumns);
            this.pubSubService.publish('onHeaderMenuHideColumns', { columns: visibleColumns, hiddenColumn: column });
        }
    }
    /** Hide the Header Menu */
    hideMenu() {
        var _a, _b;
        (_a = this._menuElm) === null || _a === void 0 ? void 0 : _a.remove();
        this._menuElm = undefined;
        (_b = this._activeHeaderColumnElm) === null || _b === void 0 ? void 0 : _b.classList.remove('slick-header-column-active');
    }
    showMenu(e, columnDef, menu) {
        var _a, _b, _c;
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
        if (!this._menuElm) {
            this._menuElm = createDomElement('div', {
                ariaExpanded: 'true',
                className: 'slick-header-menu', role: 'menu',
                style: { minWidth: `${this.addonOptions.minWidth}px` },
            });
            (_c = this.grid.getContainerNode()) === null || _c === void 0 ? void 0 : _c.appendChild(this._menuElm);
        }
        // make sure the menu element is an empty div before adding all list of commands
        emptyElement(this._menuElm);
        this.populateHeaderMenuCommandList(e, menu, callbackArgs);
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
        if (menu && args.node) {
            // run the override function (when defined), if the result is false we won't go further
            if (!this.extensionUtility.runOverrideFunctionWhenExists(this.addonOptions.menuUsabilityOverride, args)) {
                return;
            }
            const headerButtonDivElm = createDomElement('div', { className: 'slick-header-menu-button', ariaLabel: 'Header Menu' }, args.node);
            if (this.addonOptions.buttonCssClass) {
                headerButtonDivElm.classList.add(...this.addonOptions.buttonCssClass.split(' '));
            }
            if (this.addonOptions.tooltip) {
                headerButtonDivElm.title = this.addonOptions.tooltip;
            }
            // show the header menu dropdown list of commands
            this._bindEventService.bind(headerButtonDivElm, 'click', ((e) => this.showMenu(e, column, menu)));
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
            //       you must also clean them up here to avoid memory leaks.
            args.node.querySelectorAll('.slick-header-menu-button').forEach(elm => elm.remove());
        }
    }
    /** Mouse down handler when clicking anywhere in the DOM body */
    handleBodyMouseDown(e) {
        var _a;
        if ((this._menuElm !== e.target && !((_a = this._menuElm) === null || _a === void 0 ? void 0 : _a.contains(e.target))) || e.target.className === 'close') {
            this.hideMenu();
        }
    }
    handleMenuItemCommandClick(event, _type, item, columnDef) {
        var _a;
        if (item === 'divider' || item.command && (item.disabled || item.divider)) {
            return false;
        }
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
        const translationPrefix = getTranslationPrefix(gridOptions);
        if (Array.isArray(columnDefinitions) && gridOptions.enableHeaderMenu) {
            columnDefinitions.forEach((columnDef) => {
                var _a, _b, _c;
                if (columnDef && !columnDef.excludeFromHeaderMenu) {
                    if (!columnDef.header) {
                        columnDef.header = {
                            menu: {
                                items: []
                            }
                        };
                    }
                    else if (!columnDef.header.menu) {
                        // we might have header buttons without header menu,
                        // so only initialize the header menu without overwrite header buttons
                        columnDef.header.menu = { items: [] };
                    }
                    const columnHeaderMenuItems = (_c = (_b = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.header) === null || _a === void 0 ? void 0 : _a.menu) === null || _b === void 0 ? void 0 : _b.items) !== null && _c !== void 0 ? _c : [];
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
    populateHeaderMenuCommandList(e, menu, args) {
        var _a, _b;
        this.populateCommandOrOptionItems('command', this.addonOptions, this._menuElm, menu.items, args, this.handleMenuItemCommandClick);
        this.repositionMenu(e);
        // execute optional callback method defined by the user
        this.pubSubService.publish('onHeaderMenuAfterMenuShow', args);
        if (typeof ((_a = this.addonOptions) === null || _a === void 0 ? void 0 : _a.onAfterMenuShow) === 'function' && ((_b = this.addonOptions) === null || _b === void 0 ? void 0 : _b.onAfterMenuShow(e, args)) === false) {
            return;
        }
        // Stop propagation so that it doesn't register as a header click event.
        e.preventDefault();
        e.stopPropagation();
    }
    repositionMenu(e) {
        var _a, _b, _c, _d, _f, _g, _h, _j;
        const buttonElm = e.target; // get header button createElement
        if (this._menuElm && buttonElm.classList.contains('slick-header-menu-button')) {
            const relativePos = getElementOffsetRelativeToParent(this.sharedService.gridContainerElement, buttonElm);
            let leftPos = (_a = relativePos === null || relativePos === void 0 ? void 0 : relativePos.left) !== null && _a !== void 0 ? _a : 0;
            // when auto-align is set, it will calculate whether it has enough space in the viewport to show the drop menu on the right (default)
            // if there isn't enough space on the right, it will automatically align the drop menu to the left
            // to simulate an align left, we actually need to know the width of the drop menu
            if (this.addonOptions.autoAlign) {
                const gridPos = this.grid.getGridPosition();
                if ((gridPos === null || gridPos === void 0 ? void 0 : gridPos.width) && (leftPos + ((_b = this._menuElm.clientWidth) !== null && _b !== void 0 ? _b : 0)) >= gridPos.width) {
                    leftPos = leftPos + buttonElm.clientWidth - this._menuElm.clientWidth + ((_d = (_c = this.addonOptions) === null || _c === void 0 ? void 0 : _c.autoAlignOffset) !== null && _d !== void 0 ? _d : 0);
                }
            }
            this._menuElm.style.top = `${((_f = relativePos === null || relativePos === void 0 ? void 0 : relativePos.top) !== null && _f !== void 0 ? _f : 0) + ((_h = (_g = this.addonOptions) === null || _g === void 0 ? void 0 : _g.menuOffsetTop) !== null && _h !== void 0 ? _h : 0) + buttonElm.clientHeight}px`;
            this._menuElm.style.left = `${leftPos}px`;
            // mark the header as active to keep the highlighting.
            this._activeHeaderColumnElm = this._menuElm.closest('.slick-header-column');
            (_j = this._activeHeaderColumnElm) === null || _j === void 0 ? void 0 : _j.classList.add('slick-header-column-active');
        }
    }
    /**
     * Reset all the internal Menu options which have text to translate
     * @param header menu object
     */
    resetHeaderMenuTranslations(columnDefinitions) {
        columnDefinitions.forEach((columnDef) => {
            var _a, _b;
            if (((_b = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.header) === null || _a === void 0 ? void 0 : _a.menu) === null || _b === void 0 ? void 0 : _b.items) && !columnDef.excludeFromHeaderMenu) {
                const columnHeaderMenuItems = columnDef.header.menu.items || [];
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
            let emitterType = EmitterType.local;
            // 2- add to the column array, the new sorted column by the header menu
            tmpSortedColumns.push({ columnId: columnDef.id, sortCol: columnDef, sortAsc: isSortingAsc });
            if (this.sharedService.gridOptions.backendServiceApi) {
                this.sortService.onBackendSortChanged(event, { multiColumnSort: true, sortCols: tmpSortedColumns, grid: this.sharedService.slickGrid });
                emitterType = EmitterType.remote;
            }
            else if (this.sharedService.dataView) {
                this.sortService.onLocalSortChanged(this.sharedService.slickGrid, tmpSortedColumns);
                emitterType = EmitterType.local;
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
//# sourceMappingURL=slickHeaderMenu.js.map