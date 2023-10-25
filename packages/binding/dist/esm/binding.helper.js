import { BindingService } from './binding.service';
export class BindingHelper {
    constructor() {
        this._observers = [];
        this._querySelectorPrefix = '';
    }
    get querySelectorPrefix() {
        return this._querySelectorPrefix || '';
    }
    set querySelectorPrefix(prefix) {
        this._querySelectorPrefix = prefix;
    }
    get observers() {
        return this._observers;
    }
    dispose() {
        let observer = this._observers.pop();
        while (observer) {
            observer.dispose();
            observer = this._observers.pop();
        }
        this._observers = [];
    }
    addElementBinding(variable, property, selector, attribute, events, callback) {
        const elements = document.querySelectorAll(`${this.querySelectorPrefix}${selector}`);
        // before creating a new observer, first check if the variable already has an associated observer
        // if we can't find an observer then we'll create a new one for it
        let observer = this._observers.find(bind => bind.property === variable);
        if (!observer) {
            observer = new BindingService({ variable, property });
        }
        // add event(s) binding
        // when having multiple events, we'll loop through through them and add a binding for each
        if (Array.isArray(events)) {
            events.forEach(eventName => observer === null || observer === void 0 ? void 0 : observer.bind(elements, attribute, eventName, callback));
        }
        else {
            observer === null || observer === void 0 ? void 0 : observer.bind(elements, attribute, events, callback);
        }
        this._observers.push(observer);
    }
    /** From a DOM element selector, which could be zero or multiple elements, add an event listener   */
    bindEventHandler(selector, eventName, callback, options) {
        const elements = document.querySelectorAll(`${this.querySelectorPrefix}${selector}`);
        elements.forEach(elm => {
            if (elm === null || elm === void 0 ? void 0 : elm.addEventListener) {
                elm.addEventListener(eventName, callback, options);
            }
        });
    }
    /**
     * From a DOM element selector, which could be zero or multiple elements, set the value on a given attribute name
     * For example ('div.hello', 'textContent', 'world') => would set the textContent equal to 'world' on a div element having the class 'hello'
     */
    setElementAttributeValue(selector, attribute, value) {
        const elements = document.querySelectorAll(`${this.querySelectorPrefix}${selector}`);
        elements.forEach(elm => {
            elm.textContent = '';
            if (elm && attribute in elm) {
                elm[attribute] = value;
            }
        });
    }
}
//# sourceMappingURL=binding.helper.js.map