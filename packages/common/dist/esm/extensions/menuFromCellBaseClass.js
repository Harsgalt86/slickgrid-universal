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
    }
    createMenu(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        (_a = this.menuElement) === null || _a === void 0 ? void 0 : _a.remove();
        this._menuElm = undefined;
        const cell = this.grid.getCellFromEvent(event);
        if (cell) {
            this._currentCell = (_b = cell.cell) !== null && _b !== void 0 ? _b : 0;
            this._currentRow = (_c = cell.row) !== null && _c !== void 0 ? _c : 0;
            const columnDef = this.grid.getColumns()[this._currentCell];
            const dataContext = this.grid.getDataItem(this._currentRow);
            const targetEvent = (_e = (_d = event === null || event === void 0 ? void 0 : event.touches) === null || _d === void 0 ? void 0 : _d[0]) !== null && _e !== void 0 ? _e : event;
            const commandItems = ((_f = this._addonOptions) === null || _f === void 0 ? void 0 : _f.commandItems) || [];
            const optionItems = ((_g = this._addonOptions) === null || _g === void 0 ? void 0 : _g.optionItems) || [];
            let isColumnOptionAllowed = true;
            let isColumnCommandAllowed = true;
            // make sure there's at least something to show before creating the Menu
            if (this._camelPluginName === 'contextMenu') {
                isColumnOptionAllowed = this.checkIsColumnAllowed((_j = (_h = this._addonOptions) === null || _h === void 0 ? void 0 : _h.optionShownOverColumnIds) !== null && _j !== void 0 ? _j : [], columnDef.id);
                isColumnCommandAllowed = this.checkIsColumnAllowed((_l = (_k = this._addonOptions) === null || _k === void 0 ? void 0 : _k.commandShownOverColumnIds) !== null && _l !== void 0 ? _l : [], columnDef.id);
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
                if (typeof ((_m = this.addonOptions) === null || _m === void 0 ? void 0 : _m.onBeforeMenuShow) === 'function' && this.addonOptions.onBeforeMenuShow(event, callbackArgs) === false) {
                    return;
                }
            }
            // create a new Menu
            this._menuElm = createDomElement('div', {
                className: `${this._menuPluginCssPrefix || this._menuCssPrefix} ${this.gridUid}`,
                style: { display: 'none', left: `${targetEvent.pageX}px`, top: `${targetEvent.pageY + 5}px` }
            });
            const maxHeight = isNaN(this.addonOptions.maxHeight) ? this.addonOptions.maxHeight : `${(_o = this.addonOptions.maxHeight) !== null && _o !== void 0 ? _o : 0}px`;
            const maxWidth = isNaN(this.addonOptions.maxWidth) ? this.addonOptions.maxWidth : `${(_p = this.addonOptions.maxWidth) !== null && _p !== void 0 ? _p : 0}px`;
            if (maxHeight) {
                this._menuElm.style.maxHeight = maxHeight;
            }
            if (maxWidth) {
                this._menuElm.style.maxWidth = maxWidth;
            }
            if ((_q = this.addonOptions) === null || _q === void 0 ? void 0 : _q.width) {
                this._menuElm.style.width = findWidthOrDefault((_r = this.addonOptions) === null || _r === void 0 ? void 0 : _r.width);
            }
            const closeButtonElm = createDomElement('button', { ariaLabel: 'Close', className: 'close', type: 'button', innerHTML: '&times;', dataset: { dismiss: this._menuCssPrefix } });
            // -- Option List section
            if (!this.addonOptions.hideOptionSection && isColumnOptionAllowed && optionItems.length > 0) {
                const optionMenuElm = createDomElement('div', { className: `${this._menuCssPrefix}-option-list`, role: 'menu' }, this._menuElm);
                this.populateCommandOrOptionTitle('option', this.addonOptions, optionMenuElm);
                if (!this.addonOptions.hideCloseButton) {
                    this.populateCommandOrOptionCloseBtn('option', closeButtonElm, optionMenuElm);
                }
                this.populateCommandOrOptionItems('option', this.addonOptions, optionMenuElm, optionItems, { cell: this._currentCell, row: this._currentRow, column: columnDef, dataContext, grid: this.grid }, this.handleMenuItemCommandClick);
            }
            // -- Command List section
            if (!this.addonOptions.hideCommandSection && isColumnCommandAllowed && commandItems.length > 0) {
                const commandMenuElm = createDomElement('div', { className: `${this._menuCssPrefix}-command-list`, role: 'menu' }, this._menuElm);
                this.populateCommandOrOptionTitle('command', this.addonOptions, commandMenuElm);
                if (!this.addonOptions.hideCloseButton && (!isColumnOptionAllowed || optionItems.length === 0 || this.addonOptions.hideOptionSection)) {
                    this.populateCommandOrOptionCloseBtn('command', closeButtonElm, commandMenuElm);
                }
                this.populateCommandOrOptionItems('command', this.addonOptions, commandMenuElm, commandItems, { cell: this._currentCell, row: this._currentRow, column: columnDef, dataContext, grid: this.grid }, this.handleMenuItemCommandClick);
            }
            this._menuElm.style.display = 'block';
            document.body.appendChild(this._menuElm);
            // execute optional callback method defined by the user
            this.pubSubService.publish(`on${titleCase(this._camelPluginName)}AfterMenuShow`, callbackArgs);
            if (typeof ((_s = this.addonOptions) === null || _s === void 0 ? void 0 : _s.onAfterMenuShow) === 'function' && this.addonOptions.onAfterMenuShow(event, callbackArgs) === false) {
                return;
            }
        }
        return this._menuElm;
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
        var _a;
        if ((this.menuElement !== e.target && !((_a = this.menuElement) === null || _a === void 0 ? void 0 : _a.contains(e.target))) || e.target.className === 'close') {
            this.closeMenu(e, { cell: this._currentCell, row: this._currentRow, grid: this.grid });
        }
    }
    handleCloseButtonClicked(e) {
        if (!e.defaultPrevented) {
            this.closeMenu(e, { cell: 0, row: 0, grid: this.grid, });
        }
    }
    handleMenuItemCommandClick(event, type, item) {
        var _a;
        if ((item === null || item === void 0 ? void 0 : item[type]) !== undefined && item !== 'divider' && !item.disabled && !item.divider && this._currentCell !== undefined && this._currentRow !== undefined) {
            if (type === 'option' && !this.grid.getEditorLock().commitCurrentEdit()) {
                return;
            }
            const cell = this._currentCell;
            const row = this._currentRow;
            const columnDef = this.grid.getColumns()[this._currentCell];
            const dataContext = this.grid.getDataItem(this._currentRow);
            // user could execute a callback through 2 ways
            // via the onOptionSelected event and/or an action callback
            const callbackArgs = {
                cell: this._currentCell,
                row: this._currentRow,
                grid: this.grid,
                [type]: item[type],
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
    }
    populateCommandOrOptionCloseBtn(itemType, closeButtonElm, commandOrOptionMenuElm) {
        var _a;
        this._bindEventService.bind(closeButtonElm, 'click', ((e) => this.handleCloseButtonClicked(e)));
        const commandOrOptionMenuHeaderElm = (_a = commandOrOptionMenuElm.querySelector(`.slick-${itemType}-header`)) !== null && _a !== void 0 ? _a : createDomElement('div', { className: `slick-${itemType}-header` });
        commandOrOptionMenuHeaderElm === null || commandOrOptionMenuHeaderElm === void 0 ? void 0 : commandOrOptionMenuHeaderElm.appendChild(closeButtonElm);
        commandOrOptionMenuElm.appendChild(commandOrOptionMenuHeaderElm);
        commandOrOptionMenuHeaderElm.classList.add('with-close');
    }
    repositionMenu(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (this._menuElm && event.target) {
            // move to 0,0 before calulating height/width since it could be cropped values
            // when element is outside browser viewport
            this._menuElm.style.top = `0px`;
            this._menuElm.style.left = `0px`;
            const targetEvent = (_b = (_a = event === null || event === void 0 ? void 0 : event.touches) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : event;
            const parentElm = event.target.closest('.slick-cell');
            let menuOffsetLeft = (parentElm && this._camelPluginName === 'cellMenu') ? (_d = (_c = getHtmlElementOffset(parentElm)) === null || _c === void 0 ? void 0 : _c.left) !== null && _d !== void 0 ? _d : 0 : targetEvent.pageX;
            let menuOffsetTop = (parentElm && this._camelPluginName === 'cellMenu') ? (_f = (_e = getHtmlElementOffset(parentElm)) === null || _e === void 0 ? void 0 : _e.top) !== null && _f !== void 0 ? _f : 0 : targetEvent.pageY;
            const parentCellWidth = parentElm.offsetWidth || 0;
            const menuHeight = ((_g = this._menuElm) === null || _g === void 0 ? void 0 : _g.offsetHeight) || 0;
            const menuWidth = ((_h = this._menuElm) === null || _h === void 0 ? void 0 : _h.offsetWidth) || this._addonOptions.width || 0;
            const rowHeight = this.gridOptions.rowHeight || 0;
            const dropOffset = +(this._addonOptions.autoAdjustDropOffset || 0);
            const sideOffset = +(this._addonOptions.autoAlignSideOffset || 0);
            // if autoAdjustDrop is enable, we first need to see what position the drop will be located (defaults to bottom)
            // without necessary toggling it's position just yet, we just want to know the future position for calculation
            if (this._addonOptions.autoAdjustDrop || this._addonOptions.dropDirection) {
                // since we reposition menu below slick cell, we need to take it in consideration and do our calculation from that element
                const spaceBottom = calculateAvailableSpace(parentElm).bottom;
                const spaceTop = calculateAvailableSpace(parentElm).top;
                const spaceBottomRemaining = spaceBottom + dropOffset - rowHeight;
                const spaceTopRemaining = spaceTop - dropOffset + rowHeight;
                const dropPosition = ((spaceBottomRemaining < menuHeight) && (spaceTopRemaining > spaceBottomRemaining)) ? 'top' : 'bottom';
                if (dropPosition === 'top' || this._addonOptions.dropDirection === 'top') {
                    this._menuElm.classList.remove('dropdown');
                    this._menuElm.classList.add('dropup');
                    menuOffsetTop = menuOffsetTop - menuHeight - dropOffset;
                }
                else {
                    this._menuElm.classList.remove('dropup');
                    this._menuElm.classList.add('dropdown');
                    menuOffsetTop = menuOffsetTop + dropOffset;
                    if (this._camelPluginName === 'cellMenu') {
                        menuOffsetTop += rowHeight;
                    }
                }
            }
            // when auto-align is set, it will calculate whether it has enough space in the viewport to show the drop menu on the right (default)
            // if there isn't enough space on the right, it will automatically align the drop menu to the left (defaults to the right)
            // to simulate an align left, we actually need to know the width of the drop menu
            if (this._addonOptions.autoAlignSide || this._addonOptions.dropSide === 'left') {
                const gridPos = this.grid.getGridPosition();
                const dropSide = ((menuOffsetLeft + (+menuWidth)) >= gridPos.width) ? 'left' : 'right';
                if (dropSide === 'left' || this._addonOptions.dropSide === 'left') {
                    this._menuElm.classList.remove('dropright');
                    this._menuElm.classList.add('dropleft');
                    if (this._camelPluginName === 'cellMenu') {
                        menuOffsetLeft = (menuOffsetLeft - ((+menuWidth) - parentCellWidth) - sideOffset);
                    }
                    else {
                        menuOffsetLeft = menuOffsetLeft - (+menuWidth) - sideOffset;
                    }
                }
                else {
                    this._menuElm.classList.remove('dropleft');
                    this._menuElm.classList.add('dropright');
                    menuOffsetLeft = menuOffsetLeft + sideOffset;
                }
            }
            // ready to reposition the menu
            this._menuElm.style.top = `${menuOffsetTop}px`;
            this._menuElm.style.left = `${menuOffsetLeft}px`;
        }
    }
}
//# sourceMappingURL=menuFromCellBaseClass.js.map