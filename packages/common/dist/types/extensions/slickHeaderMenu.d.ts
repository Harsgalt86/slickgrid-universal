import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { Column, DOMEvent, DOMMouseOrTouchEvent, HeaderMenu, HeaderMenuCommandItem, HeaderMenuItems, HeaderMenuOption, MenuCommandItemCallbackArgs, OnHeaderCellRenderedEventArgs } from '../interfaces/index';
import type { ExtensionUtility } from '../extensions/extensionUtility';
import type { FilterService } from '../services/filter.service';
import type { SharedService } from '../services/shared.service';
import type { SortService } from '../services/sort.service';
import { type ExtendableItemTypes, type ExtractMenuType, MenuBaseClass, type MenuType } from './menuBaseClass';
/**
 * A plugin to add drop-down menus to column headers.
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.columnDefinitions = [{
 *     id: 'myColumn', name: 'My column',
 *     header: {
 *       menu: {
 *         commandItems: [{ ...menu item options... }, { ...menu item options... }]
 *       }
 *     }
 *   }];
 */
export declare class SlickHeaderMenu extends MenuBaseClass<HeaderMenu> {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly filterService: FilterService;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected readonly sortService: SortService;
    protected _activeHeaderColumnElm?: HTMLDivElement | null;
    protected _subMenuParentId: string;
    protected _defaults: HeaderMenuOption;
    pluginName: 'HeaderMenu';
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility: ExtensionUtility, filterService: FilterService, pubSubService: BasePubSubService, sharedService: SharedService, sortService: SortService);
    /** Initialize plugin. */
    init(headerMenuOptions?: HeaderMenu): void;
    /** Dispose (destroy) of the plugin */
    dispose(): void;
    /** Hide a column from the grid */
    hideColumn(column: Column): void;
    /** Hide the Header Menu */
    hideMenu(): void;
    repositionSubMenu(e: DOMMouseOrTouchEvent<HTMLElement>, item: HeaderMenuCommandItem, level: number, columnDef: Column): void;
    repositionMenu(e: DOMMouseOrTouchEvent<HTMLElement>, menuElm: HTMLDivElement): void;
    /** Translate the Header Menu titles, we need to loop through all column definition to re-translate them */
    translateHeaderMenu(): void;
    /**
     * Event handler when column title header are being rendered
     * @param {Object} event - The event
     * @param {Object} args - object arguments
     */
    protected handleHeaderCellRendered(_e: Event, args: OnHeaderCellRenderedEventArgs): void;
    /**
     * Event handler before the header cell is being destroyed
     * @param {Object} event - The event
     * @param {Object} args.column - The column definition
     */
    protected handleBeforeHeaderCellDestroy(_e: Event, args: {
        column: Column;
        node: HTMLElement;
    }): void;
    /** Mouse down handler when clicking anywhere in the DOM body */
    protected handleBodyMouseDown(e: DOMEvent<HTMLElement>): void;
    protected handleMenuItemCommandClick(event: DOMMouseOrTouchEvent<HTMLDivElement>, _type: MenuType, item: ExtractMenuType<ExtendableItemTypes, MenuType>, level?: number, columnDef?: Column): boolean | void;
    protected handleMenuItemMouseOver(e: DOMMouseOrTouchEvent<HTMLElement>, _type: MenuType, item: ExtractMenuType<ExtendableItemTypes, MenuType>, level?: number, columnDef?: Column): void;
    /**
     * Create Header Menu with Custom Commands if user has enabled Header Menu
     * @param gridOptions
     * @param columnDefinitions
     * @return header menu
     */
    protected addHeaderMenuCustomCommands(columnDefinitions: Column[]): HeaderMenu;
    /** Clear the Filter on the current column (if it's actually filtered) */
    protected clearColumnFilter(event: Event, args: MenuCommandItemCallbackArgs): void;
    /** Clear the Sort on the current column (if it's actually sorted) */
    protected clearColumnSort(event: Event, args: MenuCommandItemCallbackArgs): void;
    /** Execute the Header Menu Commands that was triggered by the onCommand subscribe */
    protected executeHeaderMenuInternalCommands(event: Event, args: MenuCommandItemCallbackArgs): void;
    protected createParentMenu(e: DOMMouseOrTouchEvent<HTMLDivElement>, columnDef: Column, menu: HeaderMenuItems): void;
    /** Create the menu or sub-menu(s) but without the column picker which is a separate single process */
    protected createCommandMenu(commandItems: Array<HeaderMenuCommandItem | 'divider'>, columnDef: Column, level?: number, item?: HeaderMenuCommandItem | 'divider'): HTMLDivElement;
    /**
     * Reset all the internal Menu options which have text to translate
     * @param header menu object
     */
    protected resetHeaderMenuTranslations(columnDefinitions: Column[]): void;
    /** Sort the current column */
    protected sortColumn(event: Event, args: MenuCommandItemCallbackArgs, isSortingAsc?: boolean): void;
}
//# sourceMappingURL=slickHeaderMenu.d.ts.map