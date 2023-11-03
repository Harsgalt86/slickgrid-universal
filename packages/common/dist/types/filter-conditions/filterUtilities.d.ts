import type { OperatorString } from '../enums/index';
/**
 * Compare 2 objects,
 * we will loop through all properties of the object to compare the entire content of both objects
 * Optionally we can compare by a property key, when that is provided we will compare the object content
 * @param o1
 * @param o2
 * @param compareKey optional
 * @return boolean are objects equals?
 */
export declare function compareObjects(o1: any, o2: any, compareKey?: string): boolean;
/** Simple check to see if the given Operator is meant to be used with a collection check */
export declare function isCollectionOperator(operator: OperatorString): boolean;
/** Execute the test on the filter condition given an operator and both values, returns a boolean */
export declare const testFilterCondition: (operator: OperatorString, value1: any, value2: any) => boolean;
//# sourceMappingURL=filterUtilities.d.ts.map