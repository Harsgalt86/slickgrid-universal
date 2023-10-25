import { multipleSelect } from 'multiple-select-vanilla';
import { setDeepValue } from '@slickgrid-universal/utils';
import { dequal } from 'dequal/lite';
import { Constants } from '../constants';
import { FieldType } from './../enums/index';
import { buildMultipleSelectDataCollection, CollectionService, emptyElement, findOrDefault, sanitizeTextByAvailableSanitizer } from '../services/index';
import { getDescendantProperty, getTranslationPrefix, } from '../services/utilities';
/**
 * Slickgrid editor class for multiple/single select lists
 */
export class SelectEditor {
    constructor(args, isMultipleSelect, delayOpening = -1) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        this.args = args;
        this.isMultipleSelect = isMultipleSelect;
        this.delayOpening = delayOpening;
        this._isValueTouched = false;
        // flag to signal that the editor is destroying itself, helps prevent
        // commit changes from being called twice and erroring
        this._isDisposingOrCallingSave = false;
        /** is the Editor disabled? */
        this.disabled = false;
        /** Do we translate the label? */
        this.enableTranslateLabel = false;
        /** Final collection displayed in the UI, that is after processing filter/sort/override */
        this.finalCollection = [];
        if (!args) {
            throw new Error('[Slickgrid-Universal] Something is wrong with this grid, an Editor must always have valid arguments.');
        }
        this.grid = args.grid;
        this.gridOptions = (this.grid.getOptions() || {});
        if ((_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.translater) {
            this._translaterService = this.gridOptions.translater;
        }
        // get locales provided by user in main file or else use default English locales via the Constants
        this._locales = this.gridOptions.locales || Constants.locales;
        // provide the name attribute to the DOM element which will be needed to auto-adjust drop position (dropup / dropdown)
        const columnId = (_c = (_b = this.columnDef) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : '';
        this.elementName = `editor-${columnId}`;
        const compositeEditorOptions = this.args.compositeEditorOptions;
        const libOptions = {
            autoAdjustDropHeight: true,
            autoAdjustDropPosition: true,
            autoAdjustDropWidthByTextSize: true,
            container: 'body',
            filter: false,
            maxHeight: 275,
            minHeight: 25,
            name: this.elementName,
            single: true,
            renderOptionLabelAsHtml: (_e = (_d = this.columnEditor) === null || _d === void 0 ? void 0 : _d.enableRenderHtml) !== null && _e !== void 0 ? _e : false,
            sanitizer: (dirtyHtml) => sanitizeTextByAvailableSanitizer(this.gridOptions, dirtyHtml),
            onClick: () => this._isValueTouched = true,
            onCheckAll: () => this._isValueTouched = true,
            onUncheckAll: () => this._isValueTouched = true,
            onClose: () => {
                if (compositeEditorOptions) {
                    this.handleChangeOnCompositeEditor(compositeEditorOptions);
                }
                else {
                    this._isDisposingOrCallingSave = true;
                    this.save(this.hasAutoCommitEdit);
                }
            },
        };
        if (isMultipleSelect) {
            libOptions.single = false;
            libOptions.displayTitle = true;
            libOptions.showOkButton = true;
            if ((_f = this._translaterService) === null || _f === void 0 ? void 0 : _f.getCurrentLanguage()) {
                const translationPrefix = getTranslationPrefix(this.gridOptions);
                libOptions.countSelectedText = this._translaterService.translate(`${translationPrefix}X_OF_Y_SELECTED`);
                libOptions.allSelectedText = this._translaterService.translate(`${translationPrefix}ALL_SELECTED`);
                libOptions.selectAllText = this._translaterService.translate(`${translationPrefix}SELECT_ALL`);
                libOptions.okButtonText = this._translaterService.translate(`${translationPrefix}OK`);
                libOptions.noMatchesFoundText = this._translaterService.translate(`${translationPrefix}NO_MATCHES_FOUND`);
            }
            else {
                libOptions.countSelectedText = (_g = this._locales) === null || _g === void 0 ? void 0 : _g.TEXT_X_OF_Y_SELECTED;
                libOptions.allSelectedText = (_h = this._locales) === null || _h === void 0 ? void 0 : _h.TEXT_ALL_SELECTED;
                libOptions.selectAllText = (_j = this._locales) === null || _j === void 0 ? void 0 : _j.TEXT_SELECT_ALL;
                libOptions.okButtonText = (_k = this._locales) === null || _k === void 0 ? void 0 : _k.TEXT_OK;
                libOptions.noMatchesFoundText = (_l = this._locales) === null || _l === void 0 ? void 0 : _l.TEXT_NO_MATCHES_FOUND;
            }
        }
        // assign the multiple select lib options
        this.defaultOptions = libOptions;
        this.init();
    }
    /** Get the Collection */
    get collection() {
        var _a, _b;
        return (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.collection) !== null && _b !== void 0 ? _b : [];
    }
    /** Getter for the Collection Options */
    get collectionOptions() {
        var _a;
        return (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.collectionOptions;
    }
    /** Get Column Definition object */
    get columnDef() {
        return this.args.column;
    }
    /** Get Column Editor object */
    get columnEditor() {
        var _a, _b;
        return (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.internalColumnEditor) !== null && _b !== void 0 ? _b : {};
    }
    /** Getter for item data context object */
    get dataContext() {
        return this.args.item;
    }
    /** Getter for the Editor DOM Element */
    get editorDomElement() {
        return this.editorElm;
    }
    get isCompositeEditor() {
        var _a;
        return !!((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions);
    }
    /** Getter for the Custom Structure if exist */
    get customStructure() {
        var _a, _b;
        return (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.internalColumnEditor) === null || _b === void 0 ? void 0 : _b.customStructure;
    }
    get hasAutoCommitEdit() {
        var _a;
        return (_a = this.gridOptions.autoCommitEdit) !== null && _a !== void 0 ? _a : false;
    }
    get msInstance() {
        return this._msInstance;
    }
    get selectOptions() {
        return this.defaultOptions;
    }
    /**
     * The current selected values (multiple select) from the collection
     */
    get currentValues() {
        var _a, _b, _c, _d, _e, _f;
        const selectedValues = (_b = (_a = this._msInstance) === null || _a === void 0 ? void 0 : _a.getSelects()) !== null && _b !== void 0 ? _b : [];
        // collection of strings, just return the filtered string that are equals
        if (this.collection.every(x => typeof x === 'number' || typeof x === 'string')) {
            return this.collection.filter(c => selectedValues === null || selectedValues === void 0 ? void 0 : selectedValues.some(val => `${val}` === (c === null || c === void 0 ? void 0 : c.toString())));
        }
        // collection of label/value pair
        const separatorBetweenLabels = (_d = (_c = this.collectionOptions) === null || _c === void 0 ? void 0 : _c.separatorBetweenTextLabels) !== null && _d !== void 0 ? _d : '';
        const isIncludingPrefixSuffix = (_f = (_e = this.collectionOptions) === null || _e === void 0 ? void 0 : _e.includePrefixSuffixToSelectedValues) !== null && _f !== void 0 ? _f : false;
        return this.collection
            .filter(c => selectedValues.some(val => { var _a; return `${val}` === ((_a = c === null || c === void 0 ? void 0 : c[this.valueName]) === null || _a === void 0 ? void 0 : _a.toString()); }))
            .map(c => {
            var _a, _b, _c, _d;
            const labelText = c[this.valueName];
            let prefixText = c[this.labelPrefixName] || '';
            let suffixText = c[this.labelSuffixName] || '';
            // when it's a complex object, then pull the object name only, e.g.: "user.firstName" => "user"
            const fieldName = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.field) !== null && _b !== void 0 ? _b : '';
            // is the field a complex object, "address.streetNumber"
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
            const serializeComplexValueFormat = (_d = (_c = this.columnEditor) === null || _c === void 0 ? void 0 : _c.serializeComplexValueFormat) !== null && _d !== void 0 ? _d : 'object';
            if (isComplexObject && typeof c === 'object' && serializeComplexValueFormat === 'object') {
                return c;
            }
            // also translate prefix/suffix if enableTranslateLabel is true and text is a string
            prefixText = (this.enableTranslateLabel && this._translaterService && prefixText && typeof prefixText === 'string') ? this._translaterService.translate(prefixText || ' ') : prefixText;
            suffixText = (this.enableTranslateLabel && this._translaterService && suffixText && typeof suffixText === 'string') ? this._translaterService.translate(suffixText || ' ') : suffixText;
            if (isIncludingPrefixSuffix) {
                const tmpOptionArray = [prefixText, labelText, suffixText].filter((text) => text); // add to a temp array for joining purpose and filter out empty text
                return tmpOptionArray.join(separatorBetweenLabels);
            }
            return labelText;
        });
    }
    /**
     * The current selected values (single select) from the collection
     */
    get currentValue() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const selectedValues = (_b = (_a = this._msInstance) === null || _a === void 0 ? void 0 : _a.getSelects()) !== null && _b !== void 0 ? _b : [];
        const selectedValue = selectedValues.length ? selectedValues[0] : '';
        const fieldName = (_c = this.columnDef) === null || _c === void 0 ? void 0 : _c.field;
        if (fieldName !== undefined) {
            // collection of strings, just return the filtered string that are equals
            if (this.collection.every(x => typeof x === 'number' || typeof x === 'string')) {
                return findOrDefault(this.collection, (c) => { var _a; return ((_a = c === null || c === void 0 ? void 0 : c.toString) === null || _a === void 0 ? void 0 : _a.call(c)) === `${selectedValue}`; });
            }
            // collection of label/value pair
            const separatorBetweenLabels = (_e = (_d = this.collectionOptions) === null || _d === void 0 ? void 0 : _d.separatorBetweenTextLabels) !== null && _e !== void 0 ? _e : '';
            const isIncludingPrefixSuffix = (_g = (_f = this.collectionOptions) === null || _f === void 0 ? void 0 : _f.includePrefixSuffixToSelectedValues) !== null && _g !== void 0 ? _g : false;
            const itemFound = findOrDefault(this.collection, (c) => { var _a; return c.hasOwnProperty(this.valueName) && ((_a = c[this.valueName]) === null || _a === void 0 ? void 0 : _a.toString()) === `${selectedValue}`; });
            // is the field a complex object, "address.streetNumber"
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
            const serializeComplexValueFormat = (_j = (_h = this.columnEditor) === null || _h === void 0 ? void 0 : _h.serializeComplexValueFormat) !== null && _j !== void 0 ? _j : 'object';
            if (isComplexObject && typeof itemFound === 'object' && serializeComplexValueFormat === 'object') {
                return itemFound;
            }
            else if (itemFound && itemFound.hasOwnProperty(this.valueName)) {
                const labelText = itemFound[this.valueName];
                if (isIncludingPrefixSuffix) {
                    let prefixText = itemFound[this.labelPrefixName] || '';
                    let suffixText = itemFound[this.labelSuffixName] || '';
                    // also translate prefix/suffix if enableTranslateLabel is true and text is a string
                    prefixText = (this.enableTranslateLabel && this._translaterService && prefixText && typeof prefixText === 'string') ? this._translaterService.translate(prefixText || ' ') : prefixText;
                    suffixText = (this.enableTranslateLabel && this._translaterService && suffixText && typeof suffixText === 'string') ? this._translaterService.translate(suffixText || ' ') : suffixText;
                    // add to a temp array for joining purpose and filter out empty text
                    const tmpOptionArray = [prefixText, labelText, suffixText].filter((text) => text);
                    return tmpOptionArray.join(separatorBetweenLabels);
                }
                return labelText;
            }
        }
        return '';
    }
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator() {
        var _a, _b, _c;
        return (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.validator) !== null && _b !== void 0 ? _b : (_c = this.columnDef) === null || _c === void 0 ? void 0 : _c.validator;
    }
    init() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if (!this.columnDef || !this.columnDef.internalColumnEditor || (!this.columnDef.internalColumnEditor.collection && !this.columnDef.internalColumnEditor.collectionAsync)) {
            throw new Error(`[Slickgrid-Universal] You need to pass a "collection" (or "collectionAsync") inside Column Definition Editor for the MultipleSelect/SingleSelect Editor to work correctly.
      Also each option should include a value/label pair (or value/labelKey when using Locale).
      For example: { editor: { collection: [{ value: true, label: 'True' },{ value: false, label: 'False'}] } }`);
        }
        this._collectionService = new CollectionService(this._translaterService);
        this.enableTranslateLabel = (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.enableTranslateLabel) !== null && _b !== void 0 ? _b : false;
        this.labelName = (_d = (_c = this.customStructure) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : 'label';
        this.labelPrefixName = (_f = (_e = this.customStructure) === null || _e === void 0 ? void 0 : _e.labelPrefix) !== null && _f !== void 0 ? _f : 'labelPrefix';
        this.labelSuffixName = (_h = (_g = this.customStructure) === null || _g === void 0 ? void 0 : _g.labelSuffix) !== null && _h !== void 0 ? _h : 'labelSuffix';
        this.optionLabel = (_k = (_j = this.customStructure) === null || _j === void 0 ? void 0 : _j.optionLabel) !== null && _k !== void 0 ? _k : 'value';
        this.valueName = (_m = (_l = this.customStructure) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : 'value';
        if (this.enableTranslateLabel && (!this._translaterService || typeof this._translaterService.translate !== 'function')) {
            throw new Error('[Slickgrid-Universal] requires a Translate Service to be installed and configured when the grid option "enableTranslate" is enabled.');
        }
        // always render the Select (dropdown) DOM element, even if user passed a "collectionAsync",
        // if that is the case, the Select will simply be without any options but we still have to render it (else SlickGrid would throw an error)
        this.renderDomElement(this.collection);
        // when having a collectionAsync and a collection that is empty, we'll toggle the Editor to disabled,
        // it will be re-enabled when we get the collection filled (in slick-vanilla-bundle on method "updateEditorCollection()")
        if (this.disabled || (((_o = this.columnEditor) === null || _o === void 0 ? void 0 : _o.collectionAsync) && Array.isArray(this.collection) && this.collection.length === 0)) {
            this.disable(true);
        }
    }
    getValue() {
        return (this.isMultipleSelect) ? this.currentValues : this.currentValue;
    }
    setValue(value, isApplyingValue = false, triggerOnCompositeEditorChange = true) {
        if (this.isMultipleSelect && Array.isArray(value)) {
            this.loadMultipleValues(value);
        }
        else {
            this.loadSingleValue(value);
        }
        if (isApplyingValue) {
            this.applyValue(this.args.item, this.serializeValue());
            // if it's set by a Composite Editor, then also trigger a change for it
            const compositeEditorOptions = this.args.compositeEditorOptions;
            if (compositeEditorOptions && triggerOnCompositeEditorChange) {
                this.handleChangeOnCompositeEditor(compositeEditorOptions, 'system');
            }
        }
    }
    hide() {
        if (this._msInstance) {
            this._msInstance.close();
        }
    }
    show(openDelay) {
        if (!this.isCompositeEditor && this._msInstance) {
            this._msInstance.open(openDelay);
        }
        else if (this.isCompositeEditor) {
            // when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor
            this.applyInputUsabilityState();
        }
    }
    applyValue(item, state) {
        var _a, _b, _c, _d, _e;
        const fieldName = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.field;
        const fieldType = (_b = this.columnDef) === null || _b === void 0 ? void 0 : _b.type;
        let newValue = state;
        if (fieldName !== undefined) {
            // when the provided user defined the column field type as a possible number then try parsing the state value as that
            if ((fieldType === FieldType.number || fieldType === FieldType.integer || fieldType === FieldType.boolean) && !isNaN(parseFloat(state))) {
                newValue = parseFloat(state);
            }
            // when set as a multiple selection, we can assume that the 3rd party lib multiple-select will return a CSV string
            // we need to re-split that into an array to be the same as the original column
            if (this.isMultipleSelect && typeof state === 'string' && state.indexOf(',') >= 0) {
                newValue = state.split(',');
            }
            // is the field a complex object, "user.address.streetNumber"
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
            // validate the value before applying it (if not valid we'll set an empty string)
            const validation = this.validate(null, newValue);
            newValue = (validation === null || validation === void 0 ? void 0 : validation.valid) ? newValue : '';
            // set the new value to the item datacontext
            if (isComplexObject) {
                // when it's a complex object, user could override the object path (where the editable object is located)
                // else we use the path provided in the Field Column Definition
                const objectPath = (_e = (_d = (_c = this.columnEditor) === null || _c === void 0 ? void 0 : _c.complexObjectPath) !== null && _d !== void 0 ? _d : fieldName) !== null && _e !== void 0 ? _e : '';
                setDeepValue(item, objectPath, newValue);
            }
            else {
                item[fieldName] = newValue;
            }
        }
    }
    destroy() {
        var _a, _b;
        // when autoCommitEdit is enabled, we might end up leaving an editor without it being saved, if so do call a save before destroying
        // this mainly happens doing a blur or focusing on another cell in the grid (it won't come here if we click outside the grid, in the body)
        if (this._msInstance && this.hasAutoCommitEdit && this.isValueChanged() && !this._isDisposingOrCallingSave && !this.isCompositeEditor) {
            this._isDisposingOrCallingSave = true; // change destroying flag to avoid infinite loop
            this.save(true);
        }
        this._isDisposingOrCallingSave = true;
        (_a = this._msInstance) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.editorElm) === null || _b === void 0 ? void 0 : _b.remove();
        this._msInstance = undefined;
    }
    loadValue(item) {
        var _a, _b, _c;
        const fieldName = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.field;
        // is the field a complex object, "address.streetNumber"
        const isComplexObject = fieldName !== undefined && (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
        if (item && fieldName !== undefined) {
            // when it's a complex object, user could override the object path (where the editable object is located)
            // else we use the path provided in the Field Column Definition
            const objectPath = (_c = (_b = this.columnEditor) === null || _b === void 0 ? void 0 : _b.complexObjectPath) !== null && _c !== void 0 ? _c : fieldName;
            const currentValue = (isComplexObject) ? getDescendantProperty(item, objectPath) : (item.hasOwnProperty(fieldName) && item[fieldName]);
            const value = (isComplexObject && (currentValue === null || currentValue === void 0 ? void 0 : currentValue.hasOwnProperty(this.valueName))) ? currentValue[this.valueName] : currentValue;
            if (this.isMultipleSelect && Array.isArray(value)) {
                this.loadMultipleValues(value);
            }
            else {
                this.loadSingleValue(value);
            }
        }
    }
    loadMultipleValues(currentValues) {
        var _a;
        // convert to string because that is how the DOM will return these values
        if (Array.isArray(currentValues)) {
            // keep the default values in memory for references
            this.originalValue = currentValues.map((i) => (typeof i === 'number' || typeof i === 'boolean') ? `${i}` : i);
            (_a = this._msInstance) === null || _a === void 0 ? void 0 : _a.setSelects(this.originalValue);
            // if it's set by a Composite Editor, then also trigger a change for it
            const compositeEditorOptions = this.args.compositeEditorOptions;
            if (compositeEditorOptions) {
                this.handleChangeOnCompositeEditor(compositeEditorOptions);
            }
        }
    }
    loadSingleValue(currentValue) {
        var _a;
        // keep the default value in memory for references
        this.originalValue = (typeof currentValue === 'number' || typeof currentValue === 'boolean') ? `${currentValue}` : currentValue;
        (_a = this._msInstance) === null || _a === void 0 ? void 0 : _a.setSelects([this.originalValue]);
    }
    serializeValue() {
        return (this.isMultipleSelect) ? this.currentValues : this.currentValue;
    }
    /**
     * Dynamically change an Editor option, this is especially useful with Composite Editor
     * since this is the only way to change option after the Editor is created (for example dynamically change "minDate" or another Editor)
     * @param {string} optionName - MultipleSelect option name
     * @param {newValue} newValue - MultipleSelect new option value
     */
    changeEditorOption(optionName, newValue) {
        var _a;
        if (this.columnEditor) {
            if (!this.columnEditor.editorOptions) {
                this.columnEditor.editorOptions = {};
            }
            this.columnEditor.editorOptions[optionName] = newValue;
            this.editorElmOptions = { ...this.editorElmOptions, [optionName]: newValue };
            (_a = this._msInstance) === null || _a === void 0 ? void 0 : _a.refreshOptions(this.editorElmOptions);
        }
    }
    disable(isDisabled = true) {
        const prevIsDisabled = this.disabled;
        this.disabled = isDisabled;
        if (this._msInstance) {
            if (isDisabled) {
                this._msInstance.disable();
                // clear select when it's newly disabled and not yet empty
                const currentValues = this.getValue();
                const isValueBlank = Array.isArray(currentValues) && this.isMultipleSelect ? (currentValues === null || currentValues === void 0 ? void 0 : currentValues[0]) === '' : currentValues === '';
                if (prevIsDisabled !== isDisabled && this.isCompositeEditor && !isValueBlank) {
                    this.reset('', true, true);
                }
            }
            else {
                this._msInstance.enable();
            }
        }
    }
    focus() {
        var _a;
        // always set focus on grid first so that plugin to copy range (SlickCellExternalCopyManager) would still be able to paste at that position
        this.grid.focus();
        (_a = this._msInstance) === null || _a === void 0 ? void 0 : _a.focus();
    }
    isValueChanged() {
        var _a;
        const valueSelection = (_a = this._msInstance) === null || _a === void 0 ? void 0 : _a.getSelects();
        if (this.isMultipleSelect) {
            const isEqual = dequal(valueSelection, this.originalValue);
            return !isEqual;
        }
        const value = Array.isArray(valueSelection) && valueSelection.length > 0 ? valueSelection[0] : undefined;
        return value !== undefined && value !== this.originalValue;
    }
    isValueTouched() {
        return this._isValueTouched;
    }
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value, triggerCompositeEventWhenExist = true, clearByDisableCommand = false) {
        const inputValue = value !== null && value !== void 0 ? value : this.originalValue;
        if (this._msInstance) {
            this.originalValue = this.isMultipleSelect ? (inputValue !== undefined ? [inputValue] : []) : inputValue;
            const selection = this.originalValue === undefined ? [] : [this.originalValue];
            this._msInstance.setSelects(selection);
        }
        this._isValueTouched = false;
        const compositeEditorOptions = this.args.compositeEditorOptions;
        if (compositeEditorOptions && triggerCompositeEventWhenExist) {
            const shouldDeleteFormValue = !clearByDisableCommand;
            this.handleChangeOnCompositeEditor(compositeEditorOptions, 'user', shouldDeleteFormValue);
        }
    }
    save(forceCommitCurrentEdit = false) {
        var _a;
        const validation = this.validate();
        const isValid = (_a = validation === null || validation === void 0 ? void 0 : validation.valid) !== null && _a !== void 0 ? _a : false;
        if ((!this._isDisposingOrCallingSave || forceCommitCurrentEdit) && this.hasAutoCommitEdit && isValid) {
            // do not use args.commitChanges() as this sets the focus to the next row.
            // also the select list will stay shown when clicking off the grid
            this.grid.getEditorLock().commitCurrentEdit();
        }
        else {
            this.args.commitChanges();
        }
    }
    validate(_targetElm, inputValue) {
        var _a, _b;
        const isRequired = this.isCompositeEditor ? false : (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.required;
        const elmValue = (inputValue !== undefined) ? inputValue : (_b = this._msInstance) === null || _b === void 0 ? void 0 : _b.getSelects(); // && this.$editorElm.val && this.$editorElm.val();
        const errorMsg = this.columnEditor && this.columnEditor.errorMessage;
        // when using Composite Editor, we also want to recheck if the field if disabled/enabled since it might change depending on other inputs on the composite form
        if (this.isCompositeEditor) {
            this.applyInputUsabilityState();
        }
        // when field is disabled, we can assume it's valid
        if (this.disabled) {
            return { valid: true, msg: '' };
        }
        if (this.validator) {
            const value = (inputValue !== undefined) ? inputValue : (this.isMultipleSelect ? this.currentValues : this.currentValue);
            return this.validator(value, this.args);
        }
        // by default the editor is almost always valid (except when it's required but not provided)
        if (isRequired && (elmValue === '' || (Array.isArray(elmValue) && elmValue.length === 0))) {
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
    /**
     * user might want to filter certain items of the collection
     * @param inputCollection
     * @return outputCollection filtered and/or sorted collection
     */
    filterCollection(inputCollection) {
        var _a, _b;
        let outputCollection = inputCollection;
        // user might want to filter certain items of the collection
        if (this.columnEditor && this.columnEditor.collectionFilterBy) {
            const filterBy = this.columnEditor.collectionFilterBy;
            const filterCollectionBy = (_b = (_a = this.columnEditor.collectionOptions) === null || _a === void 0 ? void 0 : _a.filterResultAfterEachPass) !== null && _b !== void 0 ? _b : null;
            outputCollection = this._collectionService.filterCollection(outputCollection, filterBy, filterCollectionBy);
        }
        return outputCollection;
    }
    /**
     * user might want to sort the collection in a certain way
     * @param inputCollection
     * @return outputCollection filtered and/or sorted collection
     */
    sortCollection(inputCollection) {
        let outputCollection = inputCollection;
        // user might want to sort the collection
        if (this.columnDef && this.columnEditor && this.columnEditor.collectionSortBy) {
            const sortBy = this.columnEditor.collectionSortBy;
            outputCollection = this._collectionService.sortCollection(this.columnDef, outputCollection, sortBy, this.enableTranslateLabel);
        }
        return outputCollection;
    }
    renderDomElement(inputCollection) {
        var _a, _b, _c, _d, _e;
        if (!Array.isArray(inputCollection) && ((_a = this.collectionOptions) === null || _a === void 0 ? void 0 : _a.collectionInsideObjectProperty)) {
            const collectionInsideObjectProperty = this.collectionOptions.collectionInsideObjectProperty;
            inputCollection = getDescendantProperty(inputCollection, collectionInsideObjectProperty);
        }
        if (!Array.isArray(inputCollection)) {
            throw new Error('The "collection" passed to the Select Editor is not a valid array.');
        }
        // make a copy of the collection so that we don't impact SelectFilter, this could happen when calling "addBlankEntry" or "addCustomFirstEntry"
        let collection = [];
        if (inputCollection.length > 0) {
            collection = [...inputCollection];
        }
        // user can optionally add a blank entry at the beginning of the collection
        // make sure however that it wasn't added more than once
        if (((_b = this.collectionOptions) === null || _b === void 0 ? void 0 : _b.addBlankEntry) && Array.isArray(collection) && collection.length > 0 && collection[0][this.valueName] !== '') {
            collection.unshift(this.createBlankEntry());
            this.collection.unshift(this.createBlankEntry()); // also make the change on the original collection
        }
        // user can optionally add his own custom entry at the beginning of the collection
        if (((_c = this.collectionOptions) === null || _c === void 0 ? void 0 : _c.addCustomFirstEntry) && Array.isArray(collection) && collection.length > 0 && collection[0][this.valueName] !== this.collectionOptions.addCustomFirstEntry[this.valueName]) {
            collection.unshift(this.collectionOptions.addCustomFirstEntry);
            this.collection.unshift(this.collectionOptions.addCustomFirstEntry); // also make the change on the original collection
        }
        // user can optionally add his own custom entry at the end of the collection
        if (((_d = this.collectionOptions) === null || _d === void 0 ? void 0 : _d.addCustomLastEntry) && Array.isArray(collection) && collection.length > 0) {
            const lastCollectionIndex = collection.length - 1;
            if (collection[lastCollectionIndex][this.valueName] !== this.collectionOptions.addCustomLastEntry[this.valueName]) {
                collection.push(this.collectionOptions.addCustomLastEntry);
            }
        }
        // assign the collection to a temp variable before filtering/sorting the collection
        let finalCollection = collection;
        // user might want to filter and/or sort certain items of the collection
        finalCollection = this.filterCollection(finalCollection);
        finalCollection = this.sortCollection(finalCollection);
        // user could also override the collection
        if ((_e = this.columnEditor) === null || _e === void 0 ? void 0 : _e.collectionOverride) {
            const overrideArgs = { column: this.columnDef, dataContext: this.dataContext, grid: this.grid, originalCollections: this.collection };
            if (this.args.compositeEditorOptions) {
                const { formValues, modalType } = this.args.compositeEditorOptions;
                overrideArgs.compositeEditorOptions = { formValues, modalType };
            }
            finalCollection = this.columnEditor.collectionOverride(finalCollection, overrideArgs);
        }
        // keep reference of the final collection displayed in the UI
        this.finalCollection = finalCollection;
        // step 1, create HTML string template
        const selectBuildResult = buildMultipleSelectDataCollection('editor', finalCollection, this.columnDef, this.grid, this.isMultipleSelect, this._translaterService);
        // step 2, create the DOM Element of the editor
        // we will later also subscribe to the onClose event to save the Editor whenever that event is triggered
        this.createDomElement(selectBuildResult.selectElement, selectBuildResult.dataCollection);
    }
    /** Create a blank entry that can be added to the collection. It will also reuse the same collection structure provided by the user */
    createBlankEntry() {
        const blankEntry = {
            [this.labelName]: '',
            [this.valueName]: ''
        };
        if (this.labelPrefixName) {
            blankEntry[this.labelPrefixName] = '';
        }
        if (this.labelSuffixName) {
            blankEntry[this.labelSuffixName] = '';
        }
        return blankEntry;
    }
    /**
     * From the Select DOM Element created earlier, create a Multiple/Single Select Editor using the multiple-select-vanilla.js lib
     * @param {Object} selectElement
     */
    createDomElement(selectElement, dataCollection) {
        var _a, _b, _c, _d, _e;
        const cellContainer = this.args.container;
        if (selectElement && cellContainer && typeof cellContainer.appendChild === 'function') {
            emptyElement(cellContainer);
            cellContainer.appendChild(selectElement);
        }
        // add placeholder when found
        const placeholder = (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.placeholder) !== null && _b !== void 0 ? _b : '';
        this.defaultOptions.placeholder = placeholder || '';
        const editorOptions = (_e = (_d = (_c = this.columnDef) === null || _c === void 0 ? void 0 : _c.internalColumnEditor) === null || _d === void 0 ? void 0 : _d.editorOptions) !== null && _e !== void 0 ? _e : {};
        this.editorElmOptions = { ...this.defaultOptions, ...editorOptions, data: dataCollection };
        this._msInstance = multipleSelect(selectElement, this.editorElmOptions);
        this.editorElm = this._msInstance.getParentElement();
        if (!this.isCompositeEditor) {
            this.delayOpening >= 0 ? setTimeout(() => this.show()) : this.show();
        }
    }
    handleChangeOnCompositeEditor(compositeEditorOptions, triggeredBy = 'user', isCalledByClearValue = false) {
        var _a, _b, _c, _d, _e;
        const activeCell = this.grid.getActiveCell();
        const column = this.args.column;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        const item = this.dataContext;
        const grid = this.grid;
        const newValues = this.serializeValue();
        // when valid, we'll also apply the new value to the dataContext item object
        if (this.validate().valid) {
            this.applyValue(this.dataContext, newValues);
        }
        this.applyValue(compositeEditorOptions.formValues, newValues);
        const isExcludeDisabledFieldFormValues = (_e = (_d = (_c = this.gridOptions) === null || _c === void 0 ? void 0 : _c.compositeEditorOptions) === null || _d === void 0 ? void 0 : _d.excludeDisabledFieldFormValues) !== null && _e !== void 0 ? _e : false;
        if (isCalledByClearValue || (this.disabled && isExcludeDisabledFieldFormValues && compositeEditorOptions.formValues.hasOwnProperty(columnId))) {
            delete compositeEditorOptions.formValues[columnId]; // when the input is disabled we won't include it in the form result object
        }
        grid.onCompositeEditorChange.notify({ ...activeCell, item, grid, column, formValues: compositeEditorOptions.formValues, editors: compositeEditorOptions.editors, triggeredBy }, new Slick.EventData());
    }
}
//# sourceMappingURL=selectEditor.js.map