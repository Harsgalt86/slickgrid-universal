import { setDeepValue, toSentenceCase } from '@slickgrid-universal/utils';
import { Constants } from './../constants';
import { createDomElement } from '../services/domUtilities';
import { getDescendantProperty, } from '../services/utilities';
import { BindingEventService } from '../services/bindingEvent.service';
/*
 * An example of a 'detached' editor.
 * KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
 */
export class CheckboxEditor {
    constructor(args) {
        this.args = args;
        this._isValueTouched = false;
        /** is the Editor disabled? */
        this.disabled = false;
        if (!args) {
            throw new Error('[Slickgrid-Universal] Something is wrong with this grid, an Editor must always have valid arguments.');
        }
        this.grid = args.grid;
        this.gridOptions = (this.grid.getOptions() || {});
        this._bindEventService = new BindingEventService();
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
        return this._input;
    }
    get hasAutoCommitEdit() {
        var _a;
        return (_a = this.gridOptions.autoCommitEdit) !== null && _a !== void 0 ? _a : false;
    }
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator() {
        var _a, _b, _c;
        return (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.validator) !== null && _b !== void 0 ? _b : (_c = this.columnDef) === null || _c === void 0 ? void 0 : _c.validator;
    }
    init() {
        var _a, _b, _c, _d, _e, _f, _g;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        const compositeEditorOptions = this.args.compositeEditorOptions;
        this._checkboxContainerElm = createDomElement('div', { className: `checkbox-editor-container editor-${columnId}` });
        this._input = createDomElement('input', {
            type: 'checkbox', value: 'true',
            ariaLabel: (_d = (_c = this.columnEditor) === null || _c === void 0 ? void 0 : _c.ariaLabel) !== null && _d !== void 0 ? _d : `${toSentenceCase(columnId + '')} Checkbox Editor`,
            className: `editor-checkbox editor-${columnId}`,
            title: (_f = (_e = this.columnEditor) === null || _e === void 0 ? void 0 : _e.title) !== null && _f !== void 0 ? _f : '',
        });
        const cellContainer = (_g = this.args) === null || _g === void 0 ? void 0 : _g.container;
        if (cellContainer && typeof cellContainer.appendChild === 'function') {
            if (compositeEditorOptions) {
                this._checkboxContainerElm.appendChild(this._input);
                cellContainer.appendChild(this._checkboxContainerElm);
            }
            else {
                cellContainer.appendChild(this._input);
            }
        }
        // make the checkbox editor act like a regular checkbox that commit the value on click
        if (this.hasAutoCommitEdit && !compositeEditorOptions) {
            this._bindEventService.bind(this._input, 'click', () => {
                this._isValueTouched = true;
                this.save();
            });
        }
        if (compositeEditorOptions) {
            this._bindEventService.bind(this._input, 'change', ((event) => {
                this._isValueTouched = true;
                this.handleChangeOnCompositeEditor(event, compositeEditorOptions);
            }));
        }
        else {
            this.focus();
        }
    }
    destroy() {
        var _a, _b;
        this._bindEventService.unbindAll();
        (_b = (_a = this._input) === null || _a === void 0 ? void 0 : _a.remove) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    disable(isDisabled = true) {
        var _a;
        const prevIsDisabled = this.disabled;
        this.disabled = isDisabled;
        if (this._input) {
            if (isDisabled) {
                this._input.setAttribute('disabled', 'disabled');
                this._checkboxContainerElm.classList.add('disabled');
                // clear checkbox when it's newly disabled and not empty
                const currentValue = this.getValue();
                if (prevIsDisabled !== isDisabled && ((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions) && currentValue !== false) {
                    this.reset(false, true, true);
                }
            }
            else {
                this._input.removeAttribute('disabled');
                this._checkboxContainerElm.classList.remove('disabled');
            }
        }
    }
    focus() {
        // always set focus on grid first so that plugin to copy range (SlickCellExternalCopyManager) would still be able to paste at that position
        this.grid.focus();
        if (this._input) {
            this._input.focus();
        }
    }
    /** pre-click, when enabled, will simply toggle the checkbox without requiring to double-click */
    preClick() {
        if (this._input) {
            this._input.checked = !this._input.checked;
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
        return (_b = (_a = this._input) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false;
    }
    setValue(val, isApplyingValue = false, triggerOnCompositeEditorChange = true) {
        const isChecked = val ? true : false;
        if (this._input) {
            this._input.checked = isChecked;
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
        var _a, _b, _c;
        const fieldName = this.columnDef && this.columnDef.field;
        if (fieldName !== undefined) {
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0; // is the field a complex object, "address.streetNumber"
            // validate the value before applying it (if not valid we'll set an empty string)
            const validation = this.validate(null, state);
            const newValue = (validation && validation.valid) ? state : '';
            // set the new value to the item datacontext
            if (isComplexObject) { // when it's a complex object, user could override the object path (where the editable object is located)
                // else we use the path provided in the Field Column Definition
                const objectPath = (_c = (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.complexObjectPath) !== null && _b !== void 0 ? _b : fieldName) !== null && _c !== void 0 ? _c : '';
                setDeepValue(item, objectPath, newValue);
            }
            else {
                item[fieldName] = newValue;
            }
        }
    }
    isValueChanged() {
        return (this.serializeValue() !== this._originalValue);
    }
    isValueTouched() {
        return this._isValueTouched;
    }
    loadValue(item) {
        const fieldName = this.columnDef && this.columnDef.field;
        if (item && fieldName !== undefined && this._input) {
            // is the field a complex object, "address.streetNumber"
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
            const value = (isComplexObject) ? getDescendantProperty(item, fieldName) : item[fieldName];
            this._originalValue = value;
            this._input.checked = !!this._originalValue;
        }
    }
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value, triggerCompositeEventWhenExist = true, clearByDisableCommand = false) {
        var _a;
        const inputValue = (_a = value !== null && value !== void 0 ? value : this._originalValue) !== null && _a !== void 0 ? _a : false;
        if (this._input) {
            this._originalValue = inputValue;
            this._input.checked = !!(inputValue);
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
        return (_b = (_a = this._input) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false;
    }
    validate(_targetElm, inputValue) {
        var _a, _b;
        const isRequired = ((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions) ? false : this.columnEditor.required;
        const isChecked = (inputValue !== undefined) ? inputValue : (_b = this._input) === null || _b === void 0 ? void 0 : _b.checked;
        const errorMsg = this.columnEditor.errorMessage;
        // when using Composite Editor, we also want to recheck if the field if disabled/enabled since it might change depending on other inputs on the composite form
        if (this.args.compositeEditorOptions) {
            this.applyInputUsabilityState();
        }
        // when field is disabled, we can assume it's valid
        if (this.disabled) {
            return { valid: true, msg: '' };
        }
        if (this.validator) {
            return this.validator(isChecked, this.args);
        }
        // by default the editor is almost always valid (except when it's required but not provided)
        if (isRequired && !isChecked) {
            return {
                valid: false,
                msg: errorMsg || Constants.VALIDATION_REQUIRED_FIELD
            };
        }
        return {
            valid: true,
            msg: null
        };
    }
    // --
    // protected functions
    // ------------------
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    applyInputUsabilityState() {
        const activeCell = this.grid.getActiveCell();
        const isCellEditable = this.grid.onBeforeEditCell.notify({
            ...activeCell, item: this.dataContext, column: this.args.column, grid: this.grid, target: 'composite', compositeEditorOptions: this.args.compositeEditorOptions
        }).getReturnValue();
        this.disable(isCellEditable === false);
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
}
//# sourceMappingURL=checkboxEditor.js.map