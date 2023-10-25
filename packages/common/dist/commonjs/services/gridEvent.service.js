"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridEventService = void 0;
class GridEventService {
    get eventHandler() {
        return this._eventHandler;
    }
    constructor() {
        this._eventHandler = new Slick.EventHandler();
    }
    dispose() {
        this._eventHandler.unsubscribeAll();
    }
    /* OnCellChange Event */
    bindOnBeforeEditCell(grid) {
        var _a;
        const dataView = (_a = grid === null || grid === void 0 ? void 0 : grid.getData) === null || _a === void 0 ? void 0 : _a.call(grid);
        // subscribe to this Slickgrid event of onBeforeEditCell
        this._eventHandler.subscribe(grid.onBeforeEditCell, (e, args) => {
            if (!e || !args || !grid || args.cell === undefined || !grid.getColumns || !grid.getDataItem) {
                return;
            }
            const column = grid.getColumns()[args.cell];
            // if the column definition has a onBeforeEditCell property (a callback function), then run it
            if (typeof column.onBeforeEditCell === 'function') {
                // add to the output gridOptions & dataView since we'll need them inside the AJAX column.onBeforeEditCell
                const returnedArgs = {
                    row: args.row,
                    cell: args.cell,
                    dataView,
                    grid,
                    columnDef: column,
                    dataContext: grid.getDataItem(args.row)
                };
                // finally call up the Slick.column.onBeforeEditCells.... function
                column.onBeforeEditCell(e, returnedArgs);
            }
        });
    }
    /* OnCellChange Event */
    bindOnCellChange(grid) {
        var _a;
        const dataView = (_a = grid === null || grid === void 0 ? void 0 : grid.getData) === null || _a === void 0 ? void 0 : _a.call(grid);
        // subscribe to this Slickgrid event of onCellChange
        this._eventHandler.subscribe(grid.onCellChange, (e, args) => {
            if (!e || !args || !grid || args.cell === undefined || !grid.getColumns || !grid.getDataItem) {
                return;
            }
            const column = grid.getColumns()[args.cell];
            // if the column definition has a onCellChange property (a callback function), then run it
            if (typeof column.onCellChange === 'function') {
                // add to the output gridOptions & dataView since we'll need them inside the AJAX column.onCellChange
                const returnedArgs = {
                    row: args.row,
                    cell: args.cell,
                    dataView,
                    grid,
                    columnDef: column,
                    dataContext: grid.getDataItem(args.row)
                };
                // finally call up the Slick.column.onCellChanges.... function
                column.onCellChange(e, returnedArgs);
            }
        });
    }
    /* OnClick Event */
    bindOnClick(grid) {
        var _a;
        const dataView = (_a = grid === null || grid === void 0 ? void 0 : grid.getData) === null || _a === void 0 ? void 0 : _a.call(grid);
        this._eventHandler.subscribe(grid.onClick, (e, args) => {
            var _a;
            if (!e || !args || !grid || args.cell === undefined || !grid.getColumns || !grid.getDataItem) {
                return;
            }
            const column = (_a = grid.getColumns) === null || _a === void 0 ? void 0 : _a.call(grid)[args.cell];
            // if the column definition has a onCellClick property (a callback function), then run it
            if (typeof column.onCellClick === 'function') {
                // add to the output gridOptions & dataView since we'll need them inside the AJAX column.onClick
                const returnedArgs = {
                    row: args.row,
                    cell: args.cell,
                    dataView,
                    grid,
                    columnDef: column,
                    dataContext: grid.getDataItem(args.row)
                };
                // finally call up the Slick.column.onCellClick.... function
                column.onCellClick(e, returnedArgs);
            }
        });
    }
}
exports.GridEventService = GridEventService;
//# sourceMappingURL=gridEvent.service.js.map