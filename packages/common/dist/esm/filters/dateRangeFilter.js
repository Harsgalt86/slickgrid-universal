import { DateFilter } from './dateFilter';
export class DateRangeFilter extends DateFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputFilterType = 'range';
    }
}
//# sourceMappingURL=dateRangeFilter.js.map