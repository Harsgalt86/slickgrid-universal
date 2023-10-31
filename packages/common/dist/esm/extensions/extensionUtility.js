import { Constants } from '../constants';
import { getTranslationPrefix } from '../services/utilities';
export class ExtensionUtility {
    constructor(sharedService, backendUtilities, translaterService) {
        this.sharedService = sharedService;
        this.backendUtilities = backendUtilities;
        this.translaterService = translaterService;
    }
    /**
     * From a Grid Menu object property name, we will return the correct title output string following this order
     * 1- if user provided a title, use it as the output title
     * 2- else if user provided a title key, use it to translate the output title
     * 3- else if nothing is provided use text defined as constants
     */
    getPickerTitleOutputString(propName, pickerName) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        if (this.sharedService.gridOptions && this.sharedService.gridOptions.enableTranslate && (!this.translaterService || !this.translaterService.translate)) {
            throw new Error('[Slickgrid-Universal] requires a Translate Service to be installed and configured when the grid option "enableTranslate" is enabled.');
        }
        let output = '';
        const picker = (_b = (_a = this.sharedService.gridOptions) === null || _a === void 0 ? void 0 : _a[pickerName]) !== null && _b !== void 0 ? _b : {};
        const enableTranslate = (_d = (_c = this.sharedService.gridOptions) === null || _c === void 0 ? void 0 : _c.enableTranslate) !== null && _d !== void 0 ? _d : false;
        // get locales provided by user in forRoot or else use default English locales via the Constants
        const locales = (_f = (_e = this.sharedService.gridOptions) === null || _e === void 0 ? void 0 : _e.locales) !== null && _f !== void 0 ? _f : Constants.locales;
        const title = picker === null || picker === void 0 ? void 0 : picker[propName];
        const titleKey = picker === null || picker === void 0 ? void 0 : picker[`${propName}Key`];
        const gridOptions = this.sharedService.gridOptions;
        const translationPrefix = getTranslationPrefix(gridOptions);
        if (titleKey && ((_g = this.translaterService) === null || _g === void 0 ? void 0 : _g.translate)) {
            output = this.translaterService.translate(titleKey || ' ');
        }
        else {
            switch (propName) {
                case 'commandTitle':
                    output = title || enableTranslate && ((_h = this.translaterService) === null || _h === void 0 ? void 0 : _h.getCurrentLanguage) && ((_j = this.translaterService) === null || _j === void 0 ? void 0 : _j.translate(`${translationPrefix}COMMANDS` || ' ')) || (locales === null || locales === void 0 ? void 0 : locales.TEXT_COMMANDS);
                    break;
                case 'columnTitle':
                    output = title || enableTranslate && ((_k = this.translaterService) === null || _k === void 0 ? void 0 : _k.getCurrentLanguage) && ((_l = this.translaterService) === null || _l === void 0 ? void 0 : _l.translate(`${translationPrefix}COLUMNS` || ' ')) || (locales === null || locales === void 0 ? void 0 : locales.TEXT_COLUMNS);
                    break;
                case 'forceFitTitle':
                    output = title || enableTranslate && ((_m = this.translaterService) === null || _m === void 0 ? void 0 : _m.getCurrentLanguage) && ((_o = this.translaterService) === null || _o === void 0 ? void 0 : _o.translate(`${translationPrefix}FORCE_FIT_COLUMNS` || ' ')) || (locales === null || locales === void 0 ? void 0 : locales.TEXT_FORCE_FIT_COLUMNS);
                    break;
                case 'syncResizeTitle':
                    output = title || enableTranslate && ((_p = this.translaterService) === null || _p === void 0 ? void 0 : _p.getCurrentLanguage) && ((_q = this.translaterService) === null || _q === void 0 ? void 0 : _q.translate(`${translationPrefix}SYNCHRONOUS_RESIZE` || ' ')) || (locales === null || locales === void 0 ? void 0 : locales.TEXT_SYNCHRONOUS_RESIZE);
                    break;
                default:
                    output = title;
                    break;
            }
        }
        return output;
    }
    /**
     * When using ColumnPicker/GridMenu to show/hide a column, we potentially need to readjust the grid option "frozenColumn" index.
     * That is because SlickGrid freezes by column index and it has no knowledge of the columns themselves and won't change the index, we need to do that ourselves whenever necessary.
     * Note: we call this method right after the visibleColumns array got updated, it won't work properly if we call it before the setting the visibleColumns.
     * @param {Number} frozenColumnIndex - current frozenColumn index
     * @param {Array<Object>} allColumns - all columns (including hidden ones)
     * @param {Array<Object>} visibleColumns - only visible columns (excluding hidden ones)
     */
    readjustFrozenColumnIndexWhenNeeded(frozenColumnIndex, allColumns, visibleColumns) {
        if (frozenColumnIndex >= 0) {
            const recalculatedFrozenColumnIndex = visibleColumns.findIndex(col => col.id === this.sharedService.frozenVisibleColumnId);
            if (recalculatedFrozenColumnIndex >= 0 && recalculatedFrozenColumnIndex !== frozenColumnIndex) {
                this.sharedService.gridOptions.frozenColumn = recalculatedFrozenColumnIndex;
                this.sharedService.slickGrid.setOptions({ frozenColumn: recalculatedFrozenColumnIndex });
            }
            // to freeze columns, we need to take only the visible columns and we also need to use setColumns() when some of them are hidden
            // to make sure that we only use the visible columns, not doing this would show back some of the hidden columns
            if (Array.isArray(visibleColumns) && Array.isArray(allColumns) && visibleColumns.length !== allColumns.length) {
                this.sharedService.slickGrid.setColumns(visibleColumns);
            }
        }
    }
    /** Refresh the dataset through the Backend Service */
    refreshBackendDataset(inputGridOptions) {
        var _a;
        // user can pass new set of grid options which will override current ones
        let gridOptions = this.sharedService.gridOptions;
        if (inputGridOptions) {
            gridOptions = { ...this.sharedService.gridOptions, ...inputGridOptions };
            this.sharedService.gridOptions = gridOptions;
        }
        (_a = this.backendUtilities) === null || _a === void 0 ? void 0 : _a.refreshBackendDataset(gridOptions);
    }
    /** Run the Override function when it exists, if it returns True then it is usable/visible */
    runOverrideFunctionWhenExists(overrideFn, args) {
        if (typeof overrideFn === 'function') {
            return !!(overrideFn.call(this, args));
        }
        return true;
    }
    /**
     * Sort items (by pointers) in an array by a property name
     * @param {Array<Object>} items array
     * @param {String} property name to sort with
     */
    sortItems(items, propertyName) {
        // sort the command items by their position in the list
        if (Array.isArray(items)) {
            items.sort((itemA, itemB) => {
                if (itemA && itemB && itemA.hasOwnProperty(propertyName) && itemB.hasOwnProperty(propertyName)) {
                    return itemA[propertyName] - itemB[propertyName];
                }
                return 0;
            });
        }
    }
    /** Translate the array of items from an input key and assign them to their output key */
    translateItems(items, inputKey, outputKey) {
        var _a, _b;
        if (Array.isArray(items)) {
            for (const item of items) {
                if (item.hasOwnProperty(inputKey)) {
                    item[outputKey] = (_b = (_a = this.translaterService) === null || _a === void 0 ? void 0 : _a.translate) === null || _b === void 0 ? void 0 : _b.call(_a, item[inputKey]);
                }
            }
        }
    }
    /**
     * Loop through all Menu Command Items and use `titleKey`, `subMenuTitleKey` properties to translate (or use Locale) appropriate `title` property
     * @param {Array<MenuCommandItem | String>} items - Menu Command Items array
     * @param {Object} gridOptions - Grid Options
     */
    translateMenuItemsFromTitleKey(items, subMenuItemsKey = 'commandItems') {
        for (const item of items) {
            // translate `titleKey` and also `subMenuTitleKey` if exists
            if (typeof item === 'object') {
                if (item.titleKey) {
                    item.title = this.translateWhenEnabledAndServiceExist(`${item.titleKey}`, `TEXT_${item.titleKey}`);
                }
                if (item.subMenuTitleKey) {
                    item.subMenuTitle = this.translateWhenEnabledAndServiceExist(`${item.subMenuTitleKey}`, `TEXT_${item.subMenuTitleKey}`);
                }
            }
            // an item can also have nested sub-menu items, we can use recursion to translate them as well
            if (Array.isArray(item === null || item === void 0 ? void 0 : item[subMenuItemsKey])) {
                this.translateMenuItemsFromTitleKey(item === null || item === void 0 ? void 0 : item[subMenuItemsKey]);
            }
        }
    }
    /**
     * When "enabledTranslate" is set to True, we will try to translate if the Translate Service exist or use the Locales when not
     * @param {String} translationKey
     * @param {String} localeKey
     * @param {String} textToUse - optionally provide a static text to use (that will completely override the other arguments of the method)
     */
    translateWhenEnabledAndServiceExist(translationKey, localeKey, textToUse) {
        var _a, _b, _c;
        let text = '';
        const gridOptions = (_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.gridOptions;
        // get locales provided by user in main file or else use default English locales via the Constants
        const locales = (_b = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.locales) !== null && _b !== void 0 ? _b : Constants.locales;
        if (textToUse) {
            text = textToUse;
        }
        else if (gridOptions.enableTranslate && ((_c = this.translaterService) === null || _c === void 0 ? void 0 : _c.translate)) {
            text = this.translaterService.translate(translationKey || ' ');
        }
        else if (localeKey in locales) {
            text = locales[localeKey];
        }
        else {
            text = localeKey;
        }
        return text;
    }
}
//# sourceMappingURL=extensionUtility.js.map