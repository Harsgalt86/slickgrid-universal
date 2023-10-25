"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputPasswordEditor = void 0;
const inputEditor_1 = require("./inputEditor");
class InputPasswordEditor extends inputEditor_1.InputEditor {
    /** Initialize the Editor */
    constructor(args) {
        super(args, 'password');
        this.args = args;
    }
}
exports.InputPasswordEditor = InputPasswordEditor;
//# sourceMappingURL=inputPasswordEditor.js.map