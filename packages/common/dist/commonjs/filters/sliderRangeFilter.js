"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SliderRangeFilter = void 0;
const sliderFilter_1 = require("./sliderFilter");
class SliderRangeFilter extends sliderFilter_1.SliderFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        super.sliderType = 'double';
    }
}
exports.SliderRangeFilter = SliderRangeFilter;
//# sourceMappingURL=sliderRangeFilter.js.map