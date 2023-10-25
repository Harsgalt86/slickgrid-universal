import { AutocompleterEditor } from './autocompleterEditor';
import { CheckboxEditor } from './checkboxEditor';
import { DateEditor } from './dateEditor';
import { DualInputEditor } from './dualInputEditor';
import { FloatEditor } from './floatEditor';
import { InputEditor } from './inputEditor';
import { InputPasswordEditor } from './inputPasswordEditor';
import { IntegerEditor } from './integerEditor';
import { LongTextEditor } from './longTextEditor';
import { MultipleSelectEditor } from './multipleSelectEditor';
import { SingleSelectEditor } from './singleSelectEditor';
import { SliderEditor } from './sliderEditor';
export declare const Editors: {
    /** Autocompleter Editor (using https://github.com/kraaden/autocomplete) */
    autocompleter: typeof AutocompleterEditor;
    /** Checkbox Editor (uses native checkbox DOM element) */
    checkbox: typeof CheckboxEditor;
    /** Date Picker Editor (which uses 3rd party lib "flatpickr") */
    date: typeof DateEditor;
    /** Dual Input Editor, default input type is text but it could be (integer/float/number/password/text) */
    dualInput: typeof DualInputEditor;
    /** Float Number Editor using an input of type "number" */
    float: typeof FloatEditor;
    /** Integer Number Editor using an input of type "number" */
    integer: typeof IntegerEditor;
    /**
     * Long Text Editor (uses a textarea) for longer text (you can also optionally configure its size).
     * When ready to Save you can click on the "Save" and/or use shortcuts (Ctrl+ENTER or Ctrl+s).
     */
    longText: typeof LongTextEditor;
    /** Multiple Select editor (which uses 3rd party lib "multiple-select.js") */
    multipleSelect: typeof MultipleSelectEditor;
    /** Editor with an input of type Password (note that only the text shown in the UI will be masked, the editor value is still plain text) */
    password: typeof InputPasswordEditor;
    /** Single Select editor (which uses 3rd party lib "multiple-select.js") */
    singleSelect: typeof SingleSelectEditor;
    /** Slider Editor using an input of type "range" */
    slider: typeof SliderEditor;
    /** text Editor using an input of type "text" (this is the default editor when no type is provided) */
    text: typeof InputEditor;
};
//# sourceMappingURL=editors.index.d.ts.map