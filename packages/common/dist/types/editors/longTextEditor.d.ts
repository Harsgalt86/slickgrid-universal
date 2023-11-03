/// <reference types="node" />
import type { Column, ColumnEditor, CompositeEditorOption, Editor, EditorArguments, EditorValidator, EditorValidationResult, GridOption, HtmlElementPosition, Locale, LongTextEditorOption, SlickGrid } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
import type { TranslaterService } from '../services/translater.service';
export declare class LongTextEditor implements Editor {
    protected readonly args: EditorArguments;
    protected _bindEventService: BindingEventService;
    protected _defaultTextValue: any;
    protected _isValueTouched: boolean;
    protected _locales: Locale;
    protected _timer?: NodeJS.Timeout;
    protected _currentLengthElm: HTMLSpanElement;
    protected _textareaElm: HTMLTextAreaElement;
    protected _wrapperElm: HTMLDivElement;
    /** is the Editor disabled? */
    disabled: boolean;
    /** SlickGrid Grid object */
    grid: SlickGrid;
    /** Grid options */
    gridOptions: GridOption;
    /** The translate library */
    protected _translater?: TranslaterService;
    constructor(args: EditorArguments);
    /** Get Column Definition object */
    get columnDef(): Column;
    /** Get Column Editor object */
    get columnEditor(): ColumnEditor;
    /** Getter for the item data context object */
    get dataContext(): any;
    /** Getter for the Editor DOM Element */
    get editorDomElement(): HTMLTextAreaElement;
    get editorOptions(): LongTextEditorOption;
    get hasAutoCommitEdit(): boolean;
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator(): EditorValidator | undefined;
    init(): void;
    cancel(): void;
    hide(): void;
    show(): void;
    destroy(): void;
    disable(isDisabled?: boolean): void;
    focus(): void;
    getValue(): string;
    setValue(val: string, isApplyingValue?: boolean, triggerOnCompositeEditorChange?: boolean): void;
    applyValue(item: any, state: any): void;
    isValueChanged(): boolean;
    isValueTouched(): boolean;
    loadValue(item: any): void;
    /**
     * Reposition the LongText Editor to be right over the cell, so that it looks like we opened the editor on top of the cell when in reality we just reposition (absolute) over the cell.
     * By default we use an "auto" mode which will allow to position the LongText Editor to the best logical position in the window, also when we say position, we are talking about the relative position against the grid cell.
     * We can assume that in 80% of the time the default position is bottom right, the default is "auto" but we can also override this and use a specific position.
     * Most of the time positioning of the editor will be to the "right" of the cell is ok but if our column is completely on the right side then we'll want to change the position to "left" align.
     * Same goes for the top/bottom position, Most of the time positioning the editor to the "bottom" but we are clicking on a cell at the bottom of the grid then we might need to reposition to "top" instead.
     * NOTE: this only applies to Inline Editing and will not have any effect when using the Composite Editor modal window.
     */
    position(parentPosition: HtmlElementPosition): void;
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value?: string, triggerCompositeEventWhenExist?: boolean, clearByDisableCommand?: boolean): void;
    save(): void;
    serializeValue(): string;
    validate(_targetElm?: HTMLElement, inputValue?: any): EditorValidationResult;
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    protected applyInputUsabilityState(): void;
    protected handleKeyDown(event: KeyboardEvent): void;
    /** On every input change event, we'll update the current text length counter */
    protected handleOnInputChange(event: Event & {
        clipboardData: DataTransfer;
        target: HTMLTextAreaElement;
    }): void;
    protected handleChangeOnCompositeEditor(event: Event | null, compositeEditorOptions: CompositeEditorOption, triggeredBy?: 'user' | 'system', isCalledByClearValue?: boolean): void;
    /**
     * Truncate text if the value is longer than the acceptable max length
     * @param inputElm - textarea html element
     * @param maxLength - max acceptable length
     * @returns truncated - returns True if it truncated or False otherwise
     */
    protected truncateText(inputElm: HTMLTextAreaElement, maxLength: number): boolean;
}
//# sourceMappingURL=longTextEditor.d.ts.map