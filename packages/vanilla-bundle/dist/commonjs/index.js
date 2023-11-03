"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slicker = exports.SlickVanillaGridBundle = exports.SlickPaginationComponent = exports.SlickEmptyWarningComponent = exports.Utilities = exports.SortComparers = exports.GroupTotalFormatters = exports.Formatters = exports.Filters = exports.EventPubSubService = exports.Enums = exports.Editors = exports.Aggregators = exports.BindingService = void 0;
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
const empty_warning_component_1 = require("@slickgrid-universal/empty-warning-component");
Object.defineProperty(exports, "SlickEmptyWarningComponent", { enumerable: true, get: function () { return empty_warning_component_1.SlickEmptyWarningComponent; } });
const pagination_component_1 = require("@slickgrid-universal/pagination-component");
Object.defineProperty(exports, "SlickPaginationComponent", { enumerable: true, get: function () { return pagination_component_1.SlickPaginationComponent; } });
const slick_vanilla_grid_bundle_1 = require("./components/slick-vanilla-grid-bundle");
Object.defineProperty(exports, "SlickVanillaGridBundle", { enumerable: true, get: function () { return slick_vanilla_grid_bundle_1.SlickVanillaGridBundle; } });
const Slicker = {
    GridBundle: slick_vanilla_grid_bundle_1.SlickVanillaGridBundle,
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
__exportStar(require("./interfaces/index"), exports);
__exportStar(require("./services/index"), exports);
//# sourceMappingURL=index.js.map