import type { SlickEventHandler, SlickGrid } from './../interfaces/index';
export declare class GridEventService {
    protected _eventHandler: SlickEventHandler;
    get eventHandler(): SlickEventHandler;
    constructor();
    dispose(): void;
    bindOnBeforeEditCell(grid: SlickGrid): void;
    bindOnCellChange(grid: SlickGrid): void;
    bindOnClick(grid: SlickGrid): void;
}
//# sourceMappingURL=gridEvent.service.d.ts.map