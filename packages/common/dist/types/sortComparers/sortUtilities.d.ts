import { FieldType, type SortDirectionNumber } from '../enums/index';
import type { Column, GridOption } from '../interfaces/index';
export declare function sortByFieldType(fieldType: typeof FieldType[keyof typeof FieldType], value1: any, value2: any, sortDirection: number | SortDirectionNumber, sortColumn?: Column, gridOptions?: GridOption): number;
//# sourceMappingURL=sortUtilities.d.ts.map