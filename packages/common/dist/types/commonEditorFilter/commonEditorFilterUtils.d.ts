import { AutocompleteItem } from 'autocompleter';
import type { AutocompleterOption } from '../interfaces/index';
/**
 * add loading class ".slick-autocomplete-loading" to the Kraaden Autocomplete input element
 * by overriding the original user's fetch method.
 * We will add the loading class when the fetch starts and later remove it when the update callback is being called.
 * @param inputElm - autocomplete input element
 * @param autocompleterOptions - autocomplete settings
 */
export declare function addAutocompleteLoadingByOverridingFetch<T extends AutocompleteItem>(inputElm: HTMLInputElement, autocompleterOptions: Partial<AutocompleterOption<T>>): void;
//# sourceMappingURL=commonEditorFilterUtils.d.ts.map