import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { CellMenu, CellMenuOption, Column, DOMMouseOrTouchEvent, MenuCommandItemCallbackArgs } from '../interfaces/index';
import type { ExtensionUtility } from '../extensions/extensionUtility';
import type { SharedService } from '../services/shared.service';
import { MenuFromCellBaseClass } from './menuFromCellBaseClass';
/**
 * A plugin to add Menu on a Cell click (click on the cell that has the cellMenu object defined)
 * The "cellMenu" is defined in a Column Definition object
 * Similar to the ContextMenu plugin (could be used in combo),
 * except that it subscribes to the cell "onClick" event (regular mouse click or touch).
 *
 * A general use of this plugin is for an Action Dropdown Menu to do certain things on the row that was clicked
 * You can use it to change the cell data property through a list of Options AND/OR through a list of Commands.
 *
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.columnDefinitions = [{
 *     id: 'myColumn', name: 'My column',
 *     cellMenu: {
 *       // ... cell menu options
 *       commandItems: [{ ...menu item options... }, { ...menu item options... }]
 *     }
 *   }];
 */
export declare class SlickCellMenu extends MenuFromCellBaseClass<CellMenu> {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected _defaults: CellMenuOption;
    pluginName: 'CellMenu';
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility: ExtensionUtility, pubSubService: BasePubSubService, sharedService: SharedService);
    /** Initialize plugin. */
    init(cellMenuOptions?: CellMenu): void;
    /** Translate the Cell Menu titles, we need to loop through all column definition to re-translate all list titles & all commands/options */
    translateCellMenu(): void;
    protected handleCellClick(event: DOMMouseOrTouchEvent<HTMLDivElement>, args: MenuCommandItemCallbackArgs): void;
    protected sortMenuItems(columnDefinitions: Column[]): void;
}
//# sourceMappingURL=slickCellMenu.d.ts.map