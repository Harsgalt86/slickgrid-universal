import { SelectFilter } from './selectFilter';
export class MultipleSelectFilter extends SelectFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService, collectionService, rxjs) {
        super(translaterService, collectionService, rxjs, true);
        this.translaterService = translaterService;
        this.collectionService = collectionService;
        this.rxjs = rxjs;
    }
}
//# sourceMappingURL=multipleSelectFilter.js.map