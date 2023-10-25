"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextExportService = void 0;
class TextExportService {
    /**
     * Initialize the Export Service
     * @param _grid
     * @param _containerService
     */
    init(_grid, _containerService) {
        throw new Error('ExportService the "init" method must be implemented');
    }
    /**
     * Method to return the current locale used by the App
     * @return {string} current locale
     */
    exportToFile(_options) {
        throw new Error('ExportService the "exportToFile" method must be implemented');
    }
}
exports.TextExportService = TextExportService;
//# sourceMappingURL=textExport.service.js.map