"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LongTextEditor = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const constants_1 = require("./../constants");
const keyCode_enum_1 = require("../enums/keyCode.enum");
const domUtilities_1 = require("../services/domUtilities");
const utilities_1 = require("../services/utilities");
const bindingEvent_service_1 = require("../services/bindingEvent.service");
const textValidator_1 = require("../editorValidators/textValidator");
/*
 * An example of a 'detached' editor.
 * The UI is added onto document BODY and .position(), .show() and .hide() are implemented.
 * KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
 */
class LongTextEditor {
    constructor(args) {
        this.args = args;
        this._isValueTouched = false;
        /** is the Editor disabled? */
        this.disabled = false;
        if (!args) {
            throw new Error('[Slickgrid-Universal] Something is wrong with this grid, an Editor must always have valid arguments.');
        }
        this.grid = args.grid;
        this.gridOptions = args.grid && args.grid.getOptions();
        const options = this.gridOptions || this.args.column.params || {};
        if (options === null || options === void 0 ? void 0 : options.translater) {
            this._translater = options.translater;
        }
        // get locales provided by user in forRoot or else use default English locales via the Constants
        this._locales = this.gridOptions && this.gridOptions.locales || constants_1.Constants.locales;
        this._bindEventService = new bindingEvent_service_1.BindingEventService();
        this.init();
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
    /** Getter for the item data context object */
    get dataContext() {
        return this.args.item;
    }
    /** Getter for the Editor DOM Element */
    get editorDomElement() {
        return this._textareaElm;
    }
    get editorOptions() {
        var _a, _b;
        return (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.editorOptions) !== null && _b !== void 0 ? _b : {};
    }
    get hasAutoCommitEdit() {
        var _a, _b;
        return (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.autoCommitEdit) !== null && _b !== void 0 ? _b : false;
    }
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator() {
        var _a, _b, _c;
        return (_b = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.validator) !== null && _b !== void 0 ? _b : (_c = this.columnDef) === null || _c === void 0 ? void 0 : _c.validator;
    }
    init() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        let cancelText = '';
        let saveText = '';
        if (this._translater && this._translater.translate && this.gridOptions.enableTranslate) {
            const translationPrefix = (0, utilities_1.getTranslationPrefix)(this.gridOptions);
            const cancelKey = (_b = (_a = this.editorOptions.buttonTexts) === null || _a === void 0 ? void 0 : _a.cancelKey) !== null && _b !== void 0 ? _b : `${translationPrefix}CANCEL`;
            const saveKey = (_d = (_c = this.editorOptions.buttonTexts) === null || _c === void 0 ? void 0 : _c.saveKey) !== null && _d !== void 0 ? _d : `${translationPrefix}SAVE`;
            cancelText = this._translater.translate(`${translationPrefix}${cancelKey}`);
            saveText = this._translater.translate(`${translationPrefix}${saveKey}`);
        }
        else {
            cancelText = (_h = (_f = (_e = this.editorOptions.buttonTexts) === null || _e === void 0 ? void 0 : _e.cancel) !== null && _f !== void 0 ? _f : (_g = this._locales) === null || _g === void 0 ? void 0 : _g.TEXT_CANCEL) !== null && _h !== void 0 ? _h : 'Cancel';
            saveText = (_m = (_k = (_j = this.editorOptions.buttonTexts) === null || _j === void 0 ? void 0 : _j.save) !== null && _k !== void 0 ? _k : (_l = this._locales) === null || _l === void 0 ? void 0 : _l.TEXT_SAVE) !== null && _m !== void 0 ? _m : 'Save';
        }
        const compositeEditorOptions = this.args.compositeEditorOptions;
        const columnId = (_p = (_o = this.columnDef) === null || _o === void 0 ? void 0 : _o.id) !== null && _p !== void 0 ? _p : '';
        const maxLength = (_q = this.columnEditor) === null || _q === void 0 ? void 0 : _q.maxLength;
        const textAreaRows = (_s = (_r = this.editorOptions) === null || _r === void 0 ? void 0 : _r.rows) !== null && _s !== void 0 ? _s : 4;
        const containerElm = compositeEditorOptions ? this.args.container : document.body;
        this._wrapperElm = (0, domUtilities_1.createDomElement)('div', {
            className: `slick-large-editor-text editor-${columnId}`,
            style: { position: compositeEditorOptions ? 'relative' : 'absolute' }
        });
        containerElm.appendChild(this._wrapperElm);
        // use textarea row if defined but don't go over 3 rows with composite editor modal
        this._textareaElm = (0, domUtilities_1.createDomElement)('textarea', {
            ariaLabel: (_u = (_t = this.columnEditor) === null || _t === void 0 ? void 0 : _t.ariaLabel) !== null && _u !== void 0 ? _u : `${(0, utils_1.toSentenceCase)(columnId + '')} Text Editor`,
            cols: (_w = (_v = this.editorOptions) === null || _v === void 0 ? void 0 : _v.cols) !== null && _w !== void 0 ? _w : 40,
            rows: (compositeEditorOptions && textAreaRows > 3) ? 3 : textAreaRows,
            placeholder: (_y = (_x = this.columnEditor) === null || _x === void 0 ? void 0 : _x.placeholder) !== null && _y !== void 0 ? _y : '',
            title: (_0 = (_z = this.columnEditor) === null || _z === void 0 ? void 0 : _z.title) !== null && _0 !== void 0 ? _0 : '',
        }, this._wrapperElm);
        const editorFooterElm = (0, domUtilities_1.createDomElement)('div', { className: 'editor-footer' });
        const countContainerElm = (0, domUtilities_1.createDomElement)('span', { className: 'counter' });
        this._currentLengthElm = (0, domUtilities_1.createDomElement)('span', { className: 'text-length', textContent: '0' });
        countContainerElm.appendChild(this._currentLengthElm);
        if (maxLength !== undefined) {
            countContainerElm.appendChild((0, domUtilities_1.createDomElement)('span', { className: 'separator', textContent: '/' }));
            countContainerElm.appendChild((0, domUtilities_1.createDomElement)('span', { className: 'max-length', textContent: `${maxLength}` }));
        }
        editorFooterElm.appendChild(countContainerElm);
        if (!compositeEditorOptions) {
            const cancelBtnElm = (0, domUtilities_1.createDomElement)('button', { className: 'btn btn-cancel btn-default btn-xs', textContent: cancelText }, editorFooterElm);
            const saveBtnElm = (0, domUtilities_1.createDomElement)('button', { className: 'btn btn-save btn-primary btn-xs', textContent: saveText }, editorFooterElm);
            this._bindEventService.bind(cancelBtnElm, 'click', this.cancel.bind(this));
            this._bindEventService.bind(saveBtnElm, 'click', this.save.bind(this));
            this.position((_1 = this.args) === null || _1 === void 0 ? void 0 : _1.position);
            this._textareaElm.focus();
            this._textareaElm.select();
        }
        this._wrapperElm.appendChild(editorFooterElm);
        this._bindEventService.bind(this._textareaElm, 'keydown', this.handleKeyDown.bind(this));
        this._bindEventService.bind(this._textareaElm, 'input', this.handleOnInputChange.bind(this));
        this._bindEventService.bind(this._textareaElm, 'paste', this.handleOnInputChange.bind(this));
    }
    cancel() {
        var _a;
        const value = this._defaultTextValue || '';
        this._textareaElm.value = value;
        this._currentLengthElm.textContent = `${value.length}`;
        if ((_a = this.args) === null || _a === void 0 ? void 0 : _a.cancelChanges) {
            this.args.cancelChanges();
        }
    }
    hide() {
        this._wrapperElm.style.display = 'none';
    }
    show() {
        var _a;
        const isCompositeEditor = !!((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions);
        if (!isCompositeEditor) {
            this._wrapperElm.style.display = 'block';
        }
        else {
            // when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor
            this.applyInputUsabilityState();
        }
    }
    destroy() {
        var _a, _b;
        this._bindEventService.unbindAll();
        (_b = (_a = this._wrapperElm) === null || _a === void 0 ? void 0 : _a.remove) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    disable(isDisabled = true) {
        var _a;
        const prevIsDisabled = this.disabled;
        this.disabled = isDisabled;
        if (this._textareaElm && this._wrapperElm) {
            if (isDisabled) {
                this._textareaElm.disabled = true;
                this._wrapperElm.classList.add('disabled');
                // clear value when it's newly disabled and not empty
                const currentValue = this.getValue();
                if (prevIsDisabled !== isDisabled && ((_a = this.args) === null || _a === void 0 ? void 0 : _a.compositeEditorOptions) && currentValue !== '') {
                    this.reset('', true, true);
                }
            }
            else {
                this._textareaElm.disabled = false;
                this._wrapperElm.classList.remove('disabled');
            }
        }
    }
    focus() {
        // always set focus on grid first so that plugin to copy range (SlickCellExternalCopyManager) would still be able to paste at that position
        this.grid.focus();
        if (this._textareaElm) {
            this._textareaElm.focus();
            this._textareaElm.select();
        }
    }
    getValue() {
        return this._textareaElm.value;
    }
    setValue(val, isApplyingValue = false, triggerOnCompositeEditorChange = true) {
        this._textareaElm.value = val;
        this._currentLengthElm.textContent = `${val.length}`;
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
        var _a, _b, _c, _d;
        const fieldName = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.field;
        if (fieldName !== undefined) {
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0; // is the field a complex object, "address.streetNumber"
            // validate the value before applying it (if not valid we'll set an empty string)
            const validation = this.validate(undefined, state);
            const newValue = (validation && validation.valid) ? state : '';
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
        const elmValue = this._textareaElm.value;
        return (!(elmValue === '' && (this._defaultTextValue === null || this._defaultTextValue === undefined))) && (elmValue !== this._defaultTextValue);
    }
    isValueTouched() {
        return this._isValueTouched;
    }
    loadValue(item) {
        var _a;
        const fieldName = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.field;
        if (item && fieldName !== undefined) {
            // is the field a complex object, "address.streetNumber"
            const isComplexObject = (fieldName === null || fieldName === void 0 ? void 0 : fieldName.indexOf('.')) > 0;
            const value = (isComplexObject) ? (0, utilities_1.getDescendantProperty)(item, fieldName) : item[fieldName];
            this._defaultTextValue = value || '';
            this._textareaElm.value = this._defaultTextValue;
            this._currentLengthElm.textContent = this._defaultTextValue.length;
            this._textareaElm.defaultValue = this._defaultTextValue;
            this._textareaElm.select();
        }
    }
    /**
     * Reposition the LongText Editor to be right over the cell, so that it looks like we opened the editor on top of the cell when in reality we just reposition (absolute) over the cell.
     * By default we use an "auto" mode which will allow to position the LongText Editor to the best logical position in the window, also when we say position, we are talking about the relative position against the grid cell.
     * We can assume that in 80% of the time the default position is bottom right, the default is "auto" but we can also override this and use a specific position.
     * Most of the time positioning of the editor will be to the "right" of the cell is ok but if our column is completely on the right side then we'll want to change the position to "left" align.
     * Same goes for the top/bottom position, Most of the time positioning the editor to the "bottom" but we are clicking on a cell at the bottom of the grid then we might need to reposition to "top" instead.
     * NOTE: this only applies to Inline Editing and will not have any effect when using the Composite Editor modal window.
     */
    position(parentPosition) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const containerOffset = (0, domUtilities_1.getHtmlElementOffset)(this.args.container);
        const containerHeight = this.args.container.offsetHeight;
        const containerWidth = this.args.container.offsetWidth;
        const calculatedEditorHeight = this._wrapperElm.getBoundingClientRect().height || this.args.position.height;
        const calculatedEditorWidth = this._wrapperElm.getBoundingClientRect().width || this.args.position.width;
        const calculatedBodyHeight = document.body.offsetHeight || window.innerHeight; // body height/width might be 0 if so use the window height/width
        const calculatedBodyWidth = document.body.offsetWidth || window.innerWidth;
        // first defined position will be bottom/right (which will position the editor completely over the cell)
        let newPositionTop = (_b = (_a = containerOffset === null || containerOffset === void 0 ? void 0 : containerOffset.top) !== null && _a !== void 0 ? _a : parentPosition.top) !== null && _b !== void 0 ? _b : 0;
        let newPositionLeft = (_d = (_c = containerOffset === null || containerOffset === void 0 ? void 0 : containerOffset.left) !== null && _c !== void 0 ? _c : parentPosition.left) !== null && _d !== void 0 ? _d : 0;
        // user could explicitely use a "left" position (when user knows his column is completely on the right)
        // or when using "auto" and we detect not enough available space then we'll position to the "left" of the cell
        const position = (_f = (_e = this.editorOptions) === null || _e === void 0 ? void 0 : _e.position) !== null && _f !== void 0 ? _f : 'auto';
        if (position === 'left' || (position === 'auto' && (newPositionLeft + calculatedEditorWidth) > calculatedBodyWidth)) {
            const marginRightAdjustment = (_h = (_g = this.editorOptions) === null || _g === void 0 ? void 0 : _g.marginRight) !== null && _h !== void 0 ? _h : 0;
            newPositionLeft -= (calculatedEditorWidth - containerWidth + marginRightAdjustment);
        }
        // do the same calculation/reposition with top/bottom (default is bottom of the cell or in other word starting from the cell going down)
        if (position === 'top' || (position === 'auto' && (newPositionTop + calculatedEditorHeight) > calculatedBodyHeight)) {
            newPositionTop -= (calculatedEditorHeight - containerHeight);
        }
        // reposition the editor over the cell (90% of the time this will end up using a position on the "right" of the cell)
        this._wrapperElm.style.top = `${newPositionTop}px`;
        this._wrapperElm.style.left = `${newPositionLeft}px`;
    }
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value, triggerCompositeEventWhenExist = true, clearByDisableCommand = false) {
        var _a;
        const inputValue = (_a = value !== null && value !== void 0 ? value : this._defaultTextValue) !== null && _a !== void 0 ? _a : '';
        if (this._textareaElm) {
            this._defaultTextValue = inputValue;
            this._textareaElm.value = inputValue;
            this._currentLengthElm.textContent = inputValue.length;
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
        return this._textareaElm.value;
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
        const elmValue = (inputValue !== undefined) ? inputValue : (_a = this._textareaElm) === null || _a === void 0 ? void 0 : _a.value;
        return (0, textValidator_1.textValidator)(elmValue, {
            editorArgs: this.args,
            errorMessage: this.columnEditor.errorMessage,
            minLength: this.columnEditor.minLength,
            maxLength: this.columnEditor.maxLength,
            operatorConditionalType: this.columnEditor.operatorConditionalType,
            required: ((_b = this.args) === null || _b === void 0 ? void 0 : _b.compositeEditorOptions) ? false : this.columnEditor.required,
            validator: this.validator,
        });
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
    handleKeyDown(event) {
        var _a;
        const keyCode = (_a = event.keyCode) !== null && _a !== void 0 ? _a : event.code;
        this._isValueTouched = true;
        if (!this.args.compositeEditorOptions) {
            if ((keyCode === keyCode_enum_1.KeyCode.ENTER && event.ctrlKey) || (event.ctrlKey && event.key.toUpperCase() === 'S')) {
                event.preventDefault();
                this.save();
            }
            else if (keyCode === keyCode_enum_1.KeyCode.ESCAPE) {
                event.preventDefault();
                this.cancel();
            }
            else if (keyCode === keyCode_enum_1.KeyCode.TAB && event.shiftKey) {
                event.preventDefault();
                if (this.args && this.grid) {
                    this.grid.navigatePrev();
                }
            }
            else if (keyCode === keyCode_enum_1.KeyCode.TAB) {
                event.preventDefault();
                if (this.args && this.grid) {
                    this.grid.navigateNext();
                }
            }
        }
    }
    /** On every input change event, we'll update the current text length counter */
    handleOnInputChange(event) {
        var _a, _b, _c;
        const compositeEditorOptions = this.args.compositeEditorOptions;
        const maxLength = (_a = this.columnEditor) === null || _a === void 0 ? void 0 : _a.maxLength;
        // when user defines a maxLength, we'll make sure that it doesn't go over this limit if so then truncate the text (disregard the extra text)
        let isTruncated = false;
        if (maxLength) {
            isTruncated = this.truncateText(this._textareaElm, maxLength);
        }
        // if the text get truncated then update text length as maxLength, else update text length with actual
        if (isTruncated) {
            this._currentLengthElm.textContent = `${maxLength}`;
        }
        else {
            const newText = event.type === 'paste' ? event.clipboardData.getData('text') : event.target.value;
            this._currentLengthElm.textContent = `${newText.length}`;
        }
        // when using a Composite Editor, we'll want to add a debounce delay to avoid perf issue since Composite could affect other editors in the same form
        if (compositeEditorOptions) {
            const typingDelay = (_c = (_b = this.gridOptions) === null || _b === void 0 ? void 0 : _b.editorTypingDebounce) !== null && _c !== void 0 ? _c : 500;
            clearTimeout(this._timer);
            this._timer = setTimeout(() => this.handleChangeOnCompositeEditor(event, compositeEditorOptions), typingDelay);
        }
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
    /**
     * Truncate text if the value is longer than the acceptable max length
     * @param inputElm - textarea html element
     * @param maxLength - max acceptable length
     * @returns truncated - returns True if it truncated or False otherwise
     */
    truncateText(inputElm, maxLength) {
        const text = inputElm.value + '';
        if (text.length > maxLength) {
            inputElm.value = text.substring(0, maxLength);
            return true;
        }
        return false;
    }
}
exports.LongTextEditor = LongTextEditor;
//# sourceMappingURL=longTextEditor.js.map