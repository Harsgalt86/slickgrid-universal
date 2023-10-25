"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickColumnPicker = void 0;
const bindingEvent_service_1 = require("../services/bindingEvent.service");
const domUtilities_1 = require("../services/domUtilities");
const extensionCommonUtils_1 = require("../extensions/extensionCommonUtils");
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
class SlickColumnPicker {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility, pubSubService, sharedService) {
        var _a, _b, _c, _d;
        this.extensionUtility = extensionUtility;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this._areVisibleColumnDifferent = false;
        this._columns = [];
        this._gridUid = '';
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
        this._bindEventService = new bindingEvent_service_1.BindingEventService();
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
        this._eventHandler.subscribe(this.grid.onColumnsReordered, extensionCommonUtils_1.updateColumnPickerOrder.bind(this));
        this._menuElm = (0, domUtilities_1.createDomElement)('div', {
            ariaExpanded: 'false',
            className: `slick-column-picker ${this._gridUid}`, role: 'menu',
            style: { display: 'none' },
        });
        // add Close button and optiona a Column list title
        extensionCommonUtils_1.addColumnTitleElementWhenDefined.call(this, this._menuElm);
        extensionCommonUtils_1.addCloseButtomElement.call(this, this._menuElm);
        this._listElm = (0, domUtilities_1.createDomElement)('div', { className: 'slick-column-picker-list', role: 'menu' });
        this._bindEventService.bind(this._menuElm, 'click', extensionCommonUtils_1.handleColumnPickerItemClick.bind(this));
        // Hide the menu on outside click.
        this._bindEventService.bind(document.body, 'mousedown', this.handleBodyMouseDown.bind(this));
        // destroy the picker if user leaves the page
        this._bindEventService.bind(document.body, 'beforeunload', this.dispose.bind(this));
        document.body.appendChild(this._menuElm);
    }
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose() {
        var _a, _b, _c, _d;
        this._eventHandler.unsubscribeAll();
        this._bindEventService.unbindAll();
        (_b = (_a = this._listElm) === null || _a === void 0 ? void 0 : _a.remove) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this._menuElm) === null || _c === void 0 ? void 0 : _c.remove) === null || _d === void 0 ? void 0 : _d.call(_c);
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
        if (this.addonOptions) {
            this.updateAllTitles(this.addonOptions);
        }
    }
    // --
    // protected functions
    // ------------------
    /** Mouse down handler when clicking anywhere in the DOM body */
    handleBodyMouseDown(e) {
        if ((this._menuElm !== e.target && !this._menuElm.contains(e.target)) || e.target.className === 'close') {
            this._menuElm.setAttribute('aria-expanded', 'false');
            this._menuElm.style.display = 'none';
        }
    }
    /** Mouse header context handler when doing a right+click on any of the header column title */
    handleHeaderContextMenu(e) {
        e.preventDefault();
        (0, domUtilities_1.emptyElement)(this._listElm);
        extensionCommonUtils_1.updateColumnPickerOrder.call(this);
        this._columnCheckboxes = [];
        extensionCommonUtils_1.populateColumnPicker.call(this, this.addonOptions);
        this.repositionMenu(e);
    }
    repositionMenu(event) {
        var _a, _b;
        const targetEvent = (_b = (_a = event === null || event === void 0 ? void 0 : event.touches) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : event;
        this._menuElm.style.top = `${targetEvent.pageY - 10}px`;
        this._menuElm.style.left = `${targetEvent.pageX - 10}px`;
        this._menuElm.style.minHeight = (0, domUtilities_1.findWidthOrDefault)(this.addonOptions.minHeight, '');
        this._menuElm.style.maxHeight = (0, domUtilities_1.findWidthOrDefault)(this.addonOptions.maxHeight, `${window.innerHeight - targetEvent.clientY}px`);
        this._menuElm.style.display = 'block';
        this._menuElm.setAttribute('aria-expanded', 'true');
        this._menuElm.appendChild(this._listElm);
    }
    /** Update the Titles of each sections (command, commandTitle, ...) */
    updateAllTitles(options) {
        var _a;
        if (((_a = this._columnTitleElm) === null || _a === void 0 ? void 0 : _a.textContent) && options.columnTitle) {
            this._columnTitleElm.textContent = options.columnTitle;
        }
    }
}
exports.SlickColumnPicker = SlickColumnPicker;
//# sourceMappingURL=slickColumnPicker.js.map