import type { Column, ColumnEditor, CompositeEditorOption, CurrentSliderOption, Editor, EditorArguments, EditorValidator, EditorValidationResult, GridOption, SlickGrid } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
export declare class SliderEditor implements Editor {
    protected readonly args: EditorArguments;
    protected _bindEventService: BindingEventService;
    protected _defaultValue: number;
    protected _isValueTouched: boolean;
    protected _originalValue?: number | string;
    protected _cellContainerElm: HTMLDivElement;
    protected _editorElm: HTMLDivElement;
    protected _inputElm: HTMLInputElement;
    protected _sliderOptions: CurrentSliderOption;
    protected _sliderTrackElm: HTMLDivElement;
    protected _sliderNumberElm: HTMLSpanElement | null;
    /** is the Editor disabled? */
    disabled: boolean;
    /** SlickGrid Grid object */
    grid: SlickGrid;
    /** Grid options */
    gridOptions: GridOption;
    constructor(args: EditorArguments);
    /** Get Column Definition object */
    get columnDef(): Column;
    /** Get Column Editor object */
    get columnEditor(): ColumnEditor;
    /** Getter for the item data context object */
    get dataContext(): any;
    /** Getter for the Editor DOM Element */
    get editorDomElement(): HTMLDivElement;
    /** Getter for the Editor Input DOM Element */
    get editorInputDomElement(): HTMLInputElement;
    get hasAutoCommitEdit(): boolean;
    /** Getter for the current Slider Options */
    get sliderOptions(): CurrentSliderOption | undefined;
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator(): EditorValidator | undefined;
    init(): void;
    cancel(): void;
    destroy(): void;
    disable(isDisabled?: boolean): void;
    focus(): void;
    show(): void;
    getValue(): string;
    setValue(value: number | string, isApplyingValue?: boolean, triggerOnCompositeEditorChange?: boolean): void;
    applyValue(item: any, state: any): void;
    isValueChanged(): boolean;
    isValueTouched(): boolean;
    loadValue(item: any): void;
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value?: number | string, triggerCompositeEventWhenExist?: boolean, clearByDisableCommand?: boolean): void;
    save(): void;
    serializeValue(): string | number | undefined;
    validate(_targetElm?: any, inputValue?: any): EditorValidationResult;
    /**
     * Create the HTML template as a string
     */
    protected buildDomElement(): HTMLDivElement;
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    protected applyInputUsabilityState(): void;
    protected handleChangeEvent(event: MouseEvent): void;
    protected handleChangeSliderNumber(event: Event): void;
    protected handleChangeOnCompositeEditor(event: Event | null, compositeEditorOptions: CompositeEditorOption, triggeredBy?: 'user' | 'system', isCalledByClearValue?: boolean): void;
    protected sliderTrackClicked(e: MouseEvent): void;
    protected updateTrackFilledColorWhenEnabled(): void;
}
//# sourceMappingURL=sliderEditor.d.ts.map