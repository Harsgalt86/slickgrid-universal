"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuBaseClass = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const bindingEvent_service_1 = require("../services/bindingEvent.service");
const domUtilities_1 = require("../services/domUtilities");
/* eslint-enable @typescript-eslint/indent */
class MenuBaseClass {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility, pubSubService, sharedService) {
        this.extensionUtility = extensionUtility;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this._addonOptions = {};
        this._camelPluginName = '';
        this._gridUid = '';
        this._menuCssPrefix = '';
        this._menuPluginCssPrefix = '';
        this._bindEventService = new bindingEvent_service_1.BindingEventService();
        this._eventHandler = new Slick.EventHandler();
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
    get gridOptions() {
        var _a;
        return (_a = this.sharedService.gridOptions) !== null && _a !== void 0 ? _a : {};
    }
    /** Getter for the grid uid */
    get gridUid() {
        var _a, _b;
        return this._gridUid || ((_b = (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getUID()) !== null && _b !== void 0 ? _b : '');
    }
    get gridUidSelector() {
        return this.gridUid ? `.${this.gridUid}` : '';
    }
    get menuCssClass() {
        return this._menuPluginCssPrefix || this._menuCssPrefix;
    }
    get menuElement() {
        return this._menuElm || document.querySelector(`.${this.menuCssClass}${this.gridUidSelector}`);
    }
    /** Dispose (destroy) of the plugin */
    dispose() {
        var _a, _b, _c, _d, _e;
        (_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.unsubscribeAll();
        this._bindEventService.unbindAll();
        this.pubSubService.unsubscribeAll();
        (_b = this._commandTitleElm) === null || _b === void 0 ? void 0 : _b.remove();
        (_c = this._optionTitleElm) === null || _c === void 0 ? void 0 : _c.remove();
        this.disposeAllMenus();
        (0, domUtilities_1.emptyElement)(this._menuElm);
        (_d = this.menuElement) === null || _d === void 0 ? void 0 : _d.remove();
        (_e = this._menuElm) === null || _e === void 0 ? void 0 : _e.remove();
    }
    /** Remove/dispose all parent menus and any sub-menu(s) */
    disposeAllMenus() {
        this.disposeSubMenus();
        // remove all parent menu listeners before removing them from the DOM
        this._bindEventService.unbindAll('parent-menu');
        document.querySelectorAll(`.${this.menuCssClass}${this.gridUidSelector}`)
            .forEach(subElm => subElm.remove());
    }
    /**
     * Remove/dispose all previously opened sub-menu(s),
     * it will first remove all sub-menu listeners then remove sub-menus from the DOM
     */
    disposeSubMenus() {
        this._bindEventService.unbindAll('sub-menu');
        document.querySelectorAll(`.${this.menuCssClass}.slick-submenu${this.gridUidSelector}`)
            .forEach(subElm => subElm.remove());
    }
    setOptions(newOptions) {
        this._addonOptions = { ...this._addonOptions, ...newOptions };
    }
    // --
    // protected functions
    // ------------------
    addSubMenuTitleWhenExists(item, commandOrOptionMenu) {
        if (item !== 'divider' && (item === null || item === void 0 ? void 0 : item.subMenuTitle)) {
            const subMenuTitleElm = document.createElement('div');
            subMenuTitleElm.className = 'slick-menu-title';
            subMenuTitleElm.textContent = item.subMenuTitle;
            const subMenuTitleClass = item.subMenuTitleCssClass;
            if (subMenuTitleClass) {
                subMenuTitleElm.classList.add(...subMenuTitleClass.split(' '));
            }
            commandOrOptionMenu.appendChild(subMenuTitleElm);
        }
    }
    /** Construct the Command/Options Items section. */
    populateCommandOrOptionItems(itemType, menuOptions, commandOrOptionMenuElm, commandOrOptionItems, args, itemClickCallback, itemMouseoverCallback) {
        if (args && commandOrOptionItems && menuOptions) {
            for (const item of commandOrOptionItems) {
                this.populateSingleCommandOrOptionItem(itemType, menuOptions, commandOrOptionMenuElm, item, args, itemClickCallback, itemMouseoverCallback);
            }
        }
    }
    /** Add the Command/Options Title when necessary. */
    populateCommandOrOptionTitle(itemType, menuOptions, commandOrOptionMenuElm, level) {
        var _a, _b;
        if (menuOptions) {
            const isSubMenu = level > 0;
            // return or create a title container
            const menuHeaderElm = (_b = (_a = this._menuElm) === null || _a === void 0 ? void 0 : _a.querySelector(`.slick-${itemType}-header`)) !== null && _b !== void 0 ? _b : (0, domUtilities_1.createDomElement)('div', { className: `slick-${itemType}-header` });
            // user could pass a title on top of the Commands/Options section
            const titleProp = `${itemType}Title`;
            if (!isSubMenu) {
                if (menuOptions === null || menuOptions === void 0 ? void 0 : menuOptions[titleProp]) {
                    (0, domUtilities_1.emptyElement)(menuHeaderElm); // make sure title container is empty before adding anything inside it
                    this[`_${itemType}TitleElm`] = (0, domUtilities_1.createDomElement)('span', { className: 'slick-menu-title', textContent: menuOptions[titleProp] });
                    menuHeaderElm.appendChild(this[`_${itemType}TitleElm`]);
                    menuHeaderElm.classList.add('with-title');
                }
                else {
                    menuHeaderElm.classList.add('no-title');
                }
                commandOrOptionMenuElm.appendChild(menuHeaderElm);
            }
        }
    }
    /** Construct the Command/Options Items section. */
    populateSingleCommandOrOptionItem(itemType, menuOptions, commandOrOptionMenuElm, item, args, itemClickCallback, itemMouseoverCallback) {
        var _a;
        let commandLiElm = null;
        if (args && item && menuOptions) {
            const level = (args === null || args === void 0 ? void 0 : args.level) || 0;
            const pluginMiddleName = this._camelPluginName === 'headerButtons' ? '' : '-item';
            const menuCssPrefix = `${this._menuCssPrefix}${pluginMiddleName}`;
            // run each override functions to know if the item is visible and usable
            let isItemVisible = true;
            let isItemUsable = true;
            if (typeof item === 'object') {
                isItemVisible = this.extensionUtility.runOverrideFunctionWhenExists(item.itemVisibilityOverride, args);
                isItemUsable = this.extensionUtility.runOverrideFunctionWhenExists(item.itemUsabilityOverride, args);
            }
            // if the result is not visible then there's no need to go further
            if (!isItemVisible) {
                return null;
            }
            // when the override is defined (and previously executed), we need to use its result to update the disabled property
            // so that "handleMenuItemCommandClick" has the correct flag and won't trigger a command/option clicked event
            if (typeof item === 'object' && item.itemUsabilityOverride) {
                item.disabled = isItemUsable ? false : true;
            }
            commandLiElm = (0, domUtilities_1.createDomElement)('li', { className: menuCssPrefix, role: 'menuitem' });
            if (typeof item === 'object' && (0, utils_1.hasData)(item[itemType])) {
                commandLiElm.dataset[itemType] = item === null || item === void 0 ? void 0 : item[itemType];
            }
            if (commandOrOptionMenuElm) {
                commandOrOptionMenuElm.appendChild(commandLiElm);
            }
            if ((typeof item === 'object' && item.divider) || item === 'divider') {
                commandLiElm.classList.add(`${menuCssPrefix}-divider`);
                return commandLiElm;
            }
            if (item.disabled) {
                commandLiElm.classList.add(`${menuCssPrefix}-disabled`);
            }
            if (item.hidden || item.showOnHover) {
                commandLiElm.classList.add(`${menuCssPrefix}-hidden`);
            }
            if (item.cssClass) {
                commandLiElm.classList.add(...item.cssClass.split(' '));
            }
            if (item.tooltip) {
                commandLiElm.title = item.tooltip;
            }
            if (this._camelPluginName !== 'headerButtons') {
                // Menu plugin can use optional icon & content elements
                const iconElm = (0, domUtilities_1.createDomElement)('div', { className: `${this._menuCssPrefix}-icon` });
                commandLiElm.appendChild(iconElm);
                if (item.iconCssClass) {
                    iconElm.classList.add(...item.iconCssClass.split(' '));
                }
                else if (!item.commandItems && !item.optionItems && !item.items) {
                    iconElm.textContent = '◦';
                }
                const textElm = (0, domUtilities_1.createDomElement)('span', {
                    className: `${this._menuCssPrefix}-content`,
                    textContent: typeof item === 'object' && item.title || ''
                }, commandLiElm);
                if (item.textCssClass) {
                    textElm.classList.add(...item.textCssClass.split(' '));
                }
            }
            // execute command callback on menu item clicked
            const eventGroupName = level > 0 ? 'sub-menu' : 'parent-menu';
            this._bindEventService.bind(commandLiElm, 'click', ((e) => itemClickCallback.call(this, e, itemType, item, level, args === null || args === void 0 ? void 0 : args.column)), undefined, eventGroupName);
            // optionally open sub-menu(s) by mouseover
            if (((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.subMenuOpenByEvent) === 'mouseover' && typeof itemMouseoverCallback === 'function') {
                this._bindEventService.bind(commandLiElm, 'mouseover', ((e) => itemMouseoverCallback.call(this, e, itemType, item, level)), undefined, eventGroupName);
            }
            // the option/command item could be a sub-menu if it has another list of commands/options
            if (item.commandItems || item.optionItems || item.items) {
                const chevronElm = document.createElement('span');
                chevronElm.className = 'sub-item-chevron';
                if (this._addonOptions.subItemChevronClass) {
                    chevronElm.classList.add(...this._addonOptions.subItemChevronClass.split(' '));
                }
                else {
                    chevronElm.textContent = '⮞'; // ⮞ or ▸
                }
                commandLiElm.classList.add('slick-submenu-item');
                commandLiElm.appendChild(chevronElm);
            }
        }
        return commandLiElm;
    }
}
exports.MenuBaseClass = MenuBaseClass;
//# sourceMappingURL=menuBaseClass.js.map