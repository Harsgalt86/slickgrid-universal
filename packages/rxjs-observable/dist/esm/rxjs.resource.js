import { EMPTY, iif, isObservable, firstValueFrom, Observable, of, Subject, switchMap, } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
export class RxJsResource {
    constructor() {
        this.className = 'RxJsResource';
    }
    /**
     * The same Observable instance returned by any call to without a scheduler.
     * This returns the EMPTY constant from RxJS
     */
    get EMPTY() {
        return EMPTY;
    }
    /** Simple method to create an Observable */
    createObservable() {
        return new Observable();
    }
    /** Simple method to create a Subject */
    createSubject() {
        return new Subject();
    }
    /** Converts an observable to a promise by subscribing to the observable, and returning a promise that will resolve
     * as soon as the first value arrives from the observable. The subscription will then be closed.
     */
    firstValueFrom(source) {
        return firstValueFrom(source);
    }
    iif(condition, trueResult, falseResult) {
        return iif(condition, trueResult, falseResult);
    }
    /** Tests to see if the object is an RxJS Observable */
    isObservable(obj) {
        return isObservable(obj);
    }
    /** Converts the arguments to an observable sequence. */
    of(...value) {
        return of(...value);
    }
    /** Projects each source value to an Observable which is merged in the output Observable, emitting values only from the most recently projected Observable. */
    switchMap(project) {
        return switchMap(project);
    }
    /** Emits the values emitted by the source Observable until a `notifier` Observable emits a value. */
    takeUntil(notifier) {
        return takeUntil(notifier);
    }
}
//# sourceMappingURL=rxjs.resource.js.map