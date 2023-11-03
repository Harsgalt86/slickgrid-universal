"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DualInputEditor = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const keyCode_enum_1 = require("../enums/keyCode.enum");
const utilities_1 = require("../services/utilities");
const editorValidators_1 = require("../editorValidators");
const bindingEvent_service_1 = require("../services/bindingEvent.service");
const domUtilities_1 = require("../services/domUtilities");
/*
 * An example of a 'detached' editor.
 * KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
 */
class DualInputEditor {
    constructor(args) {
        this.args = args;
        this._isValueSaveCalled = false;
        this._isLeftValueTouched = false;
        this._isRightValueTouched = false;
        /** is the Editor disabled? */
        this.disabled = false;
        if (!args) {
            throw new Error('[Slickgrid-Universal] Something is wrong with this grid, an Editor must always have valid arguments.');
        }
        this.grid = args.grid;
        this.gridOptions = (this.grid.getOptions() || {});
        this._eventHandler = new Slick.EventHandler();
        this._bindEventService = new bindingEvent_service_1.BindingEventService();
        this.init();
        this._eventHandler.subscribe(this.grid.onValidationError, () => this._isValueSaveCalled = true);
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
        return { leftInput: this._leftInput, rightInput: this._rightInput };
    }
    get editorParams() {
        return this.columnEditor.params || {};
    }
    get eventHandler() {
        return this._eventHandler;
    }
    get hasAutoCommitEdit() {
        var _a;
        return (_a = this.gridOptions.autoCommitEdit) !== null && _a !== void 0 ? _a : false;
    }
    get isValueSaveCalled() {
        return this._isValueSaveCalled;
    }
    /** Get the Shared Validator function, can be passed in Editor property or Column Definition */
    get validator() {
        var _a, _b, _c;
        return (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.validator) !== null && _b !== void 0 ? _b : (_c = this.columnDef) === null || _c === void 0 ? void 0 : _c.validator;
    }
    init() {
        var _a, _b, _c, _d;
        if (!this.editorParams || !this.editorParams.leftInput || !this.editorParams.leftInput.field || !this.editorParams.rightInput || !this.editorParams.rightInput.field) {
            throw new Error(`[Slickgrid-Universal] Please make sure that your Combo Input Editor has params defined with "leftInput" and "rightInput" (example: { editor: { model: Editors.comboInput, params: { leftInput: { field: 'firstName' }, { rightSide: { field: 'lastName' } }}}`);
        }
        this._leftFieldName = (_a = this.editorParams.leftInput) === null || _a === void 0 ? void 0 : _a.field;
        this._rightFieldName = (_b = this.editorParams.rightInput) === null || _b === void 0 ? void 0 : _b.field;
        this._leftInput = this.createInput('leftInput');
        this._rightInput = this.createInput('rightInput');
        const containerElm = (_c = this.args) === null || _c === void 0 ? void 0 : _c.container;
        if (containerElm && typeof containerElm.appendChild === 'function') {
            containerElm.appendChild(this._leftInput);
            containerElm.appendChild(this._rightInput);
        }
        this._bindEventService.bind(this._leftInput, 'keydown', ((event) => this.handleKeyDown(event, 'leftInput')));
        this._bindEventService.bind(this._rightInput, 'keydown', ((event) => this.handleKeyDown(event, 'rightInput')));
        // the lib does not get the focus out event for some reason, so register it here
        if (this.hasAutoCommitEdit) {
            this._bindEventService.bind(this._leftInput, 'focusout', ((event) => this.handleFocusOut(event, 'leftInput')));
            this._bindEventService.bind(this._rightInput, 'focusout', ((event) => this.handleFocusOut(event, 'rightInput')));
        }
        const compositeEditorOptions = (_d = this.args) === null || _d === void 0 ? void 0 : _d.compositeEditorOptions;
        if (compositeEditorOptions) {
            this._bindEventService.bind(this._leftInput, 'input', this.handleChangeOnCompositeEditorDebounce.bind(this));
            this._bindEventService.bind(this._rightInput, 'input', this.handleChangeOnCompositeEditorDebounce.bind(this));
        }
        else {
            setTimeout(() => this._leftInput.select(), 50);
        }
    }
    handleFocusOut(event, position) {
        var _a;
        // when clicking outside the editable cell OR when focusing out of it
        const targetClassNames = ((_a = event.relatedTarget) === null || _a === void 0 ? void 0 : _a.className) || '';
        const compositeEditorOptions = this.args.compositeEditorOptions;
        if (!compositeEditorOptions && (targetClassNames.indexOf('dual-editor') === -1 && this._lastEventType !== 'focusout-right')) {
            if (position === 'rightInput' || (position === 'leftInput' && this._lastEventType !== 'focusout-left')) {
                if (position === 'leftInput') {
                    this._isLeftValueTouched = true;
                }
                else {
                    this._isRightValueTouched = true;
                }
                this.save();
            }
        }
        const side = (position === 'leftInput') ? 'left' : 'right';
        this._lastEventType = `${event === null || event === void 0 ? void 0 : event.type}-${side}`;
    }
    handleKeyDown(event, position) {
        if (position === 'leftInput') {
            this._isLeftValueTouched = true;
        }
        else {
            this._isRightValueTouched = true;
        }
        this._lastInputKeyEvent = event;
        if (event.keyCode === keyCode_enum_1.KeyCode.LEFT || event.keyCode === keyCode_enum_1.KeyCode.RIGHT || event.keyCode === keyCode_enum_1.KeyCode.TAB) {
            event.stopImmediatePropagation();
        }
    }
    destroy() {
        var _a, _b, _c, _d;
        // unsubscribe all SlickGrid events
        this._eventHandler.unsubscribeAll();
        this._bindEventService.unbindAll();
        (_b = (_a = this._leftInput) === null || _a === void 0 ? void 0 : _a.remove) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this._rightInput) === null || _c === void 0 ? void 0 : _c.remove) === null || _d === void 0 ? void 0 : _d.call(_c);
    }
    createInput(position) {
        var _a, _b, _c, _d, _e, _f, _g;
        const editorSideParams = this.editorParams[position];
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        const idPropName = this.gridOptions.datasetIdPropertyName || 'id';
        const itemId = (_e = (_d = (_c = this.args) === null || _c === void 0 ? void 0 : _c.item) === null || _d === void 0 ? void 0 : _d[idPropName]) !== null && _e !== void 0 ? _e : '';
        let fieldType = editorSideParams.type || 'text';
        if (fieldType === 'float' || fieldType === 'integer') {
            fieldType = 'number';
        }
        const input = (0, domUtilities_1.createDomElement)('input', {
            type: fieldType || 'text',
            id: `item-${itemId}-${position}`,
            ariaLabel: (_g = (_f = this.columnEditor) === null || _f === void 0 ? void 0 : _f.ariaLabel) !== null && _g !== void 0 ? _g : `${(0, utils_1.toSentenceCase)(columnId + '')} Input Editor`,
            className: `dual-editor-text editor-${columnId} ${position.replace(/input/gi, '')}`,
            autocomplete: 'off', ariaAutoComplete: 'none',
            placeholder: editorSideParams.placeholder || '',
            title: editorSideParams.title || '',
        });
        if (fieldType === 'readonly') {
            // when the custom type is defined as readonly, we'll make a readonly text input
            input.readOnly = true;
            fieldType = 'text';
        }
        if (fieldType === 'number') {
            input.step = this.getInputDecimalSteps(position);
        }
        return input;
    }
    disable(isDisabled = true) {
        var _a;
        const prevIsDisabled = this.disabled;
        this.disabled = isDisabled;
        if (this._leftInput && this._rightInput) {
            if (isDisabled) {
                this._leftInput.setAttribute('disabled', 'disabled');
                this._rightInput.setAttribute('disabled', 'disabled');
                // clear the checkbox when it's newly disabled
                if (prevIsDisabled !== isDisabled && ((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions)) {
                    this.reset('', true, true);
                }
            }
            else {
                this._leftInput.removeAttribute('disabled');
                this._rightInput.removeAttribute('disabled');
            }
        }
    }
    focus() {
        // always set focus on grid first, then do nothing since we have 2 inputs and we might focus on left/right depending on which is invalid and/or new
        this.grid.focus();
    }
    show() {
        var _a;
        const isCompositeEditor = !!((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions);
        if (isCompositeEditor) {
            // when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor
            this.applyInputUsabilityState();
        }
    }
    getValues() {
        const obj = {};
        const leftInputValue = this._leftInput.value;
        const rightInputValue = this._rightInput.value;
        const isLeftInputTypeNumber = (this.editorParams.leftInput && (this.editorParams.leftInput.type === 'float' || this.editorParams.leftInput.type === 'integer'));
        const isRightInputTypeNumber = (this.editorParams.rightInput && (this.editorParams.rightInput.type === 'float' || this.editorParams.rightInput.type === 'integer'));
        const resultLeftValue = (leftInputValue !== '' && isLeftInputTypeNumber) ? +this._leftInput.value : (leftInputValue || '');
        const resultRightValue = (rightInputValue !== '' && isRightInputTypeNumber) ? +this._rightInput.value : (rightInputValue || '');
        (0, utils_1.setDeepValue)(obj, this._leftFieldName, resultLeftValue);
        (0, utils_1.setDeepValue)(obj, this._rightFieldName, resultRightValue);
        return obj;
    }
    setValues(values) {
        if (Array.isArray(values) && values.length === 2) {
            this._leftInput.value = `${values[0]}`;
            this._rightInput.value = `${values[1]}`;
        }
    }
    applyValue(item, state) {
        this.applyValueByPosition(item, state, 'leftInput');
        this.applyValueByPosition(item, state, 'rightInput');
    }
    applyValueByPosition(item, state, position) {
        var _a, _b, _c;
        const fieldName = position === 'leftInput' ? this._leftFieldName : this._rightFieldName;
        if (fieldName !== undefined) {
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0; // is the field a complex object, "address.streetNumber"
            let fieldNameToUse = fieldName;
            if (isComplexObject) {
                const complexFieldNames = fieldName.split(/\.(.*)/);
                fieldNameToUse = (complexFieldNames.length > 1 ? complexFieldNames[1] : complexFieldNames);
            }
            // validate the value before applying it (if not valid we'll set an empty string)
            const stateValue = isComplexObject ? (0, utilities_1.getDescendantProperty)(state, fieldNameToUse) : state[fieldName];
            const validation = this.validate(null, { position, inputValue: stateValue });
            // set the new value to the item datacontext
            if (isComplexObject) {
                const newValueFromComplex = (0, utilities_1.getDescendantProperty)(state, fieldNameToUse);
                const newValue = (validation && validation.valid) ? newValueFromComplex : '';
                // when it's a complex object, user could override the object path (where the editable object is located)
                // else we use the path provided in the Field Column Definition
                const objectPath = (_c = (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.complexObjectPath) !== null && _b !== void 0 ? _b : fieldName) !== null && _c !== void 0 ? _c : '';
                (0, utils_1.setDeepValue)(item, objectPath, newValue);
            }
            else if (fieldName) {
                item[fieldName] = (validation && validation.valid) ? state[fieldName] : '';
            }
        }
    }
    isValueChanged() {
        const leftElmValue = this._leftInput.value;
        const rightElmValue = this._rightInput.value;
        const leftEditorParams = this.editorParams && this.editorParams.leftInput;
        const rightEditorParams = this.editorParams && this.editorParams.rightInput;
        const lastKeyEvent = this._lastInputKeyEvent && this._lastInputKeyEvent.keyCode;
        if ((leftEditorParams && leftEditorParams.alwaysSaveOnEnterKey || rightEditorParams && rightEditorParams.alwaysSaveOnEnterKey) && lastKeyEvent === keyCode_enum_1.KeyCode.ENTER) {
            return true;
        }
        const leftResult = (!(leftElmValue === '' && (this._originalLeftValue === null || this._originalLeftValue === undefined))) && (leftElmValue !== this._originalLeftValue);
        const rightResult = (!(rightElmValue === '' && (this._originalRightValue === null || this._originalRightValue === undefined))) && (rightElmValue !== this._originalRightValue);
        return leftResult || rightResult;
    }
    isValueTouched() {
        return this._isLeftValueTouched || this._isRightValueTouched;
    }
    loadValue(item) {
        this.loadValueByPosition(item, 'leftInput');
        this.loadValueByPosition(item, 'rightInput');
        this._leftInput.select();
    }
    loadValueByPosition(item, position) {
        // is the field a complex object, "address.streetNumber"
        const fieldName = (position === 'leftInput') ? this._leftFieldName : this._rightFieldName;
        const originalValuePosition = (position === 'leftInput') ? '_originalLeftValue' : '_originalRightValue';
        const inputVarPosition = (position === 'leftInput') ? '_leftInput' : '_rightInput';
        if (item && fieldName !== undefined) {
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
            const itemValue = (isComplexObject) ? (0, utilities_1.getDescendantProperty)(item, fieldName) : (item.hasOwnProperty(fieldName) ? item[fieldName] : '');
            this[originalValuePosition] = itemValue;
            if (this.editorParams[position].type === 'float') {
                const decimalPlaces = this.getDecimalPlaces(position);
                if (decimalPlaces !== null && (this[originalValuePosition] || this[originalValuePosition] === 0) && typeof this[originalValuePosition] !== undefined) {
                    this[originalValuePosition] = (+this[originalValuePosition]).toFixed(decimalPlaces);
                }
            }
            if (this[inputVarPosition]) {
                this[inputVarPosition].value = `${this[originalValuePosition]}`;
            }
        }
    }
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value, triggerCompositeEventWhenExist = true, clearByDisableCommand = false) {
        var _a, _b;
        const inputLeftValue = (_a = value !== null && value !== void 0 ? value : this._originalLeftValue) !== null && _a !== void 0 ? _a : '';
        const inputRightValue = (_b = value !== null && value !== void 0 ? value : this._originalRightValue) !== null && _b !== void 0 ? _b : '';
        if (this._leftInput && this._rightInput) {
            this._originalLeftValue = inputLeftValue;
            this._originalRightValue = inputRightValue;
            this._leftInput.value = `${inputLeftValue}`;
            this._rightInput.value = `${inputRightValue}`;
        }
        this._isLeftValueTouched = false;
        this._isRightValueTouched = false;
        const compositeEditorOptions = this.args.compositeEditorOptions;
        if (compositeEditorOptions && triggerCompositeEventWhenExist) {
            const shouldDeleteFormValue = !clearByDisableCommand;
            this.handleChangeOnCompositeEditor(null, compositeEditorOptions, 'user', shouldDeleteFormValue);
        }
    }
    save() {
        const validation = this.validate();
        const isValid = (validation && validation.valid) || false;
        if (!this._isValueSaveCalled) {
            if (this.hasAutoCommitEdit && isValid) {
                this.grid.getEditorLock().commitCurrentEdit();
            }
            else {
                this.args.commitChanges();
            }
            this._isValueSaveCalled = true;
        }
    }
    serializeValue() {
        const obj = {};
        const leftValue = this.serializeValueByPosition('leftInput');
        const rightValue = this.serializeValueByPosition('rightInput');
        (0, utils_1.setDeepValue)(obj, this._leftFieldName, leftValue);
        (0, utils_1.setDeepValue)(obj, this._rightFieldName, rightValue);
        return obj;
    }
    serializeValueByPosition(position) {
        const elmValue = position === 'leftInput' ? this._leftInput.value : this._rightInput.value;
        if (elmValue === '' || isNaN(+elmValue)) {
            return elmValue;
        }
        let rtn = parseFloat(elmValue);
        const decPlaces = this.getDecimalPlaces(position);
        if (decPlaces !== null && (rtn || rtn === 0) && rtn.toFixed) {
            rtn = parseFloat(rtn.toFixed(decPlaces));
        }
        return rtn;
    }
    getDecimalPlaces(position) {
        const defaultDecimalPlaces = 0;
        // returns the number of fixed decimal places or null
        const positionSide = position === 'leftInput' ? 'leftInput' : 'rightInput';
        const sideParams = this.editorParams[positionSide];
        const rtn = sideParams === null || sideParams === void 0 ? void 0 : sideParams.decimal;
        if (rtn === undefined) {
            return defaultDecimalPlaces;
        }
        return rtn;
    }
    getInputDecimalSteps(position) {
        const decimals = this.getDecimalPlaces(position);
        let zeroString = '';
        for (let i = 1; i < decimals; i++) {
            zeroString += '0';
        }
        if (decimals > 0) {
            return `0.${zeroString}1`;
        }
        return '1';
    }
    validate(_targetElm, inputValidation) {
        // when using Composite Editor, we also want to recheck if the field if disabled/enabled since it might change depending on other inputs on the composite form
        if (this.args.compositeEditorOptions) {
            this.applyInputUsabilityState();
        }
        // when field is disabled, we can assume it's valid
        if (this.disabled) {
            return { valid: true, msg: '' };
        }
        if (inputValidation) {
            const posValidation = this.validateByPosition(inputValidation.position, inputValidation.inputValue);
            if (!posValidation.valid) {
                inputValidation.position === 'leftInput' ? this._leftInput.select() : this._rightInput.select();
                return posValidation;
            }
        }
        else {
            const leftValidation = this.validateByPosition('leftInput');
            const rightValidation = this.validateByPosition('rightInput');
            if (!leftValidation.valid) {
                this._leftInput.select();
                return leftValidation;
            }
            if (!rightValidation.valid) {
                this._rightInput.select();
                return rightValidation;
            }
        }
        return { valid: true, msg: '' };
    }
    validateByPosition(position, inputValue) {
        var _a;
        const positionEditorParams = this.editorParams[position];
        let currentVal = '';
        if (inputValue) {
            currentVal = inputValue;
        }
        else {
            const input = position === 'leftInput' ? this._leftInput : this._rightInput;
            currentVal = input && input.value;
        }
        // there are 2 ways of passing a Validator, 1-independent validator on each side, 2-shared validator
        const commonValidator = this.validator;
        currentVal = typeof commonValidator === 'function' ? this.getValues() : currentVal;
        const baseValidatorOptions = {
            editorArgs: this.args,
            errorMessage: positionEditorParams.errorMessage,
            required: ((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions) ? false : positionEditorParams.required,
            validator: typeof commonValidator === 'function' ? commonValidator : positionEditorParams.validator,
        };
        switch (positionEditorParams.type) {
            case 'float':
                return (0, editorValidators_1.floatValidator)(currentVal, {
                    ...baseValidatorOptions,
                    decimal: this.getDecimalPlaces(position),
                    minValue: positionEditorParams.minValue,
                    maxValue: positionEditorParams.maxValue,
                    operatorConditionalType: positionEditorParams.operatorConditionalType,
                });
            case 'integer':
                return (0, editorValidators_1.integerValidator)(currentVal, {
                    ...baseValidatorOptions,
                    minValue: positionEditorParams.minValue,
                    maxValue: positionEditorParams.maxValue,
                    operatorConditionalType: positionEditorParams.operatorConditionalType,
                });
            case 'text':
            case 'password':
            default:
                return (0, editorValidators_1.textValidator)(currentVal, baseValidatorOptions);
        }
    }
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    applyInputUsabilityState() {
        const activeCell = this.grid.getActiveCell();
        const isCellEditable = this.grid.onBeforeEditCell.notify({
            ...activeCell, item: this.dataContext, column: this.args.column, grid: this.grid, target: 'composite', compositeEditorOptions: this.args.compositeEditorOptions
        }).getReturnValue();
        this.disable(isCellEditable === false);
    }
    handleChangeOnCompositeEditor(event, compositeEditorOptions, triggeredBy = 'user', isCalledByClearValue = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const activeCell = this.grid.getActiveCell();
        const column = this.args.column;
        const leftInputId = (_c = (_b = (_a = this.columnEditor.params) === null || _a === void 0 ? void 0 : _a.leftInput) === null || _b === void 0 ? void 0 : _b.field) !== null && _c !== void 0 ? _c : '';
        const rightInputId = (_f = (_e = (_d = this.columnEditor.params) === null || _d === void 0 ? void 0 : _d.rightInput) === null || _e === void 0 ? void 0 : _e.field) !== null && _f !== void 0 ? _f : '';
        const item = this.dataContext;
        const grid = this.grid;
        const newValues = this.serializeValue();
        // when valid, we'll also apply the new value to the dataContext item object
        if (this.validate().valid) {
            this.applyValue(this.dataContext, newValues);
        }
        this.applyValue(compositeEditorOptions.formValues, newValues);
        // when the input is disabled we won't include it in the form result object
        // we'll check with both left/right inputs
        const isExcludeDisabledFieldFormValues = (_j = (_h = (_g = this.gridOptions) === null || _g === void 0 ? void 0 : _g.compositeEditorOptions) === null || _h === void 0 ? void 0 : _h.excludeDisabledFieldFormValues) !== null && _j !== void 0 ? _j : false;
        if (isCalledByClearValue || (this.disabled && isExcludeDisabledFieldFormValues && compositeEditorOptions.formValues.hasOwnProperty(leftInputId))) {
            delete compositeEditorOptions.formValues[leftInputId];
        }
        if (isCalledByClearValue || (this.disabled && isExcludeDisabledFieldFormValues && compositeEditorOptions.formValues.hasOwnProperty(rightInputId))) {
            delete compositeEditorOptions.formValues[rightInputId];
        }
        grid.onCompositeEditorChange.notify({ ...activeCell, item, grid, column, formValues: compositeEditorOptions.formValues, editors: compositeEditorOptions.editors, triggeredBy }, { ...new Slick.EventData(), ...event });
    }
    handleChangeOnCompositeEditorDebounce(event) {
        var _a, _b, _c;
        const compositeEditorOptions = (_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions;
        if (compositeEditorOptions) {
            const typingDelay = (_c = (_b = this.gridOptions) === null || _b === void 0 ? void 0 : _b.editorTypingDebounce) !== null && _c !== void 0 ? _c : 500;
            clearTimeout(this._timer);
            this._timer = setTimeout(() => this.handleChangeOnCompositeEditor(event, compositeEditorOptions), typingDelay);
        }
    }
}
exports.DualInputEditor = DualInputEditor;
//# sourceMappingURL=dualInputEditor.js.map