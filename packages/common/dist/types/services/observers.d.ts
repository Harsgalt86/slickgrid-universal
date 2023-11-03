/**
 * Collection Observer to watch for any array changes (pop, push, reverse, shift, unshift, splice, sort)
 * and execute the callback when any of the methods are called
 * @param {any[]} inputArray - array you want to listen to
 * @param {Function} callback function that will be called on any change inside array
 */
export declare function collectionObserver(inputArray: any[], callback: (outputArray: any[], newValues: any[]) => void): void;
/**
 * Object Property Observer and execute the callback whenever any of the object property changes.
 * @param {*} obj - input object
 * @param {String} prop - object property name
 * @param {Function} callback - function that will be called on any change inside array
 */
export declare function propertyObserver(obj: any, prop: string, callback: (newValue: any) => void): void;
//# sourceMappingURL=observers.d.ts.map