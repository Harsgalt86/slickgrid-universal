import { FieldType } from '../enums/fieldType.enum';
import type { SortComparer } from '../interfaces/index';
import { mapMomentDateFormatWithFieldType } from '../services/utilities';
import * as moment_ from 'moment-mini';
const moment = (moment_ as any)['default'] || moment_; // patch to fix rollup "moment has no default export" issue, document here https://github.com/rollup/rollup/issues/670

export function compareDates(value1: any, value2: any, sortDirection: number, format: string | moment_.MomentBuiltinFormat, strict?: boolean) {
  let diff = 0;

  if (value1 === value2) {
    diff = 0;
  } else {
    // use moment to validate the date
    let date1 = moment(value1, format, strict);
    let date2 = moment(value2, format, strict);

    // when moment date is invalid, we'll create a temporary old Date
    if (!date1.isValid()) {
      date1 = new Date(1001, 1, 1);
    }
    if (!date2.isValid()) {
      date2 = new Date(1001, 1, 1);
    }

    // we can use valueOf on both moment & Date to sort
    diff = date1.valueOf() - date2.valueOf();
  }

  return sortDirection * diff;
}

/** From a FieldType, return the associated Date SortComparer */
export function getAssociatedDateSortComparer(fieldType: typeof FieldType[keyof typeof FieldType]): SortComparer {
  const FORMAT = (fieldType === FieldType.date) ? moment.ISO_8601 : mapMomentDateFormatWithFieldType(fieldType);

  return ((value1: any, value2: any, sortDirection: number) => {
    if (FORMAT === moment.ISO_8601) {
      return compareDates(value1, value2, sortDirection, FORMAT, false) as number;
    }
    return compareDates(value1, value2, sortDirection, FORMAT, true) as number;
  }) as SortComparer;
}
