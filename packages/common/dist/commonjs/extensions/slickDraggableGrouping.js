"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickDraggableGrouping = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const Sortable_ = require("sortablejs");
const Sortable = ((_a = Sortable_ === null || Sortable_ === void 0 ? void 0 : Sortable_['default']) !== null && _a !== void 0 ? _a : Sortable_); // patch for rollup
const enums_1 = require("../enums");
const bindingEvent_service_1 = require("../services/bindingEvent.service");
const domUtilities_1 = require("../services/domUtilities");
const sortComparers_1 = require("../sortComparers");
/**
 *
 * Draggable Grouping contributed by:  Muthukumar Selconstasu
 *  muthukumar{dot}se{at}gmail{dot}com
 *  github.com/muthukumarse/Slickgrid
 *
 * NOTES:
 *     This plugin provides the Draggable Grouping feature
 *
 * A plugin to add drop-down menus to column headers.
 * To specify a custom button in a column header, extend the column definition like so:
 *   this.columnDefinitions = [{
 *     id: 'cost', name: 'Cost', field: 'cost',
 *     grouping: {
 *       getter: 'cost',
 *       formatter: (g) => `Cost: ${g.value} <span style="color:green">(${g.count} items)</span>`,
 *       aggregators: [new Aggregators.Sum('cost')],
 *       aggregateCollapsed: true,
 *       collapsed: true
 *     }
 *   }];
 */
class SlickDraggableGrouping {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(extensionUtility, pubSubService, sharedService) {
        this.extensionUtility = extensionUtility;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this._gridColumns = [];
        this._gridUid = '';
        this._reorderedColumns = [];
        this._subscriptions = [];
        this._defaults = {
            dropPlaceHolderText: 'Drop a column header here to group by the column',
            hideGroupSortIcons: false,
            hideToggleAllButton: false,
            toggleAllButtonText: '',
            toggleAllPlaceholderText: 'Toggle all Groups',
        };
        this.columnsGroupBy = [];
        this.pluginName = 'DraggableGrouping';
        this._bindingEventService = new bindingEvent_service_1.BindingEventService();
        this._eventHandler = new Slick.EventHandler();
        this.onGroupChanged = new Slick.Event();
    }
    get addonOptions() {
        return this._addonOptions;
    }
    /** Getter of SlickGrid DataView object */
    get dataView() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getData) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    get dropboxElement() {
        return this._dropzoneElm;
    }
    get droppableInstance() {
        return this._droppableInstance;
    }
    get sortableLeftInstance() {
        return this._sortableLeftInstance;
    }
    get sortableRightInstance() {
        return this._sortableRightInstance;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    get grid() {
        var _a, _b;
        return (_b = (_a = this._grid) !== null && _a !== void 0 ? _a : this.sharedService.slickGrid) !== null && _b !== void 0 ? _b : {};
    }
    get gridOptions() {
        var _a;
        return (_a = this.sharedService.gridOptions) !== null && _a !== void 0 ? _a : {};
    }
    /** Getter for the grid uid */
    get gridUid() {
        var _a, _b;
        return this._gridUid || ((_b = (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getUID()) !== null && _b !== void 0 ? _b : '');
    }
    get gridContainer() {
        return this.grid.getContainerNode();
    }
    /** Initialize plugin. */
    init(grid, groupingOptions) {
        var _a, _b, _c, _d, _f, _g;
        this._addonOptions = { ...this._defaults, ...groupingOptions };
        this._grid = grid;
        if (grid) {
            this._gridUid = grid.getUID();
            this._gridColumns = grid.getColumns();
            this._dropzoneElm = grid.getPreHeaderPanel();
            this._dropzoneElm.classList.add('slick-dropzone');
            // add optional group "Toggle All" with its button & text when provided
            if (!this._addonOptions.hideToggleAllButton) {
                this._groupToggler = (0, domUtilities_1.createDomElement)('div', {
                    className: 'slick-group-toggle-all',
                    title: (_a = this._addonOptions.toggleAllPlaceholderText) !== null && _a !== void 0 ? _a : '',
                    style: { display: 'none' },
                });
                const groupTogglerIconElm = (0, domUtilities_1.createDomElement)('span', { className: 'slick-group-toggle-all-icon' }, this._groupToggler);
                if (this.gridOptions.enableTranslate && this._addonOptions.toggleAllButtonTextKey) {
                    this._addonOptions.toggleAllButtonText = this.extensionUtility.translateWhenEnabledAndServiceExist(this._addonOptions.toggleAllButtonTextKey, 'TEXT_TOGGLE_ALL_GROUPS');
                }
                if (this.gridOptions.enableTranslate && this._addonOptions.toggleAllPlaceholderTextKey) {
                    this._addonOptions.toggleAllPlaceholderText = this.extensionUtility.translateWhenEnabledAndServiceExist(this._addonOptions.toggleAllPlaceholderTextKey, 'TEXT_TOGGLE_ALL_GROUPS');
                }
                this._groupToggler.title = (_b = this._addonOptions.toggleAllPlaceholderText) !== null && _b !== void 0 ? _b : '';
                if (this._addonOptions.toggleAllButtonText) {
                    this._groupToggler.appendChild((0, domUtilities_1.createDomElement)('span', {
                        className: 'slick-group-toggle-all-text',
                        textContent: this._addonOptions.toggleAllButtonText || ''
                    }));
                }
                this._dropzoneElm.appendChild(this._groupToggler);
                // when calling Expand/Collapse All Groups from Context Menu, we also need to inform this plugin as well of the action
                this._subscriptions.push(this.pubSubService.subscribe('onContextMenuCollapseAllGroups', () => this.toggleGroupToggler(groupTogglerIconElm, true, false)), this.pubSubService.subscribe('onContextMenuExpandAllGroups', () => this.toggleGroupToggler(groupTogglerIconElm, false, false)));
            }
            this._dropzonePlaceholderElm = (0, domUtilities_1.createDomElement)('div', { className: 'slick-draggable-dropzone-placeholder' }, this._dropzoneElm);
            if (this.gridOptions.enableTranslate && ((_c = this._addonOptions) === null || _c === void 0 ? void 0 : _c.dropPlaceHolderTextKey)) {
                this._addonOptions.dropPlaceHolderText = this.extensionUtility.translateWhenEnabledAndServiceExist(this._addonOptions.dropPlaceHolderTextKey, 'TEXT_TOGGLE_ALL_GROUPS');
            }
            this._dropzonePlaceholderElm.textContent = (_g = (_f = (_d = this._addonOptions) === null || _d === void 0 ? void 0 : _d.dropPlaceHolderText) !== null && _f !== void 0 ? _f : this._defaults.dropPlaceHolderText) !== null && _g !== void 0 ? _g : '';
            this.setupColumnDropbox();
            this._eventHandler.subscribe(grid.onHeaderCellRendered, (_e, args) => {
                var _a;
                const node = args.node;
                if (!(0, utils_1.isEmptyObject)((_a = args.column) === null || _a === void 0 ? void 0 : _a.grouping) && node) {
                    node.style.cursor = 'pointer'; // add the pointer cursor on each column title
                    // also optionally add an icon beside each column title that can be dragged
                    if (this._addonOptions.groupIconCssClass) {
                        const groupableIconElm = (0, domUtilities_1.createDomElement)('span', { className: 'slick-column-groupable' }, node);
                        if (this._addonOptions.groupIconCssClass) {
                            groupableIconElm.classList.add(...this._addonOptions.groupIconCssClass.split(' '));
                        }
                    }
                }
            });
            // when calling Clear All Groups from Context Menu, we also need to inform this plugin as well of the action
            this._subscriptions.push(this.pubSubService.subscribe('onContextMenuClearGrouping', () => this.clearDroppedGroups()));
            for (const col of this._gridColumns) {
                const columnId = col.field;
                grid.updateColumnHeader(columnId);
            }
        }
        return this;
    }
    /** Dispose the plugin. */
    dispose() {
        this.destroySortableInstances();
        this.onGroupChanged.unsubscribe();
        this._eventHandler.unsubscribeAll();
        this.pubSubService.unsubscribeAll(this._subscriptions);
        this._bindingEventService.unbindAll();
        (0, domUtilities_1.emptyElement)(this.gridContainer.querySelector(`.${this.gridUid} .slick-preheader-panel`));
    }
    clearDroppedGroups() {
        this.columnsGroupBy = [];
        this.updateGroupBy('clear-all');
        const allDroppedGroupingElms = this._dropzoneElm.querySelectorAll('.slick-dropped-grouping');
        for (const groupElm of Array.from(allDroppedGroupingElms)) {
            const groupRemoveBtnElm = this._dropzoneElm.querySelector('.slick-groupby-remove');
            groupRemoveBtnElm === null || groupRemoveBtnElm === void 0 ? void 0 : groupRemoveBtnElm.remove();
            groupElm === null || groupElm === void 0 ? void 0 : groupElm.remove();
        }
        // show placeholder text & hide the "Toggle All" when that later feature is enabled
        this._dropzonePlaceholderElm.style.display = 'inline-block';
        if (this._groupToggler) {
            this._groupToggler.style.display = 'none';
        }
    }
    destroySortableInstances() {
        var _a, _b, _c, _d;
        if ((_a = this._sortableLeftInstance) === null || _a === void 0 ? void 0 : _a.el) {
            (_b = this._sortableLeftInstance) === null || _b === void 0 ? void 0 : _b.destroy();
        }
        if ((_c = this._sortableRightInstance) === null || _c === void 0 ? void 0 : _c.el) {
            (_d = this._sortableRightInstance) === null || _d === void 0 ? void 0 : _d.destroy();
        }
    }
    setAddonOptions(options) {
        this._addonOptions = { ...this._addonOptions, ...options };
    }
    setColumns(cols) {
        this._gridColumns = cols;
    }
    setDroppedGroups(groupingInfo) {
        this._dropzonePlaceholderElm.style.display = 'none';
        const groupingInfos = Array.isArray(groupingInfo) ? groupingInfo : [groupingInfo];
        for (const groupInfo of groupingInfos) {
            const columnElm = this.grid.getHeaderColumn(groupInfo);
            this.handleGroupByDrop(this._dropzoneElm, columnElm);
        }
    }
    /**
     * Setup the column reordering
     * NOTE: this function is a standalone function and is called externally and does not have access to `this` instance
     * @param grid - slick grid object
     * @param headers - slick grid column header elements
     * @param _headerColumnWidthDiff - header column width difference
     * @param setColumns - callback to reassign columns
     * @param setupColumnResize - callback to setup the column resize
     * @param columns - columns array
     * @param getColumnIndex - callback to find index of a column
     * @param uid - grid UID
     * @param trigger - callback to execute when triggering a column grouping
     */
    setupColumnReorder(grid, headers, _headerColumnWidthDiff, setColumns, setupColumnResize, _columns, getColumnIndex, _uid, trigger) {
        this.destroySortableInstances();
        const dropzoneElm = grid.getPreHeaderPanel();
        const draggablePlaceholderElm = dropzoneElm.querySelector('.slick-draggable-dropzone-placeholder');
        const groupTogglerElm = dropzoneElm.querySelector('.slick-group-toggle-all');
        const sortableOptions = {
            animation: 50,
            chosenClass: 'slick-header-column-active',
            ghostClass: 'slick-sortable-placeholder',
            draggable: '.slick-header-column',
            dataIdAttr: 'data-id',
            group: {
                name: 'shared',
                pull: 'clone',
                put: false,
            },
            revertClone: true,
            // filter: function (_e, target) {
            //   // block column from being able to be dragged if it's already a grouped column
            //   // NOTE: need to disable for now since it also blocks the column reordering
            //   return columnsGroupBy.some(c => c.id === target.getAttribute('data-id'));
            // },
            onStart: () => {
                if (draggablePlaceholderElm) {
                    draggablePlaceholderElm.style.display = 'inline-block';
                }
                const droppedGroupingElms = dropzoneElm.querySelectorAll('.slick-dropped-grouping');
                droppedGroupingElms.forEach(droppedGroupingElm => droppedGroupingElm.style.display = 'none');
                if (groupTogglerElm) {
                    groupTogglerElm.style.display = 'none';
                }
            },
            onEnd: (e) => {
                var _a, _b, _c, _d, _f;
                dropzoneElm === null || dropzoneElm === void 0 ? void 0 : dropzoneElm.classList.remove('slick-dropzone-hover');
                (_a = draggablePlaceholderElm === null || draggablePlaceholderElm === void 0 ? void 0 : draggablePlaceholderElm.parentElement) === null || _a === void 0 ? void 0 : _a.classList.remove('slick-dropzone-placeholder-hover');
                const droppedGroupingElms = dropzoneElm.querySelectorAll('.slick-dropped-grouping');
                droppedGroupingElms.forEach(droppedGroupingElm => droppedGroupingElm.style.display = 'flex');
                if (droppedGroupingElms.length) {
                    if (draggablePlaceholderElm) {
                        draggablePlaceholderElm.style.display = 'none';
                    }
                    if (groupTogglerElm) {
                        groupTogglerElm.style.display = 'inline-block';
                    }
                }
                if (!grid.getEditorLock().commitCurrentEdit()) {
                    return;
                }
                const reorderedIds = (_c = (_b = this.sortableLeftInstance) === null || _b === void 0 ? void 0 : _b.toArray()) !== null && _c !== void 0 ? _c : [];
                // when frozen columns are used, headers has more than one entry and we need the ids from all of them.
                // though there is only really a left and right header, this will work even if that should change.
                if (headers.length > 1) {
                    const ids = (_f = (_d = this._sortableRightInstance) === null || _d === void 0 ? void 0 : _d.toArray()) !== null && _f !== void 0 ? _f : [];
                    // Note: the loop below could be simplified with:
                    // reorderedIds.push.apply(reorderedIds,ids);
                    // However, the loop is more in keeping with way-backward compatibility
                    for (const id of ids) {
                        reorderedIds.push(id);
                    }
                }
                const finalReorderedColumns = [];
                const reorderedColumns = grid.getColumns();
                for (const reorderedId of reorderedIds) {
                    finalReorderedColumns.push(reorderedColumns[getColumnIndex(reorderedId)]);
                }
                setColumns(finalReorderedColumns);
                trigger(grid.onColumnsReordered, { grid });
                e.stopPropagation();
                setupColumnResize();
            }
        };
        this._sortableLeftInstance = Sortable.create(this.gridContainer.querySelector(`.${grid.getUID()} .slick-header-columns.slick-header-columns-left`), sortableOptions);
        this._sortableRightInstance = Sortable.create(this.gridContainer.querySelector(`.${grid.getUID()} .slick-header-columns.slick-header-columns-right`), sortableOptions);
        return {
            sortableLeftInstance: this._sortableLeftInstance,
            sortableRightInstance: this._sortableRightInstance
        };
    }
    //
    // protected functions
    // ------------------
    addColumnGroupBy(column) {
        this.columnsGroupBy.push(column);
        this.updateGroupBy('add-group');
    }
    addGroupByRemoveClickHandler(id, groupRemoveIconElm, headerColumnElm, entry) {
        this._bindingEventService.bind(groupRemoveIconElm, 'click', () => {
            const boundedElms = this._bindingEventService.boundedEvents.filter(boundedEvent => boundedEvent.element === groupRemoveIconElm);
            for (const boundedEvent of boundedElms) {
                this._bindingEventService.unbind(boundedEvent.element, 'click', boundedEvent.listener);
            }
            this.removeGroupBy(id, headerColumnElm, entry);
        });
    }
    addGroupSortClickHandler(col, groupSortContainerElm) {
        const { grouping, type } = col;
        this._bindingEventService.bind(groupSortContainerElm, 'click', () => {
            // group sorting requires all group to be opened, make sure that the Toggle All is also expanded
            this.toggleGroupAll(col, false);
            if (grouping) {
                const nextSortDirection = grouping.sortAsc ? enums_1.SortDirectionNumber.desc : enums_1.SortDirectionNumber.asc;
                grouping.comparer = (a, b) => (0, sortComparers_1.sortByFieldType)(type || 'text', a.value, b.value, nextSortDirection, col, this.gridOptions);
                this.getGroupBySortIcon(groupSortContainerElm, !grouping.sortAsc);
                this.updateGroupBy('sort-group');
                grouping.sortAsc = !grouping.sortAsc;
                this.grid.invalidate();
            }
        });
    }
    getGroupBySortIcon(groupSortContainerElm, sortAsc = true) {
        var _a, _b, _c, _d;
        if (sortAsc) {
            // ascending icon
            if (this._addonOptions.sortAscIconCssClass) {
                groupSortContainerElm.classList.remove(...(_b = (_a = this._addonOptions.sortDescIconCssClass) === null || _a === void 0 ? void 0 : _a.split(' ')) !== null && _b !== void 0 ? _b : '');
                groupSortContainerElm.classList.add(...this._addonOptions.sortAscIconCssClass.split(' '));
            }
            else {
                groupSortContainerElm.classList.add('slick-groupby-sort-asc-icon');
                groupSortContainerElm.classList.remove('slick-groupby-sort-desc-icon');
            }
        }
        else {
            // descending icon
            if (this._addonOptions.sortDescIconCssClass) {
                groupSortContainerElm.classList.remove(...(_d = (_c = this._addonOptions.sortAscIconCssClass) === null || _c === void 0 ? void 0 : _c.split(' ')) !== null && _d !== void 0 ? _d : '');
                groupSortContainerElm.classList.add(...this._addonOptions.sortDescIconCssClass.split(' '));
            }
            else {
                if (!this._addonOptions.sortDescIconCssClass) {
                    groupSortContainerElm.classList.add('slick-groupby-sort-desc-icon');
                    groupSortContainerElm.classList.remove('slick-groupby-sort-asc-icon');
                }
            }
        }
    }
    handleGroupByDrop(containerElm, headerColumnElm) {
        var _a, _b, _c;
        const columnId = (_a = headerColumnElm.getAttribute('data-id')) === null || _a === void 0 ? void 0 : _a.replace(this._gridUid, '');
        let columnAllowed = true;
        for (const colGroupBy of this.columnsGroupBy) {
            if (colGroupBy.id === columnId) {
                columnAllowed = false;
            }
        }
        if (columnAllowed) {
            for (const col of this._gridColumns) {
                if (col.id === columnId && col.grouping && !(0, utils_1.isEmptyObject)(col.grouping)) {
                    const columnNameElm = headerColumnElm.querySelector('.slick-column-name');
                    const entryElm = (0, domUtilities_1.createDomElement)('div', {
                        id: `${this._gridUid}_${col.id}_entry`,
                        className: 'slick-dropped-grouping',
                        dataset: { id: `${col.id}` }
                    });
                    (0, domUtilities_1.createDomElement)('div', {
                        className: 'slick-dropped-grouping-title',
                        style: { display: 'inline-flex' },
                        textContent: columnNameElm ? columnNameElm.textContent : headerColumnElm.textContent,
                    }, entryElm);
                    // delete icon
                    const groupRemoveIconElm = (0, domUtilities_1.createDomElement)('div', { className: 'slick-groupby-remove' });
                    if (this._addonOptions.deleteIconCssClass) {
                        groupRemoveIconElm.classList.add(...this._addonOptions.deleteIconCssClass.split(' '));
                    }
                    if (!this._addonOptions.deleteIconCssClass) {
                        groupRemoveIconElm.classList.add('slick-groupby-remove-icon');
                    }
                    // sorting icons when enabled
                    let groupSortContainerElm;
                    if (((_b = this._addonOptions) === null || _b === void 0 ? void 0 : _b.hideGroupSortIcons) !== true && col.sortable) {
                        if (((_c = col.grouping) === null || _c === void 0 ? void 0 : _c.sortAsc) === undefined) {
                            col.grouping.sortAsc = true;
                        }
                        groupSortContainerElm = (0, domUtilities_1.createDomElement)('div', { className: 'slick-groupby-sort' }, entryElm);
                        this.getGroupBySortIcon(groupSortContainerElm, col.grouping.sortAsc);
                    }
                    entryElm.appendChild(groupRemoveIconElm);
                    entryElm.appendChild(document.createElement('div'));
                    containerElm.appendChild(entryElm);
                    // if we're grouping by only 1 group, at the root, we'll analyze Toggle All and add collapsed/expanded class
                    if (this._groupToggler && this.columnsGroupBy.length === 0) {
                        this.toggleGroupAll(col);
                    }
                    this.addColumnGroupBy(col);
                    this.addGroupByRemoveClickHandler(col.id, groupRemoveIconElm, headerColumnElm, entryElm);
                    // when Sorting group is enabled, let's add all handlers
                    if (groupSortContainerElm) {
                        this.addGroupSortClickHandler(col, groupSortContainerElm);
                    }
                }
            }
            // show the "Toggle All" when feature is enabled
            if (this._groupToggler && this.columnsGroupBy.length > 0) {
                this._groupToggler.style.display = 'inline-block';
            }
        }
    }
    toggleGroupAll({ grouping }, collapsed) {
        var _a;
        const togglerIcon = (_a = this._groupToggler) === null || _a === void 0 ? void 0 : _a.querySelector('.slick-group-toggle-all-icon');
        if (collapsed === true || (grouping === null || grouping === void 0 ? void 0 : grouping.collapsed)) {
            togglerIcon === null || togglerIcon === void 0 ? void 0 : togglerIcon.classList.add('collapsed');
            togglerIcon === null || togglerIcon === void 0 ? void 0 : togglerIcon.classList.remove('expanded');
        }
        else {
            togglerIcon === null || togglerIcon === void 0 ? void 0 : togglerIcon.classList.add('expanded');
            togglerIcon === null || togglerIcon === void 0 ? void 0 : togglerIcon.classList.remove('collapsed');
        }
    }
    removeFromArray(arrayToModify, itemToRemove) {
        if (Array.isArray(arrayToModify)) {
            const itemIdx = arrayToModify.findIndex(a => a.id === itemToRemove.id);
            if (itemIdx >= 0) {
                arrayToModify.splice(itemIdx, 1);
            }
        }
        return arrayToModify;
    }
    removeGroupBy(id, _hdrColumnElm, entry) {
        entry.remove();
        const groupByColumns = [];
        this._gridColumns.forEach(col => groupByColumns[col.id] = col);
        this.removeFromArray(this.columnsGroupBy, groupByColumns[id]);
        if (this.columnsGroupBy.length === 0) {
            // show placeholder text & hide the "Toggle All" when that later feature is enabled
            this._dropzonePlaceholderElm.style.display = 'inline-block';
            if (this._groupToggler) {
                this._groupToggler.style.display = 'none';
            }
        }
        this.updateGroupBy('remove-group');
    }
    addDragOverDropzoneListeners() {
        const draggablePlaceholderElm = this._dropzoneElm.querySelector('.slick-draggable-dropzone-placeholder');
        if (draggablePlaceholderElm && this._dropzoneElm) {
            this._bindingEventService.bind(draggablePlaceholderElm, 'dragover', (e) => e.preventDefault());
            this._bindingEventService.bind(draggablePlaceholderElm, 'dragenter', () => this._dropzoneElm.classList.add('slick-dropzone-hover'));
            this._bindingEventService.bind(draggablePlaceholderElm, 'dragleave', () => this._dropzoneElm.classList.remove('slick-dropzone-hover'));
        }
    }
    setupColumnDropbox() {
        const dropzoneElm = this._dropzoneElm;
        this._droppableInstance = Sortable.create(dropzoneElm, {
            group: 'shared',
            ghostClass: 'slick-droppable-sortitem-hover',
            draggable: '.slick-dropped-grouping',
            dragoverBubble: true,
            onAdd: (evt) => {
                var _a, _b;
                const el = evt.item;
                if ((_a = el.getAttribute('id')) === null || _a === void 0 ? void 0 : _a.replace(this._gridUid, '')) {
                    this.handleGroupByDrop(dropzoneElm, Sortable.utils.clone(evt.item));
                }
                (_b = el.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(el);
            },
            onUpdate: () => {
                var _a, _b;
                const sortArray = (_b = (_a = this._droppableInstance) === null || _a === void 0 ? void 0 : _a.toArray()) !== null && _b !== void 0 ? _b : [];
                const newGroupingOrder = [];
                for (const sortGroupId of sortArray) {
                    for (const groupByColumn of this.columnsGroupBy) {
                        if (groupByColumn.id === sortGroupId) {
                            newGroupingOrder.push(groupByColumn);
                            break;
                        }
                    }
                }
                this.columnsGroupBy = newGroupingOrder;
                this.updateGroupBy('sort-group');
            },
        });
        // Sortable doesn't have onOver, we need to implement it ourselves
        this.addDragOverDropzoneListeners();
        if (this._groupToggler) {
            this._bindingEventService.bind(this._groupToggler, 'click', ((event) => {
                const target = event.target.classList.contains('slick-group-toggle-all-icon') ? event.target : event.currentTarget.querySelector('.slick-group-toggle-all-icon');
                this.toggleGroupToggler(target, target === null || target === void 0 ? void 0 : target.classList.contains('expanded'));
            }));
        }
    }
    toggleGroupToggler(targetElm, collapsing = true, shouldExecuteDataViewCommand = true) {
        if (targetElm) {
            if (collapsing === true) {
                targetElm.classList.add('collapsed');
                targetElm.classList.remove('expanded');
                if (shouldExecuteDataViewCommand) {
                    this.dataView.collapseAllGroups();
                }
            }
            else {
                targetElm.classList.remove('collapsed');
                targetElm.classList.add('expanded');
                if (shouldExecuteDataViewCommand) {
                    this.dataView.expandAllGroups();
                }
            }
        }
    }
    updateGroupBy(originator) {
        if (this.columnsGroupBy.length === 0) {
            this.dataView.setGrouping([]);
            this._dropzonePlaceholderElm.style.display = 'inline-block';
            this.triggerOnGroupChangedEvent({ caller: originator, groupColumns: [] });
            return;
        }
        const groupingArray = [];
        this.columnsGroupBy.forEach(element => groupingArray.push(element.grouping));
        this.dataView.setGrouping(groupingArray);
        this._dropzonePlaceholderElm.style.display = 'none';
        this.triggerOnGroupChangedEvent({ caller: originator, groupColumns: groupingArray });
    }
    /** call notify on slickgrid event and execute onGroupChanged callback when defined as a function by the user */
    triggerOnGroupChangedEvent(args) {
        if (this._addonOptions && typeof this._addonOptions.onGroupChanged === 'function') {
            this._addonOptions.onGroupChanged(new Slick.EventData(), args);
        }
        this.onGroupChanged.notify(args);
    }
}
exports.SlickDraggableGrouping = SlickDraggableGrouping;
//# sourceMappingURL=slickDraggableGrouping.js.map