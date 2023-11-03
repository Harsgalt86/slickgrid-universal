import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { CellMenu, ContextMenu, DOMMouseOrTouchEvent, MenuCommandItem, MenuFromCellCallbackArgs, MenuOptionItem } from '../interfaces/index';
import type { ExtensionUtility } from '../extensions/extensionUtility';
import { type ExtendableItemTypes, type ExtractMenuType, MenuBaseClass, type MenuType } from './menuBaseClass';
import type { SharedService } from '../services/shared.service';
export declare class MenuFromCellBaseClass<M extends CellMenu | ContextMenu> extends MenuBaseClass<M> {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected _currentCell: number;
    protected _currentRow: number;
    protected _lastMenuTypeClicked: string;
    protected _subMenuParentId: string;
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility: ExtensionUtility, pubSubService: BasePubSubService, sharedService: SharedService);
    createParentMenu(event: DOMMouseOrTouchEvent<HTMLDivElement>): HTMLDivElement | undefined;
    /**
     * Create parent menu or sub-menu(s), a parent menu will start at level 0 while sub-menu(s) will be incremented
     * @param commandItems - array of optional commands or dividers
     * @param optionItems - array of optional options or dividers
     * @param level - menu level
     * @param item - command, option or divider
     * @returns menu DOM element
     */
    createMenu(commandItems: Array<MenuCommandItem | 'divider'>, optionItems: Array<MenuOptionItem | 'divider'>, level?: number, item?: ExtractMenuType<ExtendableItemTypes, MenuType>): HTMLDivElement | undefined;
    closeMenu(e: DOMMouseOrTouchEvent<HTMLDivElement>, args: MenuFromCellCallbackArgs): void;
    /** Hide the Menu */
    hideMenu(): void;
    protected checkIsColumnAllowed(columnIds: Array<number | string>, columnId: number | string): boolean;
    /** Mouse down handler when clicking anywhere in the DOM body */
    protected handleBodyMouseDown(e: DOMMouseOrTouchEvent<HTMLDivElement>): void;
    protected handleCloseButtonClicked(e: DOMMouseOrTouchEvent<HTMLDivElement>): void;
    protected handleMenuItemMouseOver(e: DOMMouseOrTouchEvent<HTMLElement>, type: MenuType, item: ExtractMenuType<ExtendableItemTypes, MenuType>, level?: number): void;
    protected handleMenuItemCommandClick(event: DOMMouseOrTouchEvent<HTMLDivElement>, type: MenuType, item: ExtractMenuType<ExtendableItemTypes, MenuType>, level?: number): void;
    protected populateCommandOrOptionCloseBtn(itemType: MenuType, closeButtonElm: HTMLButtonElement, commandOrOptionMenuElm: HTMLDivElement): void;
    protected repositionSubMenu(item: ExtractMenuType<ExtendableItemTypes, MenuType>, type: MenuType, level: number, e: DOMMouseOrTouchEvent<HTMLElement>): void;
    protected repositionMenu(event: DOMMouseOrTouchEvent<HTMLElement>, menuElm?: HTMLElement): void;
}
//# sourceMappingURL=menuFromCellBaseClass.d.ts.map