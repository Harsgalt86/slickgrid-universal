"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalContainerService = void 0;
class UniversalContainerService {
    constructor() {
        this.dependencies = [];
    }
    get(key) {
        const dependency = this.dependencies.find(dep => dep.key === key);
        if (dependency === null || dependency === void 0 ? void 0 : dependency.instance) {
            return dependency.instance;
        }
        return null;
    }
    dispose() {
        this.dependencies = [];
    }
    registerInstance(key, instance) {
        const dependency = this.dependencies.some(dep => dep.key === key);
        if (!dependency) {
            this.dependencies.push({ key, instance });
        }
    }
}
exports.UniversalContainerService = UniversalContainerService;
//# sourceMappingURL=universalContainer.service.js.map