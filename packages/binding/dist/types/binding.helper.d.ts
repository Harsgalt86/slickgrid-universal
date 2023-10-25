import { BindingService } from './binding.service';
export declare class BindingHelper {
    private _observers;
    private _querySelectorPrefix;
    get querySelectorPrefix(): string;
    set querySelectorPrefix(prefix: string);
    get observers(): BindingService[];
    dispose(): void;
    addElementBinding<T extends Element = Element>(variable: any, property: string, selector: string, attribute: string, events?: string | string[], callback?: (val: any) => void): void;
    /** From a DOM element selector, which could be zero or multiple elements, add an event listener   */
    bindEventHandler<T extends Element = Element>(selector: string, eventName: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    /**
     * From a DOM element selector, which could be zero or multiple elements, set the value on a given attribute name
     * For example ('div.hello', 'textContent', 'world') => would set the textContent equal to 'world' on a div element having the class 'hello'
     */
    setElementAttributeValue<T extends Element = Element>(selector: string, attribute: string, value: any): void;
}
//# sourceMappingURL=binding.helper.d.ts.map