import * as moment_ from 'moment-mini';
const moment = moment_['default'] || moment_; // patch to fix rollup "moment has no default export" issue, document here https://github.com/rollup/rollup/issues/670
import { Constants, createDomElement, sanitizeTextByAvailableSanitizer, } from '@slickgrid-universal/common';
import { BindingHelper } from '@slickgrid-universal/binding';
export class SlickFooterComponent {
    get eventHandler() {
        return this._eventHandler;
    }
    /** Getter for the grid uid */
    get gridUid() {
        var _a, _b;
        return (_b = (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getUID()) !== null && _b !== void 0 ? _b : '';
    }
    get gridUidSelector() {
        return this.gridUid ? `.${this.gridUid}` : '';
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        return (this.grid && this.grid.getOptions) ? this.grid.getOptions() : {};
    }
    get locales() {
        var _a, _b;
        // get locales provided by user in main file or else use default English locales via the Constants
        return (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.locales) !== null && _b !== void 0 ? _b : Constants.locales;
    }
    set metrics(metrics) {
        this.renderMetrics(metrics);
    }
    get leftFooterText() {
        var _a, _b;
        return (_b = (_a = document.querySelector(`.slick-custom-footer${this.gridUidSelector} .left-footer`)) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : '';
    }
    set leftFooterText(text) {
        this.renderLeftFooterText(text);
    }
    get rightFooterText() {
        var _a, _b;
        return (_b = (_a = document.querySelector(`.slick-custom-footer${this.gridUidSelector} .right-footer`)) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : '';
    }
    set rightFooterText(text) {
        this.renderRightFooterText(text);
    }
    constructor(grid, customFooterOptions, pubSubService, translaterService) {
        var _a, _b, _c, _d, _f, _g, _h;
        this.grid = grid;
        this.customFooterOptions = customFooterOptions;
        this.pubSubService = pubSubService;
        this.translaterService = translaterService;
        this._enableTranslate = false;
        this._isLeftFooterOriginallyEmpty = true;
        this._isLeftFooterDisplayingSelectionRowCount = false;
        this._isRightFooterOriginallyEmpty = true;
        this._selectedRowCount = 0;
        this._subscriptions = [];
        this._bindingHelper = new BindingHelper();
        this._bindingHelper.querySelectorPrefix = `.${this.gridUid} `;
        this._eventHandler = new Slick.EventHandler();
        this._enableTranslate = (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.enableTranslate) !== null && _b !== void 0 ? _b : false;
        this._isLeftFooterOriginallyEmpty = !((_c = this.gridOptions.customFooterOptions) === null || _c === void 0 ? void 0 : _c.leftFooterText);
        this._isRightFooterOriginallyEmpty = !((_d = this.gridOptions.customFooterOptions) === null || _d === void 0 ? void 0 : _d.rightFooterText);
        this.registerOnSelectedRowsChangedWhenEnabled(customFooterOptions);
        if (this._enableTranslate && (!this.translaterService || !this.translaterService.translate)) {
            throw new Error('[Slickgrid-Universal] requires a Translate Service to be installed and configured when the grid option "enableTranslate" is enabled.');
        }
        this.translateCustomFooterTexts();
        if (this._enableTranslate && ((_f = this.pubSubService) === null || _f === void 0 ? void 0 : _f.subscribe)) {
            const translateEventName = (_h = (_g = this.translaterService) === null || _g === void 0 ? void 0 : _g.eventName) !== null && _h !== void 0 ? _h : 'onLanguageChange';
            this._subscriptions.push(this.pubSubService.subscribe(translateEventName, () => this.translateCustomFooterTexts()));
        }
    }
    dispose() {
        var _a;
        // also dispose of all Subscriptions
        this._eventHandler.unsubscribeAll();
        this.pubSubService.unsubscribeAll(this._subscriptions);
        this._bindingHelper.dispose();
        (_a = this._footerElement) === null || _a === void 0 ? void 0 : _a.remove();
    }
    /**
     * We could optionally display a custom footer below the grid to show some metrics (last update, item count with/without filters)
     * It's an opt-in, user has to enable "showCustomFooter" and it cannot be used when there's already a Pagination since they display the same kind of info
     */
    renderFooter(gridParentContainerElm) {
        // execute translation when enabled or use defined text or locale
        this.translateCustomFooterTexts();
        // we create and the custom footer in the DOM but only when there's no Pagination
        this.createFooterContainer(gridParentContainerElm);
    }
    /** Render element attribute values */
    renderMetrics(metrics) {
        var _a;
        // get translated text & last timestamp
        const lastUpdateTimestamp = moment(metrics.endTime).format(this.customFooterOptions.dateFormat);
        this._bindingHelper.setElementAttributeValue('span.last-update-timestamp', 'textContent', lastUpdateTimestamp);
        this._bindingHelper.setElementAttributeValue('span.item-count', 'textContent', metrics.itemCount);
        this._bindingHelper.setElementAttributeValue('span.total-count', 'textContent', metrics.totalItemCount);
        // locale text changes
        if ((_a = this.customFooterOptions.metricTexts) === null || _a === void 0 ? void 0 : _a.lastUpdate) {
            this._bindingHelper.addElementBinding(this.customFooterOptions.metricTexts, 'lastUpdate', 'span.text-last-update', 'textContent');
        }
        this._bindingHelper.addElementBinding(this.customFooterOptions.metricTexts, 'items', 'span.text-items', 'textContent');
        this._bindingHelper.addElementBinding(this.customFooterOptions.metricTexts, 'of', 'span.text-of', 'textContent');
    }
    /** Render the left side footer text */
    renderLeftFooterText(text) {
        this._bindingHelper.setElementAttributeValue('div.left-footer', 'textContent', text);
    }
    /** Render the right side footer text */
    renderRightFooterText(text) {
        this._bindingHelper.setElementAttributeValue('div.right-footer', 'textContent', text);
    }
    /** Translate all Custom Footer Texts (footer with metrics) */
    translateCustomFooterTexts() {
        var _a, _b, _c, _d, _f;
        if (this.gridOptions.enableTranslate && ((_a = this.translaterService) === null || _a === void 0 ? void 0 : _a.translate)) {
            this.customFooterOptions.metricTexts = this.customFooterOptions.metricTexts || {};
            for (const propName of Object.keys(this.customFooterOptions.metricTexts)) {
                if (propName.lastIndexOf('Key') > 0) {
                    const propNameWithoutKey = propName.substring(0, propName.lastIndexOf('Key'));
                    this.customFooterOptions.metricTexts[propNameWithoutKey] = this.translaterService.translate(this.customFooterOptions.metricTexts[propName] || ' ');
                }
            }
            // when we're display row selection count on left footer, we also need to translate that text with its count
            if (this._isLeftFooterDisplayingSelectionRowCount) {
                this.leftFooterText = `${this._selectedRowCount} ${this.customFooterOptions.metricTexts.itemsSelected}`;
            }
        }
        else if (this.locales) {
            this.customFooterOptions.metricTexts = this.customFooterOptions.metricTexts || {};
            this.customFooterOptions.metricTexts.lastUpdate = this.customFooterOptions.metricTexts.lastUpdate || ((_b = this.locales) === null || _b === void 0 ? void 0 : _b.TEXT_LAST_UPDATE) || 'TEXT_LAST_UPDATE';
            this.customFooterOptions.metricTexts.items = this.customFooterOptions.metricTexts.items || ((_c = this.locales) === null || _c === void 0 ? void 0 : _c.TEXT_ITEMS) || 'TEXT_ITEMS';
            this.customFooterOptions.metricTexts.itemsSelected = this.customFooterOptions.metricTexts.itemsSelected || ((_d = this.locales) === null || _d === void 0 ? void 0 : _d.TEXT_ITEMS_SELECTED) || 'TEXT_ITEMS_SELECTED';
            this.customFooterOptions.metricTexts.of = this.customFooterOptions.metricTexts.of || ((_f = this.locales) === null || _f === void 0 ? void 0 : _f.TEXT_OF) || 'TEXT_OF';
        }
    }
    // --
    // protected functions
    // --------------------
    /** Create the Footer Container */
    createFooterContainer(gridParentContainerElm) {
        const footerElm = createDomElement('div', {
            className: `slick-custom-footer ${this.gridUid}`,
            style: {
                width: '100%',
                height: `${this.customFooterOptions.footerHeight || 20}px`,
            }
        });
        const leftFooterElm = createDomElement('div', { className: `left-footer ${this.customFooterOptions.leftContainerClass}` });
        leftFooterElm.innerHTML = sanitizeTextByAvailableSanitizer(this.gridOptions, this.customFooterOptions.leftFooterText || '');
        footerElm.appendChild(leftFooterElm);
        footerElm.appendChild(this.createFooterRightContainer());
        this._footerElement = footerElm;
        if ((gridParentContainerElm === null || gridParentContainerElm === void 0 ? void 0 : gridParentContainerElm.appendChild) && this._footerElement) {
            gridParentContainerElm.appendChild(this._footerElement);
        }
    }
    /** Create the Right Section Footer */
    createFooterRightContainer() {
        var _a, _b, _c, _d, _f, _g, _h, _j;
        const rightFooterElm = createDomElement('div', { className: `right-footer ${this.customFooterOptions.rightContainerClass || ''}` });
        if (!this._isRightFooterOriginallyEmpty) {
            rightFooterElm.innerHTML = sanitizeTextByAvailableSanitizer(this.gridOptions, this.customFooterOptions.rightFooterText || '');
        }
        else if (!this.customFooterOptions.hideMetrics) {
            rightFooterElm.classList.add('metrics');
            const lastUpdateElm = createDomElement('span', { className: 'timestamp' }, rightFooterElm);
            if (!this.customFooterOptions.hideLastUpdateTimestamp) {
                const footerLastUpdateElm = this.createFooterLastUpdate();
                if (footerLastUpdateElm) {
                    lastUpdateElm.appendChild(footerLastUpdateElm);
                }
            }
            // last update elements
            rightFooterElm.appendChild(createDomElement('span', { className: 'item-count', textContent: `${(_b = (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.itemCount) !== null && _b !== void 0 ? _b : '0'}` }));
            // total count element (unless hidden)
            if (!this.customFooterOptions.hideTotalItemCount) {
                // add carriage return which will add a space before the span
                rightFooterElm.appendChild(document.createTextNode('\r\n'));
                rightFooterElm.appendChild(createDomElement('span', { className: 'text-of', textContent: ` ${(_d = (_c = this.customFooterOptions.metricTexts) === null || _c === void 0 ? void 0 : _c.of) !== null && _d !== void 0 ? _d : 'of'} ` }));
                // add another carriage return which will add a space after the span
                rightFooterElm.appendChild(document.createTextNode('\r\n'));
                rightFooterElm.appendChild(createDomElement('span', { className: 'total-count', textContent: `${(_g = (_f = this.metrics) === null || _f === void 0 ? void 0 : _f.totalItemCount) !== null && _g !== void 0 ? _g : '0'}` }));
            }
            // add carriage return which will add a space before the span
            rightFooterElm.appendChild(document.createTextNode('\r\n'));
            rightFooterElm.appendChild(createDomElement('span', { className: 'text-items', textContent: ` ${(_j = (_h = this.customFooterOptions.metricTexts) === null || _h === void 0 ? void 0 : _h.items) !== null && _j !== void 0 ? _j : 'items'} ` }));
        }
        return rightFooterElm;
    }
    /** Create the Right Section Last Update Timestamp */
    createFooterLastUpdate() {
        var _a, _b, _c, _d;
        // get translated text & last timestamp
        const lastUpdateText = (_c = (_b = (_a = this.customFooterOptions) === null || _a === void 0 ? void 0 : _a.metricTexts) === null || _b === void 0 ? void 0 : _b.lastUpdate) !== null && _c !== void 0 ? _c : 'Last Update';
        const lastUpdateTimestamp = moment((_d = this.metrics) === null || _d === void 0 ? void 0 : _d.endTime).format(this.customFooterOptions.dateFormat);
        const lastUpdateContainerElm = createDomElement('span');
        lastUpdateContainerElm.appendChild(createDomElement('span', { className: 'text-last-update', textContent: lastUpdateText }));
        lastUpdateContainerElm.appendChild(document.createTextNode('\r\n'));
        lastUpdateContainerElm.appendChild(createDomElement('span', { className: 'last-update-timestamp', textContent: lastUpdateTimestamp }));
        lastUpdateContainerElm.appendChild(createDomElement('span', { className: 'separator', textContent: ` ${this.customFooterOptions.metricSeparator || ''} ` }));
        return lastUpdateContainerElm;
    }
    /**
     * When user has row selections enabled and does not have any custom text shown on the left side footer,
     * we will show the row selection count on the bottom left side of the footer (by subscribing to the SlickGrid `onSelectedRowsChanged` event).
     * @param customFooterOptions
     */
    registerOnSelectedRowsChangedWhenEnabled(customFooterOptions) {
        var _a, _b, _c, _d;
        const isRowSelectionEnabled = this.gridOptions.enableCheckboxSelector || this.gridOptions.enableRowSelection;
        if (isRowSelectionEnabled && customFooterOptions && (!customFooterOptions.hideRowSelectionCount && this._isLeftFooterOriginallyEmpty)) {
            this._isLeftFooterDisplayingSelectionRowCount = true;
            const selectedCountText = (_d = (_b = (_a = customFooterOptions.metricTexts) === null || _a === void 0 ? void 0 : _a.itemsSelected) !== null && _b !== void 0 ? _b : (_c = this.locales) === null || _c === void 0 ? void 0 : _c.TEXT_ITEMS_SELECTED) !== null && _d !== void 0 ? _d : 'TEXT_ITEMS_SELECTED';
            customFooterOptions.leftFooterText = `0 ${selectedCountText}`;
            this._eventHandler.subscribe(this.grid.onSelectedRowsChanged, (_e, args) => {
                var _a, _b, _c, _d;
                this._selectedRowCount = args.rows.length;
                const selectedCountText2 = (_d = (_b = (_a = customFooterOptions.metricTexts) === null || _a === void 0 ? void 0 : _a.itemsSelected) !== null && _b !== void 0 ? _b : (_c = this.locales) === null || _c === void 0 ? void 0 : _c.TEXT_ITEMS_SELECTED) !== null && _d !== void 0 ? _d : 'TEXT_ITEMS_SELECTED';
                this.leftFooterText = `${this._selectedRowCount} ${selectedCountText2}`;
            });
        }
    }
}
//# sourceMappingURL=slick-footer.component.js.map