import type { AutocompleteItem, AutocompleteResult } from 'autocompleter';
import type { AutocompleterOption, AutocompleteSearchItem, CollectionCustomStructure, Column, ColumnEditor, CompositeEditorOption, Editor, EditorArguments, EditorValidator, EditorValidationResult, GridOption, SlickGrid, Locale } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
import type { TranslaterService } from '../services/translater.service';
export declare class AutocompleterEditor<T extends AutocompleteItem = any> implements Editor {
    protected readonly args: EditorArguments;
    protected _autocompleterOptions: Partial<AutocompleterOption<T>>;
    protected _bindEventService: BindingEventService;
    protected _currentValue: any;
    protected _defaultTextValue: string;
    protected _originalValue: any;
    protected _elementCollection: T[] | null;
    protected _instance?: AutocompleteResult;
    protected _isValueTouched: boolean;
    protected _lastInputKeyEvent?: KeyboardEvent;
    protected _lastTriggeredByClearInput: boolean;
    protected _locales: Locale;
    /** The Editor DOM element */
    protected _editorInputGroupElm: HTMLDivElement;
    protected _inputElm: HTMLInputElement;
    protected _closeButtonGroupElm: HTMLSpanElement;
    protected _clearButtonElm: HTMLButtonElement;
    /** The translate library */
    protected _translater?: TranslaterService;
    /** is the Editor disabled? */
    disabled: boolean;
    /** SlickGrid Grid object */
    grid: SlickGrid;
    /** The property name for labels in the collection */
    labelName: string;
    /** The property name for a prefix that can be added to the labels in the collection */
    labelPrefixName: string;
    /** The property name for a suffix that can be added to the labels in the collection */
    labelSuffixName: string;
    /** The property name for values in the collection */
    valueName: string;
    forceUserInput: boolean;
    /** Final collection displayed in the UI, that is after processing filter/sort/override */
    finalCollection: T[];
    constructor(args: EditorArguments);
    /** Getter for the Autocomplete Option */
    get autocompleterOptions(): Partial<AutocompleterOption>;
    /** Getter of the Collection */
    get collection(): T[];
    /** Getter for the Editor DOM Element */
    get editorDomElement(): HTMLInputElement;
    /** Getter for the Final Collection used in the AutoCompleted Source (this may vary from the "collection" especially when providing a customStructure) */
    get elementCollection(): Array<T | CollectionCustomStructure> | null;
    /** Get Column Definition object */
    get columnDef(): Column;
    /** Get Column Editor object */
    get columnEditor(): ColumnEditor;
    /** Getter for the Custom Structure if exist */
    get customStructure(): CollectionCustomStructure | undefined;
    /** Getter for the item data context object */
    get dataContext(): T;
    get editorOptions(): AutocompleterOption;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    /** Kraaden AutoComplete instance */
    get instance(): AutocompleteResult | undefined;
    get hasAutoCommitEdit(): boolean;
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator(): EditorValidator | undefined;
    init(): void;
    destroy(): void;
    disable(isDisabled?: boolean): void;
    focus(): void;
    show(): void;
    getValue(): string;
    setValue(inputValue: any, isApplyingValue?: boolean, triggerOnCompositeEditorChange?: boolean): void;
    applyValue(item: any, state: any): void;
    isValueChanged(): boolean;
    isValueTouched(): boolean;
    loadValue(item: any): void;
    clear(clearByDisableCommand?: boolean): void;
    /**
     * You can reset the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value?: any, triggerCompositeEventWhenExist?: boolean, clearByDisableCommand?: boolean): void;
    save(): void;
    serializeValue(): any;
    validate(_targetElm?: any, inputValue?: any): EditorValidationResult;
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    protected applyInputUsabilityState(): void;
    protected handleChangeOnCompositeEditor(event: Event | null, compositeEditorOptions: CompositeEditorOption, triggeredBy?: 'user' | 'system', isCalledByClearValue?: boolean): void;
    handleSelect(item: AutocompleteSearchItem): boolean;
    protected renderRegularItem(item: T): HTMLDivElement;
    protected renderCustomItem(item: T): HTMLDivElement;
    protected renderCollectionItem(item: any): HTMLDivElement;
    renderDomElement(collection?: any[]): void;
}
//# sourceMappingURL=autocompleterEditor.d.ts.map