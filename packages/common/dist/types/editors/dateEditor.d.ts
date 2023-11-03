import type { BaseOptions as FlatpickrBaseOptions } from 'flatpickr/dist/types/options';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import type { Column, ColumnEditor, CompositeEditorOption, Editor, EditorArguments, EditorValidator, EditorValidationResult, FlatpickrOption, GridOption, SlickGrid } from './../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
import type { TranslaterService } from '../services/translater.service';
export declare class DateEditor implements Editor {
    protected readonly args: EditorArguments;
    protected _bindEventService: BindingEventService;
    protected _clearButtonElm: HTMLButtonElement;
    protected _editorInputGroupElm: HTMLDivElement;
    protected _inputElm: HTMLInputElement;
    protected _inputWithDataElm: HTMLInputElement | null;
    protected _isValueTouched: boolean;
    protected _lastTriggeredByClearDate: boolean;
    protected _originalDate?: string;
    protected _pickerMergedOptions: FlatpickrOption;
    flatInstance: FlatpickrInstance;
    defaultDate?: string;
    /** is the Editor disabled? */
    disabled: boolean;
    /** SlickGrid Grid object */
    grid: SlickGrid;
    /** Grid options */
    gridOptions: GridOption;
    /** The translate library */
    protected _translaterService: TranslaterService | undefined;
    constructor(args: EditorArguments);
    /** Get Column Definition object */
    get columnDef(): Column;
    /** Get Column Editor object */
    get columnEditor(): ColumnEditor;
    /** Getter for the item data context object */
    get dataContext(): any;
    /** Getter for the Editor DOM Element */
    get editorDomElement(): HTMLInputElement;
    /** Get Flatpickr options passed to the editor by the user */
    get editorOptions(): FlatpickrOption;
    get hasAutoCommitEdit(): boolean;
    get pickerOptions(): FlatpickrOption;
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator(): EditorValidator | undefined;
    init(): void;
    destroy(): void;
    disable(isDisabled?: boolean): void;
    /**
     * Dynamically change an Editor option, this is especially useful with Composite Editor
     * since this is the only way to change option after the Editor is created (for example dynamically change "minDate" or another Editor)
     * @param {string} optionName - Flatpickr option name
     * @param {newValue} newValue - Flatpickr new option value
     */
    changeEditorOption(optionName: keyof FlatpickrBaseOptions, newValue: any): void;
    focus(): void;
    hide(): void;
    show(): void;
    getValue(): string;
    setValue(val: string, isApplyingValue?: boolean, triggerOnCompositeEditorChange?: boolean): void;
    applyValue(item: any, state: any): void;
    isValueChanged(): boolean;
    isValueTouched(): boolean;
    loadValue(item: any): void;
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value?: string, triggerCompositeEventWhenExist?: boolean, clearByDisableCommand?: boolean): void;
    save(): void;
    serializeValue(): any;
    validate(_targetElm?: any, inputValue?: any): EditorValidationResult;
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    protected applyInputUsabilityState(): void;
    protected handleOnDateChange(): void;
    protected handleChangeOnCompositeEditor(compositeEditorOptions: CompositeEditorOption, triggeredBy?: 'user' | 'system', isCalledByClearValue?: boolean): void;
}
//# sourceMappingURL=dateEditor.d.ts.map