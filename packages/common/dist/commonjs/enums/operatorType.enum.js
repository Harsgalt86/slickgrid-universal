"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorType = void 0;
var OperatorType;
(function (OperatorType) {
    /** value is empty */
    OperatorType["empty"] = "";
    /** value contains in x (search for substring in the string) */
    OperatorType["contains"] = "Contains";
    /** value not contains x (inversed of contains) */
    OperatorType["notContains"] = "Not_Contains";
    /** value less than x */
    OperatorType["lessThan"] = "LT";
    /** value less than or equal to x */
    OperatorType["lessThanOrEqual"] = "LE";
    /** value greater than x */
    OperatorType["greaterThan"] = "GT";
    /** value great than or equal to x */
    OperatorType["greaterThanOrEqual"] = "GE";
    /** value not equal to x */
    OperatorType["notEqual"] = "NE";
    /** value equal to x */
    OperatorType["equal"] = "EQ";
    /** String ends with value */
    OperatorType["endsWith"] = "EndsWith";
    /**
     * Search in an inclusive range of values that is greater or equal to search value 1 and is smaller or equal to value 2
     * For example the search term of "5..10" will return any values that are greater or equal to 5 and smaller or equal to 10
     */
    OperatorType["rangeInclusive"] = "RangeInclusive";
    /**
     * Search in an inclusive range of values that is greater then search value 1 and is smaller then value 2
     * For example the search term of "5..10" will return any values that is greater then 5 and smaller then 10
     */
    OperatorType["rangeExclusive"] = "RangeExclusive";
    /** String starts with value */
    OperatorType["startsWith"] = "StartsWith";
    /** Find an equal match inside a collection */
    OperatorType["in"] = "IN";
    /** Inverse (Not In) of an equal match inside a collection */
    OperatorType["notIn"] = "NOT_IN";
    /**
     * Find a substring contained inside a collection, note that it has to be a CSV string.
     * For example, this condition would return True with "IN_CONTAINS":: value='Task2,Task3', collection=['Task2','Task3']
     * This would have returned False with "IN" because 'Task2' does not equal 'Task2,Task3'. However 'Task2' is contained in 'Task2,Task3'
     */
    OperatorType["inContains"] = "IN_CONTAINS";
    /** Inversed (Not In) of substring contained inside a collection */
    OperatorType["notInContains"] = "NOT_IN_CONTAINS";
    /** Find a value from within a collection inside another collection */
    OperatorType["inCollection"] = "IN_COLLECTION";
    /** Inversed (Not In) of looking for a value from a collection inside another collection */
    OperatorType["notInCollection"] = "NOT_IN_COLLECTION";
})(OperatorType || (exports.OperatorType = OperatorType = {}));
//# sourceMappingURL=operatorType.enum.js.map