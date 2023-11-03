/**
 * add loading class ".slick-autocomplete-loading" to the Kraaden Autocomplete input element
 * by overriding the original user's fetch method.
 * We will add the loading class when the fetch starts and later remove it when the update callback is being called.
 * @param inputElm - autocomplete input element
 * @param autocompleterOptions - autocomplete settings
 */
export function addAutocompleteLoadingByOverridingFetch(inputElm, autocompleterOptions) {
    const previousFetch = autocompleterOptions.fetch;
    if (previousFetch) {
        autocompleterOptions.fetch = (searchTerm, updateCallback, trigger, cursorPos) => {
            // add loading class
            inputElm.classList.add('slick-autocomplete-loading');
            const previousCallback = updateCallback;
            const newUpdateCallback = (items) => {
                previousCallback(items);
                // we're done, time to remove loading class
                inputElm.classList.remove('slick-autocomplete-loading');
            };
            // call original fetch implementation
            previousFetch(searchTerm, newUpdateCallback, trigger, cursorPos);
        };
    }
}
//# sourceMappingURL=commonEditorFilterUtils.js.map