"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundSliderFilter = void 0;
const sliderFilter_1 = require("./sliderFilter");
class CompoundSliderFilter extends sliderFilter_1.SliderFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        super.sliderType = 'compound';
    }
}
exports.CompoundSliderFilter = CompoundSliderFilter;
//# sourceMappingURL=compoundSliderFilter.js.map