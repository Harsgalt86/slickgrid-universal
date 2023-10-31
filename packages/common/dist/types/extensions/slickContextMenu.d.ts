import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { ContextMenu, ContextMenuOption, DOMMouseOrTouchEvent, MenuCallbackArgs, MenuCommandItem, MenuCommandItemCallbackArgs } from '../interfaces/index';
import type { ExtensionUtility } from '../extensions/extensionUtility';
import type { SharedService } from '../services/shared.service';
import type { TreeDataService } from '../services/treeData.service';
import { MenuFromCellBaseClass } from './menuFromCellBaseClass';
/**
 * A plugin to add Context Menu (mouse right+click), it subscribes to the cell "onContextMenu" event.
 * The "contextMenu" is defined in the Grid Options object
 *
 * You can use it to change a data property (only 1) through a list of Options AND/OR through a list of Commands.
 * A good example of a Command would be an Export to CSV, that can be run from anywhere in the grid by doing a mouse right+click
 *
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.gridOptions = {
 *     enableContextMenu: true,
 *     contextMenu: {
 *       // ... context menu options
 *       commandItems: [{ ...menu item options... }, { ...menu item options... }]
 *     }
 *   };
 */
export declare class SlickContextMenu extends MenuFromCellBaseClass<ContextMenu> {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected readonly treeDataService: TreeDataService;
    protected _defaults: ContextMenuOption;
    pluginName: 'ContextMenu';
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility: ExtensionUtility, pubSubService: BasePubSubService, sharedService: SharedService, treeDataService: TreeDataService);
    /** Initialize plugin. */
    init(contextMenuOptions?: ContextMenu): void;
    /** Translate the Context Menu titles, we need to loop through all column definition to re-translate all list titles & all commands/options */
    translateContextMenu(): void;
    protected handleOnContextMenu(event: DOMMouseOrTouchEvent<HTMLDivElement>, args: MenuCommandItemCallbackArgs): void;
    /** Create Context Menu with Custom Commands (copy cell value, export) */
    protected addMenuCustomCommands(originalCommandItems: Array<MenuCommandItem | 'divider'>): ("divider" | MenuCommandItem<MenuCommandItemCallbackArgs, MenuCallbackArgs<any>>)[];
    /**
     * First get the value, if "exportWithFormatter" is set then we'll use the formatter output
     * Then we create the DOM trick to copy a text value by creating a fake <div> that is not shown to the user
     * and from there we can call the execCommand 'copy' command and expect the value to be in clipboard
     * @param args
     */
    protected copyToClipboard(args: MenuCommandItemCallbackArgs): void;
    /** sort all menu items by their position order when defined */
    protected sortMenuItems(): void;
}
//# sourceMappingURL=slickContextMenu.d.ts.map