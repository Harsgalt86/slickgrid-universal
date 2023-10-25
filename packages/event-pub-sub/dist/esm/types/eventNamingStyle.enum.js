export var EventNamingStyle;
(function (EventNamingStyle) {
    /** Event name showing in Camel Case, so "onValidationError" would stay as "onValidationError" */
    EventNamingStyle["camelCase"] = "camelCase";
    /** Event name showing in Kebab Case, so "onValidationError" would become "on-validation-error" */
    EventNamingStyle["kebabCase"] = "kebabCase";
    /** Event name showing all in lowercase, so "onValidationError" would become "onvalidationerror" */
    EventNamingStyle["lowerCase"] = "lowerCase";
    /** Event name showing all in lowercase but without the "on" prefix, so "onValidationError" would become "validationerror" */
    EventNamingStyle["lowerCaseWithoutOnPrefix"] = "lowerCaseWithoutOnPrefix";
})(EventNamingStyle || (EventNamingStyle = {}));
//# sourceMappingURL=eventNamingStyle.enum.js.map