import { hasData } from '@slickgrid-universal/utils';
import { BindingEventService } from '../services/bindingEvent.service';
import { createDomElement, emptyElement } from '../services/domUtilities';
/* eslint-enable @typescript-eslint/indent */
export class MenuBaseClass {
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
        this._bindEventService = new BindingEventService();
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
    get menuElement() {
        return this._menuElm || document.querySelector(`.${this._menuPluginCssPrefix || this._menuCssPrefix}${this.gridUidSelector}`);
    }
    /** Dispose (destroy) of the plugin */
    dispose() {
        var _a, _b, _c, _d, _e;
        (_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.unsubscribeAll();
        this._bindEventService.unbindAll();
        this.pubSubService.unsubscribeAll();
        (_b = this._commandTitleElm) === null || _b === void 0 ? void 0 : _b.remove();
        (_c = this._optionTitleElm) === null || _c === void 0 ? void 0 : _c.remove();
        (_d = this.menuElement) === null || _d === void 0 ? void 0 : _d.remove();
        emptyElement(this._menuElm);
        (_e = this._menuElm) === null || _e === void 0 ? void 0 : _e.remove();
    }
    setOptions(newOptions) {
        this._addonOptions = { ...this._addonOptions, ...newOptions };
    }
    // --
    // protected functions
    // ------------------
    /** Construct the Command/Options Items section. */
    populateCommandOrOptionItems(itemType, menuOptions, commandOrOptionMenuElm, commandOrOptionItems, args, itemClickCallback) {
        if (args && commandOrOptionItems && menuOptions) {
            for (const item of commandOrOptionItems) {
                this.populateSingleCommandOrOptionItem(itemType, menuOptions, commandOrOptionMenuElm, item, args, itemClickCallback);
            }
        }
    }
    /** Add the Command/Options Title when necessary. */
    populateCommandOrOptionTitle(itemType, menuOptions, commandOrOptionMenuElm) {
        var _a, _b;
        if (menuOptions) {
            const menuHeaderElm = (_b = (_a = this._menuElm) === null || _a === void 0 ? void 0 : _a.querySelector(`.slick-${itemType}-header`)) !== null && _b !== void 0 ? _b : createDomElement('div', { className: `slick-${itemType}-header` });
            // user could pass a title on top of the Commands/Options section
            const titleProp = `${itemType}Title`;
            if (menuOptions === null || menuOptions === void 0 ? void 0 : menuOptions[titleProp]) {
                this[`_${itemType}TitleElm`] = createDomElement('span', { className: 'slick-menu-title', textContent: menuOptions[titleProp] });
                menuHeaderElm.appendChild(this[`_${itemType}TitleElm`]);
                menuHeaderElm.classList.add('with-title');
            }
            else {
                menuHeaderElm.classList.add('no-title');
            }
            commandOrOptionMenuElm.appendChild(menuHeaderElm);
        }
    }
    /** Construct the Command/Options Items section. */
    populateSingleCommandOrOptionItem(itemType, menuOptions, commandOrOptionMenuElm, item, args, itemClickCallback) {
        let commandLiElm = null;
        if (args && item && menuOptions) {
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
            // so that "handleMenuItemCommandClick" has the correct flag and won't trigger a command clicked event
            if (typeof item === 'object' && item.itemUsabilityOverride) {
                item.disabled = isItemUsable ? false : true;
            }
            commandLiElm = createDomElement('li', { className: menuCssPrefix, role: 'menuitem' });
            if (typeof item === 'object' && hasData(item[itemType])) {
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
                const iconElm = createDomElement('div', { className: `${this._menuCssPrefix}-icon` });
                commandLiElm.appendChild(iconElm);
                if (item.iconCssClass) {
                    iconElm.classList.add(...item.iconCssClass.split(' '));
                }
                else {
                    iconElm.textContent = '◦';
                }
                const textElm = createDomElement('span', {
                    className: `${this._menuCssPrefix}-content`,
                    textContent: typeof item === 'object' && item.title || ''
                }, commandLiElm);
                if (item.textCssClass) {
                    textElm.classList.add(...item.textCssClass.split(' '));
                }
            }
            // execute command on menu item clicked
            this._bindEventService.bind(commandLiElm, 'click', ((e) => itemClickCallback.call(this, e, itemType, item, args === null || args === void 0 ? void 0 : args.column)));
            // Header Button can have an optional handler
            if (item.handler && !item.disabled) {
                this._bindEventService.bind(commandLiElm, 'click', ((e) => item.handler.call(this, e)));
            }
        }
        return commandLiElm;
    }
}
//# sourceMappingURL=menuBaseClass.js.map