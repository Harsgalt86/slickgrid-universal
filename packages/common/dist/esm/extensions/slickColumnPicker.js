import { BindingEventService } from '../services/bindingEvent.service';
import { createDomElement, emptyElement, findWidthOrDefault } from '../services/domUtilities';
import { addColumnTitleElementWhenDefined, addCloseButtomElement, handleColumnPickerItemClick, populateColumnPicker, updateColumnPickerOrder } from '../extensions/extensionCommonUtils';
/**
 * A control to add a Column Picker (right+click on any column header to reveal the column picker)
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.gridOptions = {
 *     enableColumnPicker: true,
 *     columnPicker: {
 *       ... column picker options ...
 *     }
 *   }];
 * @class ColumnPickerControl
 * @constructor
 */
export class SlickColumnPicker {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility, pubSubService, sharedService) {
        var _a, _b, _c, _d;
        this.extensionUtility = extensionUtility;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this._areVisibleColumnDifferent = false;
        this._columns = [];
        this._gridUid = '';
        this._menuElm = null;
        this._columnCheckboxes = [];
        this.onColumnsChanged = new Slick.Event();
        this._defaults = {
            // the last 2 checkboxes titles
            hideForceFitButton: false,
            hideSyncResizeButton: false,
            forceFitTitle: 'Force fit columns',
            minHeight: 200,
            syncResizeTitle: 'Synchronous resize',
            headerColumnValueExtractor: (columnDef) => columnDef.name
        };
        this._bindEventService = new BindingEventService();
        this._eventHandler = new Slick.EventHandler();
        this._columns = (_a = this.sharedService.allColumns) !== null && _a !== void 0 ? _a : [];
        this._gridUid = (_d = (_c = (_b = this.grid) === null || _b === void 0 ? void 0 : _b.getUID) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : '';
        this.init();
    }
    get addonOptions() {
        return this.gridOptions.columnPicker || {};
    }
    get eventHandler() {
        return this._eventHandler;
    }
    get columns() {
        return this._columns;
    }
    set columns(newColumns) {
        this._columns = newColumns;
    }
    get gridOptions() {
        var _a;
        return (_a = this.sharedService.gridOptions) !== null && _a !== void 0 ? _a : {};
    }
    get grid() {
        return this.sharedService.slickGrid;
    }
    get menuElement() {
        return this._menuElm;
    }
    /** Initialize plugin. */
    init() {
        var _a;
        this._gridUid = (_a = this.grid.getUID()) !== null && _a !== void 0 ? _a : '';
        this.gridOptions.columnPicker = { ...this._defaults, ...this.gridOptions.columnPicker };
        // localization support for the picker
        this.addonOptions.columnTitle = this.extensionUtility.getPickerTitleOutputString('columnTitle', 'columnPicker');
        this.addonOptions.forceFitTitle = this.extensionUtility.getPickerTitleOutputString('forceFitTitle', 'columnPicker');
        this.addonOptions.syncResizeTitle = this.extensionUtility.getPickerTitleOutputString('syncResizeTitle', 'columnPicker');
        this._eventHandler.subscribe(this.grid.onHeaderContextMenu, this.handleHeaderContextMenu.bind(this));
        this._eventHandler.subscribe(this.grid.onColumnsReordered, updateColumnPickerOrder.bind(this));
        // Hide the menu on outside click.
        this._bindEventService.bind(document.body, 'mousedown', this.handleBodyMouseDown.bind(this), undefined, 'body');
        // destroy the picker if user leaves the page
        this._bindEventService.bind(document.body, 'beforeunload', this.dispose.bind(this), undefined, 'body');
    }
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose() {
        this._eventHandler.unsubscribeAll();
        this._bindEventService.unbindAll();
        this.disposeMenu();
    }
    disposeMenu() {
        var _a, _b;
        this._bindEventService.unbindAll('parent-menu');
        (_a = this._listElm) === null || _a === void 0 ? void 0 : _a.remove();
        (_b = this._menuElm) === null || _b === void 0 ? void 0 : _b.remove();
        this._menuElm = null;
    }
    createPickerMenu() {
        const menuElm = createDomElement('div', {
            ariaExpanded: 'true',
            className: `slick-column-picker ${this._gridUid}`,
            role: 'menu',
        });
        updateColumnPickerOrder.call(this);
        // add Close button and optiona a Column list title
        addColumnTitleElementWhenDefined.call(this, menuElm);
        addCloseButtomElement.call(this, menuElm);
        this._listElm = createDomElement('div', { className: 'slick-column-picker-list', role: 'menu' });
        this._bindEventService.bind(menuElm, 'click', handleColumnPickerItemClick.bind(this), undefined, 'parent-menu');
        document.body.appendChild(menuElm);
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
     * @returns {Array<Object>} - all columns array
     */
    getVisibleColumns() {
        return this.grid.getColumns();
    }
    /** Translate the Column Picker headers and also the last 2 checkboxes */
    translateColumnPicker() {
        // update the properties by pointers, that is the only way to get Column Picker Control to see the new values
        if (this.addonOptions) {
            this.addonOptions.columnTitle = '';
            this.addonOptions.forceFitTitle = '';
            this.addonOptions.syncResizeTitle = '';
            this.addonOptions.columnTitle = this.extensionUtility.getPickerTitleOutputString('columnTitle', 'columnPicker');
            this.addonOptions.forceFitTitle = this.extensionUtility.getPickerTitleOutputString('forceFitTitle', 'columnPicker');
            this.addonOptions.syncResizeTitle = this.extensionUtility.getPickerTitleOutputString('syncResizeTitle', 'columnPicker');
        }
        // translate all columns (including hidden columns)
        this.extensionUtility.translateItems(this._columns, 'nameKey', 'name');
        // update the Titles of each sections (command, commandTitle, ...)
        this.translateTitleLabels(this.addonOptions);
    }
    // --
    // protected functions
    // ------------------
    /** Mouse down handler when clicking anywhere in the DOM body */
    handleBodyMouseDown(e) {
        var _a;
        if ((this._menuElm !== e.target && !((_a = this._menuElm) === null || _a === void 0 ? void 0 : _a.contains(e.target))) || (e.target.className === 'close' && e.target.closest('.slick-column-picker'))) {
            this.disposeMenu();
        }
    }
    /** Mouse header context handler when doing a right+click on any of the header column title */
    handleHeaderContextMenu(e) {
        e.preventDefault();
        emptyElement(this._listElm);
        this._columnCheckboxes = [];
        this._menuElm = this.createPickerMenu();
        // load the column & create column picker list
        populateColumnPicker.call(this, this.addonOptions);
        document.body.appendChild(this._menuElm);
        this.repositionMenu(e);
    }
    repositionMenu(event) {
        var _a, _b;
        const targetEvent = (_b = (_a = event === null || event === void 0 ? void 0 : event.touches) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : event;
        if (this._menuElm) {
            this._menuElm.style.top = `${targetEvent.pageY - 10}px`;
            this._menuElm.style.left = `${targetEvent.pageX - 10}px`;
            this._menuElm.style.minHeight = findWidthOrDefault(this.addonOptions.minHeight, '');
            this._menuElm.style.maxHeight = findWidthOrDefault(this.addonOptions.maxHeight, `${window.innerHeight - targetEvent.clientY}px`);
            this._menuElm.style.display = 'block';
            this._menuElm.setAttribute('aria-expanded', 'true');
            this._menuElm.appendChild(this._listElm);
        }
    }
    /** Update the Titles of each sections (command, commandTitle, ...) */
    translateTitleLabels(pickerOptions) {
        if (pickerOptions) {
            pickerOptions.columnTitle = this.extensionUtility.getPickerTitleOutputString('columnTitle', 'gridMenu');
        }
    }
}
//# sourceMappingURL=slickColumnPicker.js.map