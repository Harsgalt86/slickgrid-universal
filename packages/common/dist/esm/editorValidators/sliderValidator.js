import { Constants } from '../constants';
export function sliderValidator(inputValue, options) {
    const isRequired = options.required;
    const minValue = options.minValue;
    const maxValue = options.maxValue;
    const errorMsg = options.errorMessage;
    const mapValidation = {
        '{{minValue}}': minValue,
        '{{maxValue}}': maxValue
    };
    if (options.validator) {
        return options.validator(inputValue, options.editorArgs);
    }
    else if (isRequired && inputValue === '') {
        return {
            valid: false,
            msg: errorMsg || Constants.VALIDATION_REQUIRED_FIELD
        };
    }
    else if (minValue !== undefined && maxValue !== undefined && inputValue !== null && (inputValue < minValue || inputValue > maxValue)) {
        // when decimal value is bigger than 0, we only accept the decimal values as that value set
        // for example if we set decimalPlaces to 2, we will only accept numbers between 0 and 2 decimals
        return {
            valid: false,
            msg: errorMsg || Constants.VALIDATION_EDITOR_NUMBER_BETWEEN.replace(/{{minValue}}|{{maxValue}}/gi, (matched) => {
                return mapValidation[matched];
            })
        };
    }
    return { valid: true, msg: null };
}
//# sourceMappingURL=sliderValidator.js.map