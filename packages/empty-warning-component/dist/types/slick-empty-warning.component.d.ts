import type { ContainerService, EmptyWarning, ExternalResource, GridOption, SlickGrid, TranslaterService } from '@slickgrid-universal/common';
export declare class SlickEmptyWarningComponent implements ExternalResource {
    protected _warningLeftElement: HTMLDivElement | null;
    protected _warningRightElement: HTMLDivElement | null;
    protected grid: SlickGrid;
    protected isPreviouslyShown: boolean;
    protected translaterService?: TranslaterService | null;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    constructor();
    init(grid: SlickGrid, containerService: ContainerService): void;
    dispose(): void;
    /**
     * Display a warning of empty data when the filtered dataset is empty
     * NOTE: to make this code reusable, you could (should) move this code into a utility service
     * @param isShowing - are we showing the message?
     * @param options - any styling options you'd like to pass like the text color
     */
    showEmptyDataMessage(isShowing?: boolean, options?: EmptyWarning): boolean;
}
//# sourceMappingURL=slick-empty-warning.component.d.ts.map