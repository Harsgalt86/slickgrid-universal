import type { RxJsFacade } from '@slickgrid-universal/common';
import { Observable, ObservableInput, OperatorFunction, ObservedValueOf, Subject } from 'rxjs';
export declare class RxJsResource implements RxJsFacade {
    readonly className = "RxJsResource";
    /**
     * The same Observable instance returned by any call to without a scheduler.
     * This returns the EMPTY constant from RxJS
     */
    get EMPTY(): Observable<never>;
    /** Simple method to create an Observable */
    createObservable<T>(): Observable<T>;
    /** Simple method to create a Subject */
    createSubject<T>(): Subject<T>;
    /** Converts an observable to a promise by subscribing to the observable, and returning a promise that will resolve
     * as soon as the first value arrives from the observable. The subscription will then be closed.
     */
    firstValueFrom<T>(source: Observable<T>): Promise<T>;
    iif<T = never, F = never>(condition: () => boolean, trueResult?: any, falseResult?: any): Observable<T | F>;
    /** Tests to see if the object is an RxJS Observable */
    isObservable(obj: any): boolean;
    /** Converts the arguments to an observable sequence. */
    of(...value: any): Observable<any>;
    /** Projects each source value to an Observable which is merged in the output Observable, emitting values only from the most recently projected Observable. */
    switchMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
    /** Emits the values emitted by the source Observable until a `notifier` Observable emits a value. */
    takeUntil<T>(notifier: Observable<any>): any;
}
//# sourceMappingURL=rxjs.resource.d.ts.map