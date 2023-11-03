"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickGroupItemMetadataProvider = void 0;
const keyCode_enum_1 = require("../enums/keyCode.enum");
/**
 * Provides item metadata for group (Slick.Group) and totals (Slick.Totals) rows produced by the DataView.
 * This metadata overrides the default behavior and formatting of those rows so that they appear and function
 * correctly when processed by the grid.
 *
 * This class also acts as a grid plugin providing event handlers to expand & collapse groups.
 * If "grid.registerPlugin(...)" is not called, expand & collapse will not work.
 */
class SlickGroupItemMetadataProvider {
    constructor() {
        this._defaults = {
            groupCssClass: 'slick-group',
            groupTitleCssClass: 'slick-group-title',
            totalsCssClass: 'slick-group-totals',
            groupFocusable: true,
            indentation: 15,
            totalsFocusable: false,
            toggleCssClass: 'slick-group-toggle',
            toggleExpandedCssClass: 'expanded',
            toggleCollapsedCssClass: 'collapsed',
            enableExpandCollapse: true,
            groupFormatter: this.defaultGroupCellFormatter.bind(this),
            totalsFormatter: this.defaultTotalsCellFormatter.bind(this),
            includeHeaderTotals: false
        };
        this._eventHandler = new Slick.EventHandler();
        this._options = this._defaults;
    }
    /** Getter of the SlickGrid Event Handler */
    get eventHandler() {
        return this._eventHandler;
    }
    /** Getter of SlickGrid DataView object */
    get dataView() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getData) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    get grid() {
        return this._grid;
    }
    init(grid, inputOptions) {
        this._grid = grid;
        this._options = { ...this._defaults, ...inputOptions };
        this._eventHandler.subscribe(grid.onClick, this.handleGridClick.bind(this));
        this._eventHandler.subscribe(grid.onKeyDown, this.handleGridKeyDown.bind(this));
    }
    dispose() {
        var _a;
        // unsubscribe all SlickGrid events
        (_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.unsubscribeAll();
    }
    getOptions() {
        return this._options;
    }
    setOptions(inputOptions) {
        this._options = { ...this._options, ...inputOptions };
    }
    getGroupRowMetadata(item) {
        return {
            selectable: false,
            focusable: this._options.groupFocusable,
            cssClasses: `${this._options.groupCssClass} slick-group-level-${(item === null || item === void 0 ? void 0 : item.level) || 0}`,
            formatter: this._options.includeHeaderTotals && this._options.totalsFormatter,
            columns: {
                0: {
                    colspan: this._options.includeHeaderTotals ? '1' : '*',
                    formatter: this._options.groupFormatter,
                    editor: null
                }
            }
        };
    }
    getTotalsRowMetadata(item) {
        var _a;
        return {
            selectable: false,
            focusable: this._options.totalsFocusable,
            cssClasses: `${this._options.totalsCssClass} slick-group-level-${((_a = item === null || item === void 0 ? void 0 : item.group) === null || _a === void 0 ? void 0 : _a.level) || 0}`,
            formatter: this._options.totalsFormatter,
            editor: null
        };
    }
    //
    // protected functions
    // -------------------
    defaultGroupCellFormatter(_row, _cell, _value, _columnDef, item) {
        var _a, _b;
        if (!this._options.enableExpandCollapse) {
            return item.title;
        }
        const groupLevel = item.level || 0;
        const indentation = (_b = (_a = this._options) === null || _a === void 0 ? void 0 : _a.indentation) !== null && _b !== void 0 ? _b : 15;
        const marginLeft = `${groupLevel * indentation}px`;
        const toggleClass = item.collapsed ? this._options.toggleCollapsedCssClass : this._options.toggleExpandedCssClass;
        return `<span class="${this._options.toggleCssClass} ${toggleClass}" aria-expanded="${!item.collapsed}" style="margin-left: ${marginLeft}"></span>` +
            `<span class="${this._options.groupTitleCssClass}" level="${groupLevel}">${item.title || ''}</span>`;
    }
    defaultTotalsCellFormatter(_row, _cell, _value, columnDef, item, grid) {
        var _a, _b;
        return (_b = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.groupTotalsFormatter) === null || _a === void 0 ? void 0 : _a.call(columnDef, item, columnDef, grid)) !== null && _b !== void 0 ? _b : '';
    }
    /** Handle a grid cell clicked, it could be a Group that is being collapsed/expanded or do nothing when it's not */
    handleGridClick(e, args) {
        const target = e.target;
        const item = this.grid.getDataItem(args.row);
        if (item instanceof Slick.Group && target.classList.contains(this._options.toggleCssClass || '')) {
            this.handleDataViewExpandOrCollapse(item);
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }
    /**
     * Handle a keyboard down event on a grouping cell.
     * TODO:  add -/+ handling
     */
    handleGridKeyDown(e) {
        if (this._options.enableExpandCollapse && (e.keyCode === keyCode_enum_1.KeyCode.SPACE)) {
            const activeCell = this.grid.getActiveCell();
            if (activeCell) {
                const item = this.grid.getDataItem(activeCell.row);
                if (item instanceof Slick.Group) {
                    this.handleDataViewExpandOrCollapse(item);
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            }
        }
    }
    handleDataViewExpandOrCollapse(item) {
        const range = this.grid.getRenderedRange();
        this.dataView.setRefreshHints({
            ignoreDiffsBefore: range.top,
            ignoreDiffsAfter: range.bottom + 1
        });
        if (item.collapsed) {
            this.dataView.expandGroup(item.groupingKey);
        }
        else {
            this.dataView.collapseGroup(item.groupingKey);
        }
    }
}
exports.SlickGroupItemMetadataProvider = SlickGroupItemMetadataProvider;
//# sourceMappingURL=slickGroupItemMetadataProvider.js.map