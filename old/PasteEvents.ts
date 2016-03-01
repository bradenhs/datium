class PasteEvents {
    constructor(private input:DatepickerInput) {
        input.element.addEventListener("paste", () => this.paste());
        
    }
    
    private paste = ():void => {
        this.input.pasting = true;
        let originalValue = this.input.element.value;
        setTimeout(() => {
            if (!this.input.dateStringRegExp.test(this.input.element.value)) {
                this.input.element.value = originalValue;
                this.input.pasting = false;
                return;
            }
            let newDate = new Date(this.input.curDate.valueOf());
            let strPrefix = "";
            this.input.dateParts.forEach((datePart) => {
                let val = this.input.element.value.replace(strPrefix, "").match(datePart.getRegExpString())[0];
                strPrefix += val;
                if (!datePart.isSelectable()) return;
                newDate = datePart.getDateFromString(newDate, val);
            });
            this.input.update(newDate);
            this.input.pasting = false;
        });
    }
}