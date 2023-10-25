import { setDeepValue } from '@slickgrid-universal/utils';
import * as flatpickr_ from 'flatpickr';
import * as moment_ from 'moment-mini';
const flatpickr = (flatpickr_ && flatpickr_['default'] || flatpickr_); // patch for rollup
const moment = moment_['default'] || moment_; // patch to fix rollup "moment has no default export" issue, document here https://github.com/rollup/rollup/issues/670
import { Constants } from './../constants';
import { FieldType } from '../enums/index';
import { getEditorOptionByName } from './editorUtilities';
import { createDomElement, destroyObjectDomElementProps, emptyElement, } from '../services/domUtilities';
import { getDescendantProperty, mapFlatpickrDateFormatWithFieldType, mapMomentDateFormatWithFieldType, } from './../services/utilities';
import { BindingEventService } from '../services/bindingEvent.service';
/*
 * An example of a date picker editor using Flatpickr
 * https://chmln.github.io/flatpickr
 */
export class DateEditor {
    constructor(args) {
        var _a;
        this.args = args;
        this._isValueTouched = false;
        this._lastTriggeredByClearDate = false;
        /** is the Editor disabled? */
        this.disabled = false;
        if (!args) {
            throw new Error('[Slickgrid-Universal] Something is wrong with this grid, an Editor must always have valid arguments.');
        }
        this.grid = args.grid;
        this.gridOptions = (this.grid.getOptions() || {});
        if ((_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.translater) {
            this._translaterService = this.gridOptions.translater;
        }
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
        return this._inputElm;
    }
    /** Get Flatpickr options passed to the editor by the user */
    get editorOptions() {
        return this.columnEditor.editorOptions || {};
    }
    get hasAutoCommitEdit() {
        var _a;
        return (_a = this.gridOptions.autoCommitEdit) !== null && _a !== void 0 ? _a : false;
    }
    get pickerOptions() {
        return this._pickerMergedOptions;
    }
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator() {
        var _a, _b, _c;
        return (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.validator) !== null && _b !== void 0 ? _b : (_c = this.columnDef) === null || _c === void 0 ? void 0 : _c.validator;
    }
    init() {
        var _a, _b, _c, _d, _e, _f, _g;
        if (this.args && this.columnDef) {
            const compositeEditorOptions = this.args.compositeEditorOptions;
            const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
            const gridOptions = (this.args.grid.getOptions() || {});
            this.defaultDate = (this.args.item) ? this.args.item[this.columnDef.field] : null;
            const inputFormat = mapFlatpickrDateFormatWithFieldType(this.columnEditor.type || this.columnDef.type || FieldType.dateUtc);
            const outputFormat = mapFlatpickrDateFormatWithFieldType(this.columnDef.outputType || this.columnEditor.type || this.columnDef.type || FieldType.dateUtc);
            let currentLocale = ((_d = (_c = this._translaterService) === null || _c === void 0 ? void 0 : _c.getCurrentLanguage) === null || _d === void 0 ? void 0 : _d.call(_c)) || gridOptions.locale || 'en';
            if (currentLocale.length > 2) {
                currentLocale = currentLocale.substring(0, 2);
            }
            const pickerOptions = {
                defaultDate: this.defaultDate,
                altInput: true,
                altFormat: outputFormat,
                dateFormat: inputFormat,
                closeOnSelect: true,
                wrap: true,
                locale: currentLocale,
                onChange: () => this.handleOnDateChange(),
                errorHandler: (error) => {
                    if (error.toString().includes('invalid locale')) {
                        console.warn(`[Slickgrid-Universal] Flatpickr missing locale imports (${currentLocale}), will revert to English as the default locale.
          See Flatpickr Localization for more info, for example if we want to use French, then we can import it with:  import 'flatpickr/dist/l10n/fr';`);
                    }
                    // for any other error do nothing
                    // Flatpickr is a little too sensitive and will throw an error when provided date is lower than minDate so just disregard the error completely
                }
            };
            // merge options with optional user's custom options
            this._pickerMergedOptions = { ...pickerOptions, ...this.editorOptions };
            const inputCssClasses = `.editor-text.editor-${columnId}.form-control`;
            if (this._pickerMergedOptions.altInput) {
                this._pickerMergedOptions.altInputClass = 'flatpickr-alt-input form-control';
            }
            this._editorInputGroupElm = createDomElement('div', { className: 'flatpickr input-group' });
            const closeButtonGroupElm = createDomElement('span', { className: 'input-group-btn input-group-append', dataset: { clear: '' } });
            this._clearButtonElm = createDomElement('button', { type: 'button', className: 'btn btn-default icon-clear' });
            this._inputElm = createDomElement('input', {
                placeholder: (_f = (_e = this.columnEditor) === null || _e === void 0 ? void 0 : _e.placeholder) !== null && _f !== void 0 ? _f : '',
                title: this.columnEditor && this.columnEditor.title || '',
                className: inputCssClasses.replace(/\./g, ' '),
                dataset: { input: '', defaultdate: this.defaultDate }
            }, this._editorInputGroupElm);
            // show clear date button (unless user specifically doesn't want it)
            if (!getEditorOptionByName(this.columnEditor, 'hideClearButton', undefined, 'date')) {
                closeButtonGroupElm.appendChild(this._clearButtonElm);
                this._editorInputGroupElm.appendChild(closeButtonGroupElm);
                this._bindEventService.bind(this._clearButtonElm, 'click', () => this._lastTriggeredByClearDate = true);
            }
            this.args.container.appendChild(this._editorInputGroupElm);
            this.flatInstance = flatpickr(this._editorInputGroupElm, this._pickerMergedOptions);
            // when we're using an alternate input to display data, we'll consider this input as the one to do the focus later on
            // else just use the top one
            this._inputWithDataElm = ((_g = this._pickerMergedOptions) === null || _g === void 0 ? void 0 : _g.altInput) ? document.querySelector(`${inputCssClasses}.flatpickr-alt-input`) : this._inputElm;
            if (!compositeEditorOptions) {
                setTimeout(() => {
                    this.show();
                    this.focus();
                }, 50);
            }
        }
    }
    destroy() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.hide();
        this._bindEventService.unbindAll();
        if ((_a = this.flatInstance) === null || _a === void 0 ? void 0 : _a.destroy) {
            this.flatInstance.destroy();
            if ((_b = this.flatInstance) === null || _b === void 0 ? void 0 : _b.element) {
                setTimeout(() => destroyObjectDomElementProps(this.flatInstance));
            }
        }
        emptyElement(this._editorInputGroupElm);
        emptyElement(this._inputWithDataElm);
        emptyElement(this._inputElm);
        (_d = (_c = this._editorInputGroupElm) === null || _c === void 0 ? void 0 : _c.remove) === null || _d === void 0 ? void 0 : _d.call(_c);
        (_f = (_e = this._inputWithDataElm) === null || _e === void 0 ? void 0 : _e.remove) === null || _f === void 0 ? void 0 : _f.call(_e);
        (_h = (_g = this._inputElm) === null || _g === void 0 ? void 0 : _g.remove) === null || _h === void 0 ? void 0 : _h.call(_g);
    }
    disable(isDisabled = true) {
        var _a, _b;
        const prevIsDisabled = this.disabled;
        this.disabled = isDisabled;
        if ((_a = this.flatInstance) === null || _a === void 0 ? void 0 : _a._input) {
            if (isDisabled) {
                this.flatInstance._input.setAttribute('disabled', 'disabled');
                this._clearButtonElm.disabled = true;
                // clear picker when it's newly disabled and not empty
                const currentValue = this.getValue();
                if (prevIsDisabled !== isDisabled && ((_b = this.args) === null || _b === void 0 ? void 0 : _b.compositeEditorOptions) && currentValue !== '') {
                    this.reset('', true, true);
                }
            }
            else {
                this.flatInstance._input.removeAttribute('disabled');
                this._clearButtonElm.disabled = false;
            }
        }
    }
    /**
     * Dynamically change an Editor option, this is especially useful with Composite Editor
     * since this is the only way to change option after the Editor is created (for example dynamically change "minDate" or another Editor)
     * @param {string} optionName - Flatpickr option name
     * @param {newValue} newValue - Flatpickr new option value
     */
    changeEditorOption(optionName, newValue) {
        if (!this.columnEditor.editorOptions) {
            this.columnEditor.editorOptions = {};
        }
        this.columnEditor.editorOptions[optionName] = newValue;
        this._pickerMergedOptions = { ...this._pickerMergedOptions, [optionName]: newValue };
        this.flatInstance.set(optionName, newValue);
    }
    focus() {
        var _a, _b;
        // always set focus on grid first so that plugin to copy range (SlickCellExternalCopyManager) would still be able to paste at that position
        this.grid.focus();
        this.show();
        (_a = this._inputElm) === null || _a === void 0 ? void 0 : _a.focus();
        if ((_b = this._inputWithDataElm) === null || _b === void 0 ? void 0 : _b.focus) {
            this._inputWithDataElm.focus();
            this._inputWithDataElm.select();
        }
    }
    hide() {
        if (this.flatInstance && typeof this.flatInstance.close === 'function') {
            this.flatInstance.close();
        }
    }
    show() {
        var _a;
        const isCompositeEditor = !!((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions);
        if (!isCompositeEditor && this.flatInstance && typeof this.flatInstance.open === 'function' && this.flatInstance._input) {
            this.flatInstance.open();
        }
        else if (isCompositeEditor) {
            // when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor
            this.applyInputUsabilityState();
        }
    }
    getValue() {
        return this._inputElm.value;
    }
    setValue(val, isApplyingValue = false, triggerOnCompositeEditorChange = true) {
        this.flatInstance.setDate(val);
        if (isApplyingValue) {
            this.applyValue(this.args.item, this.serializeValue());
            // if it's set by a Composite Editor, then also trigger a change for it
            const compositeEditorOptions = this.args.compositeEditorOptions;
            if (compositeEditorOptions && triggerOnCompositeEditorChange) {
                this.handleChangeOnCompositeEditor(compositeEditorOptions, 'system');
            }
        }
    }
    applyValue(item, state) {
        var _a, _b, _c;
        const fieldName = this.columnDef && this.columnDef.field;
        if (fieldName !== undefined) {
            const outputTypeFormat = mapMomentDateFormatWithFieldType((this.columnDef && (this.columnDef.outputType || this.columnEditor.type || this.columnDef.type)) || FieldType.dateUtc);
            const saveTypeFormat = mapMomentDateFormatWithFieldType((this.columnDef && (this.columnDef.saveOutputType || this.columnDef.outputType || this.columnEditor.type || this.columnDef.type)) || FieldType.dateUtc);
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0; // is the field a complex object, "address.streetNumber"
            // validate the value before applying it (if not valid we'll set an empty string)
            const validation = this.validate(null, state);
            const newValue = (state && validation && validation.valid) ? moment(state, outputTypeFormat).format(saveTypeFormat) : '';
            // set the new value to the item datacontext
            if (isComplexObject) {
                // when it's a complex object, user could override the object path (where the editable object is located)
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
        var _a;
        const elmValue = this._inputElm.value;
        const inputFormat = mapMomentDateFormatWithFieldType(this.columnEditor.type || ((_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.type) || FieldType.dateIso);
        const outputTypeFormat = mapMomentDateFormatWithFieldType((this.columnDef && (this.columnDef.outputType || this.columnEditor.type || this.columnDef.type)) || FieldType.dateUtc);
        const elmDateStr = elmValue ? moment(elmValue, inputFormat, false).format(outputTypeFormat) : '';
        const orgDateStr = this._originalDate ? moment(this._originalDate, inputFormat, false).format(outputTypeFormat) : '';
        if (elmDateStr === 'Invalid date' || orgDateStr === 'Invalid date') {
            return false;
        }
        const isChanged = this._lastTriggeredByClearDate || (!(elmDateStr === '' && orgDateStr === '')) && (elmDateStr !== orgDateStr);
        return isChanged;
    }
    isValueTouched() {
        return this._isValueTouched;
    }
    loadValue(item) {
        const fieldName = this.columnDef && this.columnDef.field;
        if (item && fieldName !== undefined) {
            // is the field a complex object, "address.streetNumber"
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
            const value = (isComplexObject) ? getDescendantProperty(item, fieldName) : item[fieldName];
            this._originalDate = value;
            this.flatInstance.setDate(value);
        }
    }
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value, triggerCompositeEventWhenExist = true, clearByDisableCommand = false) {
        var _a;
        const inputValue = (_a = value !== null && value !== void 0 ? value : this._originalDate) !== null && _a !== void 0 ? _a : '';
        if (this.flatInstance) {
            this._originalDate = inputValue;
            this.flatInstance.setDate(inputValue);
            if (!inputValue) {
                this.flatInstance.clear();
            }
        }
        this._isValueTouched = false;
        const compositeEditorOptions = this.args.compositeEditorOptions;
        if (compositeEditorOptions && triggerCompositeEventWhenExist) {
            const shouldDeleteFormValue = !clearByDisableCommand;
            this.handleChangeOnCompositeEditor(compositeEditorOptions, 'user', shouldDeleteFormValue);
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
        var _a;
        const domValue = this._inputElm.value;
        if (!domValue) {
            return '';
        }
        const inputFormat = mapMomentDateFormatWithFieldType(this.columnEditor.type || ((_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.type) || FieldType.dateIso);
        const outputTypeFormat = mapMomentDateFormatWithFieldType((this.columnDef && (this.columnDef.outputType || this.columnEditor.type || this.columnDef.type)) || FieldType.dateIso);
        const value = moment(domValue, inputFormat, false).format(outputTypeFormat);
        return value;
    }
    validate(_targetElm, inputValue) {
        var _a, _b;
        const isRequired = ((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions) ? false : this.columnEditor.required;
        const elmValue = (inputValue !== undefined) ? inputValue : (_b = this._inputElm) === null || _b === void 0 ? void 0 : _b.value;
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
            return this.validator(elmValue, this.args);
        }
        // by default the editor is almost always valid (except when it's required but not provided)
        if (isRequired && elmValue === '') {
            return { valid: false, msg: errorMsg || Constants.VALIDATION_REQUIRED_FIELD };
        }
        return { valid: true, msg: null };
    }
    //
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
    handleOnDateChange() {
        var _a, _b;
        this._isValueTouched = true;
        const currentFlatpickrOptions = (_b = (_a = this.flatInstance) === null || _a === void 0 ? void 0 : _a.config) !== null && _b !== void 0 ? _b : this._pickerMergedOptions;
        if (this.args && (currentFlatpickrOptions === null || currentFlatpickrOptions === void 0 ? void 0 : currentFlatpickrOptions.closeOnSelect)) {
            const compositeEditorOptions = this.args.compositeEditorOptions;
            if (compositeEditorOptions) {
                this.handleChangeOnCompositeEditor(compositeEditorOptions);
            }
            else {
                this.save();
            }
        }
        setTimeout(() => this._lastTriggeredByClearDate = false); // reset flag after a cycle
    }
    handleChangeOnCompositeEditor(compositeEditorOptions, triggeredBy = 'user', isCalledByClearValue = false) {
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
        grid.onCompositeEditorChange.notify({ ...activeCell, item, grid, column, formValues: compositeEditorOptions.formValues, editors: compositeEditorOptions.editors, triggeredBy }, new Slick.EventData());
    }
}
//# sourceMappingURL=dateEditor.js.map