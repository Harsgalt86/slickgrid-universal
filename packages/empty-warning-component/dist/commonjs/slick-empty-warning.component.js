"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickEmptyWarningComponent = void 0;
const common_1 = require("@slickgrid-universal/common");
class SlickEmptyWarningComponent {
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        return (this.grid && this.grid.getOptions) ? this.grid.getOptions() : {};
    }
    constructor() {
        this._warningLeftElement = null;
        this._warningRightElement = null;
        this.isPreviouslyShown = false;
    }
    init(grid, containerService) {
        this.grid = grid;
        this.translaterService = containerService.get('TranslaterService');
    }
    dispose() {
        var _a, _b;
        (_a = this._warningLeftElement) === null || _a === void 0 ? void 0 : _a.remove();
        (_b = this._warningRightElement) === null || _b === void 0 ? void 0 : _b.remove();
        this._warningLeftElement = null;
        this._warningRightElement = null;
    }
    /**
     * Display a warning of empty data when the filtered dataset is empty
     * NOTE: to make this code reusable, you could (should) move this code into a utility service
     * @param isShowing - are we showing the message?
     * @param options - any styling options you'd like to pass like the text color
     */
    showEmptyDataMessage(isShowing = true, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        if (!this.grid || !this.gridOptions || this.isPreviouslyShown === isShowing) {
            return false;
        }
        // keep reference so that we won't re-render the warning if the status is the same
        this.isPreviouslyShown = isShowing;
        const gridUid = this.grid.getUID();
        const defaultMessage = 'No data to display.';
        const mergedOptions = { message: defaultMessage, ...this.gridOptions.emptyDataWarning, ...options };
        const emptyDataClassName = (_a = mergedOptions === null || mergedOptions === void 0 ? void 0 : mergedOptions.className) !== null && _a !== void 0 ? _a : 'slick-empty-data-warning';
        this._warningLeftElement = document.querySelector(`.${gridUid} .${emptyDataClassName}`);
        const gridCanvasLeftElm = document.querySelector(`.${gridUid} .grid-canvas.grid-canvas-left`);
        const gridCanvasRightElm = document.querySelector(`.${gridUid} .grid-canvas.grid-canvas-right`);
        const leftElementMarginLeft = (_b = mergedOptions.leftViewportMarginLeft) !== null && _b !== void 0 ? _b : 0;
        const rightElementMarginLeft = (_c = mergedOptions.rightViewportMarginLeft) !== null && _c !== void 0 ? _c : 0;
        const leftElementFrozenMarginLeft = (_d = mergedOptions.frozenLeftViewportMarginLeft) !== null && _d !== void 0 ? _d : 0;
        const rightElementFrozenMarginLeft = (_e = mergedOptions.frozenRightViewportMarginLeft) !== null && _e !== void 0 ? _e : 0;
        const isFrozenGrid = (((_f = this.gridOptions) === null || _f === void 0 ? void 0 : _f.frozenColumn) !== undefined && this.gridOptions.frozenColumn >= 0);
        const leftViewportMarginLeft = typeof leftElementMarginLeft === 'string' ? leftElementMarginLeft : `${leftElementMarginLeft}px`;
        const rightViewportMarginLeft = typeof rightElementMarginLeft === 'string' ? rightElementMarginLeft : `${rightElementMarginLeft}px`;
        // when dealing with a grid that has "autoHeight" option, we need to override 2 height that get miscalculated
        // that is because it is not aware that we are adding this slick empty element in this grid DOM
        if (this.gridOptions.autoHeight) {
            const leftPaneElm = document.querySelector(`.${gridUid} .slick-pane.slick-pane-top.slick-pane-left`);
            if (leftPaneElm && leftPaneElm.style && gridCanvasLeftElm && gridCanvasLeftElm.style) {
                const leftPaneHeight = parseInt(leftPaneElm.style.height, 10) || 0; // this field auto calc by row height
                // get row height of each feature when enabled (rowHeight will always be defined because that is the cell height)
                const cellRowHeight = (_h = (_g = this.gridOptions) === null || _g === void 0 ? void 0 : _g.rowHeight) !== null && _h !== void 0 ? _h : 0;
                const filterRowHeight = this.gridOptions.enableFiltering ? ((_k = (_j = this.gridOptions) === null || _j === void 0 ? void 0 : _j.headerRowHeight) !== null && _k !== void 0 ? _k : 0) : 0;
                const preHeaderRowHeight = this.gridOptions.createPreHeaderPanel ? ((_m = (_l = this.gridOptions) === null || _l === void 0 ? void 0 : _l.preHeaderPanelHeight) !== null && _m !== void 0 ? _m : 0) : 0;
                if (isShowing) {
                    // use when height with rows more that 100px
                    // AutoHeight option collapse dataview to 100px when show message without data in huge grid
                    // (default autoHeight for message - 100px you can add as param if needed)
                    let leftPaneMinHeight = (leftPaneHeight !== null && leftPaneHeight < 100) ? leftPaneHeight : 100;
                    leftPaneMinHeight += filterRowHeight + preHeaderRowHeight; // add preHeader & filter height when enabled
                    leftPaneElm.style.minHeight = `${leftPaneMinHeight}px`;
                    gridCanvasLeftElm.style.minHeight = `${cellRowHeight}px`;
                }
            }
        }
        // warning message could come from a translation key or by the warning options
        let warningMessage = mergedOptions.message;
        if (this.gridOptions.enableTranslate && this.translaterService && (mergedOptions === null || mergedOptions === void 0 ? void 0 : mergedOptions.messageKey)) {
            warningMessage = this.translaterService.translate(mergedOptions.messageKey);
        }
        if (!this._warningLeftElement && gridCanvasLeftElm && gridCanvasRightElm) {
            const sanitizedOptions = (_p = (_o = this.gridOptions) === null || _o === void 0 ? void 0 : _o.sanitizeHtmlOptions) !== null && _p !== void 0 ? _p : {};
            this._warningLeftElement = document.createElement('div');
            this._warningLeftElement.classList.add(emptyDataClassName);
            this._warningLeftElement.classList.add('left');
            this._warningLeftElement.innerHTML = (0, common_1.sanitizeTextByAvailableSanitizer)(this.gridOptions, warningMessage, sanitizedOptions);
            // clone the warning element and add the "right" class to it so we can distinguish
            this._warningRightElement = this._warningLeftElement.cloneNode(true);
            this._warningRightElement.classList.add('right');
            // append both warning elements to both left/right canvas
            gridCanvasRightElm.appendChild(this._warningRightElement);
            gridCanvasLeftElm.appendChild(this._warningLeftElement);
        }
        // if we did find the Slick-Empty-Warning element then we'll display/hide at the grid position with some margin offsets (we need to position under the headerRow and filterRow)
        // when using a frozen/pinned grid, we also have extra options to hide left/right message
        if (this._warningLeftElement) {
            // display/hide right/left messages
            let leftDisplay = isShowing ? 'block' : 'none';
            if (isFrozenGrid && isShowing) {
                leftDisplay = (mergedOptions.hideFrozenLeftWarning) ? 'none' : 'block';
            }
            this._warningLeftElement.style.display = leftDisplay;
            // use correct left margin (defaults to 40% on regular grid or 10px on frozen grid)
            const leftFrozenMarginLeft = typeof leftElementFrozenMarginLeft === 'string' ? leftElementFrozenMarginLeft : `${leftElementFrozenMarginLeft}px`;
            this._warningLeftElement.style.marginLeft = isFrozenGrid ? leftFrozenMarginLeft : leftViewportMarginLeft;
        }
        if (this._warningRightElement) {
            // use correct left margin (defaults to 40% on regular grid or 10px on frozen grid)
            let rightDisplay = isShowing ? 'block' : 'none';
            if (isFrozenGrid && isShowing) {
                rightDisplay = (mergedOptions.hideFrozenRightWarning) ? 'none' : 'block';
            }
            this._warningRightElement.style.display = rightDisplay;
            // use correct left margin (defaults to 40% on regular grid or 10px on frozen grid)
            const rightFrozenMarginLeft = typeof rightElementFrozenMarginLeft === 'string' ? rightElementFrozenMarginLeft : `${rightElementFrozenMarginLeft}px`;
            this._warningRightElement.style.marginLeft = isFrozenGrid ? rightFrozenMarginLeft : rightViewportMarginLeft;
        }
        return isShowing;
    }
}
exports.SlickEmptyWarningComponent = SlickEmptyWarningComponent;
//# sourceMappingURL=slick-empty-warning.component.js.map