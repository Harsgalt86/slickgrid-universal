import type { ElementEventListener } from '../interfaces/elementEventListener.interface';
export declare class BindingEventService {
    protected _boundedEvents: ElementEventListener[];
    get boundedEvents(): ElementEventListener[];
    dispose(): void;
    /** Bind an event listener to any element */
    bind(elementOrElements: Element | NodeListOf<Element> | Window, eventNameOrNames: string | string[], listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    /** Unbind all will remove every every event handlers that were bounded earlier */
    unbind(elementOrElements: Element | NodeListOf<Element>, eventNameOrNames: string | string[], listener: EventListenerOrEventListenerObject): void;
    /** Unbind all will remove every every event handlers that were bounded earlier */
    unbindAll(): void;
}
//# sourceMappingURL=bindingEvent.service.d.ts.map