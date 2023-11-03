"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.percentCompleteBarWithTextFormatter = void 0;
const utils_1 = require("@slickgrid-universal/utils");
/** Takes a cell value number (between 0-100) and displays SlickGrid custom "percent-complete-bar" with Text a red (<30), silver (>30 & <70) or green (>=70) bar */
const percentCompleteBarWithTextFormatter = (_row, _cell, value) => {
    if (!(0, utils_1.isNumber)(value)) {
        return '';
    }
    let color = '';
    let inputNumber = parseFloat(value);
    if (inputNumber > 100) {
        inputNumber = 100;
    }
    if (inputNumber < 30) {
        color = 'red';
    }
    else if (inputNumber < 70) {
        color = 'silver';
    }
    else {
        color = 'green';
    }
    return `<div class="percent-complete-bar-with-text" title="${inputNumber}%" style="background:${color}; width:${inputNumber}%">${inputNumber}%</div>`;
};
exports.percentCompleteBarWithTextFormatter = percentCompleteBarWithTextFormatter;
//# sourceMappingURL=percentCompleteBarWithTextFormatter.js.map