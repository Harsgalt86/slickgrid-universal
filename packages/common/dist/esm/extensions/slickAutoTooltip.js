/**
 * AutoTooltips plugin to show/hide tooltips when columns are too narrow to fit content.
 * @constructor
 * @param {boolean} [options.enableForCells=true]        - Enable tooltip for grid cells
 * @param {boolean} [options.enableForHeaderCells=false] - Enable tooltip for header cells
 * @param {number}  [options.maxToolTipLength=null]      - The maximum length for a tooltip
 */
export class SlickAutoTooltip {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(options) {
        this._defaults = {
            enableForCells: true,
            enableForHeaderCells: false,
            maxToolTipLength: undefined,
            replaceExisting: true
        };
        this.pluginName = 'AutoTooltips';
        this._eventHandler = new Slick.EventHandler();
        this._addonOptions = options;
    }
    get addonOptions() {
        return this._addonOptions;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    /** Initialize plugin. */
    init(grid) {
        this._addonOptions = { ...this._defaults, ...this.addonOptions };
        this._grid = grid;
        if (this._addonOptions.enableForCells) {
            this._eventHandler.subscribe(this._grid.onMouseEnter, this.handleMouseEnter.bind(this));
        }
        if (this._addonOptions.enableForHeaderCells) {
            this._eventHandler.subscribe(this._grid.onHeaderMouseEnter, this.handleHeaderMouseEnter.bind(this));
        }
    }
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose() {
        var _a;
        (_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.unsubscribeAll();
    }
    // --
    // protected functions
    // ------------------
    /**
     * Handle mouse entering grid cell to add/remove tooltip.
     * @param {Object} event - The event
     */
    handleMouseEnter(event) {
        var _a, _b, _c, _d, _e;
        const cell = this._grid.getCellFromEvent(event);
        if (cell) {
            let node = this._grid.getCellNode(cell.row, cell.cell);
            let text;
            if (this._addonOptions && node && (!node.title || ((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.replaceExisting))) {
                if (node.clientWidth < node.scrollWidth) {
                    text = (_c = (_b = node.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '';
                    if (((_d = this._addonOptions) === null || _d === void 0 ? void 0 : _d.maxToolTipLength) && text.length > ((_e = this._addonOptions) === null || _e === void 0 ? void 0 : _e.maxToolTipLength)) {
                        text = text.substring(0, this._addonOptions.maxToolTipLength - 3) + '...';
                    }
                }
                else {
                    text = '';
                }
                node.title = text;
            }
            node = null;
        }
    }
    /**
     * Handle mouse entering header cell to add/remove tooltip.
     * @param {Object} event - The event
     * @param {Object} args.column - The column definition
     */
    handleHeaderMouseEnter(event, args) {
        var _a;
        const column = args.column;
        let node;
        const targetElm = event.target;
        if (targetElm) {
            node = targetElm.closest('.slick-header-column');
            if (node && !(column === null || column === void 0 ? void 0 : column.toolTip)) {
                node.title = (targetElm.clientWidth < node.clientWidth) ? (_a = column === null || column === void 0 ? void 0 : column.name) !== null && _a !== void 0 ? _a : '' : '';
            }
        }
        node = null;
    }
}
//# sourceMappingURL=slickAutoTooltip.js.map