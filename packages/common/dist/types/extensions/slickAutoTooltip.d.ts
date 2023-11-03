import type { AutoTooltipOption, Column, SlickEventHandler, SlickGrid } from '../interfaces/index';
/**
 * AutoTooltips plugin to show/hide tooltips when columns are too narrow to fit content.
 * @constructor
 * @param {boolean} [options.enableForCells=true]        - Enable tooltip for grid cells
 * @param {boolean} [options.enableForHeaderCells=false] - Enable tooltip for header cells
 * @param {number}  [options.maxToolTipLength=null]      - The maximum length for a tooltip
 */
export declare class SlickAutoTooltip {
    protected _eventHandler: SlickEventHandler;
    protected _grid: SlickGrid;
    protected _addonOptions?: AutoTooltipOption;
    protected _defaults: AutoTooltipOption;
    pluginName: 'AutoTooltips';
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(options?: AutoTooltipOption);
    get addonOptions(): AutoTooltipOption;
    get eventHandler(): SlickEventHandler;
    /** Initialize plugin. */
    init(grid: SlickGrid): void;
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose(): void;
    /**
     * Handle mouse entering grid cell to add/remove tooltip.
     * @param {Object} event - The event
     */
    protected handleMouseEnter(event: MouseEvent): void;
    /**
     * Handle mouse entering header cell to add/remove tooltip.
     * @param {Object} event - The event
     * @param {Object} args.column - The column definition
     */
    protected handleHeaderMouseEnter(event: MouseEvent, args: {
        column: Column;
    }): void;
}
//# sourceMappingURL=slickAutoTooltip.d.ts.map