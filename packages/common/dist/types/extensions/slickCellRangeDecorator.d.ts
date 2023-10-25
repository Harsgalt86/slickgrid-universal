import { CellRange, CellRangeDecoratorOption, type SlickGrid } from '../interfaces/index';
/**
 * Displays an overlay on top of a given cell range.
 * TODO:
 * Currently, it blocks mouse events to DOM nodes behind it.
 * Use FF and WebKit-specific "pointer-events" CSS style, or some kind of event forwarding.
 * Could also construct the borders separately using 4 individual DIVs.
 */
export declare class SlickCellRangeDecorator {
    protected readonly grid: SlickGrid;
    pluginName: 'CellRangeDecorator';
    protected _addonOptions: CellRangeDecoratorOption;
    protected _elem?: HTMLElement | null;
    protected _defaults: CellRangeDecoratorOption;
    constructor(grid: SlickGrid, options?: Partial<CellRangeDecoratorOption>);
    get addonOptions(): CellRangeDecoratorOption;
    get addonElement(): HTMLElement | null | undefined;
    /** Dispose the plugin. */
    dispose(): void;
    hide(): void;
    show(range: CellRange): HTMLElement;
}
//# sourceMappingURL=slickCellRangeDecorator.d.ts.map