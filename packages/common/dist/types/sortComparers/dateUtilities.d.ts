import { FieldType } from '../enums/fieldType.enum';
import type { SortComparer } from '../interfaces/index';
import * as moment_ from 'moment-mini';
export declare function compareDates(value1: any, value2: any, sortDirection: number, format: string | moment_.MomentBuiltinFormat, strict?: boolean): number;
/** From a FieldType, return the associated Date SortComparer */
export declare function getAssociatedDateSortComparer(fieldType: typeof FieldType[keyof typeof FieldType]): SortComparer;
//# sourceMappingURL=dateUtilities.d.ts.map