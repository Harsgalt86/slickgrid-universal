import { SliderFilter } from './sliderFilter';
export class SingleSliderFilter extends SliderFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        super.sliderType = 'single';
    }
}
//# sourceMappingURL=singleSliderFilter.js.map