"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VanillaForceGridBundle = void 0;
const common_1 = require("@slickgrid-universal/common");
const excel_export_1 = require("@slickgrid-universal/excel-export");
const composite_editor_component_1 = require("@slickgrid-universal/composite-editor-component");
const empty_warning_component_1 = require("@slickgrid-universal/empty-warning-component");
const custom_tooltip_plugin_1 = require("@slickgrid-universal/custom-tooltip-plugin");
const text_export_1 = require("@slickgrid-universal/text-export");
const vanilla_bundle_1 = require("@slickgrid-universal/vanilla-bundle");
const salesforce_global_grid_options_1 = require("./salesforce-global-grid-options");
class VanillaForceGridBundle extends vanilla_bundle_1.SlickVanillaGridBundle {
    /**
     * Salesforce Slicker Grid Bundle constructor
     * @param {Object} gridParentContainerElm - div HTML DOM element container
     * @param {Array<Column>} columnDefs - Column Definitions
     * @param {Object} options - Grid Options
     * @param {Array<Object>} dataset - Dataset
     * @param {Array<Object>} hierarchicalDataset - Hierarchical Dataset
     * @param {Object} services - Typically only used for Unit Testing when we want to pass Mocked/Stub Services
     */
    constructor(gridParentContainerElm, columnDefs, options, dataset, hierarchicalDataset, services) {
        super(gridParentContainerElm, columnDefs, options, dataset, hierarchicalDataset, services);
    }
    mergeGridOptions(gridOptions) {
        var _a;
        const extraOptions = (gridOptions.useSalesforceDefaultGridOptions || ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.useSalesforceDefaultGridOptions)) ? salesforce_global_grid_options_1.SalesforceGlobalGridOptions : {};
        const options = Slick.Utils.extend(true, {}, common_1.GlobalGridOptions, extraOptions, gridOptions);
        // also make sure to show the header row if user have enabled filtering
        if (options.enableFiltering && !options.showHeaderRow) {
            options.showHeaderRow = options.enableFiltering;
        }
        // using copy extend to do a deep clone has an unwanted side on objects and pageSizes but ES6 spread has other worst side effects
        // so we will just overwrite the pageSizes when needed, this is the only one causing issues so far.
        // On a deep extend, Object and Array are extended, but object wrappers on primitive types such as String, Boolean, and Number are not.
        if ((options === null || options === void 0 ? void 0 : options.pagination) && (gridOptions.enablePagination || gridOptions.backendServiceApi) && gridOptions.pagination && Array.isArray(gridOptions.pagination.pageSizes)) {
            options.pagination.pageSizes = gridOptions.pagination.pageSizes;
        }
        // when we use Pagination on Local Grid, it doesn't seem to work without enableFiltering
        // so we'll enable the filtering but we'll keep the header row hidden
        if (!options.enableFiltering && options.enablePagination && this._isLocalGrid) {
            options.enableFiltering = true;
            options.showHeaderRow = false;
            this._hideHeaderRowAfterPageLoad = true;
            if (this.sharedService) {
                this.sharedService.hideHeaderRowAfterPageLoad = true;
            }
        }
        return options;
    }
    // --
    // protected functions
    // ------------------
    registerResources() {
        // when using Salesforce, we want the Export to CSV always enabled without registering it
        if (this.gridOptions.enableTextExport) {
            this._registeredResources.push(new text_export_1.TextExportService());
        }
        if (this.gridOptions.enableTextExport) {
            this._registeredResources.push(new excel_export_1.ExcelExportService());
        }
        this._registeredResources.push(new custom_tooltip_plugin_1.SlickCustomTooltip());
        // at this point, we consider all the registered services as external services, anything else registered afterward aren't external
        if (Array.isArray(this._registeredResources)) {
            this.sharedService.externalRegisteredResources = this._registeredResources;
        }
        // push all other Services that we want to be registered
        this._registeredResources.push(this.gridService, this.gridStateService);
        // when using Grouping/DraggableGrouping/Colspan register its Service
        if (this.gridOptions.createPreHeaderPanel && !this.gridOptions.enableDraggableGrouping) {
            this._registeredResources.push(this.groupingService);
        }
        // when using Tree Data View, register its Service
        if (this.gridOptions.enableTreeData) {
            this._registeredResources.push(this.treeDataService);
        }
        // when user enables translation, we need to translate Headers on first pass & subsequently in the bindDifferentHooks
        if (this.gridOptions.enableTranslate) {
            this.extensionService.translateColumnHeaders();
        }
        // also initialize (render) the empty warning component
        this.slickEmptyWarning = new empty_warning_component_1.SlickEmptyWarningComponent();
        this._registeredResources.push(this.slickEmptyWarning);
        // also initialize (render) the pagination component when using the salesforce default options
        // however before adding a new instance, just make sure there isn't one that might have been loaded by calling "registerExternalResources"
        if (this.gridOptions.enableCompositeEditor) {
            if (!this._registeredResources.some((resource => resource instanceof composite_editor_component_1.SlickCompositeEditorComponent))) {
                this.slickCompositeEditor = new composite_editor_component_1.SlickCompositeEditorComponent();
                this._registeredResources.push(this.slickCompositeEditor);
            }
        }
        // bind & initialize all Components/Services that were tagged as enabled
        // register all services by executing their init method and providing them with the Grid object
        if (Array.isArray(this._registeredResources)) {
            for (const resource of this._registeredResources) {
                if (this.slickGrid && typeof resource.init === 'function') {
                    resource.init(this.slickGrid, this.universalContainerService);
                }
            }
        }
    }
}
exports.VanillaForceGridBundle = VanillaForceGridBundle;
//# sourceMappingURL=vanilla-force-bundle.js.map