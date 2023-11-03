import type { Column, GridOption, BackendUtilityService, CollectionService, ExtensionService, ExtensionUtility, FilterService, GridEventService, GridService, GridStateService, GroupingAndColspanService, PaginationService, ResizerService, RxJsFacade, SharedService, SortService, TranslaterService, TreeDataService } from '@slickgrid-universal/common';
import { EventPubSubService } from '@slickgrid-universal/event-pub-sub';
import { SlickCompositeEditorComponent } from '@slickgrid-universal/composite-editor-component';
import { SlickVanillaGridBundle, UniversalContainerService } from '@slickgrid-universal/vanilla-bundle';
export declare class VanillaForceGridBundle extends SlickVanillaGridBundle {
    slickCompositeEditor: SlickCompositeEditorComponent | undefined;
    /**
     * Salesforce Slicker Grid Bundle constructor
     * @param {Object} gridParentContainerElm - div HTML DOM element container
     * @param {Array<Column>} columnDefs - Column Definitions
     * @param {Object} options - Grid Options
     * @param {Array<Object>} dataset - Dataset
     * @param {Array<Object>} hierarchicalDataset - Hierarchical Dataset
     * @param {Object} services - Typically only used for Unit Testing when we want to pass Mocked/Stub Services
     */
    constructor(gridParentContainerElm: HTMLElement, columnDefs?: Column[], options?: GridOption, dataset?: any[], hierarchicalDataset?: any[], services?: {
        backendUtilityService?: BackendUtilityService;
        collectionService?: CollectionService;
        eventPubSubService?: EventPubSubService;
        extensionService?: ExtensionService;
        extensionUtility?: ExtensionUtility;
        filterService?: FilterService;
        gridEventService?: GridEventService;
        gridService?: GridService;
        gridStateService?: GridStateService;
        groupingAndColspanService?: GroupingAndColspanService;
        paginationService?: PaginationService;
        resizerService?: ResizerService;
        rxjs?: RxJsFacade;
        sharedService?: SharedService;
        sortService?: SortService;
        treeDataService?: TreeDataService;
        translaterService?: TranslaterService;
        universalContainerService?: UniversalContainerService;
    });
    mergeGridOptions(gridOptions: GridOption): GridOption;
    protected registerResources(): void;
}
//# sourceMappingURL=vanilla-force-bundle.d.ts.map