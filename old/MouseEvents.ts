class MouseEvents {
    constructor(private input:DatepickerInput) {
        input.element.addEventListener("mousedown", this.mousedown);
        document.addEventListener("mouseup", this.mouseup);
        document.addEventListener("touchstart", this.touchstart);
        
        // Stop default
        input.element.addEventListener("dragenter", (e) => e.preventDefault());
        input.element.addEventListener("dragover", (e) => e.preventDefault());
        input.element.addEventListener("drop", (e) => e.preventDefault());
        input.element.addEventListener("cut", (e) => e.preventDefault());
        
        // Touch devices need this handled in a different way
        this.interval = setInterval(this.handleSelectionOnTouch);
    }
    
    private interval:number;
    private down:boolean;
    private caretStart:number;
    
    private mousedown = () => {
        // Mouse event triggered - get rid of touch handler
        clearInterval(this.interval);
        
        this.down = true;
        this.input.element.setSelectionRange(void 0, void 0);
        setTimeout(() => {
            this.caretStart = this.input.element.selectionStart;
        });
    };
    
    private mouseup = () => {
        if (!this.down) return;
        this.down = false;
        let pos = this.input.element.selectionStart === this.caretStart ? this.input.element.selectionEnd : this.input.element.selectionStart;
        this.input.selectedIndex = this.input.getNearestSelectableIndex(pos);
        if (this.input.element.selectionStart > 0 || this.input.element.selectionEnd < this.input.element.value.length) {
            this.input.update();
        }
    };
    
    private touchstart = () => {
        this.input.element.removeEventListener("mousedown", this.mousedown);
        document.removeEventListener("mouseup", this.mouseup);
        document.removeEventListener("touchstart", this.touchstart);
    };
    
    private lastStart:number;
    private lastEnd:number;
    
    private handleSelectionOnTouch = () => {
        if (!this.input.pasting &&
            (this.input.element.selectionStart !== 0 ||
             this.input.element.selectionEnd !== this.input.element.value.length) &&
            (this.input.element.selectionStart !== this.lastStart ||
             this.input.element.selectionEnd !== this.lastEnd)) {
                    
            let pos = this.input.element.selectionStart + (this.input.element.selectionEnd - this.input.element.selectionStart) / 2;
            this.input.selectedIndex = this.input.getNearestSelectableIndex(pos);
            this.input.update()
        }
        this.lastStart = this.input.element.selectionStart;
        this.lastEnd = this.input.element.selectionEnd;
    }
}