"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueObjectArray = exports.uniqueArray = exports.toSnakeCase = exports.toSentenceCase = exports.toKebabCase = exports.toCamelCase = exports.titleCase = exports.setDeepValue = exports.removeAccentFromText = exports.parseBoolean = exports.isObjectEmpty = exports.isNumber = exports.hasData = exports.isPrimitiveValue = exports.isObject = exports.isEmptyObject = exports.emptyObject = exports.objectAssignAndExtend = exports.deepMerge = exports.deepCopy = exports.arrayRemoveItemByIndex = exports.addWhiteSpaces = exports.addToArrayWhenNotExists = void 0;
/**
 * Add an item to an array only when the item does not exists, when the item is an object we will be using their "id" to compare
 * @param inputArray
 * @param inputItem
 * @param itemIdPropName
 */
function addToArrayWhenNotExists(inputArray, inputItem, itemIdPropName = 'id') {
    let arrayRowIndex = -1;
    if (inputItem && typeof inputItem === 'object' && itemIdPropName in inputItem) {
        arrayRowIndex = inputArray.findIndex((item) => item[itemIdPropName] === inputItem[itemIdPropName]);
    }
    else {
        arrayRowIndex = inputArray.findIndex((item) => item === inputItem);
    }
    if (arrayRowIndex < 0) {
        inputArray.push(inputItem);
    }
}
exports.addToArrayWhenNotExists = addToArrayWhenNotExists;
/**
 * Simple function to which will loop and create as demanded the number of white spaces,
 * this is used in the CSV export
 * @param {Number} nbSpaces - number of white spaces to create
 * @param {String} spaceChar - optionally provide character to use as a space (could be override to use &nbsp; in html)
 */
function addWhiteSpaces(nbSpaces, spaceChar = ' ') {
    let result = '';
    for (let i = 0; i < nbSpaces; i++) {
        result += spaceChar;
    }
    return result;
}
exports.addWhiteSpaces = addWhiteSpaces;
/**
 * Remove a column from the grid by it's index in the grid
 * @param array input
 * @param index
 */
function arrayRemoveItemByIndex(array, index) {
    return array.filter((_el, i) => index !== i);
}
exports.arrayRemoveItemByIndex = arrayRemoveItemByIndex;
/**
 * Create an immutable clone of an array or object
 * (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Array|Object} objectOrArray - the array or object to copy
 * @return {Array|Object} - the clone of the array or object
 */
function deepCopy(objectOrArray) {
    /**
     * Create an immutable copy of an object
     * @return {Object}
     */
    const cloneObj = () => {
        // Create new object
        const clone = {};
        // Loop through each item in the original
        // Recursively copy it's value and add to the clone
        for (const key in objectOrArray) {
            if (Object.prototype.hasOwnProperty.call(objectOrArray, key)) {
                clone[key] = deepCopy(objectOrArray[key]);
            }
        }
        return clone;
    };
    /**
     * Create an immutable copy of an array
     * @return {Array}
     */
    const cloneArr = () => objectOrArray.map((item) => deepCopy(item));
    // -- init --//
    // Get object type
    const type = Object.prototype.toString.call(objectOrArray).slice(8, -1).toLowerCase();
    // If an object
    if (type === 'object') {
        return cloneObj();
    }
    // If an array
    if (type === 'array') {
        return cloneArr();
    }
    // Otherwise, return it as-is
    return objectOrArray;
}
exports.deepCopy = deepCopy;
/**
 * Performs a deep merge of objects and returns new object, it does not modify the source object, objects (immutable) and merges arrays via concatenation.
 * Also, if first argument is undefined/null but next argument is an object then it will proceed and output will be an object
 * @param {Object} target - the target object — what to apply the sources' properties to, which is returned after it is modified.
 * @param {Object} sources - the source object(s) — objects containing the properties you want to apply.
 * @returns {Object} The target object.
 */
function deepMerge(target, ...sources) {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();
    // when target is not an object but source is an object, then we'll assign as object
    target = (!isObject(target) && isObject(source)) ? {} : target;
    if (isObject(target) && isObject(source)) {
        for (const prop in source) {
            if (source.hasOwnProperty(prop)) {
                if (prop in target) {
                    // handling merging of two properties with equal names
                    if (typeof target[prop] !== 'object') {
                        target[prop] = source[prop];
                    }
                    else {
                        if (typeof source[prop] !== 'object') {
                            target[prop] = source[prop];
                        }
                        else {
                            if (target[prop].concat && source[prop].concat) {
                                // two arrays get concatenated
                                target[prop] = target[prop].concat(source[prop]);
                            }
                            else {
                                // two objects get merged recursively
                                target[prop] = deepMerge(target[prop], source[prop]);
                            }
                        }
                    }
                }
                else {
                    // new properties get added to target
                    target[prop] = source[prop];
                }
            }
        }
    }
    return deepMerge(target, ...sources);
}
exports.deepMerge = deepMerge;
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
function objectAssignAndExtend(target, ...sources) {
    if (!sources.length || sources[0] === undefined) {
        return target;
    }
    const source = sources.shift();
    // when target is not an object but source is an object, then we'll assign as object
    target = (!isObject(target) && isObject(source)) ? {} : target;
    if (isObject(target) && isObject(source)) {
        for (const key of Object.keys(source)) {
            if (typeof source[key] === 'object' && source[key] !== null) {
                objectAssignAndExtend(target[key], source[key]);
            }
            if ((target[key] === null || target[key] === undefined) && source[key] !== null && source[key] !== undefined) {
                target[key] = source[key];
            }
        }
    }
    return objectAssignAndExtend(target, ...sources);
}
exports.objectAssignAndExtend = objectAssignAndExtend;
/**
 * Empty an object properties by looping through them all and deleting them
 * @param obj - input object
 */
function emptyObject(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            delete obj[key];
        }
    }
    obj = null;
    obj = {};
    return obj;
}
exports.emptyObject = emptyObject;
/**
 * Check if an object is empty
 * @param obj - input object
 * @returns - boolean
 */
function isEmptyObject(obj) {
    if (obj === null || obj === undefined) {
        return true;
    }
    return Object.entries(obj).length === 0;
}
exports.isEmptyObject = isEmptyObject;
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return item !== null && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date);
}
exports.isObject = isObject;
/**
 * Simple check to detect if the value is a primitive type
 * @param val
 * @returns {boolean}
 */
function isPrimitiveValue(val) {
    return val === null || val === undefined || typeof val === 'boolean' || typeof val === 'number' || typeof val === 'string';
}
exports.isPrimitiveValue = isPrimitiveValue;
/**
 * Check if a value has any data (undefined, null or empty string will return False...)
 * NOTE: a `false` boolean is consider as having data so it will return True
 */
function hasData(value) {
    return value !== undefined && value !== null && value !== '';
}
exports.hasData = hasData;
/**
 * Check if input value is a number, by default it won't be a strict checking
 * but optionally we could check for strict equality, for example in strict "3" will return False but without strict it will return True
 * @param value - input value of any type
 * @param strict - when using strict it also check for strict equality, for example in strict "3" would return False but without strict it would return True
 */
function isNumber(value, strict = false) {
    if (strict) {
        return (value === null || value === undefined || typeof value === 'string') ? false : !isNaN(value);
    }
    return (value === null || value === undefined || value === '') ? false : !isNaN(+value);
}
exports.isNumber = isNumber;
/** Check if an object is empty, it will also be considered empty when the input is null, undefined or isn't an object */
function isObjectEmpty(obj) {
    return !obj || (obj && typeof obj === 'object' && Object.keys(obj).length === 0);
}
exports.isObjectEmpty = isObjectEmpty;
/** Parse any input (bool, number, string) and return a boolean or False when not possible */
function parseBoolean(input) {
    return /(true|1)/i.test(input + '');
}
exports.parseBoolean = parseBoolean;
/**
 * Remove any accents from a string by normalizing it
 * @param {String} text - input text
 * @param {Boolean} shouldLowerCase - should we also lowercase the string output?
 * @returns
 */
function removeAccentFromText(text, shouldLowerCase = false) {
    const normalizedText = (typeof text.normalize === 'function') ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : text;
    return shouldLowerCase ? normalizedText.toLowerCase() : normalizedText;
}
exports.removeAccentFromText = removeAccentFromText;
/** Set the object value of deeper node from a given dot (.) notation path (e.g.: "user.firstName") */
function setDeepValue(obj, path, value) {
    if (typeof path === 'string') {
        path = path.split('.');
    }
    if (path.length > 1) {
        const e = path.shift();
        if (obj && e !== undefined) {
            setDeepValue((obj)[e] = (hasData(obj[e]) && (Array.isArray(obj[e]) || Object.prototype.toString.call((obj)[e]) === '[object Object]'))
                ? (obj)[e]
                : {}, path, value);
        }
    }
    else if (obj && path[0]) {
        (obj)[path[0]] = value;
    }
}
exports.setDeepValue = setDeepValue;
/**
 * Title case (or capitalize) first char of a string, for example "hello world" will become "Hello world"
 * Change the string to be title case on the complete sentence (upper case first char of each word while changing everything else to lower case)
 * @param inputStr
 * @returns string
 */
function titleCase(inputStr, shouldTitleCaseEveryWords = false) {
    if (typeof inputStr === 'string') {
        if (shouldTitleCaseEveryWords) {
            return inputStr.replace(/\w\S*/g, (outputStr) => {
                return outputStr.charAt(0).toUpperCase() + outputStr.substring(1).toLowerCase();
            });
        }
        return inputStr.charAt(0).toUpperCase() + inputStr.slice(1);
    }
    return inputStr;
}
exports.titleCase = titleCase;
/**
 * Converts a string to camel case (camelCase), for example "hello-world" (or "hellow world") will become "helloWorld"
 * @param inputStr the string to convert
 * @return the string in camel case
 */
function toCamelCase(inputStr) {
    if (typeof inputStr === 'string') {
        return inputStr.replace(/(?:^\w|[A-Z]|\b\w|[\s+\-_\/])/g, (match, offset) => {
            // remove white space or hypens or underscores
            if (/[\s+\-_\/]/.test(match)) {
                return '';
            }
            return offset === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    }
    return inputStr;
}
exports.toCamelCase = toCamelCase;
/**
 * Converts a string to kebab (hypen) case, for example "helloWorld" will become "hello-world"
 * @param str the string to convert
 * @return the string in kebab case
 */
function toKebabCase(inputStr) {
    if (typeof inputStr === 'string') {
        return toCamelCase(inputStr).replace(/([A-Z])/g, '-$1').toLowerCase();
    }
    return inputStr;
}
exports.toKebabCase = toKebabCase;
/**
 * Converts a camelCase or kebab-case string to a sentence case, for example "helloWorld" will become "Hello World" and "hello-world" will become "Hello world"
 * @param str the string to convert
 * @return the string in kebab case
 */
function toSentenceCase(inputStr) {
    if (typeof inputStr === 'string') {
        const result = inputStr.replace(/([A-Z])|(\-)/g, ' $1').replace(/\s+/g, ' ').trim();
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return inputStr;
}
exports.toSentenceCase = toSentenceCase;
/**
 * Converts a string from camelCase to snake_case (underscore) case
 * @param str the string to convert
 * @return the string in kebab case
 */
function toSnakeCase(inputStr) {
    if (typeof inputStr === 'string') {
        return toCamelCase(inputStr).replace(/([A-Z])/g, '_$1').toLowerCase();
    }
    return inputStr;
}
exports.toSnakeCase = toSnakeCase;
/**
 * Takes an input array and makes sure the array has unique values by removing duplicates
 * @param array input with possible duplicates
 * @return array output without duplicates
 */
function uniqueArray(arr) {
    if (Array.isArray(arr) && arr.length > 0) {
        return arr.filter((item, index) => {
            return arr.indexOf(item) >= index;
        });
    }
    return arr;
}
exports.uniqueArray = uniqueArray;
/**
 * Takes an input array of objects and makes sure the array has unique object values by removing duplicates
 * it will loop through the array using a property name (or "id" when is not provided) to compare uniqueness
 * @param array input with possible duplicates
 * @param propertyName defaults to "id"
 * @return array output without duplicates
 */
function uniqueObjectArray(arr, propertyName = 'id') {
    if (Array.isArray(arr) && arr.length > 0) {
        const result = [];
        const map = new Map();
        for (const item of arr) {
            if (item && !map.has(item[propertyName])) {
                map.set(item[propertyName], true); // set any value to Map
                result.push({
                    id: item[propertyName],
                    name: item.name
                });
            }
        }
        return result;
    }
    return arr;
}
exports.uniqueObjectArray = uniqueObjectArray;
//# sourceMappingURL=utils.js.map