import type { ColumnPickerOption, DOMEvent, GridMenuOption } from '../interfaces/index';
import { SlickColumnPicker } from './slickColumnPicker';
import { SlickGridMenu } from './slickGridMenu';
/** Create a Close button element and add it to the Menu element */
export declare function addCloseButtomElement(this: SlickColumnPicker | SlickGridMenu, menuElm: HTMLDivElement): void;
/** When "columnTitle" option is provided, let's create a div element to show "Columns" list title */
export declare function addColumnTitleElementWhenDefined(this: SlickColumnPicker | SlickGridMenu, menuElm: HTMLDivElement): void;
/**
 * When clicking an input checkboxes from the column picker list to show/hide a column (or from the picker extra commands like forcefit columns)
 * @param event - input checkbox event
 * @returns
 */
export declare function handleColumnPickerItemClick(this: SlickColumnPicker | SlickGridMenu, event: DOMEvent<HTMLInputElement>): void;
export declare function populateColumnPicker(this: SlickColumnPicker | SlickGridMenu, addonOptions: ColumnPickerOption | GridMenuOption): void;
/**
 * Because columns can be reordered, we have to update the `columns` to reflect the new order, however we can't just take `grid.getColumns()`,
 * as it does not include columns currently hidden by the picker. We create a new `columns` structure by leaving currently-hidden
 * columns in their original ordinal position and interleaving the results of the current column sort.
 */
export declare function updateColumnPickerOrder(this: SlickColumnPicker | SlickGridMenu): void;
//# sourceMappingURL=extensionCommonUtils.d.ts.map