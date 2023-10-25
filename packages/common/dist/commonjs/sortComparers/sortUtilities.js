"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortByFieldType = void 0;
const index_1 = require("../enums/index");
const index_2 = require("./index");
const dateUtilities_1 = require("./dateUtilities");
function sortByFieldType(fieldType, value1, value2, sortDirection, sortColumn, gridOptions) {
    let sortResult = 0;
    switch (fieldType) {
        case index_1.FieldType.boolean:
            sortResult = index_2.SortComparers.boolean(value1, value2, sortDirection, sortColumn, gridOptions);
            break;
        case index_1.FieldType.float:
        case index_1.FieldType.integer:
        case index_1.FieldType.number:
            sortResult = index_2.SortComparers.numeric(value1, value2, sortDirection, sortColumn, gridOptions);
            break;
        case index_1.FieldType.date:
        case index_1.FieldType.dateIso:
        case index_1.FieldType.dateUtc:
        case index_1.FieldType.dateTime:
        case index_1.FieldType.dateTimeIso:
        case index_1.FieldType.dateTimeIsoAmPm:
        case index_1.FieldType.dateTimeIsoAM_PM:
        case index_1.FieldType.dateTimeShortIso:
        case index_1.FieldType.dateEuro:
        case index_1.FieldType.dateEuroShort:
        case index_1.FieldType.dateTimeShortEuro:
        case index_1.FieldType.dateTimeEuro:
        case index_1.FieldType.dateTimeEuroAmPm:
        case index_1.FieldType.dateTimeEuroAM_PM:
        case index_1.FieldType.dateTimeEuroShort:
        case index_1.FieldType.dateTimeEuroShortAmPm:
        case index_1.FieldType.dateTimeEuroShortAM_PM:
        case index_1.FieldType.dateUs:
        case index_1.FieldType.dateUsShort:
        case index_1.FieldType.dateTimeShortUs:
        case index_1.FieldType.dateTimeUs:
        case index_1.FieldType.dateTimeUsAmPm:
        case index_1.FieldType.dateTimeUsAM_PM:
        case index_1.FieldType.dateTimeUsShort:
        case index_1.FieldType.dateTimeUsShortAmPm:
        case index_1.FieldType.dateTimeUsShortAM_PM:
            // @ts-ignore
            sortResult = (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType).call(this, value1, value2, sortDirection, sortColumn, gridOptions);
            break;
        case index_1.FieldType.object:
            sortResult = index_2.SortComparers.objectString(value1, value2, sortDirection, sortColumn, gridOptions);
            break;
        case index_1.FieldType.string:
        case index_1.FieldType.text:
        case index_1.FieldType.password:
        case index_1.FieldType.readonly:
        default:
            sortResult = index_2.SortComparers.string(value1, value2, sortDirection, sortColumn, gridOptions);
            break;
    }
    return sortResult;
}
exports.sortByFieldType = sortByFieldType;
//# sourceMappingURL=sortUtilities.js.map