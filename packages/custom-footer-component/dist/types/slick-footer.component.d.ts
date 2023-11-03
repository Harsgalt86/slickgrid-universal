import type { CustomFooterOption, GridOption, Locale, Metrics, SlickEventHandler, SlickGrid, Subscription, TranslaterService } from '@slickgrid-universal/common';
import { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import { BindingHelper } from '@slickgrid-universal/binding';
export declare class SlickFooterComponent {
    protected readonly grid: SlickGrid;
    protected readonly customFooterOptions: CustomFooterOption;
    protected readonly pubSubService: BasePubSubService;
    protected readonly translaterService?: TranslaterService | undefined;
    protected _bindingHelper: BindingHelper;
    protected _enableTranslate: boolean;
    protected _eventHandler: SlickEventHandler;
    protected _footerElement: HTMLDivElement;
    protected _isLeftFooterOriginallyEmpty: boolean;
    protected _isLeftFooterDisplayingSelectionRowCount: boolean;
    protected _isRightFooterOriginallyEmpty: boolean;
    protected _selectedRowCount: number;
    protected _subscriptions: Subscription[];
    get eventHandler(): SlickEventHandler;
    /** Getter for the grid uid */
    get gridUid(): string;
    get gridUidSelector(): string;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    get locales(): Locale;
    set metrics(metrics: Metrics);
    get leftFooterText(): string;
    set leftFooterText(text: string);
    get rightFooterText(): string;
    set rightFooterText(text: string);
    constructor(grid: SlickGrid, customFooterOptions: CustomFooterOption, pubSubService: BasePubSubService, translaterService?: TranslaterService | undefined);
    dispose(): void;
    /**
     * We could optionally display a custom footer below the grid to show some metrics (last update, item count with/without filters)
     * It's an opt-in, user has to enable "showCustomFooter" and it cannot be used when there's already a Pagination since they display the same kind of info
     */
    renderFooter(gridParentContainerElm: HTMLElement): void;
    /** Render element attribute values */
    renderMetrics(metrics: Metrics): void;
    /** Render the left side footer text */
    renderLeftFooterText(text: string): void;
    /** Render the right side footer text */
    renderRightFooterText(text: string): void;
    /** Translate all Custom Footer Texts (footer with metrics) */
    translateCustomFooterTexts(): void;
    /** Create the Footer Container */
    protected createFooterContainer(gridParentContainerElm: HTMLElement): void;
    /** Create the Right Section Footer */
    protected createFooterRightContainer(): HTMLDivElement;
    /** Create the Right Section Last Update Timestamp */
    protected createFooterLastUpdate(): HTMLSpanElement;
    /**
     * When user has row selections enabled and does not have any custom text shown on the left side footer,
     * we will show the row selection count on the bottom left side of the footer (by subscribing to the SlickGrid `onSelectedRowsChanged` event).
     * @param customFooterOptions
     */
    protected registerOnSelectedRowsChangedWhenEnabled(customFooterOptions: CustomFooterOption): void;
}
//# sourceMappingURL=slick-footer.component.d.ts.map