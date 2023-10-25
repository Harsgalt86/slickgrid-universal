import type { ColumnFilter, Filter } from '../interfaces/index';
import type { SlickgridConfig } from '../slickgrid-config';
import type { CollectionService } from '../services/collection.service';
import type { TranslaterService } from '../services/translater.service';
import type { RxJsFacade } from '../services/rxjsFacade';
export declare class FilterFactory {
    protected config: SlickgridConfig;
    protected readonly translaterService?: TranslaterService | undefined;
    protected readonly collectionService?: CollectionService<any> | undefined;
    protected rxjs?: RxJsFacade | undefined;
    /** The options from the SlickgridConfig */
    protected _options: any;
    constructor(config: SlickgridConfig, translaterService?: TranslaterService | undefined, collectionService?: CollectionService<any> | undefined, rxjs?: RxJsFacade | undefined);
    addRxJsResource(rxjs: RxJsFacade): void;
    createFilter(columnFilter?: ColumnFilter): Filter | undefined;
}
//# sourceMappingURL=filterFactory.d.ts.map