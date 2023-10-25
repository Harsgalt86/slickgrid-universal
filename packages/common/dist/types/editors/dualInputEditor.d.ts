/// <reference types="node" />
import type { DOMEvent, Column, ColumnEditor, ColumnEditorDualInput, CompositeEditorOption, Editor, EditorArguments, EditorValidator, EditorValidationResult, GridOption, SlickEventHandler, SlickGrid } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
export declare class DualInputEditor implements Editor {
    protected readonly args: EditorArguments;
    protected _bindEventService: BindingEventService;
    protected _eventHandler: SlickEventHandler;
    protected _isValueSaveCalled: boolean;
    protected _lastEventType: string | undefined;
    protected _lastInputKeyEvent?: KeyboardEvent;
    protected _leftInput: HTMLInputElement;
    protected _isLeftValueTouched: boolean;
    protected _isRightValueTouched: boolean;
    protected _rightInput: HTMLInputElement;
    protected _leftFieldName: string;
    protected _rightFieldName: string;
    protected _originalLeftValue: string | number;
    protected _originalRightValue: string | number;
    protected _timer?: NodeJS.Timeout;
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
    get editorDomElement(): {
        leftInput: HTMLInputElement;
        rightInput: HTMLInputElement;
    };
    get editorParams(): ColumnEditorDualInput;
    get eventHandler(): SlickEventHandler;
    get hasAutoCommitEdit(): boolean;
    get isValueSaveCalled(): boolean;
    /** Get the Shared Validator function, can be passed in Editor property or Column Definition */
    get validator(): EditorValidator | undefined;
    init(): void;
    handleFocusOut(event: DOMEvent<HTMLInputElement>, position: 'leftInput' | 'rightInput'): void;
    handleKeyDown(event: KeyboardEvent, position: 'leftInput' | 'rightInput'): void;
    destroy(): void;
    createInput(position: 'leftInput' | 'rightInput'): HTMLInputElement;
    disable(isDisabled?: boolean): void;
    focus(): void;
    show(): void;
    getValues(): {
        [fieldName: string]: string | number;
    };
    setValues(values: Array<number | string>): void;
    applyValue(item: any, state: any): void;
    applyValueByPosition(item: any, state: any, position: 'leftInput' | 'rightInput'): void;
    isValueChanged(): boolean;
    isValueTouched(): boolean;
    loadValue(item: any): void;
    loadValueByPosition(item: any, position: 'leftInput' | 'rightInput'): void;
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value?: number | string, triggerCompositeEventWhenExist?: boolean, clearByDisableCommand?: boolean): void;
    save(): void;
    serializeValue(): {
        [fieldName: string]: any;
    };
    serializeValueByPosition(position: 'leftInput' | 'rightInput'): string | number;
    getDecimalPlaces(position: 'leftInput' | 'rightInput'): number;
    getInputDecimalSteps(position: 'leftInput' | 'rightInput'): string;
    validate(_targetElm?: any, inputValidation?: {
        position: 'leftInput' | 'rightInput';
        inputValue: any;
    }): EditorValidationResult;
    validateByPosition(position: 'leftInput' | 'rightInput', inputValue?: any): EditorValidationResult;
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    protected applyInputUsabilityState(): void;
    protected handleChangeOnCompositeEditor(event: Event | null, compositeEditorOptions: CompositeEditorOption, triggeredBy?: 'user' | 'system', isCalledByClearValue?: boolean): void;
    protected handleChangeOnCompositeEditorDebounce(event: KeyboardEvent): void;
}
//# sourceMappingURL=dualInputEditor.d.ts.map