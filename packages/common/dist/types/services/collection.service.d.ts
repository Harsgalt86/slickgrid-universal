import { FilterMultiplePassType, type FilterMultiplePassTypeString } from './../enums/index';
import type { CollectionFilterBy, CollectionSortBy, Column } from './../interfaces/index';
import type { TranslaterService } from './translater.service';
export declare class CollectionService<T = any> {
    protected readonly translaterService?: TranslaterService | undefined;
    constructor(translaterService?: TranslaterService | undefined);
    /**
     * Filter 1 or more items from a collection
     * @param collection
     * @param filterByOptions
     */
    filterCollection(collection: T[], filterByOptions: CollectionFilterBy | CollectionFilterBy[], filterResultBy?: FilterMultiplePassType | FilterMultiplePassTypeString | null): T[];
    /**
     * Filter an item from a collection
     * @param collection
     * @param filterBy
     */
    singleFilterCollection(collection: T[], filterBy: CollectionFilterBy): T[];
    /**
     * Sort 1 or more items in a collection
     * @param column definition
     * @param collection
     * @param sortByOptions
     * @param enableTranslateLabel
     */
    sortCollection(columnDef: Column, collection: T[], sortByOptions: CollectionSortBy | CollectionSortBy[], enableTranslateLabel?: boolean): T[];
}
//# sourceMappingURL=collection.service.d.ts.map