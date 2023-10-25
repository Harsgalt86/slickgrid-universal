import { AvgAggregator } from './avgAggregator';
import { CloneAggregator } from './cloneAggregator';
import { CountAggregator } from './countAggregator';
import { DistinctAggregator } from './distinctAggregator';
import { MinAggregator } from './minAggregator';
import { MaxAggregator } from './maxAggregator';
import { SumAggregator } from './sumAggregator';
/** Provides a list of different Aggregators for the Group Formatter */
export declare const Aggregators: {
    /** Average Aggregator which calculate the average of a given group */
    Avg: typeof AvgAggregator;
    /** Clone Aggregator will simply clone (copy) over the last defined value of a given group */
    Clone: typeof CloneAggregator;
    /** Count Aggregator will count the number of rows in the group */
    Count: typeof CountAggregator;
    /** Distinct Aggregator will return an array of distinct values found inside the given group */
    Distinct: typeof DistinctAggregator;
    /** Minimum Aggregator which will find the minimum value inside the given group */
    Min: typeof MinAggregator;
    /** Maximum Aggregator which will find the maximum value inside the given group */
    Max: typeof MaxAggregator;
    /** Sum Aggregator which calculate the sum of a given group */
    Sum: typeof SumAggregator;
};
//# sourceMappingURL=aggregators.index.d.ts.map