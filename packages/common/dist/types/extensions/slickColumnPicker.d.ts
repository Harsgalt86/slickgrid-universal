import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { Column, ColumnPickerOption, DOMMouseOrTouchEvent, GridOption, SlickEventHandler, SlickGrid } from '../interfaces/index';
import type { ExtensionUtility } from '../extensions/extensionUtility';
import { BindingEventService } from '../services/bindingEvent.service';
import type { SharedService } from '../services/shared.service';
/**
 * A control to add a Column Picker (right+click on any column header to reveal the column picker)
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.gridOptions = {
 *     enableColumnPicker: true,
 *     columnPicker: {
 *       ... column picker options ...
 *     }
 *   }];
 * @class ColumnPickerControl
 * @constructor
 */
export declare class SlickColumnPicker {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected _areVisibleColumnDifferent: boolean;
    protected _bindEventService: BindingEventService;
    protected _columns: Column[];
    protected _columnTitleElm: HTMLDivElement;
    protected _eventHandler: SlickEventHandler;
    protected _gridUid: string;
    protected _listElm: HTMLSpanElement;
    protected _menuElm: HTMLDivElement | null;
    protected _columnCheckboxes: HTMLInputElement[];
    onColumnsChanged: import("../interfaces/slickEvent.interface").SlickEvent<any>;
    protected _defaults: ColumnPickerOption;
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility: ExtensionUtility, pubSubService: BasePubSubService, sharedService: SharedService);
    get addonOptions(): ColumnPickerOption;
    get eventHandler(): SlickEventHandler;
    get columns(): Column[];
    set columns(newColumns: Column[]);
    get gridOptions(): GridOption;
    get grid(): SlickGrid;
    get menuElement(): HTMLDivElement | null;
    /** Initialize plugin. */
    init(): void;
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose(): void;
    disposeMenu(): void;
    createPickerMenu(): HTMLDivElement;
    /**
     * Get all columns including hidden columns.
     * @returns {Array<Object>} - all columns array
     */
    getAllColumns(): Column<any>[];
    /**
     * Get only the visible columns.
     * @returns {Array<Object>} - all columns array
     */
    getVisibleColumns(): Column<any>[];
    /** Translate the Column Picker headers and also the last 2 checkboxes */
    translateColumnPicker(): void;
    /** Mouse down handler when clicking anywhere in the DOM body */
    protected handleBodyMouseDown(e: DOMMouseOrTouchEvent<HTMLDivElement>): void;
    /** Mouse header context handler when doing a right+click on any of the header column title */
    protected handleHeaderContextMenu(e: DOMMouseOrTouchEvent<HTMLDivElement>): void;
    protected repositionMenu(event: DOMMouseOrTouchEvent<HTMLDivElement>): void;
    /** Update the Titles of each sections (command, commandTitle, ...) */
    protected translateTitleLabels(pickerOptions: ColumnPickerOption): void;
}
//# sourceMappingURL=slickColumnPicker.d.ts.map