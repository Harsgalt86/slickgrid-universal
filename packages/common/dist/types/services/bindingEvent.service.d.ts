import type { ElementEventListener } from '../interfaces/elementEventListener.interface';
export declare class BindingEventService {
    protected _boundedEvents: ElementEventListener[];
    get boundedEvents(): ElementEventListener[];
    dispose(): void;
    /** Bind an event listener to any element */
    bind(elementOrElements: Element | NodeListOf<Element> | Window, eventNameOrNames: string | string[], listener: EventListenerOrEventListenerObject, listenerOptions?: boolean | AddEventListenerOptions, groupName?: string): void;
    /** Unbind a specific listener that was bounded earlier */
    unbind(elementOrElements: Element | NodeListOf<Element>, eventNameOrNames: string | string[], listener: EventListenerOrEventListenerObject): void;
    /**
     * Unbind all event listeners that were bounded, optionally provide a group name to unbind all listeners assigned to that specific group only.
     */
    unbindAll(groupName?: string | string[]): void;
}
//# sourceMappingURL=bindingEvent.service.d.ts.map