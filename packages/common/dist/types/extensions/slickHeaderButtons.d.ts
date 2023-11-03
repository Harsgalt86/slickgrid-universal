import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { Column, DOMEvent, HeaderButton, HeaderButtonOption, OnHeaderCellRenderedEventArgs, SlickEventHandler, SlickGrid } from '../interfaces/index';
import type { ExtensionUtility } from '../extensions/extensionUtility';
import type { SharedService } from '../services/shared.service';
import { type ExtendableItemTypes, type ExtractMenuType, MenuBaseClass, type MenuType } from './menuBaseClass';
/**
 * A plugin to add custom buttons to column headers.
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.columnDefinitions = [{
 *     id: 'myColumn', name: 'My column',
 *     header: {
 *       buttons: [{ ...button options... }, { ...button options... }]
 *     }
 *   }];
 */
export declare class SlickHeaderButtons extends MenuBaseClass<HeaderButton> {
    protected readonly extensionUtility: ExtensionUtility;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected _buttonElms: HTMLLIElement[];
    protected _defaults: HeaderButtonOption;
    pluginName: 'HeaderButtons';
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility: ExtensionUtility, pubSubService: BasePubSubService, sharedService: SharedService);
    get addonOptions(): HeaderButton;
    set addonOptions(newOptions: HeaderButton);
    get eventHandler(): SlickEventHandler;
    get grid(): SlickGrid;
    /** Initialize plugin. */
    init(headerButtonOptions?: HeaderButton): void;
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose(): void;
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
    protected handleButtonClick(event: DOMEvent<HTMLDivElement>, _type: MenuType, button: ExtractMenuType<ExtendableItemTypes, MenuType>, level: number, columnDef?: Column): void;
}
//# sourceMappingURL=slickHeaderButtons.d.ts.map