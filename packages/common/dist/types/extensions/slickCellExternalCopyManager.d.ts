/// <reference types="node" />
import type { CellRange, Column, ExcelCopyBufferOption, SlickEventHandler, SlickGrid } from '../interfaces/index';
export declare class SlickCellExternalCopyManager {
    protected _addonOptions: ExcelCopyBufferOption;
    protected _bodyElement: HTMLElement;
    protected _clearCopyTI?: NodeJS.Timeout;
    protected _copiedCellStyle: string;
    protected _copiedCellStyleLayerKey: string;
    protected _copiedRanges: CellRange[] | null;
    protected _eventHandler: SlickEventHandler;
    protected _grid: SlickGrid;
    protected _onCopyInit?: () => void;
    protected _onCopySuccess?: (rowCount: number) => void;
    pluginName: 'CellExternalCopyManager';
    onCopyCells: import("../interfaces/slickEvent.interface").SlickEvent<any>;
    onCopyCancelled: import("../interfaces/slickEvent.interface").SlickEvent<any>;
    onPasteCells: import("../interfaces/slickEvent.interface").SlickEvent<any>;
    constructor();
    get addonOptions(): ExcelCopyBufferOption<any>;
    get eventHandler(): SlickEventHandler;
    init(grid: SlickGrid, options?: ExcelCopyBufferOption): void;
    dispose(): void;
    clearCopySelection(): void;
    getHeaderValueForColumn(columnDef: Column): any;
    getDataItemValueForColumn(item: any, columnDef: Column, event: Event): string | import("../interfaces/formatterResultObject.interface").FormatterResultObject;
    setDataItemValueForColumn(item: any, columnDef: Column, value: any): any | void;
    setIncludeHeaderWhenCopying(includeHeaderWhenCopying: boolean): void;
    protected createTextBox(innerText: string): HTMLTextAreaElement;
    protected decodeTabularData(grid: SlickGrid, textAreaElement: HTMLTextAreaElement): void;
    protected handleKeyDown(e: any): boolean | void;
    protected markCopySelection(ranges: CellRange[]): void;
}
//# sourceMappingURL=slickCellExternalCopyManager.d.ts.map