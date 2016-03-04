class MouseEventHandler {
    constructor(private input:Input) {
        listen.mousedown(input.element, () => this.mousedown());
        listen.mouseup(document, () => this.mouseup());
        
        // Stop default
        input.element.addEventListener("dragenter", (e) => e.preventDefault());
        input.element.addEventListener("dragover", (e) => e.preventDefault());
        input.element.addEventListener("drop", (e) => e.preventDefault());
        input.element.addEventListener("cut", (e) => e.preventDefault());
    }
    
    private down:boolean;
    private caretStart:number;
    
    private mousedown() {
        this.down = true;
        this.input.element.setSelectionRange(void 0, void 0);
        setTimeout(() => {
           this.caretStart = this.input.element.selectionStart; 
        });
    }
    
    private mouseup = () => {
        if (!this.down) return;
        this.down = false;
        
        let pos:number;
        
        if (this.input.element.selectionStart === this.caretStart) {
            pos = this.input.element.selectionEnd;
        } else {
            pos = this.input.element.selectionStart;
        }
        
        let block = this.input.getNearestSelectableDatePart(pos);
        
        this.input.setSelectedDatePart(block);
        
        if (this.input.element.selectionStart > 0 || this.input.element.selectionEnd < this.input.element.value.length) {
            this.input.updateView();
        }
    };
}