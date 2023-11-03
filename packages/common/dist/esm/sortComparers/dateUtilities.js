import { FieldType } from '../enums/fieldType.enum';
import { mapMomentDateFormatWithFieldType } from '../services/utilities';
import * as moment_ from 'moment-mini';
const moment = moment_['default'] || moment_; // patch to fix rollup "moment has no default export" issue, document here https://github.com/rollup/rollup/issues/670
export function compareDates(value1, value2, sortDirection, format, strict) {
    let diff = 0;
    if (value1 === value2) {
        diff = 0;
    }
    else {
        // use moment to validate the date
        let date1 = moment(value1, format, strict);
        let date2 = moment(value2, format, strict);
        // when moment date is invalid, we'll create a temporary old Date
        if (!date1.isValid()) {
            date1 = new Date(1001, 1, 1);
        }
        if (!date2.isValid()) {
            date2 = new Date(1001, 1, 1);
        }
        // we can use valueOf on both moment & Date to sort
        diff = date1.valueOf() - date2.valueOf();
    }
    return sortDirection * diff;
}
/** From a FieldType, return the associated Date SortComparer */
export function getAssociatedDateSortComparer(fieldType) {
    const FORMAT = (fieldType === FieldType.date) ? moment.ISO_8601 : mapMomentDateFormatWithFieldType(fieldType);
    return ((value1, value2, sortDirection) => {
        if (FORMAT === moment.ISO_8601) {
            return compareDates(value1, value2, sortDirection, FORMAT, false);
        }
        return compareDates(value1, value2, sortDirection, FORMAT, true);
    });
}
//# sourceMappingURL=dateUtilities.js.map