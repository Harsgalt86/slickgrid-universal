"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeEditor = void 0;
const common_1 = require("@slickgrid-universal/common");
/**
 * A composite SlickGrid editor factory.
 * Generates an editor that is composed of multiple editors for given columns.
 * Individual editors are provided given containers instead of the original cell.
 * Validation will be performed on all editors individually and the results will be aggregated into one
 * validation result.
 *
 *
 * The returned editor will have its prototype set to CompositeEditor, so you can use the "instanceof" check.
 *
 * NOTE:  This doesn't work for detached editors since they will be created and positioned relative to the
 *        active cell and not the provided container.
 *
 * @class CompositeEditor
 * @constructor
 * @param columns {Array} Column definitions from which editors will be pulled.
 * @param containers {Array} Container HTMLElements in which editors will be placed.
 * @param options {Object} Options hash:
 *  validationFailedMsg     -   A generic failed validation message set on the aggregated validation resuls.
 *  validationMsgPrefix     -   Add an optional prefix to each validation message (only the ones shown in the modal form, not the ones in the "errors")
 *  modalType               -   Defaults to "edit", modal type can 1 of these 3: (create, edit, mass, mass-selection)
 *  hide                    -   A function to be called when the grid asks the editor to hide itself.
 *  show                    -   A function to be called when the grid asks the editor to show itself.
 *  position                -   A function to be called when the grid asks the editor to reposition itself.
 *  destroy                 -   A function to be called when the editor is destroyed.
 */
function CompositeEditor(columns, containers, options) {
    let firstInvalidEditor;
    const defaultOptions = {
        modalType: 'edit',
        validationFailedMsg: 'Some of the fields have failed validation',
        validationMsgPrefix: null,
        show: null,
        hide: null,
        position: null,
        destroy: null,
        formValues: {},
        editors: {}
    };
    options = { ...defaultOptions, ...options };
    /* no operation (empty) function */
    const noop = () => { };
    const getContainerBox = (i) => {
        var _a, _b, _c, _d, _e, _f;
        const container = containers[i];
        const offset = (0, common_1.getHtmlElementOffset)(container);
        const width = (_a = container === null || container === void 0 ? void 0 : container.clientWidth) !== null && _a !== void 0 ? _a : 0;
        const height = (_b = container === null || container === void 0 ? void 0 : container.clientHeight) !== null && _b !== void 0 ? _b : 0;
        return {
            top: (_c = offset === null || offset === void 0 ? void 0 : offset.top) !== null && _c !== void 0 ? _c : 0,
            left: (_d = offset === null || offset === void 0 ? void 0 : offset.left) !== null && _d !== void 0 ? _d : 0,
            bottom: ((_e = offset === null || offset === void 0 ? void 0 : offset.top) !== null && _e !== void 0 ? _e : 0) + height,
            right: ((_f = offset === null || offset === void 0 ? void 0 : offset.left) !== null && _f !== void 0 ? _f : 0) + width,
            width,
            height,
            visible: true
        };
    };
    /* Editor prototype that will get instantiated dynamically by looping through each Editors */
    function editor(args) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;
        let editors = [];
        function init() {
            let newArgs = {};
            let idx = 0;
            while (idx < columns.length) {
                if (columns[idx].editor) {
                    const column = columns[idx];
                    newArgs = { ...args };
                    newArgs.container = containers[idx];
                    newArgs.column = column;
                    newArgs.position = getContainerBox(idx);
                    newArgs.commitChanges = noop;
                    newArgs.cancelChanges = noop;
                    newArgs.compositeEditorOptions = options;
                    newArgs.formValues = {};
                    const currentEditor = new column.editor(newArgs);
                    options.editors[column.id] = currentEditor; // add every Editor instance refs
                    editors.push(currentEditor);
                }
                idx++;
            }
            // focus on first input
            setTimeout(() => {
                if (Array.isArray(editors) && editors.length > 0 && typeof editors[0].focus === 'function') {
                    editors[0].focus();
                }
            }, 0);
        }
        context.getEditors = () => {
            return editors;
        };
        context.destroy = () => {
            var _a;
            let tmpEditor = editors.pop();
            while (tmpEditor) {
                tmpEditor === null || tmpEditor === void 0 ? void 0 : tmpEditor.destroy();
                tmpEditor = editors.pop();
            }
            let tmpContainer = containers.pop();
            while (tmpContainer) {
                (0, common_1.emptyElement)(tmpContainer);
                tmpContainer === null || tmpContainer === void 0 ? void 0 : tmpContainer.remove();
                tmpContainer = containers.pop();
            }
            (_a = options === null || options === void 0 ? void 0 : options.destroy) === null || _a === void 0 ? void 0 : _a.call(options);
            editors = [];
            containers = null;
        };
        context.focus = () => {
            // if validation has failed, set the focus to the first invalid editor
            (firstInvalidEditor || editors[0]).focus();
        };
        context.isValueChanged = () => {
            let idx = 0;
            while (idx < editors.length) {
                if (editors[idx].isValueChanged()) {
                    return true;
                }
                idx++;
            }
            return false;
        };
        context.serializeValue = () => {
            const serializedValue = [];
            let idx = 0;
            while (idx < editors.length) {
                serializedValue[idx] = editors[idx].serializeValue();
                idx++;
            }
            return serializedValue;
        };
        context.applyValue = (item, state) => {
            let idx = 0;
            while (idx < editors.length) {
                editors[idx].applyValue(item, state === null || state === void 0 ? void 0 : state[idx]);
                idx++;
            }
        };
        context.loadValue = (item) => {
            let idx = 0;
            while (idx < editors.length) {
                editors[idx].loadValue(item);
                idx++;
            }
        };
        context.validate = (targetElm) => {
            var _a, _b;
            let validationResults;
            firstInvalidEditor = null;
            const errors = [];
            let idx = 0;
            while (idx < editors.length) {
                const columnDef = (_a = editors[idx].args) === null || _a === void 0 ? void 0 : _a.column;
                if ((columnDef === null || columnDef === void 0 ? void 0 : columnDef.id) !== undefined) {
                    const compositeModalElm = document.querySelector(`.slick-editor-modal`);
                    let validationElm = compositeModalElm === null || compositeModalElm === void 0 ? void 0 : compositeModalElm.querySelector(`.item-details-validation.editor-${columnDef.id}`);
                    let labelElm = compositeModalElm === null || compositeModalElm === void 0 ? void 0 : compositeModalElm.querySelector(`.item-details-label.editor-${columnDef.id}`);
                    let editorElm = compositeModalElm === null || compositeModalElm === void 0 ? void 0 : compositeModalElm.querySelector(`[data-editorid=${columnDef.id}]`);
                    const validationMsgPrefix = (_b = options === null || options === void 0 ? void 0 : options.validationMsgPrefix) !== null && _b !== void 0 ? _b : '';
                    if (!targetElm || (editorElm === null || editorElm === void 0 ? void 0 : editorElm.contains(targetElm))) {
                        validationResults = editors[idx].validate();
                        if (!validationResults.valid) {
                            firstInvalidEditor = editors[idx];
                            errors.push({
                                index: idx,
                                editor: editors[idx],
                                container: containers[idx],
                                msg: validationResults.msg
                            });
                            if (validationElm) {
                                validationElm.textContent = `${validationMsgPrefix}${validationResults.msg}`;
                                labelElm === null || labelElm === void 0 ? void 0 : labelElm.classList.add('invalid');
                                editorElm === null || editorElm === void 0 ? void 0 : editorElm.classList.add('invalid');
                            }
                        }
                        else if (validationElm) {
                            validationElm.textContent = '';
                            editorElm === null || editorElm === void 0 ? void 0 : editorElm.classList.remove('invalid');
                            labelElm === null || labelElm === void 0 ? void 0 : labelElm.classList.remove('invalid');
                        }
                    }
                    validationElm = null;
                    labelElm = null;
                    editorElm = null;
                }
                idx++;
            }
            targetElm = null;
            if (errors.length) {
                return {
                    valid: false,
                    msg: options.validationFailedMsg,
                    errors
                };
            }
            return {
                valid: true,
                msg: ''
            };
        };
        context.hide = () => {
            var _a, _b, _c;
            let idx = 0;
            while (idx < editors.length) {
                (_b = (_a = editors[idx]) === null || _a === void 0 ? void 0 : _a.hide) === null || _b === void 0 ? void 0 : _b.call(_a);
                idx++;
            }
            (_c = options === null || options === void 0 ? void 0 : options.hide) === null || _c === void 0 ? void 0 : _c.call(options);
        };
        context.show = () => {
            var _a, _b, _c;
            let idx = 0;
            while (idx < editors.length) {
                (_b = (_a = editors[idx]) === null || _a === void 0 ? void 0 : _a.show) === null || _b === void 0 ? void 0 : _b.call(_a);
                idx++;
            }
            (_c = options === null || options === void 0 ? void 0 : options.show) === null || _c === void 0 ? void 0 : _c.call(options);
        };
        context.position = (box) => {
            var _a;
            (_a = options === null || options === void 0 ? void 0 : options.position) === null || _a === void 0 ? void 0 : _a.call(options, box);
        };
        // initialize current editor
        init();
    }
    // so we can do editor instanceof Slick.CompositeEditor OR instanceof CompositeEditor
    editor.prototype = this;
    Slick.CompositeEditor = editor;
    return editor;
}
exports.CompositeEditor = CompositeEditor;
//# sourceMappingURL=compositeEditor.factory.js.map