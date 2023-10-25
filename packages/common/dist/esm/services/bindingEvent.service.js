export class BindingEventService {
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
    bind(elementOrElements, eventNameOrNames, listener, options) {
        const eventNames = (Array.isArray(eventNameOrNames)) ? eventNameOrNames : [eventNameOrNames];
        if (elementOrElements === null || elementOrElements === void 0 ? void 0 : elementOrElements.forEach) {
            elementOrElements === null || elementOrElements === void 0 ? void 0 : elementOrElements.forEach(element => {
                for (const eventName of eventNames) {
                    element.addEventListener(eventName, listener, options);
                    this._boundedEvents.push({ element, eventName, listener });
                }
            });
        }
        else {
            for (const eventName of eventNames) {
                elementOrElements.addEventListener(eventName, listener, options);
                this._boundedEvents.push({ element: elementOrElements, eventName, listener });
            }
        }
    }
    /** Unbind all will remove every every event handlers that were bounded earlier */
    unbind(elementOrElements, eventNameOrNames, listener) {
        const elements = (Array.isArray(elementOrElements)) ? elementOrElements : [elementOrElements];
        const eventNames = Array.isArray(eventNameOrNames) ? eventNameOrNames : [eventNameOrNames];
        for (const eventName of eventNames) {
            for (const element of elements) {
                if (element === null || element === void 0 ? void 0 : element.removeEventListener) {
                    element.removeEventListener(eventName, listener);
                }
            }
        }
    }
    /** Unbind all will remove every every event handlers that were bounded earlier */
    unbindAll() {
        while (this._boundedEvents.length > 0) {
            const boundedEvent = this._boundedEvents.pop();
            const { element, eventName, listener } = boundedEvent;
            this.unbind(element, eventName, listener);
        }
    }
}
//# sourceMappingURL=bindingEvent.service.js.map