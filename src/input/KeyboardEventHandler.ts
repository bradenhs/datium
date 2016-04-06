const enum KEY {
    RIGHT = 39, LEFT = 37, TAB = 9, UP = 38,
    DOWN = 40, V = 86, C = 67, A = 65, HOME = 36,
    END = 35, BACKSPACE = 8, DELETE = 46
}

class KeyboardEventHandler {
    private shiftTabDown = false;
    private tabDown = false;
    
    constructor(private input:Input) {
        // TODO handle these things in events
        input.element.addEventListener("keydown", (e) => this.keydown(e));
        input.element.addEventListener("focus", () => this.focus());
        document.addEventListener("keydown", (e) => this.documentKeydown(e));
    }

    private focus = ():void => {
        if (this.tabDown) {
            let first = this.input.getFirstSelectableDatePart();
            this.input.setSelectedDatePart(first);
            setTimeout(() => {
               this.input.triggerViewChange();
            });
        } else if (this.shiftTabDown) {
            let last = this.input.getLastSelectableDatePart();
            this.input.setSelectedDatePart(last);
            setTimeout(() => {
               this.input.triggerViewChange();
            });
        }
    }
    
    private documentKeydown(e:KeyboardEvent) {
        if (e.shiftKey && e.keyCode === KEY.TAB) {
            this.shiftTabDown = true;
        } else if (e.keyCode === KEY.TAB) {
            this.tabDown = true;
        }
        setTimeout(() => {
            this.shiftTabDown = false;
            this.tabDown = false;
        });
    }
    
    private keydown(e:KeyboardEvent) {
        let code = e.keyCode;
        if (code >= 96 && code <= 105) {
            code -= 48;
        }
        
        
        if ((code === KEY.HOME || code === KEY.END) && e.shiftKey) return;
        if ((code === KEY.LEFT || code === KEY.RIGHT) && e.shiftKey) return;
        if ((code === KEY.C || code === KEY.A || code === KEY.V) && e.ctrlKey) return;
        
        let preventDefault = true;
        
        if (code === KEY.HOME) {
            this.home();
        } else if (code === KEY.END) {
            this.end();
        } else if (code === KEY.LEFT) {
            this.left();
        } else if (code === KEY.RIGHT) {
            this.right();
        } else if (code === KEY.TAB && e.shiftKey) {
            preventDefault = this.shiftTab();
        } else if (code === KEY.TAB) {
            preventDefault = this.tab();
        } else if (code === KEY.UP) {
            this.up();
        } else if (code === KEY.DOWN) {
            this.down();
        }
        
        if (preventDefault) {
            e.preventDefault();
        }
        
        let keyPressed = String.fromCharCode(code);
        if (/^[0-9]|[A-z]$/.test(keyPressed)) {
            let textBuffer = this.input.getTextBuffer();
            this.input.setTextBuffer(textBuffer + keyPressed);
        } else if (code === KEY.BACKSPACE) { // delete key too
            let textBuffer = this.input.getTextBuffer();
            this.input.setTextBuffer(textBuffer.slice(0, -1));
            if (textBuffer.length < 2) {
                //TODO triger defined change
                let undefinedLevel:Level = this.input.getSelectedDatePart().getLevel();
                this.input.dateParts.forEach((datePart) => {
                   if (datePart.getLevel() === undefinedLevel) {
                       this.input.setDefined(datePart, false);
                   } 
                });
                this.input.triggerViewChange();
            }
        } else if (code === KEY.DELETE) {
            //TODO triger defined change
            let undefinedLevel:Level = this.input.getSelectedDatePart().getLevel(); 
            this.input.dateParts.forEach((datePart) => {
                if (datePart.getLevel() === undefinedLevel) {
                    this.input.setDefined(datePart, false);
                } 
            });
            this.input.triggerViewChange();
        } else if (!e.shiftKey) {
            this.input.setTextBuffer('');
        }
        
    }
    
    private home() {
        let first = this.input.getFirstSelectableDatePart();
        this.input.setSelectedDatePart(first);
        this.input.triggerViewChange();
    }
    
    private end() {
        let last = this.input.getLastSelectableDatePart();
        this.input.setSelectedDatePart(last);     
        this.input.triggerViewChange();
    }
    
    private left() {
        let previous = this.input.getPreviousSelectableDatePart();
        this.input.setSelectedDatePart(previous);
        this.input.triggerViewChange();
    }
    
    private right() {
        let next = this.input.getNextSelectableDatePart();
        this.input.setSelectedDatePart(next);
        this.input.triggerViewChange();
    }
    
    private shiftTab() {
        let previous = this.input.getPreviousSelectableDatePart();
        if (previous !== this.input.getSelectedDatePart()) {
            this.input.setSelectedDatePart(previous);
            this.input.triggerViewChange();
            return true;
        }
        return false;
    }
    
    private tab() {
        let next = this.input.getNextSelectableDatePart();
        if (next !== this.input.getSelectedDatePart()) {
            this.input.setSelectedDatePart(next);
            this.input.triggerViewChange();
            return true;
        }
        return false;
        
    }
    
    private up() {
        this.input.getSelectedDatePart().increment();
        
        this.input.dateParts.forEach((datePart) => {
            if (datePart.getLevel() === this.input.getSelectedDatePart().getLevel()) {
                this.input.setDefined(datePart, true);
            }
        });
        
        let level = this.input.getSelectedDatePart().getLevel();
        let date = this.input.getSelectedDatePart().getValue();
        
        trigger.goto(this.input.element, {
            date: date,
            level: level
        });
    }
    
    private down() {
        this.input.getSelectedDatePart().decrement();
        
        this.input.dateParts.forEach((datePart) => {
            if (datePart.getLevel() === this.input.getSelectedDatePart().getLevel()) {
                this.input.setDefined(datePart, true);
            }
        });
        
        let level = this.input.getSelectedDatePart().getLevel();
        let date = this.input.getSelectedDatePart().getValue();
        
        trigger.goto(this.input.element, {
            date: date,
            level: level
        });
    }
}