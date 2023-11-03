"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aggregators = void 0;
const avgAggregator_1 = require("./avgAggregator");
const cloneAggregator_1 = require("./cloneAggregator");
const countAggregator_1 = require("./countAggregator");
const distinctAggregator_1 = require("./distinctAggregator");
const minAggregator_1 = require("./minAggregator");
const maxAggregator_1 = require("./maxAggregator");
const sumAggregator_1 = require("./sumAggregator");
/** Provides a list of different Aggregators for the Group Formatter */
exports.Aggregators = {
    /** Average Aggregator which calculate the average of a given group */
    Avg: avgAggregator_1.AvgAggregator,
    /** Clone Aggregator will simply clone (copy) over the last defined value of a given group */
    Clone: cloneAggregator_1.CloneAggregator,
    /** Count Aggregator will count the number of rows in the group */
    Count: countAggregator_1.CountAggregator,
    /** Distinct Aggregator will return an array of distinct values found inside the given group */
    Distinct: distinctAggregator_1.DistinctAggregator,
    /** Minimum Aggregator which will find the minimum value inside the given group */
    Min: minAggregator_1.MinAggregator,
    /** Maximum Aggregator which will find the maximum value inside the given group */
    Max: maxAggregator_1.MaxAggregator,
    /** Sum Aggregator which calculate the sum of a given group */
    Sum: sumAggregator_1.SumAggregator
};
//# sourceMappingURL=aggregators.index.js.map