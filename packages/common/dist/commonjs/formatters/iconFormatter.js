"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iconFormatter = void 0;
/** Display whichever icon you want (library agnostic, it could be Font-Awesome or any other) */
const iconFormatter = (_row, _cell, _value, columnDef) => {
    const columnParams = columnDef && columnDef.params || {};
    const icon = columnParams.icon || columnParams.formatterIcon;
    if (!icon) {
        throw new Error(`You must provide the "icon" or "formatterIcon" via the generic "params" options (e.g.: { formatter: Formatters.icon, params: { formatterIcon: 'fa fa-search' }}`);
    }
    return `<i class="${icon}" aria-hidden="true"></i>`;
};
exports.iconFormatter = iconFormatter;
//# sourceMappingURL=iconFormatter.js.map