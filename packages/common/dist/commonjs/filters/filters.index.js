"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filters = void 0;
const autocompleterFilter_1 = require("./autocompleterFilter");
const compoundDateFilter_1 = require("./compoundDateFilter");
const compoundInputFilter_1 = require("./compoundInputFilter");
const compoundInputNumberFilter_1 = require("./compoundInputNumberFilter");
const compoundInputPasswordFilter_1 = require("./compoundInputPasswordFilter");
const compoundSliderFilter_1 = require("./compoundSliderFilter");
const inputFilter_1 = require("./inputFilter");
const inputMaskFilter_1 = require("./inputMaskFilter");
const inputNumberFilter_1 = require("./inputNumberFilter");
const inputPasswordFilter_1 = require("./inputPasswordFilter");
const multipleSelectFilter_1 = require("./multipleSelectFilter");
const nativeSelectFilter_1 = require("./nativeSelectFilter");
const dateRangeFilter_1 = require("./dateRangeFilter");
const singleSelectFilter_1 = require("./singleSelectFilter");
const singleSliderFilter_1 = require("./singleSliderFilter");
const sliderRangeFilter_1 = require("./sliderRangeFilter");
exports.Filters = {
    /** AutoComplete Filter (using https://github.com/kraaden/autocomplete) */
    autocompleter: autocompleterFilter_1.AutocompleterFilter,
    /** Compound Date Filter (compound of Operator + Date picker) */
    compoundDate: compoundDateFilter_1.CompoundDateFilter,
    /** Alias to compoundInputText to Compound Input Filter (compound of Operator + Input Text) */
    compoundInput: compoundInputFilter_1.CompoundInputFilter,
    /** Compound Input Number Filter (compound of Operator + Input of type Number) */
    compoundInputNumber: compoundInputNumberFilter_1.CompoundInputNumberFilter,
    /** Compound Input Password Filter (compound of Operator + Input of type Password, also note that only the text shown in the UI will be masked, filter query is still plain text) */
    compoundInputPassword: compoundInputPasswordFilter_1.CompoundInputPasswordFilter,
    /** Compound Input Text Filter (compound of Operator + Input Text) */
    compoundInputText: compoundInputFilter_1.CompoundInputFilter,
    /** Compound Slider Filter (compound of Operator + Slider) */
    compoundSlider: compoundSliderFilter_1.CompoundSliderFilter,
    /** Range Date Filter (uses the Flactpickr Date picker with range option) */
    dateRange: dateRangeFilter_1.DateRangeFilter,
    /** Alias to inputText, input type text filter (this is the default filter when no type is provided) */
    input: inputFilter_1.InputFilter,
    /**
     * Input Filter of type text that will be formatted with a mask output
     * e.g.: column: { filter: { model: Filters.inputMask }, params: { mask: '(000) 000-0000' }}
     */
    inputMask: inputMaskFilter_1.InputMaskFilter,
    /** Input Filter of type Number */
    inputNumber: inputNumberFilter_1.InputNumberFilter,
    /** Input Filter of type Password (note that only the text shown in the UI will be masked, filter query is still plain text) */
    inputPassword: inputPasswordFilter_1.InputPasswordFilter,
    /** Default Filter, input type text filter */
    inputText: inputFilter_1.InputFilter,
    /** Multiple Select filter, which uses 3rd party lib "multiple-select.js" */
    multipleSelect: multipleSelectFilter_1.MultipleSelectFilter,
    /** Select filter, which uses native DOM element select */
    select: nativeSelectFilter_1.NativeSelectFilter,
    /** Single Select filter, which uses 3rd party lib "multiple-select.js" */
    singleSelect: singleSelectFilter_1.SingleSelectFilter,
    /** Slider Filter (single value) */
    slider: singleSliderFilter_1.SingleSliderFilter,
    /** Slider Range Filter (dual values, lowest/highest filter range) */
    sliderRange: sliderRangeFilter_1.SliderRangeFilter,
};
//# sourceMappingURL=filters.index.js.map