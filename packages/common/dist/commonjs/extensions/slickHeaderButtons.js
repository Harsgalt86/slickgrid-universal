"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickHeaderButtons = void 0;
const bindingEvent_service_1 = require("../services/bindingEvent.service");
const menuBaseClass_1 = require("./menuBaseClass");
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
class SlickHeaderButtons extends menuBaseClass_1.MenuBaseClass {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility, pubSubService, sharedService) {
        super(extensionUtility, pubSubService, sharedService);
        this.extensionUtility = extensionUtility;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this._buttonElms = [];
        this._defaults = {
            buttonCssClass: 'slick-header-button',
        };
        this.pluginName = 'HeaderButtons';
        this._menuCssPrefix = 'slick-header-button';
        this._camelPluginName = 'headerButtons';
        this._bindEventService = new bindingEvent_service_1.BindingEventService();
        this._eventHandler = new Slick.EventHandler();
        this.init(sharedService.gridOptions.headerButton);
    }
    get addonOptions() {
        return this._addonOptions;
    }
    set addonOptions(newOptions) {
        this._addonOptions = newOptions;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    get grid() {
        return this.sharedService.slickGrid;
    }
    /** Initialize plugin. */
    init(headerButtonOptions) {
        this._addonOptions = { ...this._defaults, ...headerButtonOptions };
        this._eventHandler.subscribe(this.grid.onHeaderCellRendered, this.handleHeaderCellRendered.bind(this));
        this._eventHandler.subscribe(this.grid.onBeforeHeaderCellDestroy, this.handleBeforeHeaderCellDestroy.bind(this));
        // force the grid to re-render the header after the events are hooked up.
        this.grid.setColumns(this.grid.getColumns());
    }
    /** Dispose (destroy) the SlickGrid 3rd party plugin */
    dispose() {
        super.dispose();
        this._buttonElms.forEach(elm => elm.remove());
    }
    // --
    // event handlers
    // ------------------
    /**
     * Event handler when column title header are being rendered
     * @param {Object} event - The event
     * @param {Object} args - object arguments
     */
    handleHeaderCellRendered(_e, args) {
        var _a;
        const column = args.column;
        if (((_a = column.header) === null || _a === void 0 ? void 0 : _a.buttons) && Array.isArray(column.header.buttons)) {
            let i = column.header.buttons.length;
            while (i--) {
                const buttonItem = column.header.buttons[i];
                const itemElm = this.populateSingleCommandOrOptionItem('command', this.addonOptions, null, buttonItem, args, this.handleButtonClick.bind(this));
                // Header Button can have an optional handler
                if (itemElm && buttonItem.handler && !buttonItem.disabled) {
                    this._bindEventService.bind(itemElm, 'click', ((e) => buttonItem.handler.call(this, e)));
                }
                if (itemElm) {
                    this._buttonElms.push(itemElm);
                    args.node.appendChild(itemElm);
                }
            }
        }
    }
    /**
     * Event handler before the header cell is being destroyed
     * @param {Object} event - The event
     * @param {Object} args.column - The column definition
     */
    handleBeforeHeaderCellDestroy(_e, args) {
        var _a, _b, _c;
        const column = args.column;
        if (((_a = column.header) === null || _a === void 0 ? void 0 : _a.buttons) && ((_b = this._addonOptions) === null || _b === void 0 ? void 0 : _b.buttonCssClass)) {
            // Removing buttons will also clean up any event handlers and data.
            // NOTE: If you attach event handlers directly or using a different framework,
            //       you must also clean them up here to avoid memory leaks.
            const buttonCssClass = (((_c = this._addonOptions) === null || _c === void 0 ? void 0 : _c.buttonCssClass) || '').replace(/(\s+)/g, '.');
            if (buttonCssClass) {
                args.node.querySelectorAll(`.${buttonCssClass}`).forEach(elm => elm.remove());
            }
        }
    }
    handleButtonClick(event, _type, button, level, columnDef) {
        var _a;
        if (button.command && !button.disabled) {
            const command = button.command || '';
            const callbackArgs = {
                grid: this.grid,
                column: columnDef,
                button,
            };
            if (command) {
                callbackArgs.command = command;
            }
            // execute action callback when defined
            if (typeof button.action === 'function' && !button.disabled) {
                button.action.call(this, event, callbackArgs);
            }
            if (command !== null && !button.disabled && ((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.onCommand)) {
                this.pubSubService.publish('onHeaderButtonCommand', callbackArgs);
                this._addonOptions.onCommand(event, callbackArgs);
                // Update the header in case the user updated the button definition in the handler.
                if (columnDef === null || columnDef === void 0 ? void 0 : columnDef.id) {
                    this.grid.updateColumnHeader(columnDef.id);
                }
            }
        }
        // Stop propagation so that it doesn't register as a header click event.
        event.preventDefault();
        event.stopPropagation();
    }
}
exports.SlickHeaderButtons = SlickHeaderButtons;
//# sourceMappingURL=slickHeaderButtons.js.map