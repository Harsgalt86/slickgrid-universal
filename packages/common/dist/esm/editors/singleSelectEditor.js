import { SelectEditor } from './selectEditor';
export class SingleSelectEditor extends SelectEditor {
    /**
     * Initialize the Editor
     */
    constructor(args, delayOpening = 0) {
        super(args, false, delayOpening);
        this.args = args;
        this.delayOpening = delayOpening;
    }
}
//# sourceMappingURL=singleSelectEditor.js.map