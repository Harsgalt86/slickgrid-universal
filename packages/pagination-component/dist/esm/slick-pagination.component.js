import { Constants, createDomElement, getTranslationPrefix, } from '@slickgrid-universal/common';
import { BindingHelper } from '@slickgrid-universal/binding';
export class SlickPaginationComponent {
    constructor(paginationService, pubSubService, sharedService, translaterService) {
        var _a, _b, _c, _d, _e;
        this.paginationService = paginationService;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this.translaterService = translaterService;
        this._enableTranslate = false;
        this._subscriptions = [];
        this.firstButtonClasses = '';
        this.lastButtonClasses = '';
        this.prevButtonClasses = '';
        this.nextButtonClasses = '';
        // text translations (handled by i18n or by custom locale)
        this.textItemsPerPage = 'items per page';
        this.textItems = 'items';
        this.textOf = 'of';
        this.textPage = 'Page';
        this._bindingHelper = new BindingHelper();
        this._bindingHelper.querySelectorPrefix = `.${this.gridUid} `;
        this.currentPagination = this.paginationService.getFullPagination();
        this._enableTranslate = (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.enableTranslate) !== null && _b !== void 0 ? _b : false;
        if (this._enableTranslate && (!this.translaterService || !this.translaterService.translate)) {
            throw new Error('[Slickgrid-Universal] requires a Translate Service to be installed and configured when the grid option "enableTranslate" is enabled.');
        }
        this.translatePaginationTexts();
        if (this._enableTranslate && ((_c = this.pubSubService) === null || _c === void 0 ? void 0 : _c.subscribe)) {
            const translateEventName = (_e = (_d = this.translaterService) === null || _d === void 0 ? void 0 : _d.eventName) !== null && _e !== void 0 ? _e : 'onLanguageChange';
            this._subscriptions.push(this.pubSubService.subscribe(translateEventName, () => this.translatePaginationTexts()));
        }
        // Anytime the pagination is initialized or has changes,
        // we'll copy the data into a local object so that we can add binding to this local object
        this._subscriptions.push(this.pubSubService.subscribe('onPaginationRefreshed', paginationChanges => {
            for (const key of Object.keys(paginationChanges)) {
                this.currentPagination[key] = paginationChanges[key];
            }
            this.updatePageButtonsUsability();
            const pageFromToElm = document.querySelector(`.${this.gridUid} span.page-info-from-to`);
            if (pageFromToElm === null || pageFromToElm === void 0 ? void 0 : pageFromToElm.style) {
                pageFromToElm.style.display = (this.currentPagination.totalItems === 0) ? 'none' : '';
            }
        }));
    }
    get availablePageSizes() {
        return this.paginationService.availablePageSizes || [];
    }
    get dataFrom() {
        return this.paginationService.dataFrom;
    }
    get dataTo() {
        return this.paginationService.dataTo;
    }
    get itemsPerPage() {
        return this.paginationService.itemsPerPage;
    }
    set itemsPerPage(count) {
        this.paginationService.changeItemPerPage(count);
    }
    get pageCount() {
        return this.paginationService.pageCount;
    }
    get pageNumber() {
        return this.paginationService.pageNumber;
    }
    set pageNumber(_page) {
        // the setter has to be declared but we won't use it, instead we will use the "changeToCurrentPage()" to only update the value after ENTER keydown event
    }
    get grid() {
        return this.sharedService.slickGrid;
    }
    get gridOptions() {
        return this.sharedService.gridOptions;
    }
    get gridUid() {
        var _a, _b;
        return (_b = (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getUID()) !== null && _b !== void 0 ? _b : '';
    }
    get locales() {
        var _a, _b;
        // get locales provided by user in main file or else use default English locales via the Constants
        return (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.locales) !== null && _b !== void 0 ? _b : Constants.locales;
    }
    get totalItems() {
        return this.paginationService.totalItems;
    }
    get isLeftPaginationDisabled() {
        return this.pageNumber === 1 || this.totalItems === 0;
    }
    get isRightPaginationDisabled() {
        return this.pageNumber === this.pageCount || this.totalItems === 0;
    }
    dispose() {
        // also dispose of all Subscriptions
        this.pubSubService.unsubscribeAll(this._subscriptions);
        this._bindingHelper.dispose();
        this._paginationElement.remove();
    }
    renderPagination(gridParentContainerElm) {
        const paginationElm = this.createPaginationContainer();
        const divNavContainerElm = createDomElement('div', { className: 'slick-pagination-nav' });
        const leftNavigationElm = this.createPageNavigation('Page navigation', [
            { liClass: 'page-item seek-first', aClass: 'page-link icon-seek-first', ariaLabel: 'First Page' },
            { liClass: 'page-item seek-prev', aClass: 'page-link icon-seek-prev', ariaLabel: 'Previous Page' },
        ]);
        const pageNumberSectionElm = this.createPageNumberSection();
        const rightNavigationElm = this.createPageNavigation('Page navigation', [
            { liClass: 'page-item seek-next', aClass: 'page-link icon-seek-next', ariaLabel: 'Next Page' },
            { liClass: 'page-item seek-end', aClass: 'page-link icon-seek-end', ariaLabel: 'Last Page' },
        ]);
        paginationElm.appendChild(divNavContainerElm);
        divNavContainerElm.appendChild(leftNavigationElm);
        divNavContainerElm.appendChild(pageNumberSectionElm);
        divNavContainerElm.appendChild(rightNavigationElm);
        const paginationSettingsElm = this.createPaginationSettingsSection();
        paginationElm.appendChild(divNavContainerElm);
        paginationElm.appendChild(paginationSettingsElm);
        this._paginationElement.appendChild(paginationElm);
        if ((gridParentContainerElm === null || gridParentContainerElm === void 0 ? void 0 : gridParentContainerElm.appendChild) && this._paginationElement) {
            gridParentContainerElm.appendChild(this._paginationElement);
        }
        this.renderPageSizes();
        this.addBindings();
        this.addEventListeners();
        this.updatePageButtonsUsability();
    }
    /** Render and fill the Page Sizes <select> element */
    renderPageSizes() {
        const selectElm = document.querySelector(`.${this.gridUid} .items-per-page`);
        if (selectElm && Array.isArray(this.availablePageSizes)) {
            for (const option of this.availablePageSizes) {
                selectElm.appendChild(createDomElement('option', { value: `${option}`, text: `${option}` }));
            }
        }
    }
    /** Add some DOM Element bindings */
    addBindings() {
        this._bindingHelper.addElementBinding(this, 'firstButtonClasses', 'li.page-item.seek-first', 'className');
        this._bindingHelper.addElementBinding(this, 'prevButtonClasses', 'li.page-item.seek-prev', 'className');
        this._bindingHelper.addElementBinding(this, 'lastButtonClasses', 'li.page-item.seek-end', 'className');
        this._bindingHelper.addElementBinding(this, 'nextButtonClasses', 'li.page-item.seek-next', 'className');
        this._bindingHelper.addElementBinding(this.currentPagination, 'dataFrom', 'span.item-from', 'textContent');
        this._bindingHelper.addElementBinding(this.currentPagination, 'dataTo', 'span.item-to', 'textContent');
        this._bindingHelper.addElementBinding(this.currentPagination, 'totalItems', 'span.total-items', 'textContent');
        this._bindingHelper.addElementBinding(this.currentPagination, 'pageCount', 'span.page-count', 'textContent');
        this._bindingHelper.addElementBinding(this.currentPagination, 'pageSize', 'select.items-per-page', 'value');
        this.paginationService.cursorBased
            ? this._bindingHelper.addElementBinding(this.currentPagination, 'pageNumber', 'span.page-number', 'textContent')
            : this._bindingHelper.addElementBinding(this.currentPagination, 'pageNumber', 'input.page-number', 'value', 'change', this.changeToCurrentPage.bind(this));
        // locale text changes
        this._bindingHelper.addElementBinding(this, 'textItems', 'span.text-items', 'textContent');
        this._bindingHelper.addElementBinding(this, 'textItemsPerPage', 'span.text-item-per-page', 'textContent');
        this._bindingHelper.addElementBinding(this, 'textOf', 'span.text-of', 'textContent');
        this._bindingHelper.addElementBinding(this, 'textPage', 'span.text-page', 'textContent');
    }
    /** Add some DOM Element event listeners */
    addEventListeners() {
        this._bindingHelper.bindEventHandler('.icon-seek-first', 'click', this.changeToFirstPage.bind(this));
        this._bindingHelper.bindEventHandler('.icon-seek-end', 'click', this.changeToLastPage.bind(this));
        this._bindingHelper.bindEventHandler('.icon-seek-next', 'click', this.changeToNextPage.bind(this));
        this._bindingHelper.bindEventHandler('.icon-seek-prev', 'click', this.changeToPreviousPage.bind(this));
        this._bindingHelper.bindEventHandler('select.items-per-page', 'change', (event) => { var _a, _b; return this.itemsPerPage = +((_b = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0); });
    }
    changeToFirstPage(event) {
        if (!this.isLeftPaginationDisabled) {
            this.paginationService.goToFirstPage(event);
        }
    }
    changeToLastPage(event) {
        if (!this.isRightPaginationDisabled) {
            this.paginationService.goToLastPage(event);
        }
    }
    changeToNextPage(event) {
        if (!this.isRightPaginationDisabled) {
            this.paginationService.goToNextPage(event);
        }
    }
    changeToPreviousPage(event) {
        if (!this.isLeftPaginationDisabled) {
            this.paginationService.goToPreviousPage(event);
        }
    }
    changeToCurrentPage(pageNumber) {
        this.paginationService.goToPageNumber(+pageNumber);
    }
    /** Translate all the texts shown in the UI, use ngx-translate service when available or custom locales when service is null */
    translatePaginationTexts() {
        var _a;
        if (this._enableTranslate && ((_a = this.translaterService) === null || _a === void 0 ? void 0 : _a.translate)) {
            const translationPrefix = getTranslationPrefix(this.gridOptions);
            this.textItemsPerPage = this.translaterService.translate(`${translationPrefix}ITEMS_PER_PAGE`);
            this.textItems = this.translaterService.translate(`${translationPrefix}ITEMS`);
            this.textOf = this.translaterService.translate(`${translationPrefix}OF`);
            this.textPage = this.translaterService.translate(`${translationPrefix}PAGE`);
        }
        else if (this.locales) {
            this.textItemsPerPage = this.locales.TEXT_ITEMS_PER_PAGE || 'TEXT_ITEMS_PER_PAGE';
            this.textItems = this.locales.TEXT_ITEMS || 'TEXT_ITEMS';
            this.textOf = this.locales.TEXT_OF || 'TEXT_OF';
            this.textPage = this.locales.TEXT_PAGE || 'TEXT_PAGE';
        }
    }
    // --
    // protected functions
    // --------------------
    /** Create the Pagination Container */
    createPaginationContainer() {
        const paginationContainerElm = createDomElement('div', {
            id: 'pager', className: `slick-pagination-container ${this.gridUid} pager`,
            style: { width: '100%' },
        });
        const paginationElm = createDomElement('div', { className: 'slick-pagination' });
        paginationContainerElm.appendChild(paginationElm);
        this._paginationElement = paginationContainerElm; // keep internal ref
        return paginationElm;
    }
    createPageNavigation(navAriaLabel, liElements) {
        const navElm = createDomElement('nav', { ariaLabel: navAriaLabel });
        const ulElm = createDomElement('ul', { className: 'pagination' });
        for (const li of liElements) {
            createDomElement('li', { className: li.liClass }, ulElm)
                .appendChild(createDomElement('a', { className: li.aClass, ariaLabel: li.ariaLabel, role: 'button' }));
        }
        navElm.appendChild(ulElm);
        return navElm;
    }
    createPageNumberSection() {
        const divElm = createDomElement('div', { className: 'slick-page-number' });
        createDomElement('span', { className: 'text-page', textContent: 'Page' }, divElm);
        divElm.appendChild(document.createTextNode(' '));
        if (this.paginationService.cursorBased) {
            // cursor based navigation cannot jump to an arbitrary page. Display current page.
            createDomElement('span', {
                className: 'page-number',
                ariaLabel: 'Page Number',
                dataset: { test: 'page-number-label' },
                textContent: '1',
            }, divElm);
        }
        else {
            // offset based navigation can jump to any page. Allow editing of current page number.
            createDomElement('input', {
                type: 'text',
                className: 'form-control page-number',
                ariaLabel: 'Page Number',
                value: '1', size: 1,
                dataset: { test: 'page-number-input' },
            }, divElm);
        }
        divElm.appendChild(document.createTextNode(' '));
        createDomElement('span', { className: 'text-of', textContent: 'of' }, divElm);
        divElm.appendChild(document.createTextNode(' '));
        createDomElement('span', { className: 'page-count', dataset: { test: 'page-count' } }, divElm);
        return divElm;
    }
    createPaginationSettingsSection() {
        const spanContainerElm = createDomElement('span', { className: 'slick-pagination-settings' });
        createDomElement('select', { id: 'items-per-page-label', ariaLabel: 'Items per Page', className: 'items-per-page' }, spanContainerElm);
        spanContainerElm.appendChild(document.createTextNode(' '));
        createDomElement('span', { className: 'text-item-per-page', textContent: 'items per page' }, spanContainerElm);
        spanContainerElm.appendChild(document.createTextNode(', '));
        const spanPaginationCount = createDomElement('span', { className: 'slick-pagination-count' }, spanContainerElm);
        const spanInfoFromToElm = createDomElement('span', { className: 'page-info-from-to' }, spanPaginationCount);
        createDomElement('span', { className: 'item-from', ariaLabel: 'Page Item From', dataset: { test: 'item-from' } }, spanInfoFromToElm);
        spanInfoFromToElm.appendChild(document.createTextNode('-'));
        createDomElement('span', { className: 'item-to', ariaLabel: 'Page Item To', dataset: { test: 'item-to' } }, spanInfoFromToElm);
        spanInfoFromToElm.appendChild(document.createTextNode(' '));
        createDomElement('span', { className: 'text-of', textContent: 'of' }, spanInfoFromToElm);
        spanInfoFromToElm.appendChild(document.createTextNode(' '));
        const spanInfoTotalElm = createDomElement('span', { className: 'page-info-total-items' }, spanPaginationCount);
        createDomElement('span', { className: 'total-items', ariaLabel: 'Total Items', dataset: { test: 'total-items' } }, spanInfoTotalElm);
        spanInfoTotalElm.appendChild(document.createTextNode(' '));
        createDomElement('span', { className: 'text-items', textContent: 'items' }, spanInfoTotalElm);
        spanInfoTotalElm.appendChild(document.createTextNode(' '));
        return spanContainerElm;
    }
    updatePageButtonsUsability() {
        this.firstButtonClasses = this.isLeftPaginationDisabled ? 'page-item seek-first disabled' : 'page-item seek-first';
        this.prevButtonClasses = this.isLeftPaginationDisabled ? 'page-item seek-prev disabled' : 'page-item seek-prev';
        this.lastButtonClasses = this.isRightPaginationDisabled ? 'page-item seek-end disabled' : 'page-item seek-end';
        this.nextButtonClasses = this.isRightPaginationDisabled ? 'page-item seek-next disabled' : 'page-item seek-next';
    }
}
//# sourceMappingURL=slick-pagination.component.js.map