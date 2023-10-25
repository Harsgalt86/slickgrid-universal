import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { CellMenu, Column, ContextMenu, DOMMouseOrTouchEvent, GridMenu, GridOption, HeaderButton, HeaderButtonItem, HeaderMenu, MenuCommandItem, MenuOptionItem, SlickEventHandler, SlickGrid } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
import type { ExtensionUtility } from '../extensions/extensionUtility';
import type { SharedService } from '../services/shared.service';
export type MenuType = 'command' | 'option';
export type ExtendableItemTypes = HeaderButtonItem | MenuCommandItem | MenuOptionItem | 'divider';
export type ExtractMenuType<A, T> = T extends 'command' ? A : T extends 'option' ? A : A extends 'divider' ? A : never;
export declare class MenuBaseClass<M extends CellMenu | ContextMenu | GridMenu | HeaderMenu | HeaderButton> {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected _addonOptions: M;
    protected _bindEventService: BindingEventService;
    protected _camelPluginName: string;
    protected _commandTitleElm?: HTMLSpanElement;
    protected _eventHandler: SlickEventHandler;
    protected _gridUid: string;
    protected _menuElm?: HTMLDivElement | null;
    protected _menuCssPrefix: string;
    protected _menuPluginCssPrefix: string;
    protected _optionTitleElm?: HTMLSpanElement;
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility: ExtensionUtility, pubSubService: BasePubSubService, sharedService: SharedService);
    get addonOptions(): M;
    set addonOptions(newOptions: M);
    get eventHandler(): SlickEventHandler;
    get grid(): SlickGrid;
    get gridOptions(): GridOption;
    /** Getter for the grid uid */
    get gridUid(): string;
    get gridUidSelector(): string;
    get menuElement(): HTMLDivElement | null;
    /** Dispose (destroy) of the plugin */
    dispose(): void;
    setOptions(newOptions: M): void;
    /** Construct the Command/Options Items section. */
    protected populateCommandOrOptionItems(itemType: MenuType, menuOptions: M, commandOrOptionMenuElm: HTMLElement, commandOrOptionItems: Array<ExtractMenuType<ExtendableItemTypes, MenuType>>, args: unknown, itemClickCallback: (event: DOMMouseOrTouchEvent<HTMLDivElement>, type: MenuType, item: ExtractMenuType<ExtendableItemTypes, MenuType>, columnDef?: Column) => void): void;
    /** Add the Command/Options Title when necessary. */
    protected populateCommandOrOptionTitle(itemType: MenuType, menuOptions: M, commandOrOptionMenuElm: HTMLElement): void;
    /** Construct the Command/Options Items section. */
    protected populateSingleCommandOrOptionItem(itemType: MenuType, menuOptions: M, commandOrOptionMenuElm: HTMLElement | null, item: ExtractMenuType<ExtendableItemTypes, MenuType>, args: any, itemClickCallback: (event: DOMMouseOrTouchEvent<HTMLDivElement>, type: MenuType, item: ExtractMenuType<ExtendableItemTypes, MenuType>, columnDef?: Column) => void): HTMLLIElement | null;
}
//# sourceMappingURL=menuBaseClass.d.ts.map