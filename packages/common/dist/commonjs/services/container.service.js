"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerService = void 0;
class ContainerService {
    get(_key) {
        throw new Error('ContainerService "get" method must be implemented');
    }
    registerInstance(_key, _instance) {
        throw new Error('ContainerService "registerInstance" method must be implemented');
    }
}
exports.ContainerService = ContainerService;
//# sourceMappingURL=container.service.js.map