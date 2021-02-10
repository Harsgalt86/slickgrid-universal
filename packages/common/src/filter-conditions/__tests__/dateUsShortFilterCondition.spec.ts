import { FieldType } from '../../enums/index';
import { FilterConditionOption } from '../../interfaces/index';
import { getFilterParsedDates } from '../dateFilterCondition';
import { executeMappedCondition } from '../executeMappedCondition';

describe('dateUsShortFilterCondition method', () => {
  it('should return False when no cell value is provided, neither search terms', () => {
    const searchTerms = undefined;
    const options = { dataKey: '', operator: 'EQ', fieldType: FieldType.dateUsShort, cellValue: '' } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });

  it('should return False when any cell value is provided without any search terms', () => {
    const searchTerms = undefined;
    const options = { dataKey: '', operator: 'EQ', fieldType: FieldType.dateUsShort, cellValue: '12/25/00' } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });

  it('should return False when search term is not a valid date', () => {
    const searchTerms = ['25/14/00'];
    const options = { dataKey: '', operator: 'EQ', fieldType: FieldType.dateUsShort, cellValue: '12/25/00', searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });

  it('should return True when input value provided is equal to the searchTerms', () => {
    const searchTerms = ['12/25/93'];
    const options = { dataKey: '', operator: 'EQ', fieldType: FieldType.dateUsShort, cellValue: '12/25/93', searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(true);
  });

  it('should return True when input value provided is equal to the searchTerms and is called by "executeMappedCondition"', () => {
    const searchTerms = ['12/25/93'];
    const options = { dataKey: '', operator: 'EQ', fieldType: FieldType.dateUsShort, cellValue: '12/25/93', searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(true);
  });

  it('should return False when cell value is not the same value as the searchTerm', () => {
    const searchTerms = ['03/03/2003'];
    const options = { dataKey: '', operator: 'EQ', fieldType: FieldType.dateUsShort, cellValue: '12/25/93', searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });

  it('should return False even when the cell value is found in the searchTerms since it only compares first term', () => {
    const searchTerms = ['03/14/03', '12/25/93'];
    const options = { dataKey: '', operator: 'EQ', fieldType: FieldType.dateUsShort, cellValue: '12/25/93', searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });

  it('should return False even when Operator is Not Equal and cell value equals the search term', () => {
    const searchTerms = ['12/25/93'];
    const options = { dataKey: '', operator: 'NE', fieldType: FieldType.dateUsShort, cellValue: '12/25/93', searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });

  it('should return True even when Operator is Not Equal and cell value is different than the search term', () => {
    const searchTerms = ['12/25/02'];
    const options = { dataKey: '', operator: 'NE', fieldType: FieldType.dateUsShort, cellValue: '12/25/93', searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(true);
  });

  it('should return False when there are no search term and no operator', () => {
    const searchTerms = [null as any];
    const options = { dataKey: '', fieldType: FieldType.dateUsShort, cellValue: '12/25/93', searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });

  it('should return False when search and cell values are different and there are no operator passed, it will use default EQ operator', () => {
    const searchTerms = ['12/27/93'];
    const options = { dataKey: '', fieldType: FieldType.dateUsShort, cellValue: '12/25/93', searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });

  it('should return True when input value is in the range of search terms', () => {
    const searchTerms = ['12/01/93..12/31/93'];
    const options = { dataKey: '', operator: 'EQ', cellValue: '12/25/93', fieldType: FieldType.dateUsShort, searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(true);
  });

  it('should return False when input value is not in the range of search terms', () => {
    const searchTerms = ['12/01/93..12/31/93'];
    const options = { dataKey: '', operator: 'EQ', cellValue: '11/25/93', fieldType: FieldType.dateUsShort, searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });

  it('should return True when input value equals the search terms min inclusive value and operator is set to "rangeInclusive"', () => {
    const searchTerms = ['12/01/93..12/31/93'];
    const options = { dataKey: '', operator: 'RangeInclusive', cellValue: '12/01/93', fieldType: FieldType.dateUsShort, searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(true);
  });

  it('should return False when input value equals the search terms min inclusive value and operator is set to "RangeExclusive"', () => {
    const searchTerms = ['12/01/93..12/31/93'];
    const options = { dataKey: '', operator: 'RangeExclusive', cellValue: '12/01/93', fieldType: FieldType.dateUsShort, searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });

  it('should return False when any of the 2 search term value is not a valid date', () => {
    const searchTerms = ['12/01/93..12/60/93'];
    const options = { dataKey: '', operator: 'RangeExclusive', cellValue: '12/05/93', fieldType: FieldType.dateUsShort, searchTerms } as FilterConditionOption;
    const output = executeMappedCondition(options, getFilterParsedDates(searchTerms, FieldType.dateUsShort));
    expect(output).toBe(false);
  });
});
