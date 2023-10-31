"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickContextMenu = void 0;
const index_1 = require("../enums/index");
const index_2 = require("../services/index");
const formatterUtilities_1 = require("../formatters/formatterUtilities");
const menuFromCellBaseClass_1 = require("./menuFromCellBaseClass");
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
class SlickContextMenu extends menuFromCellBaseClass_1.MenuFromCellBaseClass {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility, pubSubService, sharedService, treeDataService) {
        super(extensionUtility, pubSubService, sharedService);
        this.extensionUtility = extensionUtility;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this.treeDataService = treeDataService;
        this._defaults = {
            autoAdjustDrop: true,
            autoAlignSide: true,
            autoAdjustDropOffset: 0,
            autoAlignSideOffset: 0,
            hideMenuOnScroll: false,
            optionShownOverColumnIds: [],
            commandShownOverColumnIds: [],
            subMenuOpenByEvent: 'mouseover',
        };
        this.pluginName = 'ContextMenu';
        this._camelPluginName = 'contextMenu';
        this._menuCssPrefix = 'slick-menu';
        this._menuPluginCssPrefix = 'slick-context-menu';
        this.init(sharedService.gridOptions.contextMenu);
    }
    /** Initialize plugin. */
    init(contextMenuOptions) {
        this._addonOptions = { ...this._defaults, ...contextMenuOptions };
        // merge the original commands with the built-in internal commands
        const originalCommandItems = this._addonOptions && Array.isArray(this._addonOptions.commandItems) ? this._addonOptions.commandItems : [];
        this._addonOptions.commandItems = [...originalCommandItems, ...this.addMenuCustomCommands(originalCommandItems)];
        this._addonOptions = { ...this._addonOptions };
        this.sharedService.gridOptions.contextMenu = this._addonOptions;
        // sort all menu items by their position order when defined
        this.sortMenuItems();
        this._eventHandler.subscribe(this.grid.onContextMenu, this.handleOnContextMenu.bind(this));
        if (this._addonOptions.hideMenuOnScroll) {
            this._eventHandler.subscribe(this.grid.onScroll, this.closeMenu.bind(this));
        }
    }
    /** Translate the Context Menu titles, we need to loop through all column definition to re-translate all list titles & all commands/options */
    translateContextMenu() {
        var _a, _b;
        const gridOptions = (_b = (_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.gridOptions) !== null && _b !== void 0 ? _b : {};
        const contextMenu = this.sharedService.gridOptions.contextMenu;
        if (contextMenu && (gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.enableTranslate)) {
            // get both items list
            const columnContextMenuCommandItems = contextMenu.commandItems || [];
            const columnContextMenuOptionItems = contextMenu.optionItems || [];
            // translate their titles only if they have a titleKey defined
            if (contextMenu.commandTitleKey) {
                contextMenu.commandTitle = this.extensionUtility.translateWhenEnabledAndServiceExist(contextMenu.commandTitleKey, 'TEXT_COMMANDS') || contextMenu.commandTitle;
            }
            if (contextMenu.optionTitleKey) {
                contextMenu.optionTitle = this.extensionUtility.translateWhenEnabledAndServiceExist(contextMenu.optionTitleKey, 'TEXT_COMMANDS') || contextMenu.optionTitle;
            }
            // translate both command/option items (whichever is provided)
            this.extensionUtility.translateMenuItemsFromTitleKey(columnContextMenuCommandItems, 'commandItems');
            this.extensionUtility.translateMenuItemsFromTitleKey(columnContextMenuOptionItems, 'optionItems');
        }
    }
    // --
    // event handlers
    // ------------------
    handleOnContextMenu(event, args) {
        this.disposeAllMenus(); // make there's only 1 parent menu opened at a time
        const cell = this.grid.getCellFromEvent(event);
        if (cell) {
            const dataContext = this.grid.getDataItem(cell.row);
            const columnDef = this.grid.getColumns()[cell.cell];
            // run the override function (when defined), if the result is false it won't go further
            args = args || {};
            args.cell = cell.cell;
            args.row = cell.row;
            args.column = columnDef;
            args.dataContext = dataContext;
            args.grid = this.grid;
            if (!this.extensionUtility.runOverrideFunctionWhenExists(this._addonOptions.menuUsabilityOverride, args)) {
                return;
            }
            // create the DOM element
            this._menuElm = this.createParentMenu(event);
            if (this._menuElm) {
                event.preventDefault();
            }
            // reposition the menu to where the user clicked
            if (this._menuElm) {
                this.repositionMenu(event, this._menuElm);
                this._menuElm.setAttribute('aria-expanded', 'true');
                this._menuElm.style.display = 'block';
            }
            // Hide the menu on outside click.
            this._bindEventService.bind(document.body, 'mousedown', this.handleBodyMouseDown.bind(this), { capture: true });
        }
    }
    // --
    // protected functions
    // ------------------
    /** Create Context Menu with Custom Commands (copy cell value, export) */
    addMenuCustomCommands(originalCommandItems) {
        var _a;
        const menuCommandItems = [];
        const gridOptions = this.sharedService && this.sharedService.gridOptions || {};
        const contextMenu = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.contextMenu;
        const dataView = (_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.dataView;
        const translationPrefix = (0, index_2.getTranslationPrefix)(gridOptions);
        // show context menu: Copy (cell value)
        if (contextMenu && !contextMenu.hideCopyCellValueCommand) {
            const commandName = 'copy';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                menuCommandItems.push({
                    iconCssClass: contextMenu.iconCopyCellValueCommand || 'fa fa-clone',
                    titleKey: `${translationPrefix}COPY`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 50,
                    action: (_e, args) => {
                        this.copyToClipboard(args);
                    },
                    itemUsabilityOverride: (args) => {
                        // make sure there's an item to copy before enabling this command
                        const columnDef = args === null || args === void 0 ? void 0 : args.column;
                        const dataContext = args === null || args === void 0 ? void 0 : args.dataContext;
                        if (typeof columnDef.queryFieldNameGetterFn === 'function') {
                            const cellValue = (0, index_2.getCellValueFromQueryFieldGetter)(columnDef, dataContext, '');
                            if (cellValue !== '' && cellValue !== undefined) {
                                return true;
                            }
                        }
                        else if (columnDef && dataContext.hasOwnProperty(columnDef.field)) {
                            return dataContext[columnDef.field] !== '' && dataContext[columnDef.field] !== null && dataContext[columnDef.field] !== undefined;
                        }
                        return false;
                    }
                });
            }
        }
        // show context menu: Export to file
        if ((gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.enableTextExport) && contextMenu && !contextMenu.hideExportCsvCommand) {
            const commandName = 'export-csv';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                menuCommandItems.push({
                    iconCssClass: contextMenu.iconExportCsvCommand || 'fa fa-download',
                    titleKey: `${translationPrefix}EXPORT_TO_CSV`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 51,
                    action: () => {
                        var _a;
                        const registedServices = ((_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.externalRegisteredResources) || [];
                        const excelService = registedServices.find((service) => service.className === 'TextExportService');
                        if (excelService === null || excelService === void 0 ? void 0 : excelService.exportToFile) {
                            excelService.exportToFile({
                                delimiter: index_1.DelimiterType.comma,
                                format: index_1.FileType.csv,
                            });
                        }
                        else {
                            throw new Error(`[Slickgrid-Universal] You must register the TextExportService to properly use Export to File in the Context Menu. Example:: this.gridOptions = { enableTextExport: true, registerExternalResources: [new TextExportService()] };`);
                        }
                    },
                });
            }
        }
        // show context menu: Export to Excel
        if (gridOptions && gridOptions.enableExcelExport && contextMenu && !contextMenu.hideExportExcelCommand) {
            const commandName = 'export-excel';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                menuCommandItems.push({
                    iconCssClass: contextMenu.iconExportExcelCommand || 'fa fa-file-excel-o text-success',
                    titleKey: `${translationPrefix}EXPORT_TO_EXCEL`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 52,
                    action: () => {
                        var _a;
                        const registedServices = ((_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.externalRegisteredResources) || [];
                        const excelService = registedServices.find((service) => service.className === 'ExcelExportService');
                        if (excelService === null || excelService === void 0 ? void 0 : excelService.exportToExcel) {
                            excelService.exportToExcel();
                        }
                        else {
                            throw new Error(`[Slickgrid-Universal] You must register the ExcelExportService to properly use Export to Excel in the Context Menu. Example:: this.gridOptions = { enableExcelExport: true, registerExternalResources: [new ExcelExportService()] };`);
                        }
                    },
                });
            }
        }
        // show context menu: export to text file as tab delimited
        if ((gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.enableTextExport) && contextMenu && !contextMenu.hideExportTextDelimitedCommand) {
            const commandName = 'export-text-delimited';
            if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                menuCommandItems.push({
                    iconCssClass: contextMenu.iconExportTextDelimitedCommand || 'fa fa-download',
                    titleKey: `${translationPrefix}EXPORT_TO_TAB_DELIMITED`,
                    disabled: false,
                    command: commandName,
                    positionOrder: 53,
                    action: () => {
                        var _a;
                        const registedServices = ((_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.externalRegisteredResources) || [];
                        const excelService = registedServices.find((service) => service.className === 'TextExportService');
                        if (excelService === null || excelService === void 0 ? void 0 : excelService.exportToFile) {
                            excelService.exportToFile({
                                delimiter: index_1.DelimiterType.tab,
                                format: index_1.FileType.txt,
                            });
                        }
                        else {
                            throw new Error(`[Slickgrid-Universal] You must register the TextExportService to properly use Export to File in the Context Menu. Example:: this.gridOptions = { enableTextExport: true, registerExternalResources: [new TextExportService()] };`);
                        }
                    },
                });
            }
        }
        // -- Grouping Commands
        if (gridOptions && (gridOptions.enableGrouping || gridOptions.enableDraggableGrouping || gridOptions.enableTreeData)) {
            // add a divider (separator) between the top sort commands and the other clear commands
            if (contextMenu && !contextMenu.hideCopyCellValueCommand) {
                menuCommandItems.push({ divider: true, command: '', positionOrder: 54 });
            }
            // show context menu: Clear Grouping (except for Tree Data which shouldn't have this feature)
            if (gridOptions && !gridOptions.enableTreeData && contextMenu && !contextMenu.hideClearAllGrouping) {
                const commandName = 'clear-grouping';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    menuCommandItems.push({
                        iconCssClass: contextMenu.iconClearGroupingCommand || 'fa fa-times',
                        titleKey: `${translationPrefix}CLEAR_ALL_GROUPING`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 55,
                        action: () => {
                            dataView.setGrouping([]);
                            this.pubSubService.publish('onContextMenuClearGrouping');
                        },
                        itemUsabilityOverride: () => {
                            // only enable the command when there's an actually grouping in play
                            const groupingArray = dataView && dataView.getGrouping && dataView.getGrouping();
                            return Array.isArray(groupingArray) && groupingArray.length > 0;
                        }
                    });
                }
            }
            // show context menu: Collapse all Groups
            if (gridOptions && contextMenu && !contextMenu.hideCollapseAllGroups) {
                const commandName = 'collapse-all-groups';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    menuCommandItems.push({
                        iconCssClass: contextMenu.iconCollapseAllGroupsCommand || 'fa fa-compress',
                        titleKey: `${translationPrefix}COLLAPSE_ALL_GROUPS`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 56,
                        action: () => {
                            if (gridOptions.enableTreeData) {
                                this.treeDataService.toggleTreeDataCollapse(true);
                            }
                            else {
                                dataView.collapseAllGroups();
                            }
                            this.pubSubService.publish('onContextMenuCollapseAllGroups');
                        },
                        itemUsabilityOverride: () => {
                            if (gridOptions.enableTreeData) {
                                return true;
                            }
                            // only enable the command when there's an actually grouping in play
                            const groupingArray = dataView && dataView.getGrouping && dataView.getGrouping();
                            return Array.isArray(groupingArray) && groupingArray.length > 0;
                        }
                    });
                }
            }
            // show context menu: Expand all Groups
            if (gridOptions && contextMenu && !contextMenu.hideExpandAllGroups) {
                const commandName = 'expand-all-groups';
                if (!originalCommandItems.some(item => item !== 'divider' && item.hasOwnProperty('command') && item.command === commandName)) {
                    menuCommandItems.push({
                        iconCssClass: contextMenu.iconExpandAllGroupsCommand || 'fa fa-expand',
                        titleKey: `${translationPrefix}EXPAND_ALL_GROUPS`,
                        disabled: false,
                        command: commandName,
                        positionOrder: 57,
                        action: () => {
                            if (gridOptions.enableTreeData) {
                                this.treeDataService.toggleTreeDataCollapse(false);
                            }
                            else {
                                dataView.expandAllGroups();
                            }
                            this.pubSubService.publish('onContextMenuExpandAllGroups');
                        },
                        itemUsabilityOverride: () => {
                            if (gridOptions.enableTreeData) {
                                return true;
                            }
                            // only enable the command when there's an actually grouping in play
                            const groupingArray = dataView && dataView.getGrouping && dataView.getGrouping();
                            return Array.isArray(groupingArray) && groupingArray.length > 0;
                        }
                    });
                }
            }
        }
        this.extensionUtility.translateMenuItemsFromTitleKey(menuCommandItems);
        return menuCommandItems;
    }
    /**
     * First get the value, if "exportWithFormatter" is set then we'll use the formatter output
     * Then we create the DOM trick to copy a text value by creating a fake <div> that is not shown to the user
     * and from there we can call the execCommand 'copy' command and expect the value to be in clipboard
     * @param args
     */
    copyToClipboard(args) {
        var _a, _b, _c, _d, _f;
        try {
            if (args && args.grid && args.command) {
                // get the value, if "exportWithFormatter" is set then we'll use the formatter output
                const gridOptions = (_b = (_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.gridOptions) !== null && _b !== void 0 ? _b : {};
                const cell = (_c = args === null || args === void 0 ? void 0 : args.cell) !== null && _c !== void 0 ? _c : 0;
                const row = (_d = args === null || args === void 0 ? void 0 : args.row) !== null && _d !== void 0 ? _d : 0;
                const columnDef = args === null || args === void 0 ? void 0 : args.column;
                const dataContext = args === null || args === void 0 ? void 0 : args.dataContext;
                const grid = (_f = this.sharedService) === null || _f === void 0 ? void 0 : _f.slickGrid;
                const exportOptions = gridOptions && ((gridOptions.excelExportOptions || gridOptions.textExportOptions));
                let textToCopy = (0, formatterUtilities_1.exportWithFormatterWhenDefined)(row, cell, columnDef, dataContext, grid, exportOptions);
                if (typeof columnDef.queryFieldNameGetterFn === 'function') {
                    textToCopy = (0, index_2.getCellValueFromQueryFieldGetter)(columnDef, dataContext, '');
                }
                let finalTextToCopy = textToCopy;
                // when it's a string, we'll remove any unwanted Tree Data/Grouping symbols from the beginning (if exist) from the string before copying (e.g.: "⮟  Task 21" or "·   Task 2")
                if (typeof textToCopy === 'string') {
                    finalTextToCopy = textToCopy
                        .replace(/^([·|⮞|⮟]\s*)|([·|⮞|⮟])\s*/gi, '')
                        .replace(/[\u00b7|\u034f]/gi, '')
                        .trim();
                }
                // create fake <textarea> (positioned outside of the screen) to copy into clipboard & delete it from the DOM once we're done
                const tmpElem = document.createElement('textarea');
                if (tmpElem && document.body) {
                    tmpElem.style.position = 'absolute';
                    tmpElem.style.opacity = '0';
                    tmpElem.value = finalTextToCopy;
                    document.body.appendChild(tmpElem);
                    tmpElem.select();
                    if (document.execCommand('copy', false, finalTextToCopy)) {
                        tmpElem.remove();
                    }
                }
            }
        }
        catch (e) {
            /* do nothing */
        }
    }
    /** sort all menu items by their position order when defined */
    sortMenuItems() {
        var _a, _b;
        const contextMenu = (_b = (_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.gridOptions) === null || _b === void 0 ? void 0 : _b.contextMenu;
        if (contextMenu) {
            this.extensionUtility.sortItems(contextMenu.commandItems || [], 'positionOrder');
            this.extensionUtility.sortItems(contextMenu.optionItems || [], 'positionOrder');
        }
    }
}
exports.SlickContextMenu = SlickContextMenu;
//# sourceMappingURL=slickContextMenu.js.map