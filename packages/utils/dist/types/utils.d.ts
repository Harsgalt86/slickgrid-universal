/**
 * Add an item to an array only when the item does not exists, when the item is an object we will be using their "id" to compare
 * @param inputArray
 * @param inputItem
 * @param itemIdPropName
 */
export declare function addToArrayWhenNotExists<T = any>(inputArray: T[], inputItem: T, itemIdPropName?: string): void;
/**
 * Simple function to which will loop and create as demanded the number of white spaces,
 * this is used in the CSV export
 * @param {Number} nbSpaces - number of white spaces to create
 * @param {String} spaceChar - optionally provide character to use as a space (could be override to use &nbsp; in html)
 */
export declare function addWhiteSpaces(nbSpaces: number, spaceChar?: string): string;
/**
 * Remove a column from the grid by it's index in the grid
 * @param array input
 * @param index
 */
export declare function arrayRemoveItemByIndex<T>(array: T[], index: number): T[];
/**
 * Create an immutable clone of an array or object
 * (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Array|Object} objectOrArray - the array or object to copy
 * @return {Array|Object} - the clone of the array or object
 */
export declare function deepCopy(objectOrArray: any | any[]): any | any[];
/**
 * Performs a deep merge of objects and returns new object, it does not modify the source object, objects (immutable) and merges arrays via concatenation.
 * Also, if first argument is undefined/null but next argument is an object then it will proceed and output will be an object
 * @param {Object} target - the target object — what to apply the sources' properties to, which is returned after it is modified.
 * @param {Object} sources - the source object(s) — objects containing the properties you want to apply.
 * @returns {Object} The target object.
 */
export declare function deepMerge(target: any, ...sources: any[]): any;
/**
 * This method is similar to `Object.assign` with the exception that it will also extend the object properties when filled.
 * There's also a distinction with extend vs merge, we are only extending when the property is not filled (if it is filled then it remains untouched and will not be merged)
 * It also applies the change directly on the target object which mutates the original object.
 * For example using these 2 objects: obj1 = { a: 1, b: { c: 2, d: 3 }} and obj2 = { b: { d: 2, e: 3}}:
 *   - Object.assign(obj1, obj2) => { a: 1, b: { e: 4 }}
 *   - objectAssignAndExtend(obj1, obj2) => { a: 1, b: { c: 2, d: 3, e: 4 }
 * @param {Object} target - the target object — what to apply the sources properties and mutate into
 * @param {Object} sources - the source object(s) — objects containing the properties you want to apply.
 * @returns {Object} The target object.
 */
export declare function objectAssignAndExtend(target: any, ...sources: any): any;
/**
 * Empty an object properties by looping through them all and deleting them
 * @param obj - input object
 */
export declare function emptyObject(obj: any): any;
/**
 * Check if an object is empty
 * @param obj - input object
 * @returns - boolean
 */
export declare function isEmptyObject(obj: any): boolean;
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export declare function isObject(item: any): boolean;
/**
 * Simple check to detect if the value is a primitive type
 * @param val
 * @returns {boolean}
 */
export declare function isPrimitiveValue(val: any): boolean;
/**
 * Check if a value has any data (undefined, null or empty string will return False...)
 * NOTE: a `false` boolean is consider as having data so it will return True
 */
export declare function hasData(value: any): boolean;
/**
 * Check if input value is a number, by default it won't be a strict checking
 * but optionally we could check for strict equality, for example in strict "3" will return False but without strict it will return True
 * @param value - input value of any type
 * @param strict - when using strict it also check for strict equality, for example in strict "3" would return False but without strict it would return True
 */
export declare function isNumber(value: any, strict?: boolean): boolean;
/** Check if an object is empty, it will also be considered empty when the input is null, undefined or isn't an object */
export declare function isObjectEmpty(obj: unknown): boolean;
/** Parse any input (bool, number, string) and return a boolean or False when not possible */
export declare function parseBoolean(input: any): boolean;
/**
 * Remove any accents from a string by normalizing it
 * @param {String} text - input text
 * @param {Boolean} shouldLowerCase - should we also lowercase the string output?
 * @returns
 */
export declare function removeAccentFromText(text: string, shouldLowerCase?: boolean): string;
/** Set the object value of deeper node from a given dot (.) notation path (e.g.: "user.firstName") */
export declare function setDeepValue<T = unknown>(obj: T, path: string | string[], value: any): void;
/**
 * Title case (or capitalize) first char of a string, for example "hello world" will become "Hello world"
 * Change the string to be title case on the complete sentence (upper case first char of each word while changing everything else to lower case)
 * @param inputStr
 * @returns string
 */
export declare function titleCase(inputStr: string, shouldTitleCaseEveryWords?: boolean): string;
/**
 * Converts a string to camel case (camelCase), for example "hello-world" (or "hellow world") will become "helloWorld"
 * @param inputStr the string to convert
 * @return the string in camel case
 */
export declare function toCamelCase(inputStr: string): string;
/**
 * Converts a string to kebab (hypen) case, for example "helloWorld" will become "hello-world"
 * @param str the string to convert
 * @return the string in kebab case
 */
export declare function toKebabCase(inputStr: string): string;
/**
 * Converts a camelCase or kebab-case string to a sentence case, for example "helloWorld" will become "Hello World" and "hello-world" will become "Hello world"
 * @param str the string to convert
 * @return the string in kebab case
 */
export declare function toSentenceCase(inputStr: string): string;
/**
 * Converts a string from camelCase to snake_case (underscore) case
 * @param str the string to convert
 * @return the string in kebab case
 */
export declare function toSnakeCase(inputStr: string): string;
/**
 * Takes an input array and makes sure the array has unique values by removing duplicates
 * @param array input with possible duplicates
 * @return array output without duplicates
 */
export declare function uniqueArray<T = any>(arr: T[]): T[];
/**
 * Takes an input array of objects and makes sure the array has unique object values by removing duplicates
 * it will loop through the array using a property name (or "id" when is not provided) to compare uniqueness
 * @param array input with possible duplicates
 * @param propertyName defaults to "id"
 * @return array output without duplicates
 */
export declare function uniqueObjectArray(arr: any[], propertyName?: string): any[];
//# sourceMappingURL=utils.d.ts.map