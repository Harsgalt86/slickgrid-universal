import type { BasePubSubService } from './basePubSub.service';
import { EventNamingStyle, type EventSubscription, type Subscription } from './types';
export interface PubSubEvent<T = any> {
    name: string;
    listener: (event: T | CustomEventInit<T>) => void;
}
export declare class EventPubSubService implements BasePubSubService {
    protected _elementSource: Element;
    protected _subscribedEvents: PubSubEvent[];
    protected _timer: any;
    eventNamingStyle: EventNamingStyle;
    get elementSource(): Element;
    set elementSource(element: Element);
    get subscribedEvents(): PubSubEvent[];
    get subscribedEventNames(): string[];
    constructor(elementSource?: Element);
    dispose(): void;
    /**
     * Dispatch of Custom Event, which by default will bubble up & is cancelable
     * @param {String} eventName - event name to dispatch
     * @param {*} data - optional data to include in the dispatching
     * @param {Boolean} isBubbling - is the event bubbling up?
     * @param {Boolean} isCancelable - is the event cancellable?
     * @returns {Boolean} returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
     */
    dispatchCustomEvent<T = any>(eventName: string, data?: T, isBubbling?: boolean, isCancelable?: boolean): boolean;
    /**
     * Get the event name by the convention defined, it could be: all lower case, camelCase, PascalCase or kebab-case
     * @param {String} inputEventName - name of the event
     * @param {String} eventNamePrefix - prefix to use in the event name
     * @returns {String} - output event name
     */
    getEventNameByNamingConvention(inputEventName: string, eventNamePrefix: string): string;
    /**
     * Method to publish a message via a dispatchEvent.
     * Return is a Boolean (from the event dispatch) unless a delay is provided if so we'll return the dispatched event in a Promise with a delayed cycle
     * The delay is rarely use and is only used when we want to make sure that certain events have the time to execute
     * and we do this because most framework require a cycle before the binding is processed and binding a spinner end up showing too late
     * for example this is used for the following events: onBeforeFilterClear, onBeforeFilterChange, onBeforeToggleTreeCollapse, onBeforeSortChange
     * @param {String} event - The event or channel to publish to.
     * @param {*} data - The data to publish on the channel.
     * @param {Number} delay - optional argument to delay the publish event
     * @returns {Boolean | Promise} - return type will be a Boolean unless a `delay` is provided then a `Promise<Boolean>` will be returned
     */
    publish<T = any>(eventName: string, data?: T, delay?: number): boolean | Promise<boolean>;
    /**
     * Subscribes to a message channel or message type.
     * @param event The event channel or event data type.
     * @param callback The callback to be invoked when the specified message is published.
     * @return possibly a Subscription
     */
    subscribe<T = any>(eventName: string, callback: (data: T) => void): Subscription;
    /**
     * Subscribes to a custom event message channel or message type.
     * This is similar to the "subscribe" except that the callback receives an event typed as CustomEventInit and the data will be inside its "event.detail"
     * @param event The event channel or event data type.
     * @param callback The callback to be invoked when the specified message is published.
     * @return possibly a Subscription
     */
    subscribeEvent<T = any>(eventName: string, listener: (event: CustomEventInit<T>) => void): Subscription;
    /**
     * Unsubscribes a message name
     * @param {String} event - the event name
     * @param {*} listener - event listener callback
     * @param {Boolean} shouldRemoveFromEventList - should we also remove the event from the subscriptions array?
     * @return possibly a Subscription
     */
    unsubscribe<T = any>(eventName: string, listener: (event: T | CustomEventInit<T>) => void, shouldRemoveFromEventList?: boolean): void;
    /** Unsubscribes all subscriptions/events that currently exists */
    unsubscribeAll(subscriptions?: EventSubscription[]): void;
    protected removeSubscribedEventWhenFound<T>(eventName: string, listener: (event: T | CustomEventInit<T>) => void): void;
}
//# sourceMappingURL=eventPubSub.service.d.ts.map