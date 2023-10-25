"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textValidator = void 0;
const constants_1 = require("../constants");
function textValidator(inputValue, options) {
    var _a;
    const errorMsg = options.errorMessage;
    const isRequired = options.required;
    const minLength = options.minLength;
    const maxLength = options.maxLength;
    const operatorConditionalType = options.operatorConditionalType || 'inclusive';
    const mapValidation = {
        '{{minLength}}': minLength,
        '{{maxLength}}': maxLength
    };
    let isValid = true;
    let outputMsg = '';
    const inputValueLength = (_a = inputValue === null || inputValue === void 0 ? void 0 : inputValue.length) !== null && _a !== void 0 ? _a : 0;
    if (options.validator) {
        return options.validator(inputValue, options.editorArgs);
    }
    // by default the editor is almost always valid (except when it's required but not provided)
    if (isRequired && inputValue === '') {
        isValid = false;
        outputMsg = errorMsg || constants_1.Constants.VALIDATION_REQUIRED_FIELD;
    }
    else if (minLength !== undefined && maxLength !== undefined && ((operatorConditionalType === 'exclusive' && (inputValueLength <= minLength || inputValueLength >= maxLength)) || (operatorConditionalType === 'inclusive' && (inputValueLength < minLength || inputValueLength > maxLength)))) {
        // MIN & MAX Length provided
        // make sure text length is between minLength and maxLength
        isValid = false;
        outputMsg = errorMsg || constants_1.Constants.VALIDATION_EDITOR_TEXT_LENGTH_BETWEEN.replace(/{{minLength}}|{{maxLength}}/gi, (matched) => mapValidation[matched]);
    }
    else if (minLength !== undefined && inputValueLength !== null && ((operatorConditionalType === 'exclusive' && inputValueLength <= minLength) || (operatorConditionalType === 'inclusive' && inputValueLength !== null && inputValueLength < minLength))) {
        // MIN Length ONLY
        // when text length is shorter than minLength
        isValid = false;
        const defaultErrorMsg = operatorConditionalType === 'inclusive' ? constants_1.Constants.VALIDATION_EDITOR_TEXT_MIN_LENGTH_INCLUSIVE : constants_1.Constants.VALIDATION_EDITOR_TEXT_MIN_LENGTH;
        outputMsg = errorMsg || defaultErrorMsg.replace(/{{minLength}}/gi, (matched) => mapValidation[matched]);
    }
    else if (maxLength !== undefined && inputValueLength !== null && ((operatorConditionalType === 'exclusive' && inputValueLength >= maxLength) || (operatorConditionalType === 'inclusive' && inputValueLength !== null && inputValueLength > maxLength))) {
        // MAX Length ONLY
        // when text length is longer than minLength
        isValid = false;
        const defaultErrorMsg = operatorConditionalType === 'inclusive' ? constants_1.Constants.VALIDATION_EDITOR_TEXT_MAX_LENGTH_INCLUSIVE : constants_1.Constants.VALIDATION_EDITOR_TEXT_MAX_LENGTH;
        outputMsg = errorMsg || defaultErrorMsg.replace(/{{maxLength}}/gi, (matched) => mapValidation[matched]);
    }
    return { valid: isValid, msg: outputMsg };
}
exports.textValidator = textValidator;
//# sourceMappingURL=textValidator.js.map