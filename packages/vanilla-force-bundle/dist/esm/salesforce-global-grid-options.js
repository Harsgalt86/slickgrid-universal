import { EventNamingStyle } from '@slickgrid-universal/event-pub-sub';
/** Global Grid Options Defaults for Salesforce */
export const SalesforceGlobalGridOptions = {
    autoEdit: true,
    autoCommitEdit: true,
    autoFixResizeTimeout: 5 * 60 * 60,
    autoFixResizeRequiredGoodCount: 5 * 60 * 60,
    autoFixResizeWhenBrokenStyleDetected: true,
    cellValueCouldBeUndefined: true,
    contextMenu: {
        hideCloseButton: false,
    },
    eventNamingStyle: EventNamingStyle.lowerCaseWithoutOnPrefix,
    compositeEditorOptions: {
        resetEditorButtonCssClass: 'mdi mdi-refresh mdi-15px mdi-v-align-text-top',
        resetFormButtonIconCssClass: 'mdi mdi-refresh mdi-16px mdi-flip-h mdi-v-align-text-top',
        shouldPreviewMassChangeDataset: true,
    },
    datasetIdPropertyName: 'Id',
    emptyDataWarning: {
        message: `<span class="mdi mdi-alert color-warning"></span> No data to display.`,
    },
    enableDeepCopyDatasetOnPageLoad: true,
    enableTextExport: true,
    textExportOptions: {
        exportWithFormatter: true,
        sanitizeDataExport: true,
    },
    enableCellNavigation: true,
    customTooltip: {
        tooltipTextMaxLength: 650,
    },
    enableExcelExport: true,
    excelExportOptions: {
        exportWithFormatter: true,
        mimeType: '',
        sanitizeDataExport: true
    },
    filterTypingDebounce: 250,
    formatterOptions: {
        thousandSeparator: ','
    },
    frozenHeaderWidthCalcDifferential: 2,
    columnPicker: {
        hideForceFitButton: true,
    },
    gridMenu: {
        commandLabels: {
            clearFrozenColumnsCommandKey: 'UNFREEZE_COLUMNS',
        },
        hideTogglePreHeaderCommand: true,
        hideRefreshDatasetCommand: true,
        hideClearFrozenColumnsCommand: false,
        hideForceFitButton: true,
    },
    headerMenu: {
        hideFreezeColumnsCommand: false,
        iconSortAscCommand: 'fa fa-sort-amount-asc mdi mdi-arrow-up',
        iconSortDescCommand: 'fa fa-sort-amount-desc mdi mdi-arrow-down',
    },
    sanitizer: (dirtyHtml) => typeof dirtyHtml === 'string' ? dirtyHtml.replace(/(\b)(on[a-z]+)(\s*)=|javascript:([^>]*)[^>]*|(<\s*)(\/*)script([<>]*).*(<\s*)(\/*)script(>*)|(&lt;)(\/*)(script|script defer)(.*)(&gt;|&gt;">)/gi, '') : dirtyHtml,
    showCustomFooter: true,
    customFooterOptions: {
        hideMetrics: false,
        hideTotalItemCount: false,
        hideLastUpdateTimestamp: true,
        metricTexts: {
            itemsSelectedKey: 'RECORDS_SELECTED',
        }
    },
    headerRowHeight: 35,
    rowHeight: 33,
    resizeByContentOnlyOnFirstLoad: false,
    resizeByContentOptions: {
        formatterPaddingWidthInPx: 8,
        maxItemToInspectCellContentWidth: 500,
    },
    rowMoveManager: {
        hideRowMoveShadow: false,
    },
    useSalesforceDefaultGridOptions: true,
};
//# sourceMappingURL=salesforce-global-grid-options.js.map