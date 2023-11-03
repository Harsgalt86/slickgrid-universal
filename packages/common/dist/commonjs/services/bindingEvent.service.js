"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindingEventService = void 0;
class BindingEventService {
    constructor() {
        this._boundedEvents = [];
    }
    get boundedEvents() {
        return this._boundedEvents;
    }
    dispose() {
        this.unbindAll();
        this._boundedEvents = [];
    }
    /** Bind an event listener to any element */
    bind(elementOrElements, eventNameOrNames, listener, listenerOptions, groupName = '') {
        // convert to array for looping in next task
        const eventNames = (Array.isArray(eventNameOrNames)) ? eventNameOrNames : [eventNameOrNames];
        if (elementOrElements === null || elementOrElements === void 0 ? void 0 : elementOrElements.forEach) {
            // multiple elements to bind to
            elementOrElements.forEach(element => {
                for (const eventName of eventNames) {
                    element.addEventListener(eventName, listener, listenerOptions);
                    this._boundedEvents.push({ element, eventName, listener, groupName });
                }
            });
        }
        else {
            // single elements to bind to
            for (const eventName of eventNames) {
                elementOrElements.addEventListener(eventName, listener, listenerOptions);
                this._boundedEvents.push({ element: elementOrElements, eventName, listener, groupName });
            }
        }
    }
    /** Unbind a specific listener that was bounded earlier */
    unbind(elementOrElements, eventNameOrNames, listener) {
        // convert to array for looping in next task
        const elements = (Array.isArray(elementOrElements)) ? elementOrElements : [elementOrElements];
        const eventNames = Array.isArray(eventNameOrNames) ? eventNameOrNames : [eventNameOrNames];
        for (const eventName of eventNames) {
            for (const element of elements) {
                if (typeof (element === null || element === void 0 ? void 0 : element.removeEventListener) === 'function') {
                    element.removeEventListener(eventName, listener);
                }
            }
        }
    }
    /**
     * Unbind all event listeners that were bounded, optionally provide a group name to unbind all listeners assigned to that specific group only.
     */
    unbindAll(groupName) {
        if (groupName) {
            const groupNames = Array.isArray(groupName) ? groupName : [groupName];
            // unbind only the bounded event with a specific group
            // Note: we need to loop in reverse order to avoid array reindexing (causing index offset) after a splice is called
            for (let i = this._boundedEvents.length - 1; i >= 0; --i) {
                const boundedEvent = this._boundedEvents[i];
                if (groupNames.some(g => g === boundedEvent.groupName)) {
                    const { element, eventName, listener } = boundedEvent;
                    this.unbind(element, eventName, listener);
                    this._boundedEvents.splice(i, 1);
                }
            }
        }
        else {
            // unbind everything
            while (this._boundedEvents.length > 0) {
                const boundedEvent = this._boundedEvents.pop();
                const { element, eventName, listener } = boundedEvent;
                this.unbind(element, eventName, listener);
            }
        }
    }
}
exports.BindingEventService = BindingEventService;
//# sourceMappingURL=bindingEvent.service.js.map