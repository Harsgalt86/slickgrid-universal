import { titleCase } from '@slickgrid-universal/utils';
import { calculateAvailableSpace, createDomElement, findWidthOrDefault, getHtmlElementOffset, } from '../services/domUtilities';
import { MenuBaseClass } from './menuBaseClass';
export class MenuFromCellBaseClass extends MenuBaseClass {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility, pubSubService, sharedService) {
        super(extensionUtility, pubSubService, sharedService);
        this.extensionUtility = extensionUtility;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this._currentCell = -1;
        this._currentRow = -1;
        this._lastMenuTypeClicked = '';
        this._subMenuParentId = '';
    }
    createParentMenu(event) {
        var _a, _b, _c, _d, _e, _f, _g;
        (_a = this.menuElement) === null || _a === void 0 ? void 0 : _a.remove();
        this._menuElm = undefined;
        const cell = this.grid.getCellFromEvent(event);
        if (cell) {
            this._currentCell = (_b = cell.cell) !== null && _b !== void 0 ? _b : 0;
            this._currentRow = (_c = cell.row) !== null && _c !== void 0 ? _c : 0;
            const commandItems = ((_d = this._addonOptions) === null || _d === void 0 ? void 0 : _d.commandItems) || [];
            const optionItems = ((_e = this._addonOptions) === null || _e === void 0 ? void 0 : _e.optionItems) || [];
            // Let the user modify the menu or cancel altogether,
            // or provide alternative menu implementation.
            const callbackArgs = {
                cell: this._currentCell,
                row: this._currentRow,
                grid: this.grid,
                // menu: this._pluginOptions,
            };
            // delete any prior Menu
            this.closeMenu(event, callbackArgs);
            // execute optional callback method defined by the user, if it returns false then we won't go further and not open the Menu
            if (typeof event.stopPropagation === 'function') {
                this.pubSubService.publish(`on${titleCase(this._camelPluginName)}BeforeMenuShow`, callbackArgs);
                if (typeof ((_f = this.addonOptions) === null || _f === void 0 ? void 0 : _f.onBeforeMenuShow) === 'function' && this.addonOptions.onBeforeMenuShow(event, callbackArgs) === false) {
                    return;
                }
            }
            // create 1st parent menu container & reposition it
            this._menuElm = this.createMenu(commandItems, optionItems);
            if (this._menuElm) {
                this._menuElm.style.top = `${event.pageY + 5}px`;
                this._menuElm.style.left = `${event.pageX}px`;
                this._menuElm.style.display = 'block';
                document.body.appendChild(this._menuElm);
            }
            // execute optional callback method defined by the user
            this.pubSubService.publish(`on${titleCase(this._camelPluginName)}AfterMenuShow`, callbackArgs);
            if (typeof ((_g = this.addonOptions) === null || _g === void 0 ? void 0 : _g.onAfterMenuShow) === 'function' && this.addonOptions.onAfterMenuShow(event, callbackArgs) === false) {
                return;
            }
        }
        return this._menuElm;
    }
    /**
     * Create parent menu or sub-menu(s), a parent menu will start at level 0 while sub-menu(s) will be incremented
     * @param commandItems - array of optional commands or dividers
     * @param optionItems - array of optional options or dividers
     * @param level - menu level
     * @param item - command, option or divider
     * @returns menu DOM element
     */
    createMenu(commandItems, optionItems, level = 0, item) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const columnDef = this.grid.getColumns()[this._currentCell];
        const dataContext = this.grid.getDataItem(this._currentRow);
        // to avoid having multiple sub-menu trees opened
        // we need to somehow keep trace of which parent menu the tree belongs to
        // and we should keep ref of only the first sub-menu parent, we can use the command name (remove any whitespaces though)
        const subMenuCommandOrOption = (item === null || item === void 0 ? void 0 : item.command) || (item === null || item === void 0 ? void 0 : item.option);
        let subMenuId = (level === 1 && subMenuCommandOrOption) ? String(subMenuCommandOrOption).replace(/\s/g, '') : '';
        if (subMenuId) {
            this._subMenuParentId = subMenuId;
        }
        if (level > 1) {
            subMenuId = this._subMenuParentId;
        }
        let isColumnOptionAllowed = true;
        let isColumnCommandAllowed = true;
        // make sure there's at least something to show before creating the Menu
        if (this._camelPluginName === 'contextMenu') {
            isColumnOptionAllowed = this.checkIsColumnAllowed((_b = (_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.optionShownOverColumnIds) !== null && _b !== void 0 ? _b : [], columnDef.id);
            isColumnCommandAllowed = this.checkIsColumnAllowed((_d = (_c = this._addonOptions) === null || _c === void 0 ? void 0 : _c.commandShownOverColumnIds) !== null && _d !== void 0 ? _d : [], columnDef.id);
            if (!columnDef || ((!isColumnCommandAllowed || !commandItems.length) && (!isColumnOptionAllowed || !optionItems.length))) {
                this.hideMenu();
                return;
            }
        }
        else {
            if (!columnDef || !columnDef.cellMenu || (!commandItems.length && !optionItems.length)) {
                return;
            }
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
        const menuElm = document.createElement('div');
        menuElm.className = menuClasses;
        if (level > 0) {
            menuElm.classList.add('slick-submenu');
            if (subMenuId) {
                menuElm.dataset.subMenuParent = subMenuId;
            }
        }
        const maxHeight = isNaN(this.addonOptions.maxHeight) ? this.addonOptions.maxHeight : `${(_e = this.addonOptions.maxHeight) !== null && _e !== void 0 ? _e : 0}px`;
        const maxWidth = isNaN(this.addonOptions.maxWidth) ? this.addonOptions.maxWidth : `${(_f = this.addonOptions.maxWidth) !== null && _f !== void 0 ? _f : 0}px`;
        if (maxHeight) {
            menuElm.style.maxHeight = maxHeight;
        }
        if (maxWidth) {
            menuElm.style.maxWidth = maxWidth;
        }
        if ((_g = this.addonOptions) === null || _g === void 0 ? void 0 : _g.width) {
            menuElm.style.width = findWidthOrDefault((_h = this.addonOptions) === null || _h === void 0 ? void 0 : _h.width);
        }
        const closeButtonElm = createDomElement('button', { ariaLabel: 'Close', className: 'close', type: 'button', textContent: '×', dataset: { dismiss: this._menuCssPrefix } });
        // -- Option List section
        if (!this.addonOptions.hideOptionSection && isColumnOptionAllowed && optionItems.length > 0) {
            const optionMenuElm = createDomElement('div', { className: `${this._menuCssPrefix}-option-list`, role: 'menu' }, menuElm);
            this.populateCommandOrOptionTitle('option', this.addonOptions, optionMenuElm, level);
            if (!this.addonOptions.hideCloseButton && level < 1) {
                this.populateCommandOrOptionCloseBtn('option', closeButtonElm, optionMenuElm);
            }
            // when creating sub-menu also add its sub-menu title when exists
            if (item && level > 0) {
                this.addSubMenuTitleWhenExists(item, optionMenuElm); // add sub-menu title when exists
            }
            this.populateCommandOrOptionItems('option', this.addonOptions, optionMenuElm, optionItems, { cell: this._currentCell, row: this._currentRow, column: columnDef, dataContext, grid: this.grid, level }, this.handleMenuItemCommandClick, this.handleMenuItemMouseOver);
        }
        // -- Command List section
        if (!this.addonOptions.hideCommandSection && isColumnCommandAllowed && commandItems.length > 0) {
            const commandMenuElm = createDomElement('div', { className: `${this._menuCssPrefix}-command-list`, role: 'menu' }, menuElm);
            this.populateCommandOrOptionTitle('command', this.addonOptions, commandMenuElm, level);
            if (!this.addonOptions.hideCloseButton && level < 1 && (!isColumnOptionAllowed || optionItems.length === 0 || this.addonOptions.hideOptionSection)) {
                this.populateCommandOrOptionCloseBtn('command', closeButtonElm, commandMenuElm);
            }
            // when creating sub-menu also add its sub-menu title when exists
            if (item && level > 0) {
                this.addSubMenuTitleWhenExists(item, commandMenuElm); // add sub-menu title when exists
            }
            this.populateCommandOrOptionItems('command', this.addonOptions, commandMenuElm, commandItems, { cell: this._currentCell, row: this._currentRow, column: columnDef, dataContext, grid: this.grid, level }, this.handleMenuItemCommandClick, this.handleMenuItemMouseOver);
        }
        // increment level for possible next sub-menus if exists
        level++;
        return menuElm;
    }
    closeMenu(e, args) {
        var _a;
        if (this.menuElement) {
            if (typeof ((_a = this.addonOptions) === null || _a === void 0 ? void 0 : _a.onBeforeMenuClose) === 'function' && this.addonOptions.onBeforeMenuClose(e, args) === false) {
                return;
            }
            this.hideMenu();
        }
    }
    /** Hide the Menu */
    hideMenu() {
        var _a;
        (_a = this.menuElement) === null || _a === void 0 ? void 0 : _a.remove();
        this._menuElm = null;
        this.disposeSubMenus();
    }
    // --
    // protected functions
    // ------------------
    checkIsColumnAllowed(columnIds, columnId) {
        if ((columnIds === null || columnIds === void 0 ? void 0 : columnIds.length) > 0) {
            return columnIds.findIndex(colId => colId === columnId) >= 0;
        }
        return true;
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
            if (this.menuElement !== e.target && !isMenuClicked && !e.defaultPrevented || (e.target.className === 'close' && parentMenuElm)) {
                this.closeMenu(e, { cell: this._currentCell, row: this._currentRow, grid: this.grid });
            }
        }
    }
    handleCloseButtonClicked(e) {
        if (!e.defaultPrevented) {
            this.closeMenu(e, { cell: 0, row: 0, grid: this.grid, });
        }
    }
    handleMenuItemMouseOver(e, type, item, level = 0) {
        if (item.commandItems || item.optionItems || item.items) {
            this.repositionSubMenu(item, type, level, e);
            this._lastMenuTypeClicked = type;
        }
        else if (level === 0) {
            this.disposeSubMenus();
        }
    }
    handleMenuItemCommandClick(event, type, item, level = 0) {
        var _a;
        if ((item === null || item === void 0 ? void 0 : item[type]) !== undefined && item !== 'divider' && !item.disabled && !item.divider && this._currentCell !== undefined && this._currentRow !== undefined) {
            if (type === 'option' && !this.grid.getEditorLock().commitCurrentEdit()) {
                return;
            }
            const cell = this._currentCell;
            const row = this._currentRow;
            const columnDef = this.grid.getColumns()[this._currentCell];
            const dataContext = this.grid.getDataItem(this._currentRow);
            const optionOrCommand = item[type] !== undefined ? item[type] : '';
            if (optionOrCommand !== undefined && !item[`${type}Items`]) {
                // user could execute a callback through 2 ways
                // via the onOptionSelected event and/or an action callback
                const callbackArgs = {
                    cell: this._currentCell,
                    row: this._currentRow,
                    grid: this.grid,
                    [type]: optionOrCommand,
                    item,
                    column: columnDef,
                    dataContext,
                };
                // execute Menu callback with command,
                // we'll also execute optional user defined onOptionSelected callback when provided
                const eventType = type === 'command' ? 'onCommand' : 'onOptionSelected';
                const eventName = `${this._camelPluginName}:${eventType}`;
                this.pubSubService.publish(eventName, callbackArgs);
                if (typeof ((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a[eventType]) === 'function') {
                    this._addonOptions[eventType](event, callbackArgs);
                }
                // execute action callback when defined
                if (typeof item.action === 'function') {
                    item.action.call(this, event, callbackArgs);
                }
                // does the user want to leave open the Cell Menu after executing a command?
                if (!event.defaultPrevented) {
                    this.closeMenu(event, { cell, row, grid: this.grid });
                }
            }
            else if (item.commandItems || item.optionItems) {
                this.repositionSubMenu(item, type, level, event);
            }
            this._lastMenuTypeClicked = type;
        }
    }
    populateCommandOrOptionCloseBtn(itemType, closeButtonElm, commandOrOptionMenuElm) {
        var _a;
        this._bindEventService.bind(closeButtonElm, 'click', ((e) => this.handleCloseButtonClicked(e)), undefined, 'parent-menu');
        const commandOrOptionMenuHeaderElm = (_a = commandOrOptionMenuElm.querySelector(`.slick-${itemType}-header`)) !== null && _a !== void 0 ? _a : createDomElement('div', { className: `slick-${itemType}-header` });
        commandOrOptionMenuHeaderElm === null || commandOrOptionMenuHeaderElm === void 0 ? void 0 : commandOrOptionMenuHeaderElm.appendChild(closeButtonElm);
        commandOrOptionMenuElm.appendChild(commandOrOptionMenuHeaderElm);
        commandOrOptionMenuHeaderElm.classList.add('with-close');
    }
    repositionSubMenu(item, type, level, e) {
        // when we're clicking a grid cell OR our last menu type (command/option) differs then we know that we need to start fresh and close any sub-menus that might still be open
        if (e.target.classList.contains('slick-cell') || this._lastMenuTypeClicked !== type) {
            this.disposeSubMenus();
        }
        // creating sub-menu, we'll also pass level & the item object since we might have "subMenuTitle" to show
        const subMenuElm = this.createMenu((item === null || item === void 0 ? void 0 : item.commandItems) || [], (item === null || item === void 0 ? void 0 : item.optionItems) || [], level + 1, item);
        if (subMenuElm) {
            subMenuElm.style.display = 'block';
            document.body.appendChild(subMenuElm);
            this.repositionMenu(e, subMenuElm);
        }
    }
    repositionMenu(event, menuElm) {
        var _a, _b, _c, _d, _e, _f;
        const isSubMenu = menuElm === null || menuElm === void 0 ? void 0 : menuElm.classList.contains('slick-submenu');
        const parentElm = isSubMenu
            ? event.target.closest(`.${this._menuCssPrefix}-item`)
            : event.target.closest('.slick-cell');
        if (menuElm && parentElm) {
            // move to 0,0 before calulating height/width since it could be cropped values
            // when element is outside browser viewport
            menuElm.style.top = `0px`;
            menuElm.style.left = `0px`;
            const targetEvent = (_b = (_a = event === null || event === void 0 ? void 0 : event.touches) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : event;
            const parentOffset = getHtmlElementOffset(parentElm);
            let menuOffsetLeft = (parentElm && this._camelPluginName === 'cellMenu') ? (_c = parentOffset === null || parentOffset === void 0 ? void 0 : parentOffset.left) !== null && _c !== void 0 ? _c : 0 : targetEvent.pageX;
            let menuOffsetTop = (parentElm && this._camelPluginName === 'cellMenu') ? (_d = parentOffset === null || parentOffset === void 0 ? void 0 : parentOffset.top) !== null && _d !== void 0 ? _d : 0 : targetEvent.pageY;
            if (isSubMenu && this._camelPluginName === 'contextMenu') {
                menuOffsetLeft = (_e = parentOffset === null || parentOffset === void 0 ? void 0 : parentOffset.left) !== null && _e !== void 0 ? _e : 0;
                menuOffsetTop = (_f = parentOffset === null || parentOffset === void 0 ? void 0 : parentOffset.top) !== null && _f !== void 0 ? _f : 0;
            }
            const parentCellWidth = parentElm.offsetWidth || 0;
            const menuHeight = (menuElm === null || menuElm === void 0 ? void 0 : menuElm.offsetHeight) || 0;
            const menuWidth = (menuElm === null || menuElm === void 0 ? void 0 : menuElm.offsetWidth) || this._addonOptions.width || 0;
            const rowHeight = this.gridOptions.rowHeight || 0;
            const dropOffset = Number(this._addonOptions.autoAdjustDropOffset || 0);
            const sideOffset = Number(this._addonOptions.autoAlignSideOffset || 0);
            // if autoAdjustDrop is enabled, we first need to see what position the drop will be located (defaults to bottom)
            // without necessary toggling it's position just yet, we just want to know the future position for calculation
            if (this._addonOptions.autoAdjustDrop || this._addonOptions.dropDirection) {
                // since we reposition menu below slick cell, we need to take it in consideration and do our calculation from that element
                const { bottom: spaceBottom, top: spaceTop } = calculateAvailableSpace(parentElm);
                const availableSpaceBottom = spaceBottom + dropOffset - rowHeight;
                const availableSpaceTop = spaceTop - dropOffset + rowHeight;
                const dropPosition = ((availableSpaceBottom < menuHeight) && (availableSpaceTop > availableSpaceBottom)) ? 'top' : 'bottom';
                if (dropPosition === 'top' || this._addonOptions.dropDirection === 'top') {
                    menuElm.classList.remove('dropdown');
                    menuElm.classList.add('dropup');
                    if (isSubMenu) {
                        menuOffsetTop -= (menuHeight - dropOffset - parentElm.clientHeight);
                    }
                    else {
                        menuOffsetTop -= menuHeight - dropOffset;
                    }
                }
                else {
                    menuElm.classList.remove('dropup');
                    menuElm.classList.add('dropdown');
                    menuOffsetTop = menuOffsetTop + dropOffset;
                    if (this._camelPluginName === 'cellMenu') {
                        if (isSubMenu) {
                            menuOffsetTop += dropOffset;
                        }
                        else {
                            menuOffsetTop += rowHeight + dropOffset;
                        }
                    }
                }
            }
            // when auto-align is set, it will calculate whether it has enough space in the viewport to show the drop menu on the right (default)
            // if there isn't enough space on the right, it will automatically align the drop menu to the left (defaults to the right)
            // to simulate an align left, we actually need to know the width of the drop menu
            if (this._addonOptions.autoAlignSide || this._addonOptions.dropSide === 'left') {
                const gridPos = this.grid.getGridPosition();
                let subMenuPosCalc = menuOffsetLeft + Number(menuWidth); // calculate coordinate at caller element far right
                if (isSubMenu) {
                    subMenuPosCalc += parentElm.clientWidth;
                }
                const browserWidth = document.documentElement.clientWidth;
                const dropSide = (subMenuPosCalc >= gridPos.width || subMenuPosCalc >= browserWidth) ? 'left' : 'right';
                if (dropSide === 'left' || (!isSubMenu && this._addonOptions.dropSide === 'left')) {
                    menuElm.classList.remove('dropright');
                    menuElm.classList.add('dropleft');
                    if (this._camelPluginName === 'cellMenu' && !isSubMenu) {
                        menuOffsetLeft -= Number(menuWidth) - parentCellWidth - sideOffset;
                    }
                    else {
                        menuOffsetLeft -= Number(menuWidth) - sideOffset;
                    }
                }
                else {
                    menuElm.classList.remove('dropleft');
                    menuElm.classList.add('dropright');
                    if (isSubMenu) {
                        menuOffsetLeft += sideOffset + parentElm.offsetWidth;
                    }
                    else {
                        menuOffsetLeft += sideOffset;
                    }
                }
            }
            // ready to reposition the menu
            menuElm.style.top = `${menuOffsetTop}px`;
            menuElm.style.left = `${menuOffsetLeft}px`;
        }
    }
}
//# sourceMappingURL=menuFromCellBaseClass.js.map