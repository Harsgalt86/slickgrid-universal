import { DateFilter } from './dateFilter';
export class CompoundDateFilter extends DateFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputFilterType = 'compound';
    }
}
//# sourceMappingURL=compoundDateFilter.js.map