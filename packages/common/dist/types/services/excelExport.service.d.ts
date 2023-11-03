import type { ExcelExportOption, ExternalResource, SlickGrid } from '../interfaces/index';
import type { ContainerService } from '../services/container.service';
export declare abstract class ExcelExportService implements ExternalResource {
    /** ExcelExportService class name which is use to find service instance in the external registered services */
    className: string;
    /**
     * Initialize the Export Service
     * @param _grid
     * @param _containerService
     */
    init(_grid: SlickGrid, _containerService: ContainerService): void;
    /**
     * Method to return the current locale used by the App
     * @return {string} current locale
     */
    exportToExcel(_options?: ExcelExportOption): Promise<boolean>;
}
//# sourceMappingURL=excelExport.service.d.ts.map