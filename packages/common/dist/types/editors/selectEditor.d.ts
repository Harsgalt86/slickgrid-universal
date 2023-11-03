import { MultipleSelectInstance, MultipleSelectOption, OptionRowData } from 'multiple-select-vanilla';
import type { CollectionCustomStructure, CollectionOption, Column, ColumnEditor, CompositeEditorOption, Editor, EditorArguments, EditorValidator, EditorValidationResult, GridOption, Locale, SelectOption, SlickGrid } from './../interfaces/index';
import { CollectionService, type TranslaterService } from '../services/index';
/**
 * Slickgrid editor class for multiple/single select lists
 */
export declare class SelectEditor implements Editor {
    protected readonly args: EditorArguments;
    protected readonly isMultipleSelect: boolean;
    delayOpening: number;
    protected _isValueTouched: boolean;
    /** Locales */
    protected _locales: Locale;
    protected _isDisposingOrCallingSave: boolean;
    /** Collection Service */
    protected _collectionService: CollectionService;
    /** The translate library */
    protected _translaterService?: TranslaterService;
    protected _msInstance?: MultipleSelectInstance;
    /** Editor DOM element */
    editorElm?: HTMLElement;
    /** is the Editor disabled? */
    disabled: boolean;
    /** Editor Multiple-Select options */
    editorElmOptions: Partial<MultipleSelectOption>;
    /** DOM Element Name, useful for auto-detecting positioning (dropup / dropdown) */
    elementName: string;
    /** The multiple-select options for a multiple select list */
    defaultOptions: Partial<MultipleSelectOption>;
    /** The original item values that are set at the beginning */
    originalValue: any | any[];
    /** The property name for labels in the collection */
    labelName: string;
    /** The property name for a prefix that can be added to the labels in the collection */
    labelPrefixName: string;
    /** The property name for a suffix that can be added to the labels in the collection */
    labelSuffixName: string;
    /** A label that can be added to each option and can be used as an alternative to display selected options */
    optionLabel: string;
    /** The property name for values in the collection */
    valueName: string;
    /** Grid options */
    gridOptions: GridOption;
    /** Do we translate the label? */
    enableTranslateLabel: boolean;
    /** SlickGrid Grid object */
    grid: SlickGrid;
    /** Final collection displayed in the UI, that is after processing filter/sort/override */
    finalCollection: any[];
    constructor(args: EditorArguments, isMultipleSelect: boolean, delayOpening?: number);
    /** Get the Collection */
    get collection(): SelectOption[];
    /** Getter for the Collection Options */
    get collectionOptions(): CollectionOption | undefined;
    /** Get Column Definition object */
    get columnDef(): Column;
    /** Get Column Editor object */
    get columnEditor(): ColumnEditor | undefined;
    /** Getter for item data context object */
    get dataContext(): any;
    /** Getter for the Editor DOM Element */
    get editorDomElement(): HTMLElement | undefined;
    get isCompositeEditor(): boolean;
    /** Getter for the Custom Structure if exist */
    protected get customStructure(): CollectionCustomStructure | undefined;
    get hasAutoCommitEdit(): boolean;
    get msInstance(): MultipleSelectInstance | undefined;
    get selectOptions(): Partial<MultipleSelectOption>;
    /**
     * The current selected values (multiple select) from the collection
     */
    get currentValues(): any[] | null;
    /**
     * The current selected values (single select) from the collection
     */
    get currentValue(): number | string;
    /** Get the Validator function, can be passed in Editor property or Column Definition */
    get validator(): EditorValidator | undefined;
    init(): void;
    getValue(): any | any[];
    setValue(value: any | any[], isApplyingValue?: boolean, triggerOnCompositeEditorChange?: boolean): void;
    hide(): void;
    show(openDelay?: number | null): void;
    applyValue(item: any, state: any): void;
    destroy(): void;
    loadValue(item: any): void;
    loadMultipleValues(currentValues: any[]): void;
    loadSingleValue(currentValue: any): void;
    serializeValue(): any | any[];
    /**
     * Dynamically change an Editor option, this is especially useful with Composite Editor
     * since this is the only way to change option after the Editor is created (for example dynamically change "minDate" or another Editor)
     * @param {string} optionName - MultipleSelect option name
     * @param {newValue} newValue - MultipleSelect new option value
     */
    changeEditorOption(optionName: keyof MultipleSelectOption, newValue: any): void;
    disable(isDisabled?: boolean): void;
    focus(): void;
    isValueChanged(): boolean;
    isValueTouched(): boolean;
    /**
     * You can reset or clear the input value,
     * when no value is provided it will use the original value to reset (could be useful with Composite Editor Modal with edit/clone)
     */
    reset(value?: string, triggerCompositeEventWhenExist?: boolean, clearByDisableCommand?: boolean): void;
    save(forceCommitCurrentEdit?: boolean): void;
    validate(_targetElm?: any, inputValue?: any): EditorValidationResult;
    /** when it's a Composite Editor, we'll check if the Editor is editable (by checking onBeforeEditCell) and if not Editable we'll disable the Editor */
    protected applyInputUsabilityState(): void;
    /**
     * user might want to filter certain items of the collection
     * @param inputCollection
     * @return outputCollection filtered and/or sorted collection
     */
    protected filterCollection(inputCollection: any[]): any[];
    /**
     * user might want to sort the collection in a certain way
     * @param inputCollection
     * @return outputCollection filtered and/or sorted collection
     */
    protected sortCollection(inputCollection: any[]): any[];
    renderDomElement(inputCollection?: any[]): void;
    /** Create a blank entry that can be added to the collection. It will also reuse the same collection structure provided by the user */
    protected createBlankEntry(): any;
    /**
     * From the Select DOM Element created earlier, create a Multiple/Single Select Editor using the multiple-select-vanilla.js lib
     * @param {Object} selectElement
     */
    protected createDomElement(selectElement: HTMLSelectElement, dataCollection: OptionRowData[]): void;
    protected handleChangeOnCompositeEditor(compositeEditorOptions: CompositeEditorOption, triggeredBy?: 'user' | 'system', isCalledByClearValue?: boolean): void;
}
//# sourceMappingURL=selectEditor.d.ts.map