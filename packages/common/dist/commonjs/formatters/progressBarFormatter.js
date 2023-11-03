"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressBarFormatter = void 0;
const utils_1 = require("@slickgrid-universal/utils");
/** Takes a cell value number (between 0-100) and displays Bootstrap "progress-bar" a red (<30), silver (>30 & <70) or green (>=70) bar */
const progressBarFormatter = (_row, _cell, value) => {
    if (!(0, utils_1.isNumber)(value)) {
        return '';
    }
    let color = '';
    let inputNumber = parseFloat(value);
    if (inputNumber > 100) {
        inputNumber = 100;
    }
    if (inputNumber < 30) {
        color = 'danger';
    }
    else if (inputNumber < 70) {
        color = 'warning';
    }
    else {
        color = 'success';
    }
    const output = `<div class="progress">
    <div class="progress-bar progress-bar-${color} bg-${color}" role="progressbar" aria-valuenow="${inputNumber}" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: ${inputNumber}%;">
    ${inputNumber}%
    </div>
  </div>`;
    return output.replace(/\s{2,}/g, ' ').trim();
};
exports.progressBarFormatter = progressBarFormatter;
//# sourceMappingURL=progressBarFormatter.js.map