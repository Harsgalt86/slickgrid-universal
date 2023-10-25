"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssociatedDateSortComparer = exports.compareDates = void 0;
const fieldType_enum_1 = require("../enums/fieldType.enum");
const utilities_1 = require("../services/utilities");
const moment_ = require("moment-mini");
const moment = moment_['default'] || moment_; // patch to fix rollup "moment has no default export" issue, document here https://github.com/rollup/rollup/issues/670
function compareDates(value1, value2, sortDirection, format, strict) {
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
exports.compareDates = compareDates;
/** From a FieldType, return the associated Date SortComparer */
function getAssociatedDateSortComparer(fieldType) {
    const FORMAT = (fieldType === fieldType_enum_1.FieldType.date) ? moment.ISO_8601 : (0, utilities_1.mapMomentDateFormatWithFieldType)(fieldType);
    return ((value1, value2, sortDirection) => {
        if (FORMAT === moment.ISO_8601) {
            return compareDates(value1, value2, sortDirection, FORMAT, false);
        }
        return compareDates(value1, value2, sortDirection, FORMAT, true);
    });
}
exports.getAssociatedDateSortComparer = getAssociatedDateSortComparer;
//# sourceMappingURL=dateUtilities.js.map