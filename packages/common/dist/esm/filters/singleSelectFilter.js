import { SelectFilter } from './selectFilter';
export class SingleSelectFilter extends SelectFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService, collectionService, rxjs) {
        super(translaterService, collectionService, rxjs, false);
        this.translaterService = translaterService;
        this.collectionService = collectionService;
        this.rxjs = rxjs;
    }
}
//# sourceMappingURL=singleSelectFilter.js.map