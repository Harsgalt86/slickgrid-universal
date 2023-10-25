import type { BasePubSubService, EventSubscription } from '@slickgrid-universal/event-pub-sub';
import type { Column, GridOption, SlickDataView, SlickEventHandler, SlickGrid } from './../interfaces/index';
import type { ExtensionUtility } from '../extensions/extensionUtility';
export declare class GroupingAndColspanService {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly pubSubService: BasePubSubService;
    protected _eventHandler: SlickEventHandler;
    protected _grid: SlickGrid;
    protected _subscriptions: EventSubscription[];
    constructor(extensionUtility: ExtensionUtility, pubSubService: BasePubSubService);
    /** Getter of SlickGrid DataView object */
    get _dataView(): SlickDataView;
    /** Getter of the SlickGrid Event Handler */
    get eventHandler(): SlickEventHandler;
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get _gridOptions(): GridOption;
    /** Getter for the Column Definitions pulled through the Grid Object */
    protected get _columnDefinitions(): Column[];
    /**
     * Initialize the Service
     * @param {object} grid
     * @param {object} resizerPlugin
     */
    init(grid: SlickGrid): void;
    dispose(): void;
    /** call "renderPreHeaderRowGroupingTitles()" with a setTimeout delay */
    delayRenderPreHeaderRowGroupingTitles(delay?: number): void;
    /** Create or Render the Pre-Header Row Grouping Titles */
    renderPreHeaderRowGroupingTitles(): void;
    renderHeaderGroups(preHeaderPanel: HTMLElement, start: number, end: number): void;
    /** Translate Column Group texts and re-render them afterward. */
    translateGroupingAndColSpan(): void;
}
//# sourceMappingURL=groupingAndColspan.service.d.ts.map