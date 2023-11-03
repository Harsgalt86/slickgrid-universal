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
exports.OdataQueryBuilderService = exports.GridOdataService = void 0;
var grid_odata_service_1 = require("./services/grid-odata.service");
Object.defineProperty(exports, "GridOdataService", { enumerable: true, get: function () { return grid_odata_service_1.GridOdataService; } });
var odataQueryBuilder_service_1 = require("./services/odataQueryBuilder.service");
Object.defineProperty(exports, "OdataQueryBuilderService", { enumerable: true, get: function () { return odataQueryBuilder_service_1.OdataQueryBuilderService; } });
__exportStar(require("./interfaces/index"), exports);
//# sourceMappingURL=index.js.map