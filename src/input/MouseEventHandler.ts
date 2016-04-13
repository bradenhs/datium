class MouseEventHandler {
    private md:MouseDetector;
    constructor(private input:Input) {
        let listeners = listen.mousedown(input.element, () => this.mousedown());
        
        this.md = new MouseDetector((hasMouse:boolean) => {
            if (hasMouse) {
                listen.mouseup(document, () => this.mouseup());
            } else {
                listen.removeListeners(listeners);
            }
        });
        
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
        
        if (this.md.hasMouse()) {
            this.input.element.setSelectionRange(void 0, void 0);
        }
        
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
            this.input.triggerViewChange();
        }
    };
}