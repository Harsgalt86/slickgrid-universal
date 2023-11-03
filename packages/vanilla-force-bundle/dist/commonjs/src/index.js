"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slicker = exports.VanillaForceGridBundle = exports.SlickPaginationComponent = exports.SlickEmptyWarningComponent = exports.SlickCompositeEditorComponent = exports.Utilities = exports.SortComparers = exports.GroupTotalFormatters = exports.Formatters = exports.Filters = exports.EventPubSubService = exports.Enums = exports.Editors = exports.Aggregators = exports.BindingService = void 0;
const common_1 = require("@slickgrid-universal/common");
Object.defineProperty(exports, "Aggregators", { enumerable: true, get: function () { return common_1.Aggregators; } });
Object.defineProperty(exports, "Editors", { enumerable: true, get: function () { return common_1.Editors; } });
Object.defineProperty(exports, "Enums", { enumerable: true, get: function () { return common_1.Enums; } });
Object.defineProperty(exports, "Filters", { enumerable: true, get: function () { return common_1.Filters; } });
Object.defineProperty(exports, "Formatters", { enumerable: true, get: function () { return common_1.Formatters; } });
Object.defineProperty(exports, "GroupTotalFormatters", { enumerable: true, get: function () { return common_1.GroupTotalFormatters; } });
Object.defineProperty(exports, "SortComparers", { enumerable: true, get: function () { return common_1.SortComparers; } });
Object.defineProperty(exports, "Utilities", { enumerable: true, get: function () { return common_1.Utilities; } });
const binding_1 = require("@slickgrid-universal/binding");
Object.defineProperty(exports, "BindingService", { enumerable: true, get: function () { return binding_1.BindingService; } });
const event_pub_sub_1 = require("@slickgrid-universal/event-pub-sub");
Object.defineProperty(exports, "EventPubSubService", { enumerable: true, get: function () { return event_pub_sub_1.EventPubSubService; } });
const composite_editor_component_1 = require("@slickgrid-universal/composite-editor-component");
Object.defineProperty(exports, "SlickCompositeEditorComponent", { enumerable: true, get: function () { return composite_editor_component_1.SlickCompositeEditorComponent; } });
const empty_warning_component_1 = require("@slickgrid-universal/empty-warning-component");
Object.defineProperty(exports, "SlickEmptyWarningComponent", { enumerable: true, get: function () { return empty_warning_component_1.SlickEmptyWarningComponent; } });
const pagination_component_1 = require("@slickgrid-universal/pagination-component");
Object.defineProperty(exports, "SlickPaginationComponent", { enumerable: true, get: function () { return pagination_component_1.SlickPaginationComponent; } });
const vanilla_force_bundle_1 = require("./vanilla-force-bundle");
Object.defineProperty(exports, "VanillaForceGridBundle", { enumerable: true, get: function () { return vanilla_force_bundle_1.VanillaForceGridBundle; } });
const Slicker = {
    GridBundle: vanilla_force_bundle_1.VanillaForceGridBundle,
    Aggregators: common_1.Aggregators,
    BindingService: binding_1.BindingService,
    Editors: common_1.Editors,
    Enums: common_1.Enums,
    Filters: common_1.Filters,
    Formatters: common_1.Formatters,
    GroupTotalFormatters: common_1.GroupTotalFormatters,
    SortComparers: common_1.SortComparers,
    Utilities: common_1.Utilities,
};
exports.Slicker = Slicker;
// expose the bundle on the global "window" object as Slicker
if (typeof window !== 'undefined') {
    window.Slicker = Slicker;
}
//# sourceMappingURL=index.js.map