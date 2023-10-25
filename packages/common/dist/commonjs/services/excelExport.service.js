"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelExportService = void 0;
class ExcelExportService {
    /**
     * Initialize the Export Service
     * @param _grid
     * @param _containerService
     */
    init(_grid, _containerService) {
        throw new Error('ExcelExportService the "init" method must be implemented');
    }
    /**
     * Method to return the current locale used by the App
     * @return {string} current locale
     */
    exportToExcel(_options) {
        throw new Error('ExcelExportService the "exportToExcel" method must be implemented');
    }
}
exports.ExcelExportService = ExcelExportService;
//# sourceMappingURL=excelExport.service.js.map