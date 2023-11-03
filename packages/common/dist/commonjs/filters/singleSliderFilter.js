"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleSliderFilter = void 0;
const sliderFilter_1 = require("./sliderFilter");
class SingleSliderFilter extends sliderFilter_1.SliderFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        super.sliderType = 'single';
    }
}
exports.SingleSliderFilter = SingleSliderFilter;
//# sourceMappingURL=singleSliderFilter.js.map