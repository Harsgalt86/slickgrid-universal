import { AutocompleterFilter } from './autocompleterFilter';
import { CompoundDateFilter } from './compoundDateFilter';
import { CompoundInputFilter } from './compoundInputFilter';
import { CompoundInputNumberFilter } from './compoundInputNumberFilter';
import { CompoundInputPasswordFilter } from './compoundInputPasswordFilter';
import { CompoundSliderFilter } from './compoundSliderFilter';
import { InputFilter } from './inputFilter';
import { InputMaskFilter } from './inputMaskFilter';
import { InputNumberFilter } from './inputNumberFilter';
import { InputPasswordFilter } from './inputPasswordFilter';
import { MultipleSelectFilter } from './multipleSelectFilter';
import { NativeSelectFilter } from './nativeSelectFilter';
import { DateRangeFilter } from './dateRangeFilter';
import { SingleSelectFilter } from './singleSelectFilter';
import { SingleSliderFilter } from './singleSliderFilter';
import { SliderRangeFilter } from './sliderRangeFilter';
export declare const Filters: {
    /** AutoComplete Filter (using https://github.com/kraaden/autocomplete) */
    autocompleter: typeof AutocompleterFilter;
    /** Compound Date Filter (compound of Operator + Date picker) */
    compoundDate: typeof CompoundDateFilter;
    /** Alias to compoundInputText to Compound Input Filter (compound of Operator + Input Text) */
    compoundInput: typeof CompoundInputFilter;
    /** Compound Input Number Filter (compound of Operator + Input of type Number) */
    compoundInputNumber: typeof CompoundInputNumberFilter;
    /** Compound Input Password Filter (compound of Operator + Input of type Password, also note that only the text shown in the UI will be masked, filter query is still plain text) */
    compoundInputPassword: typeof CompoundInputPasswordFilter;
    /** Compound Input Text Filter (compound of Operator + Input Text) */
    compoundInputText: typeof CompoundInputFilter;
    /** Compound Slider Filter (compound of Operator + Slider) */
    compoundSlider: typeof CompoundSliderFilter;
    /** Range Date Filter (uses the Flactpickr Date picker with range option) */
    dateRange: typeof DateRangeFilter;
    /** Alias to inputText, input type text filter (this is the default filter when no type is provided) */
    input: typeof InputFilter;
    /**
     * Input Filter of type text that will be formatted with a mask output
     * e.g.: column: { filter: { model: Filters.inputMask }, params: { mask: '(000) 000-0000' }}
     */
    inputMask: typeof InputMaskFilter;
    /** Input Filter of type Number */
    inputNumber: typeof InputNumberFilter;
    /** Input Filter of type Password (note that only the text shown in the UI will be masked, filter query is still plain text) */
    inputPassword: typeof InputPasswordFilter;
    /** Default Filter, input type text filter */
    inputText: typeof InputFilter;
    /** Multiple Select filter, which uses 3rd party lib "multiple-select.js" */
    multipleSelect: typeof MultipleSelectFilter;
    /** Select filter, which uses native DOM element select */
    select: typeof NativeSelectFilter;
    /** Single Select filter, which uses 3rd party lib "multiple-select.js" */
    singleSelect: typeof SingleSelectFilter;
    /** Slider Filter (single value) */
    slider: typeof SingleSliderFilter;
    /** Slider Range Filter (dual values, lowest/highest filter range) */
    sliderRange: typeof SliderRangeFilter;
};
//# sourceMappingURL=filters.index.d.ts.map