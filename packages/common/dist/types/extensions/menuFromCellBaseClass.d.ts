import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { CellMenu, ContextMenu, DOMMouseOrTouchEvent, MenuFromCellCallbackArgs } from '../interfaces/index';
import type { ExtensionUtility } from '../extensions/extensionUtility';
import { type ExtendableItemTypes, type ExtractMenuType, MenuBaseClass, type MenuType } from './menuBaseClass';
import type { SharedService } from '../services/shared.service';
export declare class MenuFromCellBaseClass<M extends CellMenu | ContextMenu> extends MenuBaseClass<M> {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected _currentCell: number;
    protected _currentRow: number;
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility: ExtensionUtility, pubSubService: BasePubSubService, sharedService: SharedService);
    createMenu(event: DOMMouseOrTouchEvent<HTMLDivElement>): HTMLDivElement | undefined;
    closeMenu(e: DOMMouseOrTouchEvent<HTMLDivElement>, args: MenuFromCellCallbackArgs): void;
    /** Hide the Menu */
    hideMenu(): void;
    protected checkIsColumnAllowed(columnIds: Array<number | string>, columnId: number | string): boolean;
    /** Mouse down handler when clicking anywhere in the DOM body */
    protected handleBodyMouseDown(e: DOMMouseOrTouchEvent<HTMLDivElement>): void;
    protected handleCloseButtonClicked(e: DOMMouseOrTouchEvent<HTMLDivElement>): void;
    protected handleMenuItemCommandClick(event: DOMMouseOrTouchEvent<HTMLDivElement>, type: MenuType, item: ExtractMenuType<ExtendableItemTypes, MenuType>): void;
    protected populateCommandOrOptionCloseBtn(itemType: MenuType, closeButtonElm: HTMLButtonElement, commandOrOptionMenuElm: HTMLDivElement): void;
    protected repositionMenu(event: DOMMouseOrTouchEvent<HTMLDivElement>): void;
}
//# sourceMappingURL=menuFromCellBaseClass.d.ts.map