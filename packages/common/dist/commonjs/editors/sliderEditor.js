"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SliderEditor = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const constants_1 = require("../constants");
const editorUtilities_1 = require("./editorUtilities");
const utilities_1 = require("../services/utilities");
const sliderValidator_1 = require("../editorValidators/sliderValidator");
const bindingEvent_service_1 = require("../services/bindingEvent.service");
const domUtilities_1 = require("../services/domUtilities");
/*
 * An example of a 'detached' editor.
 * KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
 */
class SliderEditor {
    constructor(args) {
        this.args = args;
        this._defaultValue = 0;
        this._isValueTouched = false;
        this._sliderNumberElm = null;
        /** is the Editor disabled? */
        this.disabled = false;
        if (!args) {
            throw new Error('[Slickgrid-Universal] Something is wrong with this grid, an Editor must always have valid arguments.');
        }
        this.grid = args.grid;
        this.gridOptions = (this.grid.getOptions() || {});
        this._bindEventService = new bindingEvent_service_1.BindingEventService();
        this.init();
    }
    /** Get Column Definition object */
    get columnDef() {
        return this.args.column;
    }
    /** Get Column Editor object */
    get columnEditor() {
        return this.columnDef && this.columnDef.internalColumnEditor || {};
    }
    /** Getter for the item data context object */
    get dataContext() {
        return this.args.item;
    }
    /** Getter for the Editor DOM Element */
    get editorDomElement() {
        return this._editorElm;
    }
    /** Getter for the Editor Input DOM Element */
    get editorInputDomElement() {
        return this._inputElm;
    }
    get hasAutoCommitEdit() {
        var _a;
        return (_a = this.gridOptions.autoCommitEdit) !== null && _a !== void 0 ? _a : false;
    }
    /** Getter for the current Slider Options */
    get sliderOptions() {
        return this._sliderOptions;
    }
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator() {
        var _a, _b, _c;
        return (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.validator) !== null && _b !== void 0 ? _b : (_c = this.columnDef) === null || _c === void 0 ? void 0 : _c.validator;
    }
    init() {
        var _a;
        this._cellContainerElm = (_a = this.args) === null || _a === void 0 ? void 0 : _a.container;
        if (this._cellContainerElm && this.columnDef) {
            // define the input & slider number IDs
            const compositeEditorOptions = this.args.compositeEditorOptions;
            // create HTML string template
            this._editorElm = this.buildDomElement();
            if (!compositeEditorOptions) {
                this.focus();
            }
            // watch on change event
            this._cellContainerElm.appendChild(this._editorElm);
            this._bindEventService.bind(this._sliderTrackElm, ['click', 'mouseup'], this.sliderTrackClicked.bind(this));
            this._bindEventService.bind(this._inputElm, ['change', 'mouseup', 'touchend'], this.handleChangeEvent.bind(this));
            // if user chose to display the slider number on the right side, then update it every time it changes
            // we need to use both "input" and "change" event to be all cross-browser
            this._bindEventService.bind(this._inputElm, ['input', 'change'], this.handleChangeSliderNumber.bind(this));
        }
    }
    cancel() {
        if (this._inputElm) {
            this._inputElm.value = `${this._originalValue}`;
        }
        this.args.cancelChanges();
    }
    destroy() {
        var _a, _b, _c;
        this._bindEventService.unbindAll();
        (_a = this._inputElm) === null || _a === void 0 ? void 0 : _a.remove();
        (_b = this._editorElm) === null || _b === void 0 ? void 0 : _b.remove();
        (_c = this._sliderTrackElm) === null || _c === void 0 ? void 0 : _c.remove();
    }
    disable(isDisabled = true) {
        var _a;
        const prevIsDisabled = this.disabled;
        this.disabled = isDisabled;
        if (this._inputElm) {
            if (isDisabled) {
                this._inputElm.disabled = true;
                // clear value when it's newly disabled and not empty
                const currentValue = this.getValue();
                if (prevIsDisabled !== isDisabled && ((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions) && currentValue !== '') {
                    this.reset(0, true, true);
                }
            }
            else {
                this._inputElm.disabled = false;
            }
        }
    }
    focus() {
        // always set focus on grid first so that plugin to copy range (SlickCellExternalCopyManager) would still be able to paste at that position
        this.grid.focus();
        if (this._inputElm) {
            this._inputElm.focus();
        }
    }
    show() {
        var _a;
        const isCompositeEditor = !!((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions);
        if (isCompositeEditor) {
            // when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor
            this.applyInputUsabilityState();
        }
    }
    getValue() {
        var _a, _b;
        return (_b = (_a = this._inputElm) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
    }
    setValue(value, isApplyingValue = false, triggerOnCompositeEditorChange = true) {
        if (this._inputElm) {
            this._inputElm.value = `${value}`;
        }
        if (this._sliderNumberElm) {
            this._sliderNumberElm.textContent = `${value}`;
        }
        if (isApplyingValue) {
            this.applyValue(this.args.item, this.serializeValue());
            // if it's set by a Composite Editor, then also trigger a change for it
            const compositeEditorOptions = this.args.compositeEditorOptions;
            if (compositeEditorOptions && triggerOnCompositeEditorChange) {
                this.handleChangeOnCompositeEditor(null, compositeEditorOptions, 'system');
            }
        }
    }
    applyValue(item, state) {
        var _a, _b, _c, _d, _e;
        const fieldName = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.field) !== null && _b !== void 0 ? _b : '';
        if (fieldName !== undefined) {
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0; // is the field a complex object, "address.streetNumber"
            const validation = this.validate(undefined, state);
            const newValue = (validation && validation.valid) ? state : '';
            // set the new value to the item datacontext
            if (isComplexObject) {
                // when it's a complex object, user could override the object path (where the editable object is located)
                // else we use the path provided in the Field Column Definition
                const objectPath = (_e = (_d = (_c = this.columnEditor) === null || _c === void 0 ? void 0 : _c.complexObjectPath) !== null && _d !== void 0 ? _d : fieldName) !== null && _e !== void 0 ? _e : '';
                (0, utils_1.setDeepValue)(item, objectPath, newValue);
            }
            else if (item) {
                item[fieldName] = newValue;
            }
        }
    }
    isValueChanged() {
        var _a, _b;
        const elmValue = (_b = (_a = this._inputElm) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
        return (!(elmValue === '' && this._originalValue === undefined)) && (+elmValue !== this._originalValue);
    }
    isValueTouched() {
        return this._isValueTouched;
    }
    loadValue(item) {
        var _a, _b;
        const fieldName = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.field) !== null && _b !== void 0 ? _b : '';
        if (item && fieldName !== undefined) {
            // is the field a complex object, "address.streetNumber"
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
            let value = (isComplexObject) ? (0, utilities_1.getDescendantProperty)(item, fieldName) : (item.hasOwnProperty(fieldName) ? item[fieldName] : this._defaultValue);
            if (value === '' || value === null || value === undefined) {
                value = this._defaultValue; // load default value when item doesn't have any value
            }
            this._originalValue = +value;
            if (this._inputElm) {
                this._inputElm.value = `${value}`;
                this._inputElm.title = `${value}`;
            }
            if (this._sliderNumberElm) {
                this._sliderNumberElm.textContent = `${value}`;
            }
        }
        this.updateTrackFilledColorWhenEnabled();
    }
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value, triggerCompositeEventWhenExist = true, clearByDisableCommand = false) {
        var _a;
        const inputValue = (_a = value !== null && value !== void 0 ? value : this._originalValue) !== null && _a !== void 0 ? _a : 0;
        if (this._inputElm) {
            this._inputElm.value = `${inputValue}`;
        }
        if (this._sliderNumberElm) {
            this._sliderNumberElm.textContent = `${inputValue}`;
        }
        this._isValueTouched = false;
        const compositeEditorOptions = this.args.compositeEditorOptions;
        if (compositeEditorOptions && triggerCompositeEventWhenExist) {
            const shouldDeleteFormValue = !clearByDisableCommand;
            this.handleChangeOnCompositeEditor(null, compositeEditorOptions, 'user', shouldDeleteFormValue);
        }
    }
    save() {
        const validation = this.validate();
        const isValid = (validation && validation.valid) || false;
        if (this.hasAutoCommitEdit && isValid) {
            // do not use args.commitChanges() as this sets the focus to the next row.
            // also the select list will stay shown when clicking off the grid
            this.grid.getEditorLock().commitCurrentEdit();
        }
        else {
            this.args.commitChanges();
        }
    }
    serializeValue() {
        var _a, _b;
        const elmValue = (_b = (_a = this._inputElm) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
        return elmValue !== '' ? parseInt(elmValue, 10) : this._originalValue;
    }
    validate(_targetElm, inputValue) {
        var _a, _b;
        // when using Composite Editor, we also want to recheck if the field if disabled/enabled since it might change depending on other inputs on the composite form
        if (this.args.compositeEditorOptions) {
            this.applyInputUsabilityState();
        }
        // when field is disabled, we can assume it's valid
        if (this.disabled) {
            return { valid: true, msg: '' };
        }
        const elmValue = (inputValue !== undefined) ? inputValue : (_a = this._inputElm) === null || _a === void 0 ? void 0 : _a.value;
        return (0, sliderValidator_1.sliderValidator)(elmValue, {
            editorArgs: this.args,
            errorMessage: this.columnEditor.errorMessage,
            minValue: this.columnEditor.minValue,
            maxValue: this.columnEditor.maxValue,
            required: ((_b = this.args) === null || _b === void 0 ? void 0 : _b.compositeEditorOptions) ? false : this.columnEditor.required,
            validator: this.validator,
        });
    }
    //
    // protected functions
    // ------------------
    /**
     * Create the HTML template as a string
     */
    buildDomElement() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        const title = (_d = (_c = this.columnEditor) === null || _c === void 0 ? void 0 : _c.title) !== null && _d !== void 0 ? _d : '';
        const minValue = +((_f = (_e = this.columnEditor) === null || _e === void 0 ? void 0 : _e.minValue) !== null && _f !== void 0 ? _f : constants_1.Constants.SLIDER_DEFAULT_MIN_VALUE);
        const maxValue = +((_h = (_g = this.columnEditor) === null || _g === void 0 ? void 0 : _g.maxValue) !== null && _h !== void 0 ? _h : constants_1.Constants.SLIDER_DEFAULT_MAX_VALUE);
        const step = +((_k = (_j = this.columnEditor) === null || _j === void 0 ? void 0 : _j.valueStep) !== null && _k !== void 0 ? _k : constants_1.Constants.SLIDER_DEFAULT_STEP);
        const defaultValue = (_l = (0, editorUtilities_1.getEditorOptionByName)(this.columnEditor, 'sliderStartValue')) !== null && _l !== void 0 ? _l : minValue;
        this._defaultValue = +defaultValue;
        this._sliderTrackElm = (0, domUtilities_1.createDomElement)('div', { className: 'slider-track' });
        this._inputElm = (0, domUtilities_1.createDomElement)('input', {
            type: 'range', title,
            defaultValue: `${defaultValue}`, value: `${defaultValue}`, min: `${minValue}`, max: `${maxValue}`,
            step: `${(_o = (_m = this.columnEditor) === null || _m === void 0 ? void 0 : _m.valueStep) !== null && _o !== void 0 ? _o : constants_1.Constants.SLIDER_DEFAULT_STEP}`,
            ariaLabel: (_q = (_p = this.columnEditor) === null || _p === void 0 ? void 0 : _p.ariaLabel) !== null && _q !== void 0 ? _q : `${(0, utils_1.toSentenceCase)(columnId + '')} Slider Editor`,
            className: `slider-editor-input editor-${columnId}`,
        });
        const divContainerElm = (0, domUtilities_1.createDomElement)('div', { className: 'slider-container slider-editor' });
        const sliderInputContainerElm = (0, domUtilities_1.createDomElement)('div', { className: 'slider-input-container slider-editor' });
        sliderInputContainerElm.appendChild(this._sliderTrackElm);
        sliderInputContainerElm.appendChild(this._inputElm);
        divContainerElm.appendChild(sliderInputContainerElm);
        if (!(0, editorUtilities_1.getEditorOptionByName)(this.columnEditor, 'hideSliderNumber')) {
            divContainerElm.classList.add('input-group');
            const divGroupAddonElm = (0, domUtilities_1.createDomElement)('div', { className: 'input-group-addon input-group-append slider-value' });
            this._sliderNumberElm = (0, domUtilities_1.createDomElement)('span', { className: `input-group-text`, textContent: `${defaultValue}` });
            divGroupAddonElm.appendChild(this._sliderNumberElm);
            divContainerElm.appendChild(divGroupAddonElm);
        }
        // merge options with optional user's custom options
        this._sliderOptions = { minValue, maxValue, step };
        return divContainerElm;
    }
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    applyInputUsabilityState() {
        const activeCell = this.grid.getActiveCell();
        const isCellEditable = this.grid.onBeforeEditCell.notify({
            ...activeCell, item: this.dataContext, column: this.args.column, grid: this.grid, target: 'composite', compositeEditorOptions: this.args.compositeEditorOptions
        }).getReturnValue();
        this.disable(isCellEditable === false);
    }
    handleChangeEvent(event) {
        this._isValueTouched = true;
        const compositeEditorOptions = this.args.compositeEditorOptions;
        if (compositeEditorOptions) {
            this.handleChangeOnCompositeEditor(event, compositeEditorOptions);
        }
        else {
            this.save();
        }
    }
    handleChangeSliderNumber(event) {
        var _a, _b, _c;
        const value = (_b = (_a = event.target) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
        if (value !== '') {
            if (!(0, editorUtilities_1.getEditorOptionByName)(this.columnEditor, 'hideSliderNumber') && this._sliderNumberElm) {
                this._sliderNumberElm.textContent = value;
            }
            this._inputElm.title = value;
            // trigger mouse enter event on the editor for optionally hooked SlickCustomTooltip
            if (!((_c = this.args) === null || _c === void 0 ? void 0 : _c.compositeEditorOptions)) {
                this.grid.onMouseEnter.notify({ grid: this.grid }, { ...new Slick.EventData(), target: event === null || event === void 0 ? void 0 : event.target });
            }
        }
        this.updateTrackFilledColorWhenEnabled();
    }
    handleChangeOnCompositeEditor(event, compositeEditorOptions, triggeredBy = 'user', isCalledByClearValue = false) {
        var _a, _b, _c, _d, _e;
        const activeCell = this.grid.getActiveCell();
        const column = this.args.column;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        const item = this.dataContext;
        const grid = this.grid;
        const newValue = this.serializeValue();
        // when valid, we'll also apply the new value to the dataContext item object
        if (this.validate().valid) {
            this.applyValue(this.dataContext, newValue);
        }
        this.applyValue(compositeEditorOptions.formValues, newValue);
        const isExcludeDisabledFieldFormValues = (_e = (_d = (_c = this.gridOptions) === null || _c === void 0 ? void 0 : _c.compositeEditorOptions) === null || _d === void 0 ? void 0 : _d.excludeDisabledFieldFormValues) !== null && _e !== void 0 ? _e : false;
        if (isCalledByClearValue || (this.disabled && isExcludeDisabledFieldFormValues && compositeEditorOptions.formValues.hasOwnProperty(columnId))) {
            delete compositeEditorOptions.formValues[columnId]; // when the input is disabled we won't include it in the form result object
        }
        grid.onCompositeEditorChange.notify({ ...activeCell, item, grid, column, formValues: compositeEditorOptions.formValues, editors: compositeEditorOptions.editors, triggeredBy }, { ...new Slick.EventData(), ...event });
    }
    sliderTrackClicked(e) {
        e.preventDefault();
        const sliderTrackX = e.offsetX;
        const sliderTrackWidth = this._sliderTrackElm.offsetWidth;
        const trackPercentPosition = (sliderTrackX + 0) * 100 / sliderTrackWidth;
        if (this._inputElm) {
            // automatically move to calculated clicked percentage
            // dispatch a change event to update its value & number when shown
            this._inputElm.value = `${trackPercentPosition}`;
            this._inputElm.dispatchEvent(new Event('change'));
        }
    }
    updateTrackFilledColorWhenEnabled() {
        var _a, _b, _c;
        if ((0, editorUtilities_1.getEditorOptionByName)(this.columnEditor, 'enableSliderTrackColoring') && this._inputElm) {
            const percent1 = 0;
            const percent2 = ((+this.getValue() - +this._inputElm.min) / ((_b = (_a = this.sliderOptions) === null || _a === void 0 ? void 0 : _a.maxValue) !== null && _b !== void 0 ? _b : 0 - +this._inputElm.min)) * 100;
            const bg = 'linear-gradient(to right, %b %p1, %c %p1, %c %p2, %b %p2)'
                .replace(/%b/g, '#eee')
                .replace(/%c/g, ((_c = (0, editorUtilities_1.getEditorOptionByName)(this.columnEditor, 'sliderTrackFilledColor')) !== null && _c !== void 0 ? _c : 'var(--slick-slider-filter-thumb-color, #86bff8)'))
                .replace(/%p1/g, `${percent1}%`)
                .replace(/%p2/g, `${percent2}%`);
            this._sliderTrackElm.style.background = bg;
            this._sliderOptions.sliderTrackBackground = bg;
        }
    }
}
exports.SliderEditor = SliderEditor;
//# sourceMappingURL=sliderEditor.js.map