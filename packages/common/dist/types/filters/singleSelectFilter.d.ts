import { SelectFilter } from './selectFilter';
import type { CollectionService } from './../services/collection.service';
import type { TranslaterService } from '../services/translater.service';
import type { RxJsFacade } from '../services/rxjsFacade';
export declare class SingleSelectFilter extends SelectFilter {
    protected readonly translaterService: TranslaterService;
    protected readonly collectionService: CollectionService;
    protected readonly rxjs?: RxJsFacade | undefined;
    /**
     * Initialize the Filter
     */
    constructor(translaterService: TranslaterService, collectionService: CollectionService, rxjs?: RxJsFacade | undefined);
}
//# sourceMappingURL=singleSelectFilter.d.ts.map