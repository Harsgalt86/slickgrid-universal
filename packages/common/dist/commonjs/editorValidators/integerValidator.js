"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integerValidator = void 0;
const constants_1 = require("../constants");
function integerValidator(inputValue, options) {
    let intNumber = !isNaN(inputValue) ? parseInt(inputValue, 10) : null;
    if (intNumber !== null && isNaN(intNumber)) {
        intNumber = null;
    }
    const errorMsg = options.errorMessage;
    const isRequired = options.required;
    const minValue = options.minValue;
    const maxValue = options.maxValue;
    const operatorConditionalType = options.operatorConditionalType || 'inclusive';
    const mapValidation = {
        '{{minValue}}': minValue,
        '{{maxValue}}': maxValue
    };
    let isValid = true;
    let outputMsg = '';
    if (options.validator) {
        return options.validator(inputValue, options.editorArgs);
    }
    else if (isRequired && inputValue === '') {
        isValid = false;
        outputMsg = errorMsg || constants_1.Constants.VALIDATION_REQUIRED_FIELD;
    }
    else if (inputValue !== '' && ((isNaN(inputValue) || !/^[+-]?\d+$/.test(inputValue)))) {
        isValid = false;
        outputMsg = errorMsg || constants_1.Constants.VALIDATION_EDITOR_VALID_INTEGER;
    }
    else if (minValue !== undefined && maxValue !== undefined && intNumber !== null && ((operatorConditionalType === 'exclusive' && (intNumber <= +minValue || intNumber >= +maxValue)) || (operatorConditionalType === 'inclusive' && (intNumber < +minValue || intNumber > +maxValue)))) {
        // MIN & MAX Values provided (between)
        // when decimal value is bigger than 0, we only accept the decimal values as that value set
        // for example if we set decimalPlaces to 2, we will only accept numbers between 0 and 2 decimals
        isValid = false;
        outputMsg = errorMsg || constants_1.Constants.VALIDATION_EDITOR_INTEGER_BETWEEN.replace(/{{minValue}}|{{maxValue}}/gi, (matched) => mapValidation[matched]);
    }
    else if (minValue !== undefined && intNumber !== null && ((operatorConditionalType === 'exclusive' && intNumber <= +minValue) || (operatorConditionalType === 'inclusive' && intNumber !== null && intNumber < +minValue))) {
        // MIN VALUE ONLY
        // when decimal value has to be higher then provided minValue
        isValid = false;
        const defaultErrorMsg = operatorConditionalType === 'inclusive' ? constants_1.Constants.VALIDATION_EDITOR_INTEGER_MIN_INCLUSIVE : constants_1.Constants.VALIDATION_EDITOR_INTEGER_MIN;
        outputMsg = errorMsg || defaultErrorMsg.replace(/{{minValue}}/gi, (matched) => mapValidation[matched]);
    }
    else if (maxValue !== undefined && intNumber !== null && ((operatorConditionalType === 'exclusive' && intNumber >= +maxValue) || (operatorConditionalType === 'inclusive' && intNumber !== null && intNumber > +maxValue))) {
        // MAX VALUE ONLY
        // when decimal value has to be lower then provided maxValue
        isValid = false;
        const defaultErrorMsg = operatorConditionalType === 'inclusive' ? constants_1.Constants.VALIDATION_EDITOR_INTEGER_MAX_INCLUSIVE : constants_1.Constants.VALIDATION_EDITOR_INTEGER_MAX;
        outputMsg = errorMsg || defaultErrorMsg.replace(/{{maxValue}}/gi, (matched) => mapValidation[matched]);
    }
    return { valid: isValid, msg: outputMsg };
}
exports.integerValidator = integerValidator;
//# sourceMappingURL=integerValidator.js.map