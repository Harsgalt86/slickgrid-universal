import type { Column, GridMenuItem, GridOption, MenuCommandItem, MenuOptionItem } from '../interfaces/index';
import type { BackendUtilityService } from '../services/backendUtility.service';
import type { SharedService } from '../services/shared.service';
import type { TranslaterService } from '../services/translater.service';
export declare class ExtensionUtility {
    private readonly sharedService;
    private readonly backendUtilities?;
    private readonly translaterService?;
    constructor(sharedService: SharedService, backendUtilities?: BackendUtilityService | undefined, translaterService?: TranslaterService | undefined);
    /**
     * From a Grid Menu object property name, we will return the correct title output string following this order
     * 1- if user provided a title, use it as the output title
     * 2- else if user provided a title key, use it to translate the output title
     * 3- else if nothing is provided use text defined as constants
     */
    getPickerTitleOutputString(propName: string, pickerName: 'gridMenu' | 'columnPicker'): string;
    /**
     * When using ColumnPicker/GridMenu to show/hide a column, we potentially need to readjust the grid option "frozenColumn" index.
     * That is because SlickGrid freezes by column index and it has no knowledge of the columns themselves and won't change the index, we need to do that ourselves whenever necessary.
     * Note: we call this method right after the visibleColumns array got updated, it won't work properly if we call it before the setting the visibleColumns.
     * @param {Number} frozenColumnIndex - current frozenColumn index
     * @param {Array<Object>} allColumns - all columns (including hidden ones)
     * @param {Array<Object>} visibleColumns - only visible columns (excluding hidden ones)
     */
    readjustFrozenColumnIndexWhenNeeded(frozenColumnIndex: number, allColumns: Column[], visibleColumns: Column[]): void;
    /** Refresh the dataset through the Backend Service */
    refreshBackendDataset(inputGridOptions?: GridOption): void;
    /** Run the Override function when it exists, if it returns True then it is usable/visible */
    runOverrideFunctionWhenExists<T = any>(overrideFn: ((args: any) => boolean) | undefined, args: T): boolean;
    /**
     * Sort items (by pointers) in an array by a property name
     * @param {Array<Object>} items array
     * @param {String} property name to sort with
     */
    sortItems(items: any[], propertyName: string): void;
    /** Translate the array of items from an input key and assign them to their output key */
    translateItems<T = any>(items: T[], inputKey: string, outputKey: string): void;
    /**
     * Loop through all Menu Command Items and use `titleKey` property to translate (or use Locale) appropriate `title` property
     * @param {Array<MenuCommandItem | String>} items - Menu Command Items array
     * @param {Object} gridOptions - Grid Options
     */
    translateMenuItemsFromTitleKey(items: Array<MenuCommandItem | MenuOptionItem | GridMenuItem | 'divider'>): void;
    /**
     * When "enabledTranslate" is set to True, we will try to translate if the Translate Service exist or use the Locales when not
     * @param {String} translationKey
     * @param {String} localeKey
     * @param {String} textToUse - optionally provide a static text to use (that will completely override the other arguments of the method)
     */
    translateWhenEnabledAndServiceExist(translationKey: string, localeKey: string, textToUse?: string): string;
}
//# sourceMappingURL=extensionUtility.d.ts.map