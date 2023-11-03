import { SliderFilter } from './sliderFilter';
export class CompoundSliderFilter extends SliderFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        super.sliderType = 'compound';
    }
}
//# sourceMappingURL=compoundSliderFilter.js.map