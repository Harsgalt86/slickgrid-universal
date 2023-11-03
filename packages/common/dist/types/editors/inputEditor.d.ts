/// <reference types="node" />
import type { Column, ColumnEditor, CompositeEditorOption, Editor, EditorArguments, EditorValidator, EditorValidationResult, GridOption, SlickGrid } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
export declare class InputEditor implements Editor {
    protected readonly args: EditorArguments;
    protected _bindEventService: BindingEventService;
    protected _input: HTMLInputElement | undefined;
    protected _inputType: string;
    protected _isValueTouched: boolean;
    protected _lastInputKeyEvent?: KeyboardEvent;
    protected _originalValue?: number | string;
    protected _timer?: NodeJS.Timeout;
    /** is the Editor disabled? */
    disabled: boolean;
    /** SlickGrid Grid object */
    grid: SlickGrid;
    /** Grid options */
    gridOptions: GridOption;
    constructor(args: EditorArguments, inputType: string);
    /** Get Column Definition object */
    get columnDef(): Column;
    /** Get Column Editor object */
    get columnEditor(): ColumnEditor;
    /** Getter for the item data context object */
    get dataContext(): any;
    /** Getter for the Editor DOM Element */
    get editorDomElement(): any;
    get hasAutoCommitEdit(): boolean;
    /** Getter of input type (text, number, password) */
    get inputType(): string;
    /** Setter of input type (text, number, password) */
    set inputType(type: string);
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator(): EditorValidator | undefined;
    init(): void;
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
    serializeValue(): number | string;
    validate(_targetElm?: any, inputValue?: any): EditorValidationResult;
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    protected applyInputUsabilityState(): void;
    protected handleChangeOnCompositeEditor(event: Event | null, compositeEditorOptions: CompositeEditorOption, triggeredBy?: 'user' | 'system', isCalledByClearValue?: boolean): void;
    protected handleOnInputChange(event: KeyboardEvent): void;
}
//# sourceMappingURL=inputEditor.d.ts.map