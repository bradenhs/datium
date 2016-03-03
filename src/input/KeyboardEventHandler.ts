const enum KEY {
    RIGHT = 39, LEFT = 37, TAB = 9, UP = 38,
    DOWN = 40, V = 86, C = 67, A = 65, HOME = 36,
    END = 35, BACKSPACE = 8
}

class KeyboardEventHandler {
    private shiftTabDown = false;
    private tabDown = false;
    
    constructor(private input:Input, private dateManager:DateManager) {
        input.element.addEventListener("keydown", (e) => this.keydown(e));
        input.element.addEventListener("focus", () => this.focus());
        document.addEventListener("keydown", (e) => this.documentKeydown(e));
    }

    private focus = ():void => {
        if (this.tabDown) {
            let first = this.input.getFirstSelectableDatePart();
            this.input.setSelectedDatePart(first);
            setTimeout(() => {
               this.input.updateView();
            });
        } else if (this.shiftTabDown) {
            let last = this.input.getLastSelectableDatePart();
            this.input.setSelectedDatePart(last);
            setTimeout(() => {
               this.input.updateView();
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
        
    }
    
    private home() {
        let first = this.input.getFirstSelectableDatePart();
        this.input.setSelectedDatePart(first);
    }
    
    private end() {
        let last = this.input.getLastSelectableDatePart();
        this.input.setSelectedDatePart(last);        
    }
    
    private left() {
        let previous = this.input.getPreviousSelectableDatePart();
        this.input.setSelectedDatePart(previous);
    }
    
    private right() {
        let next = this.input.getNextSelectableDatePart();
        this.input.setSelectedDatePart(next);
    }
    
    private shiftTab() {
        let previous = this.input.getPreviousSelectableDatePart();
        if (previous !== this.input.getSelectedDatePart()) {
            this.input.setSelectedDatePart(previous);
            return true;
        }
        return false;
    }
    
    private tab() {
        let next = this.input.getNextSelectableDatePart();
        if (next !== this.input.getSelectedDatePart()) {
            this.input.setSelectedDatePart(next);
            return true;
        }
        return false;
        
    }
    
    private up() {
        try {
            this.input.getSelectedDatePart().increment();
        } catch (e) {
            this.input.getSelectedDatePart().setValue(this.dateManager.getDefaultDate());
        }
        
        let level = this.input.getSelectedDatePart().getLevel();
        let date = this.input.getSelectedDatePart().getValue();
        
        this.dateManager.goTo(date, level);
    }
    
    private down() {
        
    }
}