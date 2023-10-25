import type { Column, ColumnEditor, CompositeEditorOption, Editor, EditorArguments, EditorValidator, EditorValidationResult, GridOption, SlickGrid } from './../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
export declare class CheckboxEditor implements Editor {
    protected readonly args: EditorArguments;
    protected _bindEventService: BindingEventService;
    protected _checkboxContainerElm: HTMLDivElement;
    protected _input: HTMLInputElement;
    protected _isValueTouched: boolean;
    protected _originalValue?: boolean | string;
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
    get editorDomElement(): any;
    get hasAutoCommitEdit(): boolean;
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator(): EditorValidator | undefined;
    init(): void;
    destroy(): void;
    disable(isDisabled?: boolean): void;
    focus(): void;
    /** pre-click, when enabled, will simply toggle the checkbox without requiring to double-click */
    preClick(): void;
    show(): void;
    getValue(): boolean;
    setValue(val: boolean | string, isApplyingValue?: boolean, triggerOnCompositeEditorChange?: boolean): void;
    applyValue(item: any, state: any): void;
    isValueChanged(): boolean;
    isValueTouched(): boolean;
    loadValue(item: any): void;
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value?: boolean, triggerCompositeEventWhenExist?: boolean, clearByDisableCommand?: boolean): void;
    save(): void;
    serializeValue(): boolean;
    validate(_targetElm?: any, inputValue?: any): EditorValidationResult;
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    protected applyInputUsabilityState(): void;
    protected handleChangeOnCompositeEditor(event: Event | null, compositeEditorOptions: CompositeEditorOption, triggeredBy?: 'user' | 'system', isCalledByClearValue?: boolean): void;
}
//# sourceMappingURL=checkboxEditor.d.ts.map