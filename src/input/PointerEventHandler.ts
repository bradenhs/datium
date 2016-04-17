class PointerEventHandler {
    constructor(private input:Input) {
        let stopMousedown = false;
        listen.touchstart(input.element, (e) => {
           stopMousedown = true;
        });
        listen.mousedown(input.element, () => {
            if (!stopMousedown) this.mousedown();
            stopMousedown = false;
        });
        listen.mouseup(document, () => this.mouseup());
        
        // Set Interval for Touch Devices
        let start:number, end:number;
        setInterval(() => {
            if (this.down ||
                this.input.element !== document.activeElement)
                return;
            
            if (start === this.input.element.selectionStart &&
                end === this.input.element.selectionEnd)
                return;
                
            if (this.input.element.selectionStart !== this.input.element.selectionEnd)
                return;
            
            start = this.input.element.selectionStart;
            end = this.input.element.selectionEnd;
            
            let pos = start + (end - start) / 2;
            
            let block = this.input.getNearestSelectableDatePart(pos);
            this.input.setSelectedDatePart(block);
            
            this.input.triggerViewChange();
        }, 10);
        
        // Stop default
        input.element.addEventListener("dragenter", (e) => e.preventDefault());
        input.element.addEventListener("dragover", (e) => e.preventDefault());
        input.element.addEventListener("drop", (e) => e.preventDefault());
        input.element.addEventListener("cut", (e) => e.preventDefault());
    }
    
    private caretStart:number;
    private down:boolean = false;
    
    private mousedown() {
        this.down = true;
        
        this.input.element.setSelectionRange(void 0, void 0);
        
        setTimeout(() => {
            this.caretStart = this.input.element.selectionStart;
        });
    }
    
    private lastSelectionStart:number;
    private lastSelectionEnd:number;
    
    private mouseup = () => {
        if (!this.down) return;
        this.down = false;
        
        let pos:number = this.input.element.selectionStart;
        
        if (pos === this.caretStart) {
            pos = this.input.element.selectionEnd;
        }
        
        let block = this.input.getNearestSelectableDatePart(pos);
        
        this.input.setSelectedDatePart(block);
        
        if (this.input.element.selectionStart > 0 || this.input.element.selectionEnd < this.input.element.value.length) {
            this.input.triggerViewChange();
        }
    };
}