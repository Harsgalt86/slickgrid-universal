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
exports.GraphqlQueryBuilder = exports.GraphqlService = void 0;
var graphql_service_1 = require("./services/graphql.service");
Object.defineProperty(exports, "GraphqlService", { enumerable: true, get: function () { return graphql_service_1.GraphqlService; } });
var graphqlQueryBuilder_1 = require("./services/graphqlQueryBuilder");
Object.defineProperty(exports, "GraphqlQueryBuilder", { enumerable: true, get: function () { return graphqlQueryBuilder_1.default; } });
__exportStar(require("./interfaces/index"), exports);
//# sourceMappingURL=index.js.map