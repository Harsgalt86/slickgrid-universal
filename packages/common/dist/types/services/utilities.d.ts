import type { EventSubscription } from '@slickgrid-universal/event-pub-sub';
import { FieldType, type OperatorString, OperatorType } from '../enums/index';
import type { Aggregator, CancellablePromiseWrapper, Column, GridOption } from '../interfaces/index';
import type { Observable, RxJsFacade, Subject, Subscription } from './rxjsFacade';
/** Cancelled Extension that can be only be thrown by the `cancellablePromise()` function */
export declare class CancelledException extends Error {
    constructor(message: string);
}
/**
 * From an input Promise, make it cancellable by wrapping it inside an object that holds the promise and a `cancel()` method
 * @param {Promise<any>} - input Promise
 * @returns {Object} - Promise wrapper that holds the promise and a `cancel()` method
 */
export declare function cancellablePromise<T = any>(inputPromise: Promise<T>): CancellablePromiseWrapper<T>;
/**
 * Try casting an input of type Promise | Observable into a Promise type.
 * @param object which could be of type Promise or Observable
 * @param fromServiceName string representing the caller service name and will be used if we throw a casting problem error
 */
export declare function castObservableToPromise<T>(rxjs: RxJsFacade, input: Promise<T> | Observable<T> | Subject<T>, fromServiceName?: string): Promise<T>;
/**
 * Mutate the original array and add a treeLevel (defaults to `__treeLevel`) property on each item.
 * @param {Array<Object>} treeArray - hierarchical tree array
 * @param {Object} options - options containing info like children & treeLevel property names
 * @param {Number} [treeLevel] - current tree level
 */
export declare function addTreeLevelByMutation<T>(treeArray: T[], options: {
    childrenPropName: string;
    levelPropName: string;
}, treeLevel?: number): void;
export declare function addTreeLevelAndAggregatorsByMutation<T = any>(treeArray: T[], options: {
    aggregator: Aggregator;
    childrenPropName: string;
    levelPropName: string;
}, treeLevel?: number, parent?: T): void;
/**
 * Convert a hierarchical (tree) array (with children) into a flat array structure array (where the children are pushed as next indexed item in the array)
 * @param {Array<Object>} treeArray - input hierarchical (tree) array
 * @param {Object} options - you can provide "childrenPropName" (defaults to "children")
 * @return {Array<Object>} output - Parent/Child array
 */
export declare function flattenToParentChildArray<T>(treeArray: T[], options?: {
    aggregators?: Aggregator[];
    parentPropName?: string;
    childrenPropName?: string;
    hasChildrenPropName?: string;
    identifierPropName?: string;
    shouldAddTreeLevelNumber?: boolean;
    levelPropName?: string;
}): Omit<T, number | typeof Symbol.iterator | "charAt" | "charCodeAt" | "concat" | "indexOf" | "lastIndexOf" | "localeCompare" | "match" | "replace" | "search" | "slice" | "split" | "substring" | "toLowerCase" | "toLocaleLowerCase" | "toUpperCase" | "toLocaleUpperCase" | "trim" | "length" | "substr" | "codePointAt" | "includes" | "endsWith" | "normalize" | "repeat" | "startsWith" | "anchor" | "big" | "blink" | "bold" | "fixed" | "fontcolor" | "fontsize" | "italics" | "link" | "small" | "strike" | "sub" | "sup" | "padStart" | "padEnd" | "trimEnd" | "trimStart" | "trimLeft" | "trimRight" | "matchAll" | "at" | "toString" | "toLocaleString" | "valueOf">[];
/**
 * Convert a flat array (with "parentId" references) into a hierarchical (tree) dataset structure (where children are array(s) inside their parent objects)
 * @param flatArray input array (flat dataset)
 * @param options you can provide the following tree data options (which are all prop names, except 1 boolean flag, to use or else use their defaults):: collapsedPropName, childrenPropName, parentPropName, identifierPropName and levelPropName and initiallyCollapsed (boolean)
 * @return roots - hierarchical (tree) data view array
 */
export declare function unflattenParentChildArrayToTree<P, T extends P & {
    [childrenPropName: string]: P[];
}>(flatArray: P[], options?: {
    aggregators?: Aggregator[];
    childrenPropName?: string;
    collapsedPropName?: string;
    identifierPropName?: string;
    levelPropName?: string;
    parentPropName?: string;
    initiallyCollapsed?: boolean;
}): T[];
/**
 * Find an item from a tree (hierarchical) view structure (a parent that can have children array which themseleves can children and so on)
 * @param {Array<Object>} treeArray - hierarchical tree dataset
 * @param {Function} predicate - search predicate to find the item in the hierarchical tree structure
 * @param {String} childrenPropertyName - children property name to use in the tree (defaults to "children")
 */
export declare function findItemInTreeStructure<T = any>(treeArray: T[], predicate: (item: T) => boolean, childrenPropertyName: string): T | undefined;
/**
 * Take a number (or a string) and display it as a formatted decimal string with defined minimum and maximum decimals
 * @param input
 * @param minDecimal
 * @param maxDecimal
 * @param decimalSeparator
 * @param thousandSeparator
 */
export declare function decimalFormatted(input: number | string, minDecimal?: number, maxDecimal?: number, decimalSeparator?: '.' | ',', thousandSeparator?: ',' | '_' | '.' | ' ' | ''): string;
/**
 * Format a number following options passed as arguments (decimals, separator, ...)
 * @param input
 * @param minDecimal
 * @param maxDecimal
 * @param wrapNegativeNumberInBraquets
 * @param symbolPrefix
 * @param symbolSuffix
 * @param decimalSeparator
 * @param thousandSeparator
 */
export declare function formatNumber(input: number | string, minDecimal?: number, maxDecimal?: number, wrapNegativeNumberInBraquets?: boolean, symbolPrefix?: string, symbolSuffix?: string, decimalSeparator?: '.' | ',', thousandSeparator?: ',' | '_' | '.' | ' ' | ''): string;
/**
 * When a queryFieldNameGetterFn is defined, then get the value from that getter callback function
 * @param {Column} columnDef
 * @param {Object} dataContext
 * @param {String} defaultValue - optional value to use if value isn't found in data context
 * @return outputValue
 */
export declare function getCellValueFromQueryFieldGetter(columnDef: Column, dataContext: any, defaultValue: any): string;
/**
 * From a dot (.) notation path, find and return a property within an object given a path
 * @param object - object input
 * @param path - path of the complex object, string with dot (.) notation
 * @returns outputValue - the object property value found if any
 */
export declare function getDescendantProperty<T = any>(object: T, path: string | undefined): any;
/** Get I18N Translation Prefix, defaults to an empty string */
export declare function getTranslationPrefix(gridOptions?: GridOption): string;
/** From a column definition, find column type */
export declare function getColumnFieldType(columnDef: Column): typeof FieldType[keyof typeof FieldType];
/** Verify if the identified column is of type Date */
export declare function isColumnDateType(fieldType: typeof FieldType[keyof typeof FieldType]): boolean;
/**
 * From a Date FieldType, return it's equivalent moment.js format
 * refer to moment.js for the format standard used: https://momentjs.com/docs/#/parsing/string-format/
 * @param fieldType
 */
export declare function mapMomentDateFormatWithFieldType(fieldType: typeof FieldType[keyof typeof FieldType]): string;
/**
 * From a Date FieldType, return it's equivalent Flatpickr format
 * refer to Flatpickr for the format standard used: https://chmln.github.io/flatpickr/formatting/#date-formatting-tokens
 * also note that they seem very similar to PHP format (except for am/pm): http://php.net/manual/en/function.date.php
 * @param fieldType
 */
export declare function mapFlatpickrDateFormatWithFieldType(fieldType: typeof FieldType[keyof typeof FieldType]): string;
/**
 * Mapper for query operators (ex.: <= is "le", > is "gt")
 * @param string operator
 * @returns string map
 */
export declare function mapOperatorType(operator: OperatorType | OperatorString): OperatorType;
/**
 * Find equivalent short designation of an Operator Type or Operator String.
 * When using a Compound Filter, we use the short designation and so we need the mapped value.
 * For example OperatorType.startsWith short designation is "a*", while OperatorType.greaterThanOrEqual is ">="
 */
export declare function mapOperatorToShorthandDesignation(operator: OperatorType | OperatorString): OperatorString;
/**
 * Mapper for query operator by a Filter Type
 * For example a multiple-select typically uses 'IN' operator
 * @param operator
 * @returns string map
 */
export declare function mapOperatorByFieldType(fieldType: typeof FieldType[keyof typeof FieldType]): OperatorType;
/**
 * Takes an object and allow to provide a property key to omit from the original object
 * @param {Object} obj - input object
 * @param {String} omitKey - object property key to omit
 * @returns {String} original object without the property that user wants to omit
 */
export declare function objectWithoutKey<T = any>(obj: T, omitKey: keyof T): T;
/**
 * Parse a date passed as a string (Date only, without time) and return a Date object (if valid)
 * @param inputDateString
 * @returns string date formatted
 */
export declare function parseUtcDate(inputDateString: any, useUtc?: boolean): string;
/**
 * Format a number or a string into a string that is separated every thousand,
 * the default separator is a comma but user can optionally pass a different one
 * @param inputValue
 * @param separator default to comma ","
 * @returns string
 */
export declare function thousandSeparatorFormatted(inputValue: string | number | null, separator?: ',' | '_' | '.' | ' ' | ''): string | null;
/**
 * Uses the logic function to find an item in an array or returns the default
 * value provided (empty object by default)
 * @param any[] array the array to filter
 * @param function logic the logic to find the item
 * @param any [defaultVal={}] the default value to return
 * @return object the found object or default value
 */
export declare function findOrDefault<T = any>(array: T[], logic: (item: T) => boolean, defaultVal?: {}): any;
/**
 * Unsubscribe all Subscriptions
 * It will return an empty array if it all went well
 * @param subscriptions
 */
export declare function unsubscribeAll(subscriptions: Array<EventSubscription | Subscription>): Array<EventSubscription | Subscription>;
//# sourceMappingURL=utilities.d.ts.map