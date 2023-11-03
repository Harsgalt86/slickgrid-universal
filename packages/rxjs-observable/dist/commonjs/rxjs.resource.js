"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RxJsResource = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
class RxJsResource {
    constructor() {
        this.className = 'RxJsResource';
    }
    /**
     * The same Observable instance returned by any call to without a scheduler.
     * This returns the EMPTY constant from RxJS
     */
    get EMPTY() {
        return rxjs_1.EMPTY;
    }
    /** Simple method to create an Observable */
    createObservable() {
        return new rxjs_1.Observable();
    }
    /** Simple method to create a Subject */
    createSubject() {
        return new rxjs_1.Subject();
    }
    /** Converts an observable to a promise by subscribing to the observable, and returning a promise that will resolve
     * as soon as the first value arrives from the observable. The subscription will then be closed.
     */
    firstValueFrom(source) {
        return (0, rxjs_1.firstValueFrom)(source);
    }
    iif(condition, trueResult, falseResult) {
        return (0, rxjs_1.iif)(condition, trueResult, falseResult);
    }
    /** Tests to see if the object is an RxJS Observable */
    isObservable(obj) {
        return (0, rxjs_1.isObservable)(obj);
    }
    /** Converts the arguments to an observable sequence. */
    of(...value) {
        return (0, rxjs_1.of)(...value);
    }
    /** Projects each source value to an Observable which is merged in the output Observable, emitting values only from the most recently projected Observable. */
    switchMap(project) {
        return (0, rxjs_1.switchMap)(project);
    }
    /** Emits the values emitted by the source Observable until a `notifier` Observable emits a value. */
    takeUntil(notifier) {
        return (0, operators_1.takeUntil)(notifier);
    }
}
exports.RxJsResource = RxJsResource;
//# sourceMappingURL=rxjs.resource.js.map