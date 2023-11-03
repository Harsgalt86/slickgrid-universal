/**
 * Get option from editor.params PR editor.editorOptions
 * @deprecated this should be removed when slider editorParams are replaced by editorOptions
 */
export function getEditorOptionByName(columnEditor, optionName, defaultValue, editorName = 'Slider') {
    var _a, _b, _c;
    let outValue;
    if (((_a = columnEditor.editorOptions) === null || _a === void 0 ? void 0 : _a[optionName]) !== undefined) {
        outValue = columnEditor.editorOptions[optionName];
    }
    else if (((_b = columnEditor === null || columnEditor === void 0 ? void 0 : columnEditor.params) === null || _b === void 0 ? void 0 : _b[optionName]) !== undefined) {
        console.warn(`[Slickgrid-Universal] All editor.params from ${editorName} Editor are moving to "editorOptions" for better typing support and "params" will be deprecated in future release.`);
        outValue = (_c = columnEditor === null || columnEditor === void 0 ? void 0 : columnEditor.params) === null || _c === void 0 ? void 0 : _c[optionName];
    }
    return outValue !== null && outValue !== void 0 ? outValue : defaultValue;
}
//# sourceMappingURL=editorUtilities.js.map