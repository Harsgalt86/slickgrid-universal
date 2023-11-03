"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPubSubService = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const types_1 = require("./types");
class EventPubSubService {
    get elementSource() {
        return this._elementSource;
    }
    set elementSource(element) {
        this._elementSource = element;
    }
    get subscribedEvents() {
        return this._subscribedEvents;
    }
    get subscribedEventNames() {
        return this._subscribedEvents.map((pubSubEvent) => pubSubEvent.name);
    }
    constructor(elementSource) {
        this._subscribedEvents = [];
        this.eventNamingStyle = types_1.EventNamingStyle.camelCase;
        // use the provided element
        // or create a "phantom DOM node" (a div element that is never rendered) to set up a custom event dispatching
        this._elementSource = elementSource || document.createElement('div');
    }
    dispose() {
        var _a;
        this.unsubscribeAll();
        this._subscribedEvents = [];
        clearTimeout(this._timer);
        (_a = this._elementSource) === null || _a === void 0 ? void 0 : _a.remove();
        this._elementSource = null;
    }
    /**
     * Dispatch of Custom Event, which by default will bubble up & is cancelable
     * @param {String} eventName - event name to dispatch
     * @param {*} data - optional data to include in the dispatching
     * @param {Boolean} isBubbling - is the event bubbling up?
     * @param {Boolean} isCancelable - is the event cancellable?
     * @returns {Boolean} returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
     */
    dispatchCustomEvent(eventName, data, isBubbling = true, isCancelable = true) {
        var _a;
        const eventInit = { bubbles: isBubbling, cancelable: isCancelable };
        if (data) {
            eventInit.detail = data;
        }
        return (_a = this._elementSource) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new CustomEvent(eventName, eventInit));
    }
    /**
     * Get the event name by the convention defined, it could be: all lower case, camelCase, PascalCase or kebab-case
     * @param {String} inputEventName - name of the event
     * @param {String} eventNamePrefix - prefix to use in the event name
     * @returns {String} - output event name
     */
    getEventNameByNamingConvention(inputEventName, eventNamePrefix) {
        let outputEventName = '';
        switch (this.eventNamingStyle) {
            case types_1.EventNamingStyle.camelCase:
                outputEventName = (eventNamePrefix !== '') ? `${eventNamePrefix}${(0, utils_1.titleCase)(inputEventName)}` : inputEventName;
                break;
            case types_1.EventNamingStyle.kebabCase:
                outputEventName = (eventNamePrefix !== '') ? `${eventNamePrefix}-${(0, utils_1.toKebabCase)(inputEventName)}` : (0, utils_1.toKebabCase)(inputEventName);
                break;
            case types_1.EventNamingStyle.lowerCase:
                outputEventName = `${eventNamePrefix}${inputEventName}`.toLowerCase();
                break;
            case types_1.EventNamingStyle.lowerCaseWithoutOnPrefix:
                outputEventName = `${eventNamePrefix}${inputEventName.replace(/^on/, '')}`.toLowerCase();
                break;
        }
        return outputEventName;
    }
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
    publish(eventName, data, delay) {
        const eventNameByConvention = this.getEventNameByNamingConvention(eventName, '');
        if (delay) {
            return new Promise(resolve => {
                this._timer = setTimeout(() => resolve(this.dispatchCustomEvent(eventNameByConvention, data, true, true)), delay);
            });
        }
        else {
            return this.dispatchCustomEvent(eventNameByConvention, data, true, true);
        }
    }
    /**
     * Subscribes to a message channel or message type.
     * @param event The event channel or event data type.
     * @param callback The callback to be invoked when the specified message is published.
     * @return possibly a Subscription
     */
    subscribe(eventName, callback) {
        const eventNameByConvention = this.getEventNameByNamingConvention(eventName, '');
        // the event listener will return the data in the "event.detail", so we need to return its content to the final callback
        // basically we substitute the "data" with "event.detail" so that the user ends up with only the "data" result
        this._elementSource.addEventListener(eventNameByConvention, (event) => callback.call(null, event.detail));
        this._subscribedEvents.push({ name: eventNameByConvention, listener: callback });
        // return a subscription that we can unsubscribe
        return {
            unsubscribe: () => this.unsubscribe(eventNameByConvention, callback)
        };
    }
    /**
     * Subscribes to a custom event message channel or message type.
     * This is similar to the "subscribe" except that the callback receives an event typed as CustomEventInit and the data will be inside its "event.detail"
     * @param event The event channel or event data type.
     * @param callback The callback to be invoked when the specified message is published.
     * @return possibly a Subscription
     */
    subscribeEvent(eventName, listener) {
        const eventNameByConvention = this.getEventNameByNamingConvention(eventName, '');
        this._elementSource.addEventListener(eventNameByConvention, listener);
        this._subscribedEvents.push({ name: eventNameByConvention, listener });
        // return a subscription that we can unsubscribe
        return {
            unsubscribe: () => this.unsubscribe(eventNameByConvention, listener)
        };
    }
    /**
     * Unsubscribes a message name
     * @param {String} event - the event name
     * @param {*} listener - event listener callback
     * @param {Boolean} shouldRemoveFromEventList - should we also remove the event from the subscriptions array?
     * @return possibly a Subscription
     */
    unsubscribe(eventName, listener, shouldRemoveFromEventList = true) {
        const eventNameByConvention = this.getEventNameByNamingConvention(eventName, '');
        this._elementSource.removeEventListener(eventNameByConvention, listener);
        if (shouldRemoveFromEventList) {
            this.removeSubscribedEventWhenFound(eventName, listener);
        }
    }
    /** Unsubscribes all subscriptions/events that currently exists */
    unsubscribeAll(subscriptions) {
        if (Array.isArray(subscriptions)) {
            let subscription;
            do {
                subscription = subscriptions.pop();
                if (subscription === null || subscription === void 0 ? void 0 : subscription.dispose) {
                    subscription.dispose();
                }
                else if (subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe) {
                    subscription.unsubscribe();
                }
            } while (subscription);
        }
        else {
            let pubSubEvent = this._subscribedEvents.pop();
            while (pubSubEvent) {
                this.unsubscribe(pubSubEvent.name, pubSubEvent.listener, false);
                pubSubEvent = this._subscribedEvents.pop();
            }
        }
    }
    // --
    // protected functions
    // --------------------
    removeSubscribedEventWhenFound(eventName, listener) {
        const eventIdx = this._subscribedEvents.findIndex(evt => evt.name === eventName && evt.listener === listener);
        if (eventIdx >= 0) {
            this._subscribedEvents.splice(eventIdx, 1);
        }
    }
}
exports.EventPubSubService = EventPubSubService;
//# sourceMappingURL=eventPubSub.service.js.map