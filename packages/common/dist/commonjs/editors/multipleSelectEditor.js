"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleSelectEditor = void 0;
const selectEditor_1 = require("./selectEditor");
class MultipleSelectEditor extends selectEditor_1.SelectEditor {
    /**
     * Initialize the Editor
     */
    constructor(args, delayOpening = 0) {
        super(args, true, delayOpening);
        this.args = args;
        this.delayOpening = delayOpening;
    }
}
exports.MultipleSelectEditor = MultipleSelectEditor;
//# sourceMappingURL=multipleSelectEditor.js.map