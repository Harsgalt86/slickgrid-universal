import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { Column, DOMEvent, GridMenu, GridMenuEventWithElementCallbackArgs, GridMenuItem, GridMenuOption, GridOption } from '../interfaces/index';
import type { ExtensionUtility } from '../extensions/extensionUtility';
import type { FilterService } from '../services/filter.service';
import type { SharedService } from '../services/shared.service';
import type { SortService } from '../services/sort.service';
import { type ExtendableItemTypes, type ExtractMenuType, MenuBaseClass, type MenuType } from '../extensions/menuBaseClass';
/**
 * A control to add a Grid Menu with Extra Commands & Column Picker (hambuger menu on top-right of the grid)
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.gridOptions = {
 *     enableGridMenu: true,
 *     gridMenu: {
 *       ... grid menu options ...
 *       commandItems: [{ ...command... }, { ...command... }]
 *     }
 *   }];
 * @class GridMenuControl
 * @constructor
 */
export declare class SlickGridMenu extends MenuBaseClass<GridMenu> {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly filterService: FilterService;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected readonly sortService: SortService;
    protected _areVisibleColumnDifferent: boolean;
    protected _columns: Column[];
    protected _columnCheckboxes: HTMLInputElement[];
    protected _columnTitleElm: HTMLDivElement;
    protected _commandMenuElm: HTMLDivElement;
    protected _gridMenuOptions: GridMenu | null;
    protected _gridMenuButtonElm: HTMLButtonElement;
    protected _headerElm: HTMLDivElement | null;
    protected _isMenuOpen: boolean;
    protected _listElm: HTMLSpanElement;
    protected _userOriginalGridMenu: GridMenu;
    onAfterMenuShow: import("../interfaces/slickEvent.interface").SlickEvent<any>;
    onBeforeMenuShow: import("../interfaces/slickEvent.interface").SlickEvent<any>;
    onMenuClose: import("../interfaces/slickEvent.interface").SlickEvent<any>;
    onCommand: import("../interfaces/slickEvent.interface").SlickEvent<any>;
    onColumnsChanged: import("../interfaces/slickEvent.interface").SlickEvent<any>;
    protected _defaults: GridMenuOption;
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility: ExtensionUtility, filterService: FilterService, pubSubService: BasePubSubService, sharedService: SharedService, sortService: SortService);
    get addonOptions(): GridMenu;
    get columns(): Column[];
    set columns(newColumns: Column[]);
    get gridOptions(): GridOption;
    initEventHandlers(): void;
    /** Initialize plugin. */
    init(): void;
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose(): void;
    deleteMenu(): void;
    createColumnPickerContainer(): void;
    createGridMenu(): void;
    /**
     * Get all columns including hidden columns.
     * @returns {Array<Object>} - all columns array
     */
    getAllColumns(): Column<any>[];
    /**
     * Get only the visible columns.
     * @returns {Array<Object>} - only the visible columns array
     */
    getVisibleColumns(): Column<any>[];
    /**
     * Hide the Grid Menu but only if it does detect as open prior to executing anything.
     * @param event
     * @returns
     */
    hideMenu(event: Event): void;
    /** destroy and recreate the Grid Menu in the DOM */
    recreateGridMenu(): void;
    repositionMenu(e: MouseEvent | TouchEvent, addonOptions: GridMenu, showMenu?: boolean): void;
    showGridMenu(e: MouseEvent, options?: GridMenuOption): void;
    /** Update the Titles of each sections (command, commandTitle, ...) */
    updateAllTitles(options: GridMenuOption): void;
    /** Translate the Grid Menu titles and column picker */
    translateGridMenu(): void;
    translateTitleLabels(gridMenuOptions: GridMenu | null): void;
    /** Create Grid Menu with Custom Commands if user has enabled Filters and/or uses a Backend Service (OData, GraphQL) */
    protected addGridMenuCustomCommands(originalCommandItems: Array<GridMenuItem | 'divider'>): ("divider" | GridMenuItem)[];
    /**
     * Execute the Grid Menu Custom command callback that was triggered by the onCommand subscribe
     * These are the default internal custom commands
     * @param event
     * @param GridMenuItem args
     */
    protected executeGridMenuInternalCustomCommands(_e: Event, args: GridMenuItem): void;
    /** @return default Grid Menu options */
    protected getDefaultGridMenuOptions(): GridMenu;
    /** Mouse down handler when clicking anywhere in the DOM body */
    protected handleBodyMouseDown(event: DOMEvent<HTMLElement>): void;
    protected handleMenuItemCommandClick(event: Event, _type: MenuType, item: ExtractMenuType<ExtendableItemTypes, MenuType>): boolean | void;
    /** Re/Create Command List by adding title, close & list of commands */
    recreateCommandList(addonOptions: GridMenu, callbackArgs: GridMenuEventWithElementCallbackArgs): void;
}
//# sourceMappingURL=slickGridMenu.d.ts.map