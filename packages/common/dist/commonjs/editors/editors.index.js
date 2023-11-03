"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editors = void 0;
const autocompleterEditor_1 = require("./autocompleterEditor");
const checkboxEditor_1 = require("./checkboxEditor");
const dateEditor_1 = require("./dateEditor");
const dualInputEditor_1 = require("./dualInputEditor");
const floatEditor_1 = require("./floatEditor");
const inputEditor_1 = require("./inputEditor");
const inputPasswordEditor_1 = require("./inputPasswordEditor");
const integerEditor_1 = require("./integerEditor");
const longTextEditor_1 = require("./longTextEditor");
const multipleSelectEditor_1 = require("./multipleSelectEditor");
const singleSelectEditor_1 = require("./singleSelectEditor");
const sliderEditor_1 = require("./sliderEditor");
exports.Editors = {
    /** Autocompleter Editor (using https://github.com/kraaden/autocomplete) */
    autocompleter: autocompleterEditor_1.AutocompleterEditor,
    /** Checkbox Editor (uses native checkbox DOM element) */
    checkbox: checkboxEditor_1.CheckboxEditor,
    /** Date Picker Editor (which uses 3rd party lib "flatpickr") */
    date: dateEditor_1.DateEditor,
    /** Dual Input Editor, default input type is text but it could be (integer/float/number/password/text) */
    dualInput: dualInputEditor_1.DualInputEditor,
    /** Float Number Editor using an input of type "number" */
    float: floatEditor_1.FloatEditor,
    /** Integer Number Editor using an input of type "number" */
    integer: integerEditor_1.IntegerEditor,
    /**
     * Long Text Editor (uses a textarea) for longer text (you can also optionally configure its size).
     * When ready to Save you can click on the "Save" and/or use shortcuts (Ctrl+ENTER or Ctrl+s).
     */
    longText: longTextEditor_1.LongTextEditor,
    /** Multiple Select editor (which uses 3rd party lib "multiple-select.js") */
    multipleSelect: multipleSelectEditor_1.MultipleSelectEditor,
    /** Editor with an input of type Password (note that only the text shown in the UI will be masked, the editor value is still plain text) */
    password: inputPasswordEditor_1.InputPasswordEditor,
    /** Single Select editor (which uses 3rd party lib "multiple-select.js") */
    singleSelect: singleSelectEditor_1.SingleSelectEditor,
    /** Slider Editor using an input of type "range" */
    slider: sliderEditor_1.SliderEditor,
    /** text Editor using an input of type "text" (this is the default editor when no type is provided) */
    text: inputEditor_1.InputEditor
};
//# sourceMappingURL=editors.index.js.map