import { SelectEditor } from './selectEditor';
export class MultipleSelectEditor extends SelectEditor {
    /**
     * Initialize the Editor
     */
    constructor(args, delayOpening = 0) {
        super(args, true, delayOpening);
        this.args = args;
        this.delayOpening = delayOpening;
    }
}
//# sourceMappingURL=multipleSelectEditor.js.map