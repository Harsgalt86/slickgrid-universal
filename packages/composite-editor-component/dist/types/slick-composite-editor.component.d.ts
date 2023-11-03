import type { Column, CompositeEditorLabel, CompositeEditorOpenDetailOption, CompositeEditorOption, ContainerService, DOMEvent, Editor, EditorValidationResult, ExternalResource, GridOption, GridService, Locale, OnErrorOption, OnCompositeEditorChangeEventArgs, PlainFunc, SlickDataView, SlickEventHandler, SlickGrid, TranslaterService } from '@slickgrid-universal/common';
import { BindingEventService } from '@slickgrid-universal/common';
type ApplyChangesCallbackFn = (formValues: {
    [columnId: string]: any;
} | null, selection: {
    gridRowIndexes: number[];
    dataContextIds: Array<number | string>;
}, applyToDataview?: boolean) => any[] | void | undefined;
type DataSelection = {
    gridRowIndexes: number[];
    dataContextIds: Array<number | string>;
};
export declare class SlickCompositeEditorComponent implements ExternalResource {
    protected _bindEventService: BindingEventService;
    protected _columnDefinitions: Column[];
    protected _compositeOptions: CompositeEditorOption;
    protected _eventHandler: SlickEventHandler;
    protected _itemDataContext: any;
    protected _modalElm: HTMLDivElement;
    protected _originalDataContext: any;
    protected _options: CompositeEditorOpenDetailOption;
    protected _lastActiveRowNumber: number;
    protected _locales: Locale;
    protected _formValues: {
        [columnId: string]: any;
    } | null;
    protected _editors: {
        [columnId: string]: Editor;
    };
    protected _editorContainers: Array<HTMLElement | null>;
    protected _modalBodyTopValidationElm: HTMLDivElement;
    protected _modalSaveButtonElm: HTMLButtonElement;
    protected grid: SlickGrid;
    protected gridService: GridService | null;
    protected translaterService?: TranslaterService | null;
    get eventHandler(): SlickEventHandler;
    get dataView(): SlickDataView;
    get dataViewLength(): number;
    get formValues(): any;
    get editors(): {
        [columnId: string]: Editor;
    };
    set editors(editors: {
        [columnId: string]: Editor;
    });
    get gridOptions(): GridOption;
    constructor();
    /**
     * initialize the Composite Editor by passing the SlickGrid object and the container service
     *
     * Note: we aren't using DI in the constructor simply to be as framework agnostic as possible,
     * we are simply using this init() function with a very basic container service to do the job
     */
    init(grid: SlickGrid, containerService: ContainerService): void;
    /** Dispose of the Component & unsubscribe all events */
    dispose(): void;
    /** Dispose of the Component without unsubscribing any events */
    disposeComponent(): void;
    /**
     * Dynamically change value of an input from the Composite Editor form.
     *
     * NOTE: user might get an error thrown when trying to apply a value on a Composite Editor that was not found in the form,
     * but in some cases the user might still want the value to be applied to the formValues so that it will be sent to the save in final item data context
     * and when that happens, you can just skip that error so it won't throw.
     * @param {String | Column} columnIdOrDef - column id or column definition
     * @param {*} newValue - the new value
     * @param {Boolean} skipMissingEditorError - defaults to False, skipping the error when the Composite Editor was not found will allow to still apply the value into the formValues object
     * @param {Boolean} triggerOnCompositeEditorChange - defaults to True, will this change trigger a onCompositeEditorChange event?
     */
    changeFormInputValue(columnIdOrDef: string | Column, newValue: any, skipMissingEditorError?: boolean, triggerOnCompositeEditorChange?: boolean): void;
    /**
     * Dynamically update the `formValues` object directly without triggering the onCompositeEditorChange event.
     * The fact that this doesn't trigger an event, might not always be good though, in these cases you are probably better with using the changeFormInputValue() method
     * @param {String | Column} columnIdOrDef - column id or column definition
     * @param {*} newValue - the new value
     */
    changeFormValue(columnIdOrDef: string | Column, newValue: any): void;
    /**
     * Dynamically change an Editor option of the Composite Editor form
     * For example, a use case could be to dynamically change the "minDate" of another Date Editor in the Composite Editor form.
     * @param {String} columnId - column id
     * @param {*} newValue - the new value
     */
    changeFormEditorOption(columnId: string, optionName: string, newOptionValue: any): void;
    /**
     * Disable (or enable) an input of the Composite Editor form
     * @param {String} columnId - column definition id
     * @param isDisabled - defaults to True, are we disabling the associated form input
     */
    disableFormInput(columnId: string, isDisabled?: boolean): void;
    /** Entry point to initialize and open the Composite Editor modal window */
    openDetails(options: CompositeEditorOpenDetailOption): SlickCompositeEditorComponent | null;
    /** Cancel the Editing which will also close the modal window */
    cancelEditing(): Promise<void>;
    /** Show a Validation Summary text (as a <div>) when a validation fails or simply hide it when there's no error */
    showValidationSummaryText(isShowing: boolean, errorMsg?: string): void;
    /** Apply Mass Update Changes (form values) to the entire dataset */
    protected applySaveMassUpdateChanges(formValues: any, _selection: DataSelection, applyToDataview?: boolean): any[];
    /** Apply Mass Changes to the Selected rows in the grid (form values) */
    protected applySaveMassSelectionChanges(formValues: any, selection: DataSelection, applyToDataview?: boolean): any[];
    /**
     * Auto-Calculate how many columns to display in the view layout (1, 2, or 3).
     * We'll display a 1 column layout for 8 or less Editors, 2 columns layout for less than 15 Editors or 3 columns when more than 15 Editors
     * @param {number} editorCount - how many Editors do we have in total
     * @returns {number} count - calculated column count (1, 2 or 3)
     */
    protected autoCalculateLayoutColumnCount(editorCount: number): number;
    /**
     * Create a reset button for each editor and attach a button click handler
     * @param {String} columnId - column id
     * @returns {Object} - html button
     */
    protected createEditorResetButtonElement(columnId: string): HTMLButtonElement;
    /**
     * Create a form reset button and attach a button click handler
     * @param {String} columnId - column id
     * @returns {Object} - html button
     */
    protected createFormResetButtonElement(): HTMLDivElement;
    /**
     * Execute the onError callback when defined
     * or use the default onError callback which is to simply display the error in the console
     */
    protected executeOnError(error: OnErrorOption): void;
    /**
     * A simple and generic method to execute the "OnSave" callback if it's defined by the user OR else simply execute built-in apply changes callback.
     * This method deals with multiple callbacks as shown below
     * @param {Function} applyChangesCallback - first callback to apply the changes into the grid (this could be a user custom callback)
     * @param {Function} executePostCallback - second callback to execute right after the "onSave"
     * @param {Function} beforeClosingCallback - third and last callback to execute after Saving but just before closing the modal window
     * @param {Object} itemDataContext - item data context when modal type is (create/clone/edit)
     */
    protected executeOnSave(applyChangesCallback: ApplyChangesCallbackFn, executePostCallback: PlainFunc, beforeClosingCallback?: PlainFunc, itemDataContext?: any): Promise<void>;
    protected focusOnFirstColumnCellWithEditor(columns: Column[], dataContext: any, columnIndex: number, rowIndex: number, isWithMassChange: boolean): boolean;
    protected findNextAvailableEditorColumnIndex(columns: Column[], dataContext: any, rowIndex: number, isWithMassUpdate: boolean): number;
    /**
     * Get a column definition by providing a column id OR a column definition.
     * If the input is a string, we'll assume it's a columnId and we'll simply search for the column in the column definitions list
     */
    protected getColumnByObjectOrId(columnIdOrDef: string | Column): Column | undefined;
    protected getActiveCellEditor(row: number, cell: number): Editor | null;
    /**
     * Get the column label, the label might have an optional "columnGroup" (or "columnGroupKey" which need to be translated)
     * @param {object} columnDef - column definition
     * @returns {string} label - column label
     */
    protected getColumnLabel(columnDef: Column): string;
    /** Get the correct label text depending, if we use a Translater Service then translate the text when possible else use default text */
    protected getLabelText(labelProperty: keyof CompositeEditorLabel, localeText: string, defaultText: string): string;
    /** Retrieve the current selection of row indexes & data context Ids */
    protected getCurrentRowSelections(): {
        gridRowIndexes: number[];
        dataContextIds: Array<string | number>;
    };
    protected handleBodyClicked(event: Event): void;
    protected handleKeyDown(event: KeyboardEvent): void;
    protected handleResetInputValue(event: DOMEvent<HTMLButtonElement>): void;
    /** Callback which processes a Mass Update or Mass Selection Changes */
    protected handleMassSaving(modalType: 'mass-update' | 'mass-selection', executePostCallback: PlainFunc): Promise<void>;
    /** Anytime an input of the Composite Editor form changes, we'll add/remove a "modified" CSS className for styling purposes */
    protected handleOnCompositeEditorChange(_e: Event, args: OnCompositeEditorChangeEventArgs): void;
    /** Check wether the grid has the Row Selection enabled */
    protected hasRowSelectionEnabled(): false | import("@slickgrid-universal/common").SlickCellSelectionModel | import("@slickgrid-universal/common").SlickRowSelectionModel | undefined;
    /** Reset Form button handler */
    protected handleResetFormClicked(): void;
    /** switch case handler to determine which code to execute depending on the modal type */
    protected handleSaveClicked(): void;
    /** Insert an item into the DataView or throw an error when finding duplicate id in the dataset */
    protected insertNewItemInDataView(item: any): void;
    protected parseText(inputText: string, mappedArgs: any): string;
    /** Put back the current row to its original item data context using the DataView without triggering a change */
    protected resetCurrentRowDataContext(): void;
    /** Validate all the Composite Editors that are defined in the form */
    protected validateCompositeEditors(targetElm?: HTMLElement): EditorValidationResult;
    /** Validate the current cell editor */
    protected validateCurrentEditor(): void;
}
export {};
//# sourceMappingURL=slick-composite-editor.component.d.ts.map