import { SliderFilter } from './sliderFilter';
export class SliderRangeFilter extends SliderFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        super.sliderType = 'double';
    }
}
//# sourceMappingURL=sliderRangeFilter.js.map