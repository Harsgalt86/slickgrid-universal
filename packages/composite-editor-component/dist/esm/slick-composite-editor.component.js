import { deepCopy, deepMerge, emptyObject, setDeepValue } from '@slickgrid-universal/utils';
import { BindingEventService, Constants, createDomElement, getDescendantProperty, numericSortComparer, sanitizeTextByAvailableSanitizer, SortDirectionNumber, } from '@slickgrid-universal/common';
import { CompositeEditor } from './compositeEditor.factory';
const DEFAULT_ON_ERROR = (error) => console.log(error.message);
export class SlickCompositeEditorComponent {
    get eventHandler() {
        return this._eventHandler;
    }
    get dataView() {
        return this.grid.getData();
    }
    get dataViewLength() {
        return this.dataView.getLength();
    }
    get formValues() {
        return this._formValues;
    }
    get editors() {
        return this._editors;
    }
    set editors(editors) {
        this._editors = editors;
    }
    get gridOptions() {
        var _a;
        return (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getOptions();
    }
    constructor() {
        this._columnDefinitions = [];
        this._lastActiveRowNumber = -1;
        this._formValues = null;
        this.gridService = null;
        this._eventHandler = new Slick.EventHandler();
        this._bindEventService = new BindingEventService();
    }
    /**
     * initialize the Composite Editor by passing the SlickGrid object and the container service
     *
     * Note: we aren't using DI in the constructor simply to be as framework agnostic as possible,
     * we are simply using this init() function with a very basic container service to do the job
     */
    init(grid, containerService) {
        var _a, _b;
        this.grid = grid;
        this.gridService = containerService.get('GridService');
        this.translaterService = containerService.get('TranslaterService');
        if (!this.gridService) {
            throw new Error('[Slickgrid-Universal] it seems that the GridService is not being loaded properly, make sure the Container Service is properly implemented.');
        }
        if (this.gridOptions.enableTranslate && (!this.translaterService || !this.translaterService.translate)) {
            throw new Error('[Slickgrid-Universal] requires a Translate Service to be installed and configured when the grid option "enableTranslate" is enabled.');
        }
        // get locales provided by user in forRoot or else use default English locales via the Constants
        this._locales = (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.locales) !== null && _b !== void 0 ? _b : Constants.locales;
    }
    /** Dispose of the Component & unsubscribe all events */
    dispose() {
        this._eventHandler.unsubscribeAll();
        this._bindEventService.unbindAll();
        this._formValues = null;
        this.disposeComponent();
    }
    /** Dispose of the Component without unsubscribing any events */
    disposeComponent() {
        var _a, _b, _c;
        // protected _editorContainers!: Array<HTMLElement | null>;
        (_a = this._modalBodyTopValidationElm) === null || _a === void 0 ? void 0 : _a.remove();
        (_b = this._modalSaveButtonElm) === null || _b === void 0 ? void 0 : _b.remove();
        if (typeof ((_c = this._modalElm) === null || _c === void 0 ? void 0 : _c.remove) === 'function') {
            this._modalElm.remove();
            // remove the body backdrop click listener, every other listeners will be dropped automatically since we destroy the component
            document.body.classList.remove('slick-modal-open');
        }
        this._editorContainers = [];
    }
    /**
     * Dynamically change value of an input from the Composite Editor form.
     *
     * NOTE: user might get an error thrown when trying to apply a value on a Composite Editor that was not found in the form,
     * but in some cases the user might still want the value to be applied to the formValues so that it will be sent to the save in final item data context
     * and when that happens, you can just skip that error so it won't throw.
     * @param {String | Column} columnIdOrDef - column id or column definition
     * @param {*} newValue - the new value
     * @param {Boolean} skipMissingEditorError - defaults to False, skipping the error when the Composite Editor was not found will allow to still apply the value into the formValues object
     * @param {Boolean} triggerOnCompositeEditorChange - defaults to True, will this change trigger a onCompositeEditorChange event?
     */
    changeFormInputValue(columnIdOrDef, newValue, skipMissingEditorError = false, triggerOnCompositeEditorChange = true) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o;
        const columnDef = this.getColumnByObjectOrId(columnIdOrDef);
        const columnId = typeof columnIdOrDef === 'string' ? columnIdOrDef : (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.id) !== null && _a !== void 0 ? _a : '';
        const editor = (_b = this._editors) === null || _b === void 0 ? void 0 : _b[columnId];
        let outputValue = newValue;
        if (!editor && !skipMissingEditorError) {
            throw new Error(`Composite Editor with column id "${columnId}" not found.`);
        }
        if (typeof (editor === null || editor === void 0 ? void 0 : editor.setValue) === 'function' && Array.isArray(this._editorContainers)) {
            editor.setValue(newValue, true, triggerOnCompositeEditorChange);
            const editorContainerElm = this._editorContainers.find(editorElm => editorElm.dataset.editorid === columnId);
            const excludeDisabledFieldFormValues = (_f = (_d = (_c = this.gridOptions) === null || _c === void 0 ? void 0 : _c.compositeEditorOptions) === null || _d === void 0 ? void 0 : _d.excludeDisabledFieldFormValues) !== null && _f !== void 0 ? _f : false;
            if (!editor.disabled || (editor.disabled && !excludeDisabledFieldFormValues)) {
                (_g = editorContainerElm === null || editorContainerElm === void 0 ? void 0 : editorContainerElm.classList) === null || _g === void 0 ? void 0 : _g.add('modified');
            }
            else {
                outputValue = '';
                (_h = editorContainerElm === null || editorContainerElm === void 0 ? void 0 : editorContainerElm.classList) === null || _h === void 0 ? void 0 : _h.remove('modified');
            }
            // when the field is disabled, we will only allow a blank value anything else will be disregarded
            if (editor.disabled && (outputValue !== '' || outputValue !== null || outputValue !== undefined || outputValue !== 0)) {
                outputValue = '';
            }
        }
        // is the field a complex object, like "address.streetNumber"
        // we'll set assign the value as a complex object following the `field` dot notation
        const fieldName = (_j = columnDef === null || columnDef === void 0 ? void 0 : columnDef.field) !== null && _j !== void 0 ? _j : '';
        if (columnDef && (fieldName === null || fieldName === void 0 ? void 0 : fieldName.includes('.'))) {
            // when it's a complex object, user could override the object path (where the editable object is located)
            // else we use the path provided in the Field Column Definition
            const objectPath = (_m = (_l = (_k = columnDef.internalColumnEditor) === null || _k === void 0 ? void 0 : _k.complexObjectPath) !== null && _l !== void 0 ? _l : fieldName) !== null && _m !== void 0 ? _m : '';
            setDeepValue((_o = this._formValues) !== null && _o !== void 0 ? _o : {}, objectPath, newValue);
        }
        else {
            this._formValues = { ...this._formValues, [columnId]: outputValue };
        }
    }
    /**
     * Dynamically update the `formValues` object directly without triggering the onCompositeEditorChange event.
     * The fact that this doesn't trigger an event, might not always be good though, in these cases you are probably better with using the changeFormInputValue() method
     * @param {String | Column} columnIdOrDef - column id or column definition
     * @param {*} newValue - the new value
     */
    changeFormValue(columnIdOrDef, newValue) {
        var _a, _b, _c, _d, _f;
        const columnDef = this.getColumnByObjectOrId(columnIdOrDef);
        const columnId = typeof columnIdOrDef === 'string' ? columnIdOrDef : (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.id) !== null && _a !== void 0 ? _a : '';
        // is the field a complex object, like "address.streetNumber"
        // we'll set assign the value as a complex object following the `field` dot notation
        const fieldName = (_b = columnDef === null || columnDef === void 0 ? void 0 : columnDef.field) !== null && _b !== void 0 ? _b : columnIdOrDef;
        if (fieldName === null || fieldName === void 0 ? void 0 : fieldName.includes('.')) {
            // when it's a complex object, user could override the object path (where the editable object is located)
            // else we use the path provided in the Field Column Definition
            const objectPath = (_f = (_d = (_c = columnDef === null || columnDef === void 0 ? void 0 : columnDef.internalColumnEditor) === null || _c === void 0 ? void 0 : _c.complexObjectPath) !== null && _d !== void 0 ? _d : fieldName) !== null && _f !== void 0 ? _f : '';
            setDeepValue(this._formValues, objectPath, newValue);
        }
        else {
            this._formValues = { ...this._formValues, [columnId]: newValue };
        }
        this._formValues = deepMerge({}, this._itemDataContext, this._formValues);
    }
    /**
     * Dynamically change an Editor option of the Composite Editor form
     * For example, a use case could be to dynamically change the "minDate" of another Date Editor in the Composite Editor form.
     * @param {String} columnId - column id
     * @param {*} newValue - the new value
     */
    changeFormEditorOption(columnId, optionName, newOptionValue) {
        var _a;
        const editor = (_a = this._editors) === null || _a === void 0 ? void 0 : _a[columnId];
        // change an Editor option (not all Editors have that method, so make sure it exists before trying to call it)
        if (editor === null || editor === void 0 ? void 0 : editor.changeEditorOption) {
            editor.changeEditorOption(optionName, newOptionValue);
        }
        else {
            throw new Error(`Editor with column id "${columnId}" not found OR the Editor does not support "changeEditorOption" (current only available with AutoComplete, Date, MultipleSelect & SingleSelect Editors).`);
        }
    }
    /**
     * Disable (or enable) an input of the Composite Editor form
     * @param {String} columnId - column definition id
     * @param isDisabled - defaults to True, are we disabling the associated form input
     */
    disableFormInput(columnId, isDisabled = true) {
        var _a;
        const editor = (_a = this._editors) === null || _a === void 0 ? void 0 : _a[columnId];
        if ((editor === null || editor === void 0 ? void 0 : editor.disable) && Array.isArray(this._editorContainers)) {
            editor.disable(isDisabled);
        }
    }
    /** Entry point to initialize and open the Composite Editor modal window */
    openDetails(options) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const onError = (_a = options.onError) !== null && _a !== void 0 ? _a : DEFAULT_ON_ERROR;
        const defaultOptions = {
            backdrop: 'static',
            showCloseButtonOutside: true,
            shouldClearRowSelectionAfterMassAction: true,
            viewColumnLayout: 'auto',
            modalType: 'edit',
        };
        try {
            if (!this.grid || (this.grid.getEditorLock().isActive() && !this.grid.getEditorLock().commitCurrentEdit())) {
                return null;
            }
            this._formValues = null; // make sure there's no leftover from previous change
            this._options = { ...defaultOptions, ...this.gridOptions.compositeEditorOptions, ...options, labels: { ...(_b = this.gridOptions.compositeEditorOptions) === null || _b === void 0 ? void 0 : _b.labels, ...options === null || options === void 0 ? void 0 : options.labels } }; // merge default options with user options
            this._options.backdrop = options.backdrop !== undefined ? options.backdrop : 'static';
            const viewColumnLayout = this._options.viewColumnLayout || 1;
            const activeCell = this.grid.getActiveCell();
            const activeColIndex = (_c = activeCell === null || activeCell === void 0 ? void 0 : activeCell.cell) !== null && _c !== void 0 ? _c : 0;
            const activeRow = (_d = activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) !== null && _d !== void 0 ? _d : 0;
            const gridUid = this.grid.getUID() || '';
            let headerTitle = options.headerTitle || '';
            // execute callback before creating the modal window (that is in short the first event in the lifecycle)
            if (typeof this._options.onBeforeOpen === 'function') {
                this._options.onBeforeOpen();
            }
            if (this.hasRowSelectionEnabled() && this._options.modalType === 'auto-mass' && this.grid.getSelectedRows) {
                const selectedRowsIndexes = this.grid.getSelectedRows() || [];
                if (selectedRowsIndexes.length > 0) {
                    this._options.modalType = 'mass-selection';
                    if (options === null || options === void 0 ? void 0 : options.headerTitleMassSelection) {
                        headerTitle = options === null || options === void 0 ? void 0 : options.headerTitleMassSelection;
                    }
                }
                else {
                    this._options.modalType = 'mass-update';
                    if (options === null || options === void 0 ? void 0 : options.headerTitleMassUpdate) {
                        headerTitle = options === null || options === void 0 ? void 0 : options.headerTitleMassUpdate;
                    }
                }
            }
            const modalType = this._options.modalType || 'edit';
            if (!this.gridOptions.editable) {
                onError({ type: 'error', code: 'EDITABLE_GRID_REQUIRED', message: 'Your grid must be editable in order to use the Composite Editor Modal.' });
                return null;
            }
            else if (!this.gridOptions.enableCellNavigation) {
                onError({ type: 'error', code: 'ENABLE_CELL_NAVIGATION_REQUIRED', message: 'Composite Editor requires the flag "enableCellNavigation" to be set to True in your Grid Options.' });
                return null;
            }
            else if (!this.gridOptions.enableAddRow && (modalType === 'clone' || modalType === 'create')) {
                onError({ type: 'error', code: 'ENABLE_ADD_ROW_REQUIRED', message: 'Composite Editor requires the flag "enableAddRow" to be set to True in your Grid Options when cloning/creating a new item.' });
                return null;
            }
            else if (!activeCell && (modalType === 'clone' || modalType === 'edit')) {
                onError({ type: 'warning', code: 'NO_RECORD_FOUND', message: 'No records selected for edit or clone operation.' });
                return null;
            }
            else {
                const isWithMassChange = (modalType === 'mass-update' || modalType === 'mass-selection');
                const dataContext = !isWithMassChange ? this.grid.getDataItem(activeRow) : {};
                this._originalDataContext = deepCopy(dataContext);
                this._columnDefinitions = this.grid.getColumns();
                const selectedRowsIndexes = this.hasRowSelectionEnabled() ? this.grid.getSelectedRows() : [];
                const fullDatasetLength = (_g = (_f = this.dataView) === null || _f === void 0 ? void 0 : _f.getItemCount()) !== null && _g !== void 0 ? _g : 0;
                this._lastActiveRowNumber = activeRow;
                const dataContextIds = this.dataView.getAllSelectedIds();
                // focus on a first cell with an Editor (unless current cell already has an Editor then do nothing)
                // also when it's a "Create" modal, we'll scroll to the end of the grid
                const rowIndex = modalType === 'create' ? this.dataViewLength : activeRow;
                const hasFoundEditor = this.focusOnFirstColumnCellWithEditor(this._columnDefinitions, dataContext, activeColIndex, rowIndex, isWithMassChange);
                if (!hasFoundEditor) {
                    return null;
                }
                if (modalType === 'edit' && !dataContext) {
                    onError({ type: 'warning', code: 'ROW_NOT_EDITABLE', message: 'Current row is not editable.' });
                    return null;
                }
                else if (modalType === 'mass-selection') {
                    if (selectedRowsIndexes.length < 1) {
                        onError({ type: 'warning', code: 'ROW_SELECTION_REQUIRED', message: 'You must select some rows before trying to apply new value(s).' });
                        return null;
                    }
                }
                let modalColumns = [];
                if (isWithMassChange) {
                    // when using Mass Update, we only care about the columns that have the "massUpdate: true", we disregard anything else
                    modalColumns = this._columnDefinitions.filter(col => { var _a; return col.editor && ((_a = col.internalColumnEditor) === null || _a === void 0 ? void 0 : _a.massUpdate) === true; });
                }
                else {
                    modalColumns = this._columnDefinitions.filter(col => col.editor);
                }
                // user could optionally show the form inputs in a specific order instead of using default column definitions order
                if (modalColumns.some(col => { var _a; return ((_a = col.internalColumnEditor) === null || _a === void 0 ? void 0 : _a.compositeEditorFormOrder) !== undefined; })) {
                    modalColumns.sort((col1, col2) => {
                        var _a, _b, _c, _d;
                        const val1 = (_b = (_a = col1 === null || col1 === void 0 ? void 0 : col1.internalColumnEditor) === null || _a === void 0 ? void 0 : _a.compositeEditorFormOrder) !== null && _b !== void 0 ? _b : Infinity;
                        const val2 = (_d = (_c = col2 === null || col2 === void 0 ? void 0 : col2.internalColumnEditor) === null || _c === void 0 ? void 0 : _c.compositeEditorFormOrder) !== null && _d !== void 0 ? _d : Infinity;
                        return numericSortComparer(val1, val2, SortDirectionNumber.asc);
                    });
                }
                // open the editor modal and we can also provide a header title with optional parsing pulled from the dataContext, via template {{ }}
                // for example {{title}} => display the item title, or even complex object works {{product.name}} => display item product name
                const parsedHeaderTitle = headerTitle.replace(/\{\{(.*?)\}\}/g, (_match, group) => getDescendantProperty(dataContext, group));
                const layoutColCount = viewColumnLayout === 'auto' ? this.autoCalculateLayoutColumnCount(modalColumns.length) : viewColumnLayout;
                this._modalElm = createDomElement('div', { className: `slick-editor-modal ${gridUid}` });
                const modalContentElm = createDomElement('div', { className: 'slick-editor-modal-content' });
                if ((!isNaN(viewColumnLayout) && +viewColumnLayout > 1) || (viewColumnLayout === 'auto' && layoutColCount > 1)) {
                    const splitClassName = layoutColCount === 2 ? 'split-view' : 'triple-split-view';
                    modalContentElm.classList.add(splitClassName);
                }
                const modalHeaderTitleElm = createDomElement('div', {
                    className: 'slick-editor-modal-title',
                    innerHTML: sanitizeTextByAvailableSanitizer(this.gridOptions, parsedHeaderTitle),
                });
                const modalCloseButtonElm = createDomElement('button', { type: 'button', ariaLabel: 'Close', textContent: '×', className: 'close', dataset: { action: 'close' } });
                if (this._options.showCloseButtonOutside) {
                    (_h = modalHeaderTitleElm === null || modalHeaderTitleElm === void 0 ? void 0 : modalHeaderTitleElm.classList) === null || _h === void 0 ? void 0 : _h.add('outside');
                    (_j = modalCloseButtonElm === null || modalCloseButtonElm === void 0 ? void 0 : modalCloseButtonElm.classList) === null || _j === void 0 ? void 0 : _j.add('outside');
                }
                const modalHeaderElm = createDomElement('div', { ariaLabel: 'Close', className: 'slick-editor-modal-header' });
                modalHeaderElm.appendChild(modalHeaderTitleElm);
                modalHeaderElm.appendChild(modalCloseButtonElm);
                const modalBodyElm = createDomElement('div', { className: 'slick-editor-modal-body' });
                this._modalBodyTopValidationElm = createDomElement('div', { className: 'validation-summary', style: { display: 'none' } }, modalBodyElm);
                const modalFooterElm = createDomElement('div', { className: 'slick-editor-modal-footer' });
                const modalCancelButtonElm = createDomElement('button', {
                    type: 'button',
                    ariaLabel: this.getLabelText('cancelButton', 'TEXT_CANCEL', 'Cancel'),
                    className: 'btn btn-cancel btn-default btn-sm',
                    textContent: this.getLabelText('cancelButton', 'TEXT_CANCEL', 'Cancel'),
                    dataset: { action: 'cancel' },
                });
                let leftFooterText = '';
                let saveButtonText = '';
                switch (modalType) {
                    case 'clone':
                        saveButtonText = this.getLabelText('cloneButton', 'TEXT_CLONE', 'Clone');
                        break;
                    case 'mass-update':
                        const footerUnparsedText = this.getLabelText('massUpdateStatus', 'TEXT_ALL_X_RECORDS_SELECTED', 'All {{x}} records selected');
                        leftFooterText = this.parseText(footerUnparsedText, { x: fullDatasetLength });
                        saveButtonText = this.getLabelText('massUpdateButton', 'TEXT_APPLY_MASS_UPDATE', 'Mass Update');
                        break;
                    case 'mass-selection':
                        const selectionUnparsedText = this.getLabelText('massSelectionStatus', 'TEXT_X_OF_Y_MASS_SELECTED', '{{x}} of {{y}} selected');
                        leftFooterText = this.parseText(selectionUnparsedText, { x: dataContextIds.length, y: fullDatasetLength });
                        saveButtonText = this.getLabelText('massSelectionButton', 'TEXT_APPLY_TO_SELECTION', 'Update Selection');
                        break;
                    default:
                        saveButtonText = this.getLabelText('saveButton', 'TEXT_SAVE', 'Save');
                }
                const selectionCounterElm = createDomElement('div', { className: 'footer-status-text', textContent: leftFooterText });
                this._modalSaveButtonElm = createDomElement('button', {
                    type: 'button', className: 'btn btn-save btn-primary btn-sm',
                    ariaLabel: saveButtonText,
                    textContent: saveButtonText,
                    dataset: {
                        action: (modalType === 'create' || modalType === 'edit') ? 'save' : modalType,
                        ariaLabel: saveButtonText
                    }
                });
                const footerContainerElm = createDomElement('div', { className: 'footer-buttons' });
                if (modalType === 'mass-update' || modalType === 'mass-selection') {
                    modalFooterElm.appendChild(selectionCounterElm);
                }
                footerContainerElm.appendChild(modalCancelButtonElm);
                footerContainerElm.appendChild(this._modalSaveButtonElm);
                modalFooterElm.appendChild(footerContainerElm);
                modalContentElm.appendChild(modalHeaderElm);
                modalContentElm.appendChild(modalBodyElm);
                modalContentElm.appendChild(modalFooterElm);
                this._modalElm.appendChild(modalContentElm);
                for (const columnDef of modalColumns) {
                    if (columnDef.editor) {
                        const itemContainer = createDomElement('div', { className: `item-details-container editor-${columnDef.id}` });
                        if (layoutColCount === 1) {
                            itemContainer.classList.add('slick-col-medium-12');
                        }
                        else {
                            itemContainer.classList.add('slick-col-medium-6', `slick-col-xlarge-${12 / layoutColCount}`);
                        }
                        const templateItemLabelElm = createDomElement('div', {
                            className: `item-details-label editor-${columnDef.id}`,
                            innerHTML: sanitizeTextByAvailableSanitizer(this.gridOptions, this.getColumnLabel(columnDef) || 'n/a')
                        });
                        const templateItemEditorElm = createDomElement('div', {
                            className: 'item-details-editor-container slick-cell',
                            dataset: { editorid: `${columnDef.id}` },
                        });
                        const templateItemValidationElm = createDomElement('div', { className: `item-details-validation editor-${columnDef.id}` });
                        // optionally add a reset button beside each editor
                        if ((_k = this._options) === null || _k === void 0 ? void 0 : _k.showResetButtonOnEachEditor) {
                            const editorResetButtonElm = this.createEditorResetButtonElement(`${columnDef.id}`);
                            this._bindEventService.bind(editorResetButtonElm, 'click', this.handleResetInputValue.bind(this));
                            templateItemLabelElm.appendChild(editorResetButtonElm);
                        }
                        itemContainer.appendChild(templateItemLabelElm);
                        itemContainer.appendChild(templateItemEditorElm);
                        itemContainer.appendChild(templateItemValidationElm);
                        modalBodyElm.appendChild(itemContainer);
                    }
                }
                // optionally add a form reset button
                if ((_l = this._options) === null || _l === void 0 ? void 0 : _l.showFormResetButton) {
                    const resetButtonContainerElm = this.createFormResetButtonElement();
                    this._bindEventService.bind(resetButtonContainerElm, 'click', this.handleResetFormClicked.bind(this));
                    modalBodyElm.appendChild(resetButtonContainerElm);
                }
                document.body.appendChild(this._modalElm);
                document.body.classList.add('slick-modal-open'); // add backdrop to body
                this._bindEventService.bind(document.body, 'click', this.handleBodyClicked.bind(this));
                this._editors = {};
                this._editorContainers = modalColumns.map(col => modalBodyElm.querySelector(`[data-editorid=${col.id}]`)) || [];
                this._compositeOptions = { destroy: this.disposeComponent.bind(this), modalType, validationMsgPrefix: '* ', formValues: {}, editors: this._editors };
                const compositeEditor = new CompositeEditor(modalColumns, this._editorContainers, this._compositeOptions);
                this.grid.editActiveCell(compositeEditor);
                // --
                // Add a few Event Handlers
                // keyboard, blur & button event handlers
                this._bindEventService.bind(modalCloseButtonElm, 'click', this.cancelEditing.bind(this));
                this._bindEventService.bind(modalCancelButtonElm, 'click', this.cancelEditing.bind(this));
                this._bindEventService.bind(this._modalSaveButtonElm, 'click', this.handleSaveClicked.bind(this));
                this._bindEventService.bind(this._modalElm, 'keydown', this.handleKeyDown.bind(this));
                this._bindEventService.bind(this._modalElm, 'focusout', this.validateCurrentEditor.bind(this));
                this._bindEventService.bind(this._modalElm, 'blur', this.validateCurrentEditor.bind(this));
                // when any of the input of the composite editor form changes, we'll add/remove a "modified" CSS className for styling purposes
                this._eventHandler.subscribe(this.grid.onCompositeEditorChange, this.handleOnCompositeEditorChange.bind(this));
                // when adding a new row to the grid, we need to invalidate that row and re-render the grid
                this._eventHandler.subscribe(this.grid.onAddNewRow, (_e, args) => {
                    this.insertNewItemInDataView(args.item);
                    this._originalDataContext = args.item; // this becomes the new data context
                    this.dispose();
                });
            }
            return this;
        }
        catch (error) {
            this.dispose();
            const errorMsg = (typeof error === 'string') ? error : ((_p = (_m = error === null || error === void 0 ? void 0 : error.message) !== null && _m !== void 0 ? _m : (_o = error === null || error === void 0 ? void 0 : error.body) === null || _o === void 0 ? void 0 : _o.message) !== null && _p !== void 0 ? _p : '');
            const errorCode = (typeof error === 'string') ? error : (_s = (_q = error === null || error === void 0 ? void 0 : error.status) !== null && _q !== void 0 ? _q : (_r = error === null || error === void 0 ? void 0 : error.body) === null || _r === void 0 ? void 0 : _r.status) !== null && _s !== void 0 ? _s : errorMsg;
            onError({ type: 'error', code: errorCode, message: errorMsg });
            return null;
        }
    }
    /** Cancel the Editing which will also close the modal window */
    async cancelEditing() {
        var _a, _b;
        let confirmed = true;
        if (this.formValues && Object.keys(this.formValues).length > 0 && typeof this._options.onClose === 'function') {
            confirmed = await this._options.onClose();
        }
        if (confirmed) {
            this.grid.getEditController().cancelCurrentEdit();
            // cancel current edit is not enough when editing/cloning,
            // we also need to reset with the original item data context to undo/reset the entire row
            if (((_a = this._options) === null || _a === void 0 ? void 0 : _a.modalType) === 'edit' || ((_b = this._options) === null || _b === void 0 ? void 0 : _b.modalType) === 'clone') {
                this.resetCurrentRowDataContext();
            }
            this.grid.setActiveRow(this._lastActiveRowNumber);
            this.dispose();
        }
    }
    /** Show a Validation Summary text (as a <div>) when a validation fails or simply hide it when there's no error */
    showValidationSummaryText(isShowing, errorMsg = '') {
        var _a, _b;
        if (isShowing && errorMsg !== '') {
            this._modalBodyTopValidationElm.textContent = errorMsg;
            this._modalBodyTopValidationElm.style.display = 'block';
            (_b = (_a = this._modalBodyTopValidationElm).scrollIntoView) === null || _b === void 0 ? void 0 : _b.call(_a);
            this._modalSaveButtonElm.disabled = false;
            this._modalSaveButtonElm.classList.remove('saving');
        }
        else {
            this._modalBodyTopValidationElm.style.display = 'none';
            this._modalBodyTopValidationElm.textContent = errorMsg;
        }
    }
    // --
    // protected methods
    // ----------------
    /** Apply Mass Update Changes (form values) to the entire dataset */
    applySaveMassUpdateChanges(formValues, _selection, applyToDataview = true) {
        // not applying to dataView means that we're doing a preview of dataset and we should use a deep copy of it instead of applying changes directly to it
        const data = applyToDataview ? this.dataView.getItems() : deepCopy(this.dataView.getItems());
        // from the "lastCompositeEditor" object that we kept as reference, it contains all the changes inside the "formValues" property
        // we can loop through these changes and apply them on the selected row indexes
        for (const itemProp in formValues) {
            if (itemProp in formValues) {
                data.forEach((dataContext) => {
                    var _a;
                    if (itemProp in formValues && (((_a = this._options) === null || _a === void 0 ? void 0 : _a.validateMassUpdateChange) === undefined || this._options.validateMassUpdateChange(itemProp, dataContext, formValues) !== false)) {
                        dataContext[itemProp] = formValues[itemProp];
                    }
                });
            }
        }
        // change the entire dataset with our updated dataset
        if (applyToDataview) {
            this.dataView.setItems(data, this.gridOptions.datasetIdPropertyName);
            this.grid.invalidate();
        }
        return data;
    }
    /** Apply Mass Changes to the Selected rows in the grid (form values) */
    applySaveMassSelectionChanges(formValues, selection, applyToDataview = true) {
        var _a, _b;
        const selectedItemIds = (_a = selection === null || selection === void 0 ? void 0 : selection.dataContextIds) !== null && _a !== void 0 ? _a : [];
        const selectedTmpItems = selectedItemIds.map(itemId => this.dataView.getItemById(itemId));
        // not applying to dataView means that we're doing a preview of dataset and we should use a deep copy of it instead of applying changes directly to it
        const selectedItems = applyToDataview ? selectedTmpItems : deepCopy(selectedTmpItems);
        // from the "lastCompositeEditor" object that we kept as reference, it contains all the changes inside the "formValues" property
        // we can loop through these changes and apply them on the selected row indexes
        for (const itemProp in formValues) {
            if (itemProp in formValues) {
                selectedItems.forEach((dataContext) => {
                    var _a;
                    if (itemProp in formValues && (((_a = this._options) === null || _a === void 0 ? void 0 : _a.validateMassUpdateChange) === undefined || this._options.validateMassUpdateChange(itemProp, dataContext, formValues) !== false)) {
                        dataContext[itemProp] = formValues[itemProp];
                    }
                });
            }
        }
        // update all items in the grid with the grid service
        if (applyToDataview) {
            (_b = this.gridService) === null || _b === void 0 ? void 0 : _b.updateItems(selectedItems);
        }
        return selectedItems;
    }
    /**
     * Auto-Calculate how many columns to display in the view layout (1, 2, or 3).
     * We'll display a 1 column layout for 8 or less Editors, 2 columns layout for less than 15 Editors or 3 columns when more than 15 Editors
     * @param {number} editorCount - how many Editors do we have in total
     * @returns {number} count - calculated column count (1, 2 or 3)
     */
    autoCalculateLayoutColumnCount(editorCount) {
        if (editorCount >= 15) {
            return 3;
        }
        else if (editorCount >= 8) {
            return 2;
        }
        return 1;
    }
    /**
     * Create a reset button for each editor and attach a button click handler
     * @param {String} columnId - column id
     * @returns {Object} - html button
     */
    createEditorResetButtonElement(columnId) {
        var _a, _b, _c, _d, _f;
        const resetButtonElm = createDomElement('button', {
            type: 'button', name: columnId,
            ariaLabel: 'Reset',
            title: (_c = (_b = (_a = this._options) === null || _a === void 0 ? void 0 : _a.labels) === null || _b === void 0 ? void 0 : _b.resetFormButton) !== null && _c !== void 0 ? _c : 'Reset Form Input',
            className: 'btn btn-xs btn-editor-reset'
        });
        if ((_d = this._options) === null || _d === void 0 ? void 0 : _d.resetEditorButtonCssClass) {
            const resetBtnClasses = (_f = this._options) === null || _f === void 0 ? void 0 : _f.resetEditorButtonCssClass.split(' ');
            for (const cssClass of resetBtnClasses) {
                resetButtonElm.classList.add(cssClass);
            }
        }
        return resetButtonElm;
    }
    /**
     * Create a form reset button and attach a button click handler
     * @param {String} columnId - column id
     * @returns {Object} - html button
     */
    createFormResetButtonElement() {
        var _a, _b;
        const resetButtonContainerElm = createDomElement('div', { className: 'reset-container' });
        const resetButtonElm = createDomElement('button', { type: 'button', className: 'btn btn-sm reset-form' }, resetButtonContainerElm);
        createDomElement('span', { className: (_b = (_a = this._options) === null || _a === void 0 ? void 0 : _a.resetFormButtonIconCssClass) !== null && _b !== void 0 ? _b : '' }, resetButtonElm);
        resetButtonElm.appendChild(document.createTextNode(' Reset Form'));
        return resetButtonContainerElm;
    }
    /**
     * Execute the onError callback when defined
     * or use the default onError callback which is to simply display the error in the console
     */
    executeOnError(error) {
        var _a, _b;
        const onError = (_b = (_a = this._options) === null || _a === void 0 ? void 0 : _a.onError) !== null && _b !== void 0 ? _b : DEFAULT_ON_ERROR;
        onError(error);
    }
    /**
     * A simple and generic method to execute the "OnSave" callback if it's defined by the user OR else simply execute built-in apply changes callback.
     * This method deals with multiple callbacks as shown below
     * @param {Function} applyChangesCallback - first callback to apply the changes into the grid (this could be a user custom callback)
     * @param {Function} executePostCallback - second callback to execute right after the "onSave"
     * @param {Function} beforeClosingCallback - third and last callback to execute after Saving but just before closing the modal window
     * @param {Object} itemDataContext - item data context when modal type is (create/clone/edit)
     */
    async executeOnSave(applyChangesCallback, executePostCallback, beforeClosingCallback, itemDataContext) {
        var _a, _b, _c, _d, _f, _g;
        try {
            this.showValidationSummaryText(false, '');
            const validationResults = this.validateCompositeEditors();
            if (validationResults.valid) {
                this._modalSaveButtonElm.classList.add('saving');
                this._modalSaveButtonElm.disabled = true;
                if (typeof ((_a = this._options) === null || _a === void 0 ? void 0 : _a.onSave) === 'function') {
                    const isMassChange = (this._options.modalType === 'mass-update' || this._options.modalType === 'mass-selection');
                    // apply the changes in the grid early when that option is enabled (that is before the await of `onSave`)
                    let updatedDataset;
                    if (isMassChange && ((_b = this._options) === null || _b === void 0 ? void 0 : _b.shouldPreviewMassChangeDataset)) {
                        updatedDataset = applyChangesCallback(this.formValues, this.getCurrentRowSelections(), false);
                    }
                    // call the custon onSave callback when defined and note that the item data context will only be filled for create/clone/edit
                    const dataContextOrUpdatedDatasetPreview = isMassChange ? updatedDataset : itemDataContext;
                    const successful = await ((_c = this._options) === null || _c === void 0 ? void 0 : _c.onSave(this.formValues, this.getCurrentRowSelections(), dataContextOrUpdatedDatasetPreview));
                    if (successful) {
                        // apply the changes in the grid (if it's not yet applied)
                        applyChangesCallback(this.formValues, this.getCurrentRowSelections());
                        // once we're done doing the mass update, we can cancel the current editor since we don't want to add any new row
                        // that will also destroy/close the modal window
                        executePostCallback();
                    }
                }
                else {
                    applyChangesCallback(this.formValues, this.getCurrentRowSelections());
                    executePostCallback();
                }
                // run any function before closing the modal
                if (typeof beforeClosingCallback === 'function') {
                    beforeClosingCallback();
                }
                // close the modal only when successful
                this.dispose();
            }
        }
        catch (error) {
            const errorMsg = (typeof error === 'string') ? error : ((_g = (_d = error === null || error === void 0 ? void 0 : error.message) !== null && _d !== void 0 ? _d : (_f = error === null || error === void 0 ? void 0 : error.body) === null || _f === void 0 ? void 0 : _f.message) !== null && _g !== void 0 ? _g : '');
            this.showValidationSummaryText(true, errorMsg);
        }
    }
    // For the Composite Editor to work, the current active cell must have an Editor (because it calls editActiveCell() and that only works with a cell with an Editor)
    // so if current active cell doesn't have an Editor, we'll find the first column with an Editor and focus on it (from left to right starting at index 0)
    focusOnFirstColumnCellWithEditor(columns, dataContext, columnIndex, rowIndex, isWithMassChange) {
        // make sure we're not trying to activate a cell outside of the grid, that can happen when using MassUpdate without `enableAddRow` flag enabled
        const activeCellIndex = (isWithMassChange && !this.gridOptions.enableAddRow && (rowIndex >= this.dataViewLength)) ? this.dataViewLength - 1 : rowIndex;
        let columnIndexWithEditor = columnIndex;
        const cellEditor = columns[columnIndex].editor;
        let activeEditorCellNode = this.grid.getCellNode(activeCellIndex, columnIndex);
        if (!cellEditor || !activeEditorCellNode || !this.getActiveCellEditor(activeCellIndex, columnIndex)) {
            columnIndexWithEditor = this.findNextAvailableEditorColumnIndex(columns, dataContext, rowIndex, isWithMassChange);
            if (columnIndexWithEditor === -1) {
                this.executeOnError({ type: 'error', code: 'NO_EDITOR_FOUND', message: 'We could not find any Editor in your Column Definition' });
                return false;
            }
            else {
                this.grid.setActiveCell(activeCellIndex, columnIndexWithEditor, false);
                if (isWithMassChange) {
                    // when it's a mass change, we'll activate the last row without scrolling to it
                    // that is possible via the 3rd argument "suppressScrollIntoView" set to "true"
                    this.grid.setActiveRow(this.dataViewLength, columnIndexWithEditor, true);
                }
            }
        }
        // check again if the cell node is now being created, if it is then we're good
        activeEditorCellNode = this.grid.getCellNode(activeCellIndex, columnIndexWithEditor);
        return !!activeEditorCellNode;
    }
    findNextAvailableEditorColumnIndex(columns, dataContext, rowIndex, isWithMassUpdate) {
        var _a;
        let columnIndexWithEditor = -1;
        for (let colIndex = 0; colIndex < columns.length; colIndex++) {
            const col = columns[colIndex];
            if (col.editor && (!isWithMassUpdate || (isWithMassUpdate && ((_a = col.internalColumnEditor) === null || _a === void 0 ? void 0 : _a.massUpdate)))) {
                // we can check that the cell is really editable by checking the onBeforeEditCell event not returning false (returning undefined, null also mean it is editable)
                const isCellEditable = this.grid.onBeforeEditCell.notify({ row: rowIndex, cell: colIndex, item: dataContext, column: col, grid: this.grid, target: 'composite', compositeEditorOptions: this._compositeOptions }).getReturnValue();
                this.grid.setActiveCell(rowIndex, colIndex, false);
                if (isCellEditable !== false) {
                    columnIndexWithEditor = colIndex;
                    break;
                }
            }
        }
        return columnIndexWithEditor;
    }
    /**
     * Get a column definition by providing a column id OR a column definition.
     * If the input is a string, we'll assume it's a columnId and we'll simply search for the column in the column definitions list
     */
    getColumnByObjectOrId(columnIdOrDef) {
        let column;
        if (typeof columnIdOrDef === 'object') {
            column = columnIdOrDef;
        }
        else if (typeof columnIdOrDef === 'string') {
            column = this._columnDefinitions.find(col => col.id === columnIdOrDef);
        }
        return column;
    }
    getActiveCellEditor(row, cell) {
        this.grid.setActiveCell(row, cell, false);
        return this.grid.getCellEditor();
    }
    /**
     * Get the column label, the label might have an optional "columnGroup" (or "columnGroupKey" which need to be translated)
     * @param {object} columnDef - column definition
     * @returns {string} label - column label
     */
    getColumnLabel(columnDef) {
        var _a;
        const columnGroupSeparator = this.gridOptions.columnGroupSeparator || ' - ';
        let columnName = columnDef.nameCompositeEditor || columnDef.name || '';
        let columnGroup = columnDef.columnGroup || '';
        if (this.gridOptions.enableTranslate && this.translaterService) {
            const translationKey = columnDef.nameCompositeEditorKey || columnDef.nameKey;
            if (translationKey) {
                columnName = this.translaterService.translate(translationKey);
            }
            if (columnDef.columnGroupKey && ((_a = this.translaterService) === null || _a === void 0 ? void 0 : _a.translate)) {
                columnGroup = this.translaterService.translate(columnDef.columnGroupKey);
            }
        }
        const columnLabel = columnGroup ? `${columnGroup}${columnGroupSeparator}${columnName}` : columnName;
        return columnLabel || '';
    }
    /** Get the correct label text depending, if we use a Translater Service then translate the text when possible else use default text */
    getLabelText(labelProperty, localeText, defaultText) {
        var _a, _b, _c, _d, _f, _g, _h;
        const textLabels = { ...(_a = this.gridOptions.compositeEditorOptions) === null || _a === void 0 ? void 0 : _a.labels, ...(_b = this._options) === null || _b === void 0 ? void 0 : _b.labels };
        if (((_c = this.gridOptions) === null || _c === void 0 ? void 0 : _c.enableTranslate) && ((_d = this.translaterService) === null || _d === void 0 ? void 0 : _d.translate) && textLabels.hasOwnProperty(`${labelProperty}Key`)) {
            const translationKey = textLabels[`${labelProperty}Key`];
            return this.translaterService.translate(translationKey || '');
        }
        return (_h = (_f = textLabels === null || textLabels === void 0 ? void 0 : textLabels[labelProperty]) !== null && _f !== void 0 ? _f : (_g = this._locales) === null || _g === void 0 ? void 0 : _g[localeText]) !== null && _h !== void 0 ? _h : defaultText;
    }
    /** Retrieve the current selection of row indexes & data context Ids */
    getCurrentRowSelections() {
        const dataContextIds = this.dataView.getAllSelectedIds();
        const gridRowIndexes = this.dataView.mapIdsToRows(dataContextIds);
        return { gridRowIndexes, dataContextIds };
    }
    handleBodyClicked(event) {
        var _a, _b, _c;
        if ((_b = (_a = event.target) === null || _a === void 0 ? void 0 : _a.classList) === null || _b === void 0 ? void 0 : _b.contains('slick-editor-modal')) {
            if (((_c = this._options) === null || _c === void 0 ? void 0 : _c.backdrop) !== 'static') {
                this.dispose();
            }
        }
    }
    handleKeyDown(event) {
        if (event.code === 'Escape') {
            this.cancelEditing();
            event.stopPropagation();
            event.preventDefault();
        }
        else if (event.code === 'Tab') {
            this.validateCurrentEditor();
        }
    }
    handleResetInputValue(event) {
        var _a, _b;
        const columnId = event.target.name;
        const editor = (_a = this._editors) === null || _a === void 0 ? void 0 : _a[columnId];
        if (editor === null || editor === void 0 ? void 0 : editor.reset) {
            editor.reset();
        }
        (_b = this._formValues) === null || _b === void 0 ? true : delete _b[columnId];
    }
    /** Callback which processes a Mass Update or Mass Selection Changes */
    async handleMassSaving(modalType, executePostCallback) {
        if (!this.formValues || Object.keys(this.formValues).length === 0) {
            this.executeOnError({ type: 'warning', code: 'NO_CHANGES_DETECTED', message: 'Sorry we could not detect any changes.' });
        }
        else {
            const applyCallbackFnName = (modalType === 'mass-update') ? 'applySaveMassUpdateChanges' : 'applySaveMassSelectionChanges';
            this.executeOnSave(this[applyCallbackFnName].bind(this), executePostCallback.bind(this));
        }
    }
    /** Anytime an input of the Composite Editor form changes, we'll add/remove a "modified" CSS className for styling purposes */
    handleOnCompositeEditorChange(_e, args) {
        var _a, _b, _c, _d, _f, _g, _h, _j;
        const columnId = (_b = (_a = args.column) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        this._formValues = { ...this._formValues, ...args.formValues };
        const editor = (_c = this._editors) === null || _c === void 0 ? void 0 : _c[columnId];
        const isEditorValueTouched = (_h = (_f = (_d = editor === null || editor === void 0 ? void 0 : editor.isValueTouched) === null || _d === void 0 ? void 0 : _d.call(editor)) !== null && _f !== void 0 ? _f : (_g = editor === null || editor === void 0 ? void 0 : editor.isValueChanged) === null || _g === void 0 ? void 0 : _g.call(editor)) !== null && _h !== void 0 ? _h : false;
        this._itemDataContext = (_j = editor === null || editor === void 0 ? void 0 : editor.dataContext) !== null && _j !== void 0 ? _j : {}; // keep reference of the item data context
        // add extra css styling to the composite editor input(s) that got modified
        const editorElm = this._modalElm.querySelector(`[data-editorid=${columnId}]`);
        if (editorElm === null || editorElm === void 0 ? void 0 : editorElm.classList) {
            if (isEditorValueTouched) {
                editorElm.classList.add('modified');
            }
            else {
                editorElm.classList.remove('modified');
            }
        }
        // after any input changes we'll re-validate all fields
        this.validateCompositeEditors();
    }
    /** Check wether the grid has the Row Selection enabled */
    hasRowSelectionEnabled() {
        const selectionModel = this.grid.getSelectionModel();
        const isRowSelectionEnabled = this.gridOptions.enableRowSelection || this.gridOptions.enableCheckboxSelector;
        return (isRowSelectionEnabled && selectionModel);
    }
    /** Reset Form button handler */
    handleResetFormClicked() {
        for (const columnId of Object.keys(this._editors)) {
            const editor = this._editors[columnId];
            if (editor === null || editor === void 0 ? void 0 : editor.reset) {
                editor.reset();
            }
        }
        this._formValues = emptyObject(this._formValues);
    }
    /** switch case handler to determine which code to execute depending on the modal type */
    handleSaveClicked() {
        var _a, _b, _c;
        const modalType = (_a = this._options) === null || _a === void 0 ? void 0 : _a.modalType;
        switch (modalType) {
            case 'mass-update':
                this.handleMassSaving(modalType, () => {
                    this.grid.getEditController().cancelCurrentEdit();
                    this.grid.setActiveCell(0, 0, false);
                    if (this._options.shouldClearRowSelectionAfterMassAction) {
                        this.grid.setSelectedRows([]);
                    }
                });
                break;
            case 'mass-selection':
                this.handleMassSaving(modalType, () => {
                    this.grid.getEditController().cancelCurrentEdit();
                    this.grid.setActiveRow(this._lastActiveRowNumber);
                    if (this._options.shouldClearRowSelectionAfterMassAction) {
                        this.grid.setSelectedRows([]);
                    }
                });
                break;
            case 'clone':
                // the clone object will be a merge of the selected data context (original object) with the changed form values
                const clonedItemDataContext = { ...this._originalDataContext, ...this.formValues };
                // post save callback (before closing modal)
                const postSaveCloneCallback = () => {
                    this.grid.getEditController().cancelCurrentEdit();
                    this.grid.setActiveCell(0, 0, false);
                };
                // call the onSave execution and provide the item data context so that it's available to the user
                this.executeOnSave(this.insertNewItemInDataView.bind(this, clonedItemDataContext), postSaveCloneCallback, this.resetCurrentRowDataContext.bind(this), clonedItemDataContext);
                break;
            case 'create':
            case 'edit':
            default:
                // commit the changes into the grid
                // if it's a "create" then it will triggered the "onAddNewRow" event which will in term push it to the grid
                // while an "edit" will simply applies the changes directly on the same row
                this.grid.getEditController().commitCurrentEdit();
                // if the user provided the "onSave" callback, let's execute it with the item data context
                if (typeof ((_b = this._options) === null || _b === void 0 ? void 0 : _b.onSave) === 'function') {
                    const itemDataContext = this.grid.getDataItem(this._lastActiveRowNumber); // we can get item data context directly from DataView
                    (_c = this._options) === null || _c === void 0 ? void 0 : _c.onSave(this.formValues, this.getCurrentRowSelections(), itemDataContext);
                }
                break;
        }
    }
    /** Insert an item into the DataView or throw an error when finding duplicate id in the dataset */
    insertNewItemInDataView(item) {
        var _a, _b, _c, _d;
        const fullDatasetLength = (_b = (_a = this.dataView) === null || _a === void 0 ? void 0 : _a.getItemCount()) !== null && _b !== void 0 ? _b : 0;
        const newId = (_c = this._options.insertNewId) !== null && _c !== void 0 ? _c : fullDatasetLength + 1;
        item[this.gridOptions.datasetIdPropertyName || 'id'] = newId;
        if (!this.dataView.getItemById(newId)) {
            (_d = this.gridService) === null || _d === void 0 ? void 0 : _d.addItem(item, this._options.insertOptions);
        }
        else {
            this.executeOnError({ type: 'error', code: 'ITEM_ALREADY_EXIST', message: `The item object which you are trying to add already exist with the same Id:: ${newId}` });
        }
    }
    parseText(inputText, mappedArgs) {
        return inputText.replace(/\{\{(.*?)\}\}/g, (match, group) => {
            return mappedArgs[group] !== undefined ? mappedArgs[group] : match;
        });
    }
    /** Put back the current row to its original item data context using the DataView without triggering a change */
    resetCurrentRowDataContext() {
        const idPropName = this.gridOptions.datasetIdPropertyName || 'id';
        const dataView = this.grid.getData();
        dataView.updateItem(this._originalDataContext[idPropName], this._originalDataContext);
    }
    /** Validate all the Composite Editors that are defined in the form */
    validateCompositeEditors(targetElm) {
        let validationResults = { valid: true, msg: '' };
        const currentEditor = this.grid.getCellEditor();
        if (currentEditor) {
            validationResults = currentEditor.validate(targetElm);
        }
        return validationResults;
    }
    /** Validate the current cell editor */
    validateCurrentEditor() {
        const currentEditor = this.grid.getCellEditor();
        if (currentEditor === null || currentEditor === void 0 ? void 0 : currentEditor.validate) {
            currentEditor.validate();
        }
    }
}
//# sourceMappingURL=slick-composite-editor.component.js.map