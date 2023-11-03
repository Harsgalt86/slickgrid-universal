import { KeyCode } from '../enums/keyCode.enum';
import { SlickRowSelectionModel } from './slickRowSelectionModel';
import { createDomElement, emptyElement } from '../services/domUtilities';
import { BindingEventService } from '../services/bindingEvent.service';
export class SlickCheckboxSelectColumn {
    constructor(pubSubService, options) {
        this.pubSubService = pubSubService;
        this.pluginName = 'CheckboxSelectColumn';
        this._defaults = {
            columnId: '_checkbox_selector',
            cssClass: null,
            field: '_checkbox_selector',
            hideSelectAllCheckbox: false,
            toolTip: 'Select/Deselect All',
            width: 30,
            applySelectOnAllPages: true,
            hideInColumnTitleRow: false,
            hideInFilterHeaderRow: true
        };
        this._addonOptions = this._defaults;
        this._checkboxColumnCellIndex = null;
        this._isSelectAllChecked = false;
        this._isUsingDataView = false;
        this._selectedRowsLookup = {};
        this._selectAll_UID = this.createUID();
        this._bindEventService = new BindingEventService();
        this._eventHandler = new Slick.EventHandler();
        this._addonOptions = { ...this._defaults, ...options };
    }
    get addonOptions() {
        return this._addonOptions;
    }
    get headerRowNode() {
        return this._headerRowNode;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    get selectAllUid() {
        return this._selectAll_UID;
    }
    set selectedRowsLookup(selectedRows) {
        this._selectedRowsLookup = selectedRows;
    }
    init(grid) {
        this._grid = grid;
        this._isUsingDataView = !Array.isArray(grid.getData());
        if (this._isUsingDataView) {
            this._dataView = grid.getData();
        }
        // we cannot apply "Select All" to all pages when using a Backend Service API (OData, GraphQL, ...)
        if (this.gridOptions.backendServiceApi) {
            this._addonOptions.applySelectOnAllPages = false;
        }
        this._eventHandler
            .subscribe(grid.onSelectedRowsChanged, this.handleSelectedRowsChanged.bind(this))
            .subscribe(grid.onClick, this.handleClick.bind(this))
            .subscribe(grid.onKeyDown, this.handleKeyDown.bind(this));
        if (this._isUsingDataView && this._dataView && this._addonOptions.applySelectOnAllPages) {
            this._eventHandler
                .subscribe(this._dataView.onSelectedRowIdsChanged, this.handleDataViewSelectedIdsChanged.bind(this))
                .subscribe(this._dataView.onPagingInfoChanged, this.handleDataViewSelectedIdsChanged.bind(this));
        }
        if (!this._addonOptions.hideInFilterHeaderRow) {
            this.addCheckboxToFilterHeaderRow(grid);
        }
        if (!this._addonOptions.hideInColumnTitleRow) {
            this._eventHandler.subscribe(this._grid.onHeaderClick, this.handleHeaderClick.bind(this));
        }
        // this also requires the Row Selection Model to be registered as well
        if (!this._rowSelectionModel || !this._grid.getSelectionModel()) {
            this._rowSelectionModel = new SlickRowSelectionModel(this.gridOptions.rowSelectionOptions);
            this._grid.setSelectionModel(this._rowSelectionModel);
        }
        // user might want to pre-select some rows
        // the setTimeout is because of timing issue with styling (row selection happen but rows aren't highlighted properly)
        if (this.gridOptions.preselectedRows && this._rowSelectionModel && this._grid.getSelectionModel()) {
            setTimeout(() => this.selectRows(this.gridOptions.preselectedRows || []));
        }
        // user could override the checkbox icon logic from within the options or after instantiating the plugin
        if (typeof this._addonOptions.selectableOverride === 'function') {
            this.selectableOverride(this._addonOptions.selectableOverride);
        }
    }
    dispose() {
        this._bindEventService.unbindAll();
        this._eventHandler.unsubscribeAll();
    }
    /**
     * Create the plugin before the Grid creation to avoid having odd behaviors.
     * Mostly because the column definitions might change after the grid creation, so we want to make sure to add it before then
     */
    create(columnDefinitions, gridOptions) {
        var _a, _b;
        this._addonOptions = { ...this._defaults, ...gridOptions.checkboxSelector };
        if (Array.isArray(columnDefinitions) && gridOptions) {
            const selectionColumn = this.getColumnDefinition();
            // add new checkbox column unless it was already added
            if (!columnDefinitions.some(col => col.id === selectionColumn.id)) {
                // column index position in the grid
                const columnPosition = (_b = (_a = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.checkboxSelector) === null || _a === void 0 ? void 0 : _a.columnIndexPosition) !== null && _b !== void 0 ? _b : 0;
                if (columnPosition > 0) {
                    columnDefinitions.splice(columnPosition, 0, selectionColumn);
                }
                else {
                    columnDefinitions.unshift(selectionColumn);
                }
                this.pubSubService.publish(`onPluginColumnsChanged`, {
                    columns: columnDefinitions,
                    pluginName: this.pluginName
                });
            }
        }
        return this;
    }
    getOptions() {
        return this._addonOptions;
    }
    setOptions(options) {
        var _a;
        this._addonOptions = { ...this._addonOptions, ...options };
        if (this._addonOptions.hideSelectAllCheckbox) {
            this.hideSelectAllFromColumnHeaderTitleRow();
            this.hideSelectAllFromColumnHeaderFilterRow();
        }
        else {
            if (!this._addonOptions.hideInColumnTitleRow) {
                this.renderSelectAllCheckbox(this._isSelectAllChecked);
                this._eventHandler.subscribe(this._grid.onHeaderClick, this.handleHeaderClick.bind(this));
            }
            else {
                this.hideSelectAllFromColumnHeaderTitleRow();
            }
            if (!this._addonOptions.hideInFilterHeaderRow) {
                const selectAllContainerElm = (_a = this.headerRowNode) === null || _a === void 0 ? void 0 : _a.querySelector('#filter-checkbox-selectall-container');
                if (selectAllContainerElm) {
                    selectAllContainerElm.style.display = 'flex';
                    selectAllContainerElm.ariaChecked = String(this._isSelectAllChecked);
                    const selectAllInputElm = selectAllContainerElm.querySelector('input[type="checkbox"]');
                    if (selectAllInputElm) {
                        selectAllInputElm.ariaChecked = String(this._isSelectAllChecked);
                        selectAllInputElm.checked = this._isSelectAllChecked;
                    }
                }
            }
            else {
                this.hideSelectAllFromColumnHeaderFilterRow();
            }
        }
    }
    deSelectRows(rowArray) {
        const removeRows = [];
        for (const row of rowArray) {
            if (this._selectedRowsLookup[row]) {
                removeRows[removeRows.length] = row;
            }
        }
        this._grid.setSelectedRows(this._grid.getSelectedRows().filter((n) => removeRows.indexOf(n) < 0), 'SlickCheckboxSelectColumn.deSelectRows');
    }
    selectRows(rowArray) {
        var _a;
        const addRows = [];
        for (const row of rowArray) {
            if (this._selectedRowsLookup[row]) {
                addRows[addRows.length] = row;
            }
        }
        const newSelectedRows = (_a = this._grid.getSelectedRows()) === null || _a === void 0 ? void 0 : _a.concat(addRows);
        this._grid.setSelectedRows(newSelectedRows);
    }
    getColumnDefinition() {
        var _a, _b;
        const columnId = String((_b = (_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.columnId) !== null && _b !== void 0 ? _b : this._defaults.columnId);
        return {
            id: columnId,
            name: (this._addonOptions.hideSelectAllCheckbox || this._addonOptions.hideInColumnTitleRow) ? '' : `<input id="header-selector${this._selectAll_UID}" type="checkbox"><label for="header-selector${this._selectAll_UID}"></label>`,
            toolTip: (this._addonOptions.hideSelectAllCheckbox || this._addonOptions.hideInColumnTitleRow) ? '' : this._addonOptions.toolTip,
            field: columnId,
            cssClass: this._addonOptions.cssClass,
            excludeFromExport: true,
            excludeFromColumnPicker: true,
            excludeFromGridMenu: true,
            excludeFromQuery: true,
            excludeFromHeaderMenu: true,
            hideSelectAllCheckbox: this._addonOptions.hideSelectAllCheckbox,
            resizable: false,
            sortable: false,
            width: this._addonOptions.width || 30,
            formatter: this.checkboxSelectionFormatter.bind(this),
        };
    }
    hideSelectAllFromColumnHeaderTitleRow() {
        this._grid.updateColumnHeader(this._addonOptions.columnId || '', '', '');
    }
    hideSelectAllFromColumnHeaderFilterRow() {
        var _a;
        const selectAllContainerElm = (_a = this.headerRowNode) === null || _a === void 0 ? void 0 : _a.querySelector('#filter-checkbox-selectall-container');
        if (selectAllContainerElm) {
            selectAllContainerElm.style.display = 'none';
        }
    }
    /**
     * Toggle a row selection by providing a row number
     * @param {Number} row - grid row number to toggle
     */
    toggleRowSelection(row) {
        this.toggleRowSelectionWithEvent(null, row);
    }
    /**
     *  Toggle a row selection and also provide the event that triggered it
     * @param {Object} event - event that triggered the row selection change
     * @param {Number} row - grid row number to toggle
     * @returns
     */
    toggleRowSelectionWithEvent(event, row) {
        const dataContext = this._grid.getDataItem(row);
        if (!this.checkSelectableOverride(row, dataContext, this._grid)) {
            return;
        }
        // user can optionally execute a callback defined in its grid options prior to toggling the row
        const previousSelectedRows = this._grid.getSelectedRows();
        if (this._addonOptions.onRowToggleStart) {
            this._addonOptions.onRowToggleStart(event, { row, previousSelectedRows });
        }
        const newSelectedRows = this._selectedRowsLookup[row] ? this._grid.getSelectedRows().filter((n) => n !== row) : this._grid.getSelectedRows().concat(row);
        this._grid.setSelectedRows(newSelectedRows, 'click.toggle');
        this._grid.setActiveCell(row, this.getCheckboxColumnCellIndex());
        // user can optionally execute a callback defined in its grid options after the row toggle is completed
        if (this._addonOptions.onRowToggleEnd) {
            this._addonOptions.onRowToggleEnd(event, { row, previousSelectedRows });
        }
    }
    /**
     * Method that user can pass to override the default behavior or making every row a selectable row.
     * In order word, user can choose which rows to be selectable or not by providing his own logic.
     * @param overrideFn: override function callback
     */
    selectableOverride(overrideFn) {
        this._selectableOverride = overrideFn;
    }
    //
    // protected functions
    // ---------------------
    addCheckboxToFilterHeaderRow(grid) {
        this._eventHandler.subscribe(grid.onHeaderRowCellRendered, (_e, args) => {
            if (args.column.field === (this._addonOptions.field || '_checkbox_selector')) {
                emptyElement(args.node);
                // <span class="container"><input type="checkbox"><label for="checkbox"></label></span>
                const spanElm = createDomElement('span', { id: 'filter-checkbox-selectall-container', ariaChecked: 'false' });
                spanElm.appendChild(createDomElement('input', { type: 'checkbox', id: `header-filter-selector${this._selectAll_UID}` }));
                spanElm.appendChild(createDomElement('label', { htmlFor: `header-filter-selector${this._selectAll_UID}` }));
                args.node.appendChild(spanElm);
                this._headerRowNode = args.node;
                this._bindEventService.bind(spanElm, 'click', ((e) => this.handleHeaderClick(e, args)));
            }
        });
    }
    checkboxSelectionFormatter(row, cell, value, columnDef, dataContext, grid) {
        if (dataContext && this.checkSelectableOverride(row, dataContext, grid)) {
            const UID = this.createUID() + row;
            return `<input id="selector${UID}" type="checkbox" ${this._selectedRowsLookup[row] ? `checked="checked" aria-checked="true"` : 'aria-checked="false"'}><label for="selector${UID}"></label>`;
        }
        return null;
    }
    checkSelectableOverride(row, dataContext, grid) {
        if (typeof this._selectableOverride === 'function') {
            return this._selectableOverride(row, dataContext, grid);
        }
        return true;
    }
    createUID() {
        return Math.round(10000000 * Math.random());
    }
    getCheckboxColumnCellIndex() {
        if (this._checkboxColumnCellIndex === null) {
            this._checkboxColumnCellIndex = 0;
            const colArr = this._grid.getColumns();
            for (let i = 0; i < colArr.length; i++) {
                if (colArr[i].id === this._addonOptions.columnId) {
                    this._checkboxColumnCellIndex = i;
                }
            }
        }
        return this._checkboxColumnCellIndex;
    }
    handleDataViewSelectedIdsChanged() {
        var _a;
        const selectedIds = this._dataView.getAllSelectedFilteredIds();
        const filteredItems = this._dataView.getFilteredItems();
        let disabledCount = 0;
        if (typeof this._selectableOverride === 'function' && selectedIds.length > 0) {
            for (let k = 0; k < this._dataView.getItemCount(); k++) {
                // If we are allowed to select the row
                const dataItem = this._dataView.getItemByIdx(k);
                const idProperty = this._dataView.getIdPropertyName();
                const dataItemId = dataItem[idProperty];
                const foundItemIdx = filteredItems.findIndex((item) => item[idProperty] === dataItemId);
                if (foundItemIdx >= 0 && !this.checkSelectableOverride(k, dataItem, this._grid)) {
                    disabledCount++;
                }
            }
        }
        this._isSelectAllChecked = (selectedIds.length + disabledCount) >= filteredItems.length;
        if (!this._addonOptions.hideInColumnTitleRow && !this._addonOptions.hideSelectAllCheckbox) {
            this.renderSelectAllCheckbox(this._isSelectAllChecked);
        }
        if (!this._addonOptions.hideInFilterHeaderRow) {
            const selectAllElm = (_a = this.headerRowNode) === null || _a === void 0 ? void 0 : _a.querySelector(`#header-filter-selector${this._selectAll_UID}`);
            if (selectAllElm) {
                selectAllElm.ariaChecked = String(this._isSelectAllChecked);
                selectAllElm.checked = this._isSelectAllChecked;
            }
        }
    }
    handleClick(e, args) {
        // clicking on a row select checkbox
        if (this._grid.getColumns()[args.cell].id === this._addonOptions.columnId && e.target.type === 'checkbox') {
            e.target.ariaChecked = String(e.target.checked);
            // if editing, try to commit
            if (this._grid.getEditorLock().isActive() && !this._grid.getEditorLock().commitCurrentEdit()) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return;
            }
            this.toggleRowSelectionWithEvent(e, args.row);
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    }
    handleHeaderClick(e, args) {
        if (args.column.id === this._addonOptions.columnId && e.target.type === 'checkbox') {
            e.target.ariaChecked = String(e.target.checked);
            // if editing, try to commit
            if (this._grid.getEditorLock().isActive() && !this._grid.getEditorLock().commitCurrentEdit()) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return;
            }
            // who called the selection?
            let isAllSelected = e.target.checked;
            const caller = isAllSelected ? 'click.selectAll' : 'click.unselectAll';
            // trigger event before the real selection so that we have an event before & the next one after the change
            const previousSelectedRows = this._grid.getSelectedRows();
            // user can optionally execute a callback defined in its grid options prior to the Select All toggling
            if (this._addonOptions.onSelectAllToggleStart) {
                this._addonOptions.onSelectAllToggleStart(e, { previousSelectedRows, caller });
            }
            let newSelectedRows = []; // when unselecting all, the array will become empty
            if (isAllSelected) {
                const rows = [];
                for (let i = 0; i < this._grid.getDataLength(); i++) {
                    // Get the row and check it's a selectable row before pushing it onto the stack
                    const rowItem = this._grid.getDataItem(i);
                    if (!rowItem.__group && !rowItem.__groupTotals && this.checkSelectableOverride(i, rowItem, this._grid)) {
                        rows.push(i);
                    }
                }
                newSelectedRows = rows;
                isAllSelected = true;
            }
            if (this._isUsingDataView && this._dataView && this._addonOptions.applySelectOnAllPages) {
                const ids = [];
                const filteredItems = this._dataView.getFilteredItems();
                for (let j = 0; j < filteredItems.length; j++) {
                    // Get the row and check it's a selectable ID (it could be in a different page) before pushing it onto the stack
                    const dataviewRowItem = filteredItems[j];
                    if (this.checkSelectableOverride(j, dataviewRowItem, this._grid)) {
                        ids.push(dataviewRowItem[this._dataView.getIdPropertyName()]);
                    }
                }
                this._dataView.setSelectedIds(ids, { isRowBeingAdded: isAllSelected });
            }
            // we finally need to call the actual row selection from SlickGrid method
            this._grid.setSelectedRows(newSelectedRows, caller);
            // user can optionally execute a callback defined in its grid options after the Select All toggling is completed
            if (this._addonOptions.onSelectAllToggleEnd) {
                this._addonOptions.onSelectAllToggleEnd(e, { rows: newSelectedRows, previousSelectedRows, caller });
            }
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    }
    handleKeyDown(e, args) {
        if (e.which === KeyCode.SPACE || e.key === ' ') {
            if (this._grid.getColumns()[args.cell].id === this._addonOptions.columnId) {
                // if editing, try to commit
                if (!this._grid.getEditorLock().isActive() || this._grid.getEditorLock().commitCurrentEdit()) {
                    this.toggleRowSelectionWithEvent(e, args.row);
                }
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }
    }
    handleSelectedRowsChanged() {
        var _a, _b;
        const selectedRows = this._grid.getSelectedRows();
        const lookup = {};
        let row = 0;
        let i = 0;
        let k = 0;
        let disabledCount = 0;
        if (typeof this._selectableOverride === 'function') {
            for (k = 0; k < this._grid.getDataLength(); k++) {
                // If we are allowed to select the row
                const dataItem = this._grid.getDataItem(k);
                if (!this.checkSelectableOverride(i, dataItem, this._grid)) {
                    disabledCount++;
                }
            }
        }
        const removeList = [];
        for (i = 0; i < selectedRows.length; i++) {
            row = selectedRows[i];
            // If we are allowed to select the row
            const rowItem = this._grid.getDataItem(row);
            if (this.checkSelectableOverride(i, rowItem, this._grid)) {
                lookup[row] = true;
                if (lookup[row] !== this._selectedRowsLookup[row]) {
                    this._grid.invalidateRow(row);
                    delete this._selectedRowsLookup[row];
                }
            }
            else {
                removeList.push(row);
            }
        }
        for (const selectedRow in this._selectedRowsLookup) {
            if (selectedRow !== undefined) {
                this._grid.invalidateRow(+selectedRow);
            }
        }
        this._selectedRowsLookup = lookup;
        this._grid.render();
        this._isSelectAllChecked = ((_a = selectedRows === null || selectedRows === void 0 ? void 0 : selectedRows.length) !== null && _a !== void 0 ? _a : 0) + disabledCount >= this._grid.getDataLength();
        if (!this._isUsingDataView || !this._addonOptions.applySelectOnAllPages) {
            if (!this._addonOptions.hideInColumnTitleRow && !this._addonOptions.hideSelectAllCheckbox) {
                this.renderSelectAllCheckbox(this._isSelectAllChecked);
            }
            if (!this._addonOptions.hideInFilterHeaderRow) {
                const selectAllElm = (_b = this.headerRowNode) === null || _b === void 0 ? void 0 : _b.querySelector(`#header-filter-selector${this._selectAll_UID}`);
                if (selectAllElm) {
                    selectAllElm.ariaChecked = String(this._isSelectAllChecked);
                    selectAllElm.checked = this._isSelectAllChecked;
                }
            }
        }
        // Remove items that shouln't of been selected in the first place (Got here Ctrl + click)
        if (removeList.length > 0) {
            for (const itemToRemove of removeList) {
                const remIdx = selectedRows.indexOf(itemToRemove);
                selectedRows.splice(remIdx, 1);
            }
            this._grid.setSelectedRows(selectedRows, 'click.toggle');
        }
    }
    renderSelectAllCheckbox(isSelectAllChecked) {
        const checkedStr = isSelectAllChecked ? ` checked="checked" aria-checked="true"` : ' aria-checked="false"';
        this._grid.updateColumnHeader(this._addonOptions.columnId || '', `<input id="header-selector${this._selectAll_UID}" type="checkbox"${checkedStr}><label for="header-selector${this._selectAll_UID}"></label>`, this._addonOptions.toolTip);
    }
}
//# sourceMappingURL=slickCheckboxSelectColumn.js.map