"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegerEditor = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const index_1 = require("../enums/index");
const integerValidator_1 = require("../editorValidators/integerValidator");
const inputEditor_1 = require("./inputEditor");
const domUtilities_1 = require("../services/domUtilities");
const utilities_1 = require("../services/utilities");
class IntegerEditor extends inputEditor_1.InputEditor {
    constructor(args) {
        super(args, 'number');
        this.args = args;
    }
    /** Initialize the Editor */
    init() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (this.columnDef && this.columnEditor && this.args) {
            const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
            const compositeEditorOptions = this.args.compositeEditorOptions;
            this._input = (0, domUtilities_1.createDomElement)('input', {
                type: 'number', autocomplete: 'off', ariaAutoComplete: 'none',
                ariaLabel: (_d = (_c = this.columnEditor) === null || _c === void 0 ? void 0 : _c.ariaLabel) !== null && _d !== void 0 ? _d : `${(0, utils_1.toSentenceCase)(columnId + '')} Slider Editor`,
                placeholder: (_f = (_e = this.columnEditor) === null || _e === void 0 ? void 0 : _e.placeholder) !== null && _f !== void 0 ? _f : '',
                title: (_h = (_g = this.columnEditor) === null || _g === void 0 ? void 0 : _g.title) !== null && _h !== void 0 ? _h : '',
                step: `${(this.columnEditor.valueStep !== undefined) ? this.columnEditor.valueStep : '1'}`,
                className: `editor-text editor-${columnId}`,
            });
            const cellContainer = this.args.container;
            if (cellContainer && typeof cellContainer.appendChild === 'function') {
                cellContainer.appendChild(this._input);
            }
            this._bindEventService.bind(this._input, 'focus', () => { var _a; return (_a = this._input) === null || _a === void 0 ? void 0 : _a.select(); });
            this._bindEventService.bind(this._input, 'keydown', ((event) => {
                this._lastInputKeyEvent = event;
                if (event.keyCode === index_1.KeyCode.LEFT || event.keyCode === index_1.KeyCode.RIGHT) {
                    event.stopImmediatePropagation();
                }
            }));
            // the lib does not get the focus out event for some reason
            // so register it here
            if (this.hasAutoCommitEdit && !compositeEditorOptions) {
                this._bindEventService.bind(this._input, 'focusout', () => {
                    this._isValueTouched = true;
                    this.save();
                });
            }
            if (compositeEditorOptions) {
                this._bindEventService.bind(this._input, ['input', 'paste'], this.handleOnInputChange.bind(this));
                this._bindEventService.bind(this._input, 'wheel', this.handleOnMouseWheel.bind(this), { passive: true });
            }
        }
    }
    loadValue(item) {
        const fieldName = this.columnDef && this.columnDef.field;
        if (fieldName !== undefined) {
            if (item && fieldName !== undefined && this._input) {
                // is the field a complex object, "address.streetNumber"
                const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
                const value = (isComplexObject) ? (0, utilities_1.getDescendantProperty)(item, fieldName) : item[fieldName];
                this._originalValue = (isNaN(value) || value === null || value === undefined) ? value : `${value}`;
                this._input.value = `${this._originalValue}`;
                this._input.select();
            }
        }
    }
    serializeValue() {
        var _a;
        const elmValue = (_a = this._input) === null || _a === void 0 ? void 0 : _a.value;
        if (elmValue === undefined || elmValue === '' || isNaN(+elmValue)) {
            return elmValue;
        }
        const output = isNaN(+elmValue) ? elmValue : parseInt(elmValue, 10);
        return isNaN(+output) ? elmValue : output;
    }
    validate(_targetElm, inputValue) {
        var _a;
        // when using Composite Editor, we also want to recheck if the field if disabled/enabled since it might change depending on other inputs on the composite form
        if (this.args.compositeEditorOptions) {
            this.applyInputUsabilityState();
        }
        // when field is disabled, we can assume it's valid
        if (this.disabled) {
            return { valid: true, msg: '' };
        }
        const elmValue = (inputValue !== undefined) ? inputValue : this.getValue();
        return (0, integerValidator_1.integerValidator)(elmValue, {
            editorArgs: this.args,
            errorMessage: this.columnEditor.errorMessage,
            minValue: this.columnEditor.minValue,
            maxValue: this.columnEditor.maxValue,
            operatorConditionalType: this.columnEditor.operatorConditionalType,
            required: ((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions) ? false : this.columnEditor.required,
            validator: this.validator,
        });
    }
    // --
    // protected functions
    // ------------------
    /** When the input value changes (this will cover the input spinner arrows on the right) */
    handleOnMouseWheel(event) {
        this._isValueTouched = true;
        const compositeEditorOptions = this.args.compositeEditorOptions;
        if (compositeEditorOptions) {
            this.handleChangeOnCompositeEditor(event, compositeEditorOptions);
        }
    }
}
exports.IntegerEditor = IntegerEditor;
//# sourceMappingURL=integerEditor.js.map