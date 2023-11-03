"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyObserver = exports.collectionObserver = void 0;
/**
 * Collection Observer to watch for any array changes (pop, push, reverse, shift, unshift, splice, sort)
 * and execute the callback when any of the methods are called
 * @param {any[]} inputArray - array you want to listen to
 * @param {Function} callback function that will be called on any change inside array
 */
function collectionObserver(inputArray, callback) {
    // Add more methods here if you want to listen to them
    const mutationMethods = ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'];
    mutationMethods.forEach((changeMethod) => {
        inputArray[changeMethod] = (...args) => {
            const res = Array.prototype[changeMethod].apply(inputArray, args); // call normal behaviour
            callback.apply(inputArray, [inputArray, args]); // finally call the callback supplied
            return res;
        };
    });
}
exports.collectionObserver = collectionObserver;
/**
 * Object Property Observer and execute the callback whenever any of the object property changes.
 * @param {*} obj - input object
 * @param {String} prop - object property name
 * @param {Function} callback - function that will be called on any change inside array
 */
function propertyObserver(obj, prop, callback) {
    let innerValue = obj[prop];
    Object.defineProperty(obj, prop, {
        configurable: true,
        get() {
            return innerValue;
        },
        set(newValue) {
            innerValue = newValue;
            // @ts-ignore
            callback.apply(obj, [newValue, obj[prop]]);
        }
    });
}
exports.propertyObserver = propertyObserver;
//# sourceMappingURL=observers.js.map