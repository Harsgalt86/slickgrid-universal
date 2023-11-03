/**
 * A simple empty shell, a Facade to RxJS to make Slickgrid-Universal usable with RxJS without installing RxJS.
 * Its sole purpose is to provide access, as an Interface, to use RxJS with Slickgrid-Universal without adding it as a dependency.
 * The developer who will want to use RxJS will simply have to use the extra `rxjs-observable` package to get going.
 *
 * That external `rsjs-observable` package simply implements this RxJsFacade
 * and is just a very simple and basic RxJS Wrapper package (which will depend on the real RxJS package)
 */
export declare abstract class RxJsFacade {
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
    /** Decides at subscription time which Observable will actually be subscribed. */
    iif<T = never, F = never>(condition: () => boolean, trueResult?: any, falseResult?: any): Observable<T | F>;
    /** Tests to see if the object is an RxJS Observable */
    isObservable(obj: any): boolean;
    /** Converts the arguments to an observable sequence. */
    of(...value: any): Observable<any>;
    /** Projects each source value to an Observable which is merged in the output Observable, emitting values only from the most recently projected Observable. */
    switchMap(project: (value: any, index: number) => any): any;
    /** Emits the values emitted by the source Observable until a `notifier` Observable emits a value. */
    takeUntil<T>(notifier: Observable<any>): any;
}
/** A representation of any set of values over any amount of time. This is the most basic building block of RxJS. */
export declare abstract class Observable<T> {
    /** Observable constructor, you can provide a subscribe function that is called when the Observable is initially subscribed to. */
    constructor(subscribe?: (this: Observable<T>, subscriber: any) => any);
    /** Subscribe to the Observable */
    subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
    /** Pipe an operator function to the Observable */
    pipe(...fns: Array<any>): any;
}
/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 */
export declare abstract class Subject<T> extends Observable<T> {
    complete(): void;
    next(value: T): void;
    unsubscribe(): void;
}
/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 */
export declare abstract class Subscription {
    /** A function describing how to perform the disposal of resources when the `unsubscribe` method is called. */
    constructor(unsubscribe?: () => void);
    /** Disposes the resources held by the subscription. */
    unsubscribe(): void;
}
//# sourceMappingURL=rxjsFacade.d.ts.map