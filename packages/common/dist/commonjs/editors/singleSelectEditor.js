"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleSelectEditor = void 0;
const selectEditor_1 = require("./selectEditor");
class SingleSelectEditor extends selectEditor_1.SelectEditor {
    /**
     * Initialize the Editor
     */
    constructor(args, delayOpening = 0) {
        super(args, false, delayOpening);
        this.args = args;
        this.delayOpening = delayOpening;
    }
}
exports.SingleSelectEditor = SingleSelectEditor;
//# sourceMappingURL=singleSelectEditor.js.map