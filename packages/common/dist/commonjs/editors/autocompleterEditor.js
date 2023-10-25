"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleterEditor = void 0;
const autocompleter_ = require("autocompleter");
const autocomplete = (autocompleter_ && autocompleter_['default'] || autocompleter_); // patch for rollup
const utils_1 = require("@slickgrid-universal/utils");
const constants_1 = require("./../constants");
const index_1 = require("../enums/index");
const textValidator_1 = require("../editorValidators/textValidator");
const commonEditorFilter_1 = require("../commonEditorFilter");
const editorUtilities_1 = require("./editorUtilities");
const domUtilities_1 = require("../services/domUtilities");
const utilities_1 = require("../services/utilities");
const bindingEvent_service_1 = require("../services/bindingEvent.service");
// minimum length of chars to type before starting to start querying
const MIN_LENGTH = 3;
/*
 * An example of a 'detached' editor.
 * KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
 */
class AutocompleterEditor {
    constructor(args) {
        var _a;
        this.args = args;
        this._isValueTouched = false;
        this._lastTriggeredByClearInput = false;
        /** is the Editor disabled? */
        this.disabled = false;
        this.forceUserInput = false;
        /** Final collection displayed in the UI, that is after processing filter/sort/override */
        this.finalCollection = [];
        if (!args) {
            throw new Error('[Slickgrid-Universal] Something is wrong with this grid, an Editor must always have valid arguments.');
        }
        this.grid = args.grid;
        this._bindEventService = new bindingEvent_service_1.BindingEventService();
        if ((_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.translater) {
            this._translater = this.gridOptions.translater;
        }
        // get locales provided by user in forRoot or else use default English locales via the Constants
        this._locales = this.gridOptions && this.gridOptions.locales || constants_1.Constants.locales;
        this.init();
    }
    /** Getter for the Autocomplete Option */
    get autocompleterOptions() {
        return this._autocompleterOptions || {};
    }
    /** Getter of the Collection */
    get collection() {
        var _a, _b;
        return (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.collection) !== null && _b !== void 0 ? _b : [];
    }
    /** Getter for the Editor DOM Element */
    get editorDomElement() {
        return this._inputElm;
    }
    /** Getter for the Final Collection used in the AutoCompleted Source (this may vary from the "collection" especially when providing a customStructure) */
    get elementCollection() {
        return this._elementCollection;
    }
    /** Get Column Definition object */
    get columnDef() {
        return this.args.column;
    }
    /** Get Column Editor object */
    get columnEditor() {
        var _a;
        return ((_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.internalColumnEditor) || {};
    }
    /** Getter for the Custom Structure if exist */
    get customStructure() {
        var _a, _b, _c, _d, _e, _f;
        let customStructure = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.customStructure;
        const columnType = (_c = (_b = this.columnEditor) === null || _b === void 0 ? void 0 : _b.type) !== null && _c !== void 0 ? _c : (_d = this.columnDef) === null || _d === void 0 ? void 0 : _d.type;
        if (!customStructure && (columnType === index_1.FieldType.object && ((_e = this.columnDef) === null || _e === void 0 ? void 0 : _e.dataKey) && ((_f = this.columnDef) === null || _f === void 0 ? void 0 : _f.labelKey))) {
            customStructure = {
                label: this.columnDef.labelKey,
                value: this.columnDef.dataKey,
            };
        }
        return customStructure;
    }
    /** Getter for the item data context object */
    get dataContext() {
        return this.args.item;
    }
    get editorOptions() {
        var _a;
        return ((_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.editorOptions) || {};
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getOptions) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    /** Kraaden AutoComplete instance */
    get instance() {
        return this._instance;
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        this.labelName = (_b = (_a = this.customStructure) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : 'label';
        this.valueName = (_d = (_c = this.customStructure) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : 'value';
        this.labelPrefixName = (_f = (_e = this.customStructure) === null || _e === void 0 ? void 0 : _e.labelPrefix) !== null && _f !== void 0 ? _f : 'labelPrefix';
        this.labelSuffixName = (_h = (_g = this.customStructure) === null || _g === void 0 ? void 0 : _g.labelSuffix) !== null && _h !== void 0 ? _h : 'labelSuffix';
        // always render the DOM element, even if user passed a "collectionAsync",
        let newCollection = this.columnEditor.collection;
        if (((_j = this.columnEditor) === null || _j === void 0 ? void 0 : _j.collectionAsync) && !newCollection) {
            newCollection = [];
        }
        // const newCollection = this.columnEditor.collection;
        this.renderDomElement(newCollection);
        // when having a collectionAsync and a collection that is empty, we'll toggle the Editor to disabled,
        // it will be re-enabled when we get the collection filled (in slick-vanilla-bundle on method "updateEditorCollection()")
        if (this.disabled || (((_k = this.columnEditor) === null || _k === void 0 ? void 0 : _k.collectionAsync) && Array.isArray(newCollection) && newCollection.length === 0)) {
            this.disable(true);
        }
    }
    destroy() {
        var _a, _b, _c;
        this._bindEventService.unbindAll();
        (_a = this._instance) === null || _a === void 0 ? void 0 : _a.destroy();
        (_c = (_b = this._inputElm) === null || _b === void 0 ? void 0 : _b.remove) === null || _c === void 0 ? void 0 : _c.call(_b);
        this._elementCollection = null;
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
                    this.clear(true);
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
            this._inputElm.select();
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
        return this._inputElm.value;
    }
    setValue(inputValue, isApplyingValue = false, triggerOnCompositeEditorChange = true) {
        var _a;
        // if user provided a custom structure, we will serialize the value returned from the object with custom structure
        this._inputElm.value = (inputValue === null || inputValue === void 0 ? void 0 : inputValue.hasOwnProperty(this.labelName))
            ? inputValue[this.labelName]
            : inputValue;
        if (isApplyingValue) {
            this._currentValue = inputValue;
            this._defaultTextValue = typeof inputValue === 'string' ? inputValue : ((_a = inputValue === null || inputValue === void 0 ? void 0 : inputValue[this.labelName]) !== null && _a !== void 0 ? _a : '');
            this.applyValue(this.args.item, this.serializeValue());
            // if it's set by a Composite Editor, then also trigger a change for it
            const compositeEditorOptions = this.args.compositeEditorOptions;
            if (compositeEditorOptions && triggerOnCompositeEditorChange) {
                this.handleChangeOnCompositeEditor(null, compositeEditorOptions, 'system');
            }
        }
    }
    applyValue(item, state) {
        var _a, _b, _c, _d;
        let newValue = state;
        const fieldName = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.field;
        if (fieldName !== undefined) {
            // if we have a collection defined, we will try to find the string within the collection and return it
            if (Array.isArray(this.collection) && this.collection.length > 0) {
                newValue = (0, utilities_1.findOrDefault)(this.collection, (collectionItem) => {
                    if (collectionItem && (0, utils_1.isObject)(state) && collectionItem.hasOwnProperty(this.valueName)) {
                        return (collectionItem[this.valueName].toString()) === (state.hasOwnProperty(this.valueName) && state[this.valueName].toString());
                    }
                    else if (collectionItem && typeof state === 'string' && collectionItem.hasOwnProperty(this.valueName)) {
                        return (collectionItem[this.valueName].toString()) === state;
                    }
                    return (collectionItem === null || collectionItem === void 0 ? void 0 : collectionItem.toString()) === state;
                }, '');
            }
            // is the field a complex object, "address.streetNumber"
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
            // validate the value before applying it (if not valid we'll set an empty string)
            const validation = this.validate(null, newValue);
            newValue = (validation === null || validation === void 0 ? void 0 : validation.valid) ? newValue : '';
            // set the new value to the item datacontext
            if (isComplexObject) {
                // when it's a complex object, user could override the object path (where the editable object is located)
                // else we use the path provided in the Field Column Definition
                const objectPath = (_d = (_c = (_b = this.columnEditor) === null || _b === void 0 ? void 0 : _b.complexObjectPath) !== null && _c !== void 0 ? _c : fieldName) !== null && _d !== void 0 ? _d : '';
                (0, utils_1.setDeepValue)(item, objectPath, newValue);
            }
            else {
                item[fieldName] = newValue;
            }
        }
    }
    isValueChanged() {
        var _a, _b;
        const elmValue = this._inputElm.value;
        const lastKeyCodeEvent = (_a = this._lastInputKeyEvent) === null || _a === void 0 ? void 0 : _a.keyCode;
        if (((_b = this.columnEditor) === null || _b === void 0 ? void 0 : _b.alwaysSaveOnEnterKey) && (lastKeyCodeEvent === index_1.KeyCode.ENTER)) {
            return true;
        }
        const isValueChanged = (!(elmValue === '' && (this._defaultTextValue === null || this._defaultTextValue === undefined))) && (elmValue !== this._defaultTextValue);
        return this._lastTriggeredByClearInput || isValueChanged;
    }
    isValueTouched() {
        return this._isValueTouched;
    }
    loadValue(item) {
        var _a, _b;
        const fieldName = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.field;
        if (item && fieldName !== undefined) {
            // is the field a complex object, "address.streetNumber"
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
            const data = isComplexObject ? (0, utilities_1.getDescendantProperty)(item, fieldName) : item[fieldName];
            this._currentValue = data;
            this._originalValue = data;
            this._defaultTextValue = typeof data === 'string' ? data : ((_b = data === null || data === void 0 ? void 0 : data[this.labelName]) !== null && _b !== void 0 ? _b : '');
            this._inputElm.value = this._defaultTextValue;
            this._inputElm.select();
        }
    }
    clear(clearByDisableCommand = false) {
        if (this._inputElm) {
            this._currentValue = '';
            this._defaultTextValue = '';
            this.setValue('', true); // set the input value and also apply the change to the datacontext item
        }
        this._isValueTouched = true;
        this._lastTriggeredByClearInput = true;
        const compositeEditorOptions = this.args.compositeEditorOptions;
        if (compositeEditorOptions) {
            const shouldDeleteFormValue = !clearByDisableCommand;
            this.handleChangeOnCompositeEditor(null, compositeEditorOptions, 'user', shouldDeleteFormValue);
        }
        else {
            this.save();
        }
    }
    /**
     * You can reset the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value, triggerCompositeEventWhenExist = true, clearByDisableCommand = false) {
        var _a, _b;
        const inputValue = (_a = value !== null && value !== void 0 ? value : this._originalValue) !== null && _a !== void 0 ? _a : '';
        if (this._inputElm) {
            this._currentValue = inputValue;
            this._defaultTextValue = typeof inputValue === 'string' ? inputValue : ((_b = inputValue === null || inputValue === void 0 ? void 0 : inputValue[this.labelName]) !== null && _b !== void 0 ? _b : '');
            this._inputElm.value = this._defaultTextValue;
        }
        this._isValueTouched = false;
        const compositeEditorOptions = this.args.compositeEditorOptions;
        if (compositeEditorOptions && triggerCompositeEventWhenExist) {
            const shouldDeleteFormValue = !clearByDisableCommand;
            this.handleChangeOnCompositeEditor(null, compositeEditorOptions, 'user', shouldDeleteFormValue);
        }
    }
    save() {
        var _a;
        const validation = this.validate();
        const isValid = (_a = validation === null || validation === void 0 ? void 0 : validation.valid) !== null && _a !== void 0 ? _a : false;
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
        var _a, _b, _c, _d, _e, _f;
        // if you want to add the autocomplete functionality but want the user to be able to input a new option
        if (this._inputElm && this.editorOptions.forceUserInput) {
            const minLength = (_b = (_a = this.editorOptions) === null || _a === void 0 ? void 0 : _a.minLength) !== null && _b !== void 0 ? _b : MIN_LENGTH;
            this._currentValue = this._inputElm.value.length > minLength ? this._inputElm.value : this._currentValue;
        }
        // if user provided a custom structure, we will serialize the value returned from the object with custom structure
        if (this.customStructure && this._currentValue && this._currentValue.hasOwnProperty(this.valueName) && (((_c = this.columnDef) === null || _c === void 0 ? void 0 : _c.type) !== index_1.FieldType.object && ((_d = this.columnEditor) === null || _d === void 0 ? void 0 : _d.type) !== index_1.FieldType.object)) {
            return this._currentValue[this.valueName];
        }
        else if (this._currentValue && this._currentValue.value !== undefined) {
            // when object has a "value" property and its column is set as an Object type, we'll return an object with optional custom structure
            if (((_e = this.columnDef) === null || _e === void 0 ? void 0 : _e.type) === index_1.FieldType.object || ((_f = this.columnEditor) === null || _f === void 0 ? void 0 : _f.type) === index_1.FieldType.object) {
                return {
                    [this.labelName]: this._currentValue.label,
                    [this.valueName]: this._currentValue.value
                };
            }
            return this._currentValue.value;
        }
        // if it falls here it might be that the user provided its own custom item with something else than the regular label/value pair
        // at this point it's only available when user provide a custom template for the autocomplete renderItem callback
        return this._currentValue;
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
        const val = (inputValue !== undefined) ? inputValue : (_a = this._inputElm) === null || _a === void 0 ? void 0 : _a.value;
        return (0, textValidator_1.textValidator)(val, {
            editorArgs: this.args,
            errorMessage: this.columnEditor.errorMessage,
            minLength: this.columnEditor.minLength,
            maxLength: this.columnEditor.maxLength,
            operatorConditionalType: this.columnEditor.operatorConditionalType,
            required: ((_b = this.args) === null || _b === void 0 ? void 0 : _b.compositeEditorOptions) ? false : this.columnEditor.required,
            validator: this.validator,
        });
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
    // this function should be protected but for unit tests purposes we'll make it public until a better solution is found
    // a better solution would be to get the autocomplete DOM element to work with selection but I couldn't find how to do that in Jest
    handleSelect(item) {
        var _a, _b;
        if (item !== undefined) {
            const event = null; // TODO do we need the event?
            const selectedItem = item;
            this._currentValue = selectedItem;
            this._isValueTouched = true;
            const compositeEditorOptions = this.args.compositeEditorOptions;
            // when the user defines a "renderItem" template, then we assume the user defines his own custom structure of label/value pair
            // otherwise we know that the autocomplete lib always require a label/value pair, we can pull them directly
            const hasCustomRenderItemCallback = (_b = (_a = this.editorOptions) === null || _a === void 0 ? void 0 : _a.renderItem) !== null && _b !== void 0 ? _b : false;
            const itemLabel = typeof selectedItem === 'string' ? selectedItem : (hasCustomRenderItemCallback ? selectedItem[this.labelName] : selectedItem.label);
            this.setValue(itemLabel);
            if (compositeEditorOptions) {
                this.handleChangeOnCompositeEditor(event, compositeEditorOptions);
            }
            else {
                this.save();
            }
            // if user wants to hook to the "select", he can do via this "onSelect"
            // its signature is purposely similar to the "onSelect" callback + some extra arguments (row, cell, column, dataContext)
            if (typeof this.editorOptions.onSelectItem === 'function') {
                const { row, cell } = this.grid.getActiveCell();
                this.editorOptions.onSelectItem(item, row, cell, this.args.column, this.args.item);
            }
            setTimeout(() => this._lastTriggeredByClearInput = false); // reset flag after a cycle
        }
        return false;
    }
    renderRegularItem(item) {
        var _a;
        const itemLabel = (typeof item === 'string' ? item : (_a = item === null || item === void 0 ? void 0 : item.label) !== null && _a !== void 0 ? _a : '');
        return (0, domUtilities_1.createDomElement)('div', { textContent: itemLabel || '' });
    }
    renderCustomItem(item) {
        var _a, _b, _c;
        const templateString = (_c = (_b = (_a = this._autocompleterOptions) === null || _a === void 0 ? void 0 : _a.renderItem) === null || _b === void 0 ? void 0 : _b.templateCallback(item)) !== null && _c !== void 0 ? _c : '';
        // sanitize any unauthorized html tags like script and others
        // for the remaining allowed tags we'll permit all attributes
        const sanitizedTemplateText = (0, domUtilities_1.sanitizeTextByAvailableSanitizer)(this.gridOptions, templateString) || '';
        return (0, domUtilities_1.createDomElement)('div', { innerHTML: sanitizedTemplateText });
    }
    renderCollectionItem(item) {
        var _a, _b;
        const isRenderHtmlEnabled = (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.enableRenderHtml) !== null && _b !== void 0 ? _b : false;
        const prefixText = item.labelPrefix || '';
        const labelText = item.label || '';
        const suffixText = item.labelSuffix || '';
        const finalText = prefixText + labelText + suffixText;
        // sanitize any unauthorized html tags like script and others
        // for the remaining allowed tags we'll permit all attributes
        const sanitizedText = (0, domUtilities_1.sanitizeTextByAvailableSanitizer)(this.gridOptions, finalText) || '';
        const div = document.createElement('div');
        div[isRenderHtmlEnabled ? 'innerHTML' : 'textContent'] = sanitizedText;
        return div;
    }
    renderDomElement(collection) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        const placeholder = (_d = (_c = this.columnEditor) === null || _c === void 0 ? void 0 : _c.placeholder) !== null && _d !== void 0 ? _d : '';
        const title = (_f = (_e = this.columnEditor) === null || _e === void 0 ? void 0 : _e.title) !== null && _f !== void 0 ? _f : '';
        this._editorInputGroupElm = (0, domUtilities_1.createDomElement)('div', { className: 'autocomplete-container input-group' });
        const closeButtonGroupElm = (0, domUtilities_1.createDomElement)('span', { className: 'input-group-btn input-group-append', dataset: { clear: '' } });
        this._clearButtonElm = (0, domUtilities_1.createDomElement)('button', { type: 'button', className: 'btn btn-default icon-clear' });
        this._inputElm = (0, domUtilities_1.createDomElement)('input', {
            type: 'text', placeholder, title,
            autocomplete: 'off', ariaAutoComplete: 'none',
            className: `autocomplete form-control editor-text input-group-editor editor-${columnId}`,
            dataset: { input: '' }
        }, this._editorInputGroupElm);
        // add an empty <span> in order to add loading spinner styling
        this._editorInputGroupElm.appendChild(document.createElement('span'));
        // show clear date button (unless user specifically doesn't want it)
        if (!(0, editorUtilities_1.getEditorOptionByName)(this.columnEditor, 'hideClearButton', undefined, 'autocomplete')) {
            closeButtonGroupElm.appendChild(this._clearButtonElm);
            this._editorInputGroupElm.appendChild(closeButtonGroupElm);
            this._bindEventService.bind(this._clearButtonElm, 'click', () => this.clear());
        }
        this._bindEventService.bind(this._inputElm, 'focus', () => { var _a; return (_a = this._inputElm) === null || _a === void 0 ? void 0 : _a.select(); });
        this._bindEventService.bind(this._inputElm, 'keydown', ((event) => {
            this._lastInputKeyEvent = event;
            if (event.keyCode === index_1.KeyCode.LEFT || event.keyCode === index_1.KeyCode.RIGHT || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.stopImmediatePropagation();
            }
            // in case the user wants to save even an empty value,
            // we need to subscribe to the onKeyDown event for that use case and clear the current value
            if (this.columnEditor.alwaysSaveOnEnterKey) {
                if (event.keyCode === index_1.KeyCode.ENTER || event.key === 'Enter') {
                    this._currentValue = null;
                }
            }
        }));
        // assign the collection to a temp variable before filtering/sorting the collection
        let finalCollection = collection;
        // user could also override the collection
        if (finalCollection && ((_g = this.columnEditor) === null || _g === void 0 ? void 0 : _g.collectionOverride)) {
            const overrideArgs = { column: this.columnDef, dataContext: this.dataContext, grid: this.grid, originalCollections: this.collection };
            if (this.args.compositeEditorOptions) {
                const { formValues, modalType } = this.args.compositeEditorOptions;
                overrideArgs.compositeEditorOptions = { formValues, modalType };
            }
            finalCollection = this.columnEditor.collectionOverride(finalCollection, overrideArgs);
        }
        // keep reference of the final collection displayed in the UI
        if (finalCollection) {
            this.finalCollection = finalCollection;
        }
        // the kradeen autocomplete lib only works with label/value pair, make sure that our array is in accordance
        if (Array.isArray(finalCollection)) {
            if (this.collection.every(x => (0, utils_1.isPrimitiveValue)(x))) {
                // when detecting an array of primitives, we have to remap it to an array of value/pair objects
                finalCollection = finalCollection.map(c => ({ label: c, value: c }));
            }
            else {
                // user might provide its own custom structures, if so remap them as the new label/value pair
                finalCollection = finalCollection.map((item) => {
                    var _a, _b;
                    return ({
                        label: item === null || item === void 0 ? void 0 : item[this.labelName],
                        value: item === null || item === void 0 ? void 0 : item[this.valueName],
                        labelPrefix: (_a = item === null || item === void 0 ? void 0 : item[this.labelPrefixName]) !== null && _a !== void 0 ? _a : '',
                        labelSuffix: (_b = item === null || item === void 0 ? void 0 : item[this.labelSuffixName]) !== null && _b !== void 0 ? _b : ''
                    });
                });
            }
            // keep the final source collection used in the AutoComplete as reference
            this._elementCollection = finalCollection;
        }
        // merge custom autocomplete options with default basic options
        this._autocompleterOptions = {
            input: this._inputElm,
            debounceWaitMs: 200,
            className: `slick-autocomplete ${(_j = (_h = this.editorOptions) === null || _h === void 0 ? void 0 : _h.className) !== null && _j !== void 0 ? _j : ''}`.trim(),
            emptyMsg: this.gridOptions.enableTranslate && ((_k = this._translater) === null || _k === void 0 ? void 0 : _k.translate) ? this._translater.translate('NO_ELEMENTS_FOUND') : (_m = (_l = this._locales) === null || _l === void 0 ? void 0 : _l.TEXT_NO_ELEMENTS_FOUND) !== null && _m !== void 0 ? _m : 'No elements found',
            customize: (_input, _inputRect, container) => {
                container.style.width = ''; // unset width that was set internally by the Autopleter lib
            },
            onSelect: this.handleSelect.bind(this),
            ...this.editorOptions,
        };
        // "render" callback overriding
        if ((_o = this._autocompleterOptions.renderItem) === null || _o === void 0 ? void 0 : _o.layout) {
            // when "renderItem" is defined, we need to add our custom style CSS classes & custom item renderer
            this._autocompleterOptions.className += ` autocomplete-custom-${(0, utils_1.toKebabCase)(this._autocompleterOptions.renderItem.layout)}`;
            this._autocompleterOptions.render = this.renderCustomItem.bind(this);
        }
        else if (Array.isArray(collection)) {
            // we'll use our own renderer so that it works with label prefix/suffix and also with html rendering when enabled
            this._autocompleterOptions.render = (_q = (_p = this._autocompleterOptions.render) === null || _p === void 0 ? void 0 : _p.bind(this)) !== null && _q !== void 0 ? _q : this.renderCollectionItem.bind(this);
        }
        else if (!this._autocompleterOptions.render) {
            // when no render callback is defined, we still need to define our own renderer for regular item
            // because we accept string array but the Kraaden autocomplete doesn't by default and we can change that
            this._autocompleterOptions.render = this.renderRegularItem.bind(this);
        }
        // when user passes it's own autocomplete options
        // we still need to provide our own "select" callback implementation
        if ((_r = this._autocompleterOptions) === null || _r === void 0 ? void 0 : _r.fetch) {
            // add loading class by overriding user's fetch method
            (0, commonEditorFilter_1.addAutocompleteLoadingByOverridingFetch)(this._inputElm, this._autocompleterOptions);
            // create the Kraaden AutoComplete
            this._instance = autocomplete(this._autocompleterOptions);
        }
        else {
            this._instance = autocomplete({
                ...this._autocompleterOptions,
                fetch: (searchTerm, updateCallback) => {
                    if (finalCollection) {
                        // you can also use AJAX requests instead of preloaded data
                        // also at this point our collection was already modified, by the previous map, to have the "label" property (unless it's a string)
                        updateCallback(finalCollection.filter(c => {
                            const label = (typeof c === 'string' ? c : c === null || c === void 0 ? void 0 : c.label) || '';
                            return label.toLowerCase().includes(searchTerm.toLowerCase());
                        }));
                    }
                },
            });
        }
        this.args.container.appendChild(this._editorInputGroupElm);
        if (!this.args.compositeEditorOptions) {
            setTimeout(() => this.focus(), 50);
        }
    }
}
exports.AutocompleterEditor = AutocompleterEditor;
//# sourceMappingURL=autocompleterEditor.js.map