class MouseEventHandler {
    constructor(private input:Input) {
        //listen.mousedown(input.element, () => this.selectionStart());
        listen.select(input.element, () => {
            alert('selection end');   
        });//this.selectionEnd());
        
        // Stop default
        input.element.addEventListener("dragenter", (e) => e.preventDefault());
        input.element.addEventListener("dragover", (e) => e.preventDefault());
        input.element.addEventListener("drop", (e) => e.preventDefault());
        input.element.addEventListener("cut", (e) => e.preventDefault());
    }
    
    private selectionStart() {
        this.input.element.setSelectionRange(void 0, void 0);
    }
    
    private lastSelectionStart:number;
    private lastSelectionEnd:number;
    
    private selectionEnd = () => {
        if (this.input.element.selectionStart === this.lastSelectionStart &&
            this.input.element.selectionEnd === this.lastSelectionEnd) {
            return;
        }
        
        this.lastSelectionStart = this.input.element.selectionStart;
        this.lastSelectionEnd = this.input.element.selectionEnd;
        
        let block = this.input.getNearestSelectableDatePart(this.input.element.selectionStart);
        
        this.input.setSelectedDatePart(block);
        
        if (this.input.element.selectionStart > 0 || this.input.element.selectionEnd < this.input.element.value.length) {
            this.input.triggerViewChange();
        }
    };
}