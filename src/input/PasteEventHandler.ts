class PasteEventHander {
    constructor(private input:Input) {
        listen.paste(input.element, () => this.paste());
    }
    
    private paste() {
        let originalValue = this.input.element.value;
        let start = this.input.element.selectionStart;
        let end = this.input.element.selectionEnd;
        setTimeout(() => {
            if (!this.input.setDateFromString(this.input.element.value, start, end)) {
                this.input.element.value = originalValue;
            }
        });
    }
}

// TODO Cross-browser
// TODO pasting bugs. look closer