import type { Binding, BoundedEventWithListener, ElementBinding, ElementBindingWithListener } from './interfaces';
/**
 * Create 2 way Bindings for any variable that are primitive or object types, when it's an object type it will watch for property changes
 * The following 2 articles helped in building this service:
 *   1- https://blog.jeremylikness.com/blog/client-side-javascript-databinding-without-a-framework/
 *   2- https://www.wintellect.com/data-binding-pure-javascript/
 */
export declare class BindingService {
    protected _value: any;
    protected _binding: Binding;
    protected _property: string;
    protected _boundedEventWithListeners: BoundedEventWithListener[];
    protected _elementBindings: Array<ElementBinding | ElementBindingWithListener>;
    constructor(binding: Binding);
    get boundedEventWithListeners(): BoundedEventWithListener[];
    get elementBindings(): Array<ElementBinding | ElementBindingWithListener>;
    get property(): string;
    dispose(): void;
    valueGetter(): any;
    valueSetter<T extends Element = Element>(val: any): void;
    /**
     * Add binding to 1 or more DOM Element by an object attribute and optionally on an event, we can do it in couple ways
     * 1- if there's no event provided, it will simply replace the DOM elemnt (by an attribute), for example an innerHTML
     * 2- when an event is provided, we will replace the DOM element (by an attribute) every time an event is triggered
     *    2.1- we could also provide an extra callback method to execute when the event gets triggered
     */
    bind<T extends Element = Element>(elements: T | NodeListOf<T> | null, attribute: string, eventName?: string, eventCallback?: (val: any) => any): this;
    /** Unbind (remove) an element event listener */
    unbind(element: Element | null, eventName: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions, eventUid?: string): void;
    /** Unbind All (remove) bounded elements with listeners */
    unbindAll(): void;
    /**
     * Add binding to a single element by an object attribute and optionally on an event, we can do it in couple ways
     * 1- if there's no event provided, it will simply replace the DOM element (by an attribute), for example an innerHTML
     * 2- when an event is provided, we will replace the DOM element (by an attribute) every time an event is triggered
     *    2.1- we could also provide an extra callback method to execute when the event gets triggered
     */
    protected bindSingleElement<T extends Element = Element>(element: T | null, attribute: string, eventName?: string, eventCallback?: (val: any) => any): void;
    /** Generate a UUID version 4 RFC compliant */
    protected generateUuidV4(): string;
    protected hasData(value: any): boolean;
}
//# sourceMappingURL=binding.service.d.ts.map