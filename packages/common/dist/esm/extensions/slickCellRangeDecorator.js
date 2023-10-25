import { deepMerge } from '@slickgrid-universal/utils';
import { createDomElement } from '../services/domUtilities';
/**
 * Displays an overlay on top of a given cell range.
 * TODO:
 * Currently, it blocks mouse events to DOM nodes behind it.
 * Use FF and WebKit-specific "pointer-events" CSS style, or some kind of event forwarding.
 * Could also construct the borders separately using 4 individual DIVs.
 */
export class SlickCellRangeDecorator {
    constructor(grid, options) {
        this.grid = grid;
        // --
        // public API
        this.pluginName = 'CellRangeDecorator';
        this._defaults = {
            selectionCssClass: 'slick-range-decorator',
            selectionCss: {
                border: '2px dashed red',
                zIndex: '9999',
            },
            offset: { top: -1, left: -1, height: -2, width: -2 }
        };
        this._addonOptions = deepMerge(this._defaults, options);
    }
    get addonOptions() {
        return this._addonOptions;
    }
    get addonElement() {
        return this._elem;
    }
    /** Dispose the plugin. */
    dispose() {
        this.hide();
    }
    hide() {
        var _a;
        (_a = this._elem) === null || _a === void 0 ? void 0 : _a.remove();
        this._elem = null;
    }
    show(range) {
        var _a, _b;
        if (!this._elem) {
            this._elem = createDomElement('div', { className: this._addonOptions.selectionCssClass });
            Object.keys(this._addonOptions.selectionCss).forEach((cssStyleKey) => {
                this._elem.style[cssStyleKey] = this._addonOptions.selectionCss[cssStyleKey];
            });
            this._elem.style.position = 'absolute';
            (_a = this.grid.getActiveCanvasNode()) === null || _a === void 0 ? void 0 : _a.appendChild(this._elem);
        }
        const from = this.grid.getCellNodeBox(range.fromRow, range.fromCell);
        const to = this.grid.getCellNodeBox(range.toRow, range.toCell);
        if (from && to && ((_b = this._addonOptions) === null || _b === void 0 ? void 0 : _b.offset)) {
            this._elem.style.top = `${from.top + this._addonOptions.offset.top}px`;
            this._elem.style.left = `${from.left + this._addonOptions.offset.left}px`;
            this._elem.style.height = `${to.bottom - from.top + this._addonOptions.offset.height}px`;
            this._elem.style.width = `${to.right - from.left + this._addonOptions.offset.width}px`;
        }
        return this._elem;
    }
}
//# sourceMappingURL=slickCellRangeDecorator.js.map