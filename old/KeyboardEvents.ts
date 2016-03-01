class KeyboardEvents {
    private shiftTabDown = false;
    private tabDown = false;
    
    constructor(private input:DatepickerInput) {
        input.element.addEventListener("keydown", (e) => this.keydown(e));
        input.element.addEventListener("focus", () => this.focus());
        
        document.addEventListener("keydown", (e:KeyboardEvent) => {
            if (e.shiftKey && e.keyCode === KeyCodes.TAB) {
                this.shiftTabDown = true;
            } else if (e.keyCode === KeyCodes.TAB) {
                this.tabDown = true;
            }
            setTimeout(() => {
               this.shiftTabDown = false;
               this.tabDown = false;
            });
        });
    }

    private focus = ():void => {
        if (this.tabDown) {
            this.input.selectedIndex = this.input.getFirstSelectable();
            setTimeout(() => {
               this.input.update();
            });
        } else if (this.shiftTabDown) {
            this.input.selectedIndex = this.input.getLastSelectable();
            setTimeout(() => {
               this.input.update();
            });
        }
    }
    
    private keydown = (e:KeyboardEvent):void => {
        if ((e.keyCode === KeyCodes.HOME || e.keyCode === KeyCodes.END) && e.shiftKey) return;
        if (e.keyCode === KeyCodes.C && e.ctrlKey) return;
        if (e.keyCode === KeyCodes.A && e.ctrlKey) return;
        if (e.keyCode === KeyCodes.V && e.ctrlKey) return;
        if ((e.keyCode === KeyCodes.LEFT || e.keyCode === KeyCodes.RIGHT) && e.shiftKey) return;

        if (e.keyCode === KeyCodes.HOME) {
            this.input.selectedIndex = this.input.getFirstSelectable();
            this.input.update();
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.END) {
            this.input.selectedIndex = this.input.getLastSelectable();
            this.input.update();
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.LEFT) {
            this.input.selectedIndex = this.input.getPreviousSelectable();
            this.input.update();
            e.preventDefault();
        } else if (e.shiftKey && e.keyCode === KeyCodes.TAB) {
            let previousSelectable = this.input.getPreviousSelectable();
            if (previousSelectable !== this.input.selectedIndex) {
                this.input.selectedIndex = previousSelectable;
                this.input.update();
                e.preventDefault();
            }
        } else if (e.keyCode === KeyCodes.RIGHT) {
            this.input.selectedIndex = this.input.getNextSelectable();
            this.input.update();
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.TAB) {
            let nextSelectable = this.input.getNextSelectable();
            if (nextSelectable !== this.input.selectedIndex) {
                this.input.selectedIndex = nextSelectable;
                this.input.update();
                e.preventDefault();
            }
        } else if (e.keyCode === KeyCodes.UP) {
            let newDate = this.input.dateParts[this.input.selectedIndex].increment(this.input.curDate);
            this.input.update(newDate);
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.DOWN) {
            let newDate = this.input.dateParts[this.input.selectedIndex].decrement(this.input.curDate);
            this.input.update(newDate);
            e.preventDefault();
        } else {
            e.preventDefault();
        }

        let keyPressed = (<any>{
            "48": "0", "96": "0", "49": "1", "97": "1",
            "50": "2", "98": "2", "51": "3", "99": "3",
            "52": "4", "100": "4", "53": "5", "101": "5",
            "54": "6", "102": "6", "55": "7", "103": "7",
            "56": "8", "104": "8", "57": "9", "105": "9",
            "65": "a", "66": "b", "67": "c", "68": "d",
            "69": "e", "70": "f", "71": "g", "72": "h",
            "73": "i", "74": "j", "75": "k", "76": "l",
            "77": "m", "78": "n", "79": "o", "80": "p",
            "81": "q", "82": "r", "83": "s", "84": "t",
            "85": "u", "86": "v", "87": "w", "88": "x",
            "89": "y", "90": "z"
        })[e.keyCode];

        if (e.keyCode === KeyCodes.BACKSPACE) {
            this.backspace();
        } else if (keyPressed !== void 0) {
            this.input.textBuffer += keyPressed;
        } else if (!e.shiftKey) {
            this.input.textBuffer = "";
        }

        if (this.input.textBuffer.length > 0) {
            let orig = this.input.curDate.valueOf();
            let result = this.input.dateParts[this.input.selectedIndex].getDateFromString(this.input.curDate, this.input.textBuffer);
            if (result !== void 0 && this.input.dateParts[this.input.selectedIndex].getMaxBufferSize(result) !== void 0 && this.input.textBuffer.length >= this.input.dateParts[this.input.selectedIndex].getMaxBufferSize(result)) {
                var next = this.input.getNextSelectable();
                if (next === this.input.selectedIndex) this.input.textBuffer = '';
                this.input.selectedIndex = next;
            }
            if (result === void 0) {
                this.input.textBuffer = this.input.textBuffer.slice(0, this.input.textBuffer.length - 1);
            } else {
                this.input.update(result);
            }
        }
    }
    
    private backspace = () => {
        if (this.input.textBuffer.length < 2) {
            let orig = this.input.curDate.valueOf();
            let result = this.input.dateParts[this.input.selectedIndex].getDateFromString(this.input.curDate, "ZERO_OUT");
            if (result.valueOf() !== orig) {
                this.input.update(result);
            }
        }
        this.input.textBuffer = this.input.textBuffer.slice(0, this.input.textBuffer.length - 1);
    }
}