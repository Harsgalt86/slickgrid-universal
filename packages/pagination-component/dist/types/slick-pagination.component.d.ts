import type { GridOption, Locale, PaginationService, PubSubService, ServicePagination, SharedService, Subscription, TranslaterService } from '@slickgrid-universal/common';
import { SlickGrid } from '@slickgrid-universal/common';
import { BindingHelper } from '@slickgrid-universal/binding';
export declare class SlickPaginationComponent {
    protected readonly paginationService: PaginationService;
    protected readonly pubSubService: PubSubService;
    protected readonly sharedService: SharedService;
    protected readonly translaterService?: TranslaterService | undefined;
    protected _bindingHelper: BindingHelper;
    protected _paginationElement: HTMLDivElement;
    protected _enableTranslate: boolean;
    protected _subscriptions: Subscription[];
    currentPagination: ServicePagination;
    firstButtonClasses: string;
    lastButtonClasses: string;
    prevButtonClasses: string;
    nextButtonClasses: string;
    textItemsPerPage: string;
    textItems: string;
    textOf: string;
    textPage: string;
    constructor(paginationService: PaginationService, pubSubService: PubSubService, sharedService: SharedService, translaterService?: TranslaterService | undefined);
    get availablePageSizes(): number[];
    get dataFrom(): number;
    get dataTo(): number;
    get itemsPerPage(): number;
    set itemsPerPage(count: number);
    get pageCount(): number;
    get pageNumber(): number;
    set pageNumber(_page: number);
    get grid(): SlickGrid;
    get gridOptions(): GridOption;
    get gridUid(): string;
    get locales(): Locale;
    get totalItems(): number;
    get isLeftPaginationDisabled(): boolean;
    get isRightPaginationDisabled(): boolean;
    dispose(): void;
    renderPagination(gridParentContainerElm: HTMLElement): void;
    /** Render and fill the Page Sizes <select> element */
    renderPageSizes(): void;
    /** Add some DOM Element bindings */
    addBindings(): void;
    /** Add some DOM Element event listeners */
    addEventListeners(): void;
    changeToFirstPage(event: MouseEvent): void;
    changeToLastPage(event: MouseEvent): void;
    changeToNextPage(event: MouseEvent): void;
    changeToPreviousPage(event: MouseEvent): void;
    changeToCurrentPage(pageNumber: number): void;
    /** Translate all the texts shown in the UI, use ngx-translate service when available or custom locales when service is null */
    translatePaginationTexts(): void;
    /** Create the Pagination Container */
    protected createPaginationContainer(): HTMLDivElement;
    protected createPageNavigation(navAriaLabel: string, liElements: Array<{
        liClass: string;
        aClass: string;
        ariaLabel: string;
    }>): HTMLElement;
    protected createPageNumberSection(): HTMLDivElement;
    protected createPaginationSettingsSection(): HTMLSpanElement;
    protected updatePageButtonsUsability(): void;
}
//# sourceMappingURL=slick-pagination.component.d.ts.map