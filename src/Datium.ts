/// <reference path="OptionSanitizer.ts" />
/// <reference path="FormatBlocks.ts" />
/// <reference path="DatePart.ts" />
/// <reference path="DisplayParser.ts" />

(<any>window)['Datium'] = (function() {
    let options:IOptions;
    
    return class {
        constructor(opts:IOptions) {
            this.updateOptions(opts);
        }
        
        updateOptions(opts:IOptions):void {
            options = OptionSanitizer.sanitize(opts);
        }
    }
})();

export const enum KeyCodes {
    RIGHT = 39, LEFT = 37, TAB = 9, UP = 38,
    DOWN = 40, V = 86, C = 67, A = 65, HOME = 36,
    END = 35, BACKSPACE = 8
}

class Selection {
    constructor(public start:number, public end:number) {}
}

export default class DatepickerInput {

    private selectedIndex:number;
    private curDate:Date;
    private dateParts:DatePart[];
    private dateStringRegExp:RegExp;

    constructor(private element:HTMLInputElement, displayAs:string, private minDate?:Date, private maxDate?:Date) {
        this.dateParts = DisplayParser.parse(displayAs);
        this.dateStringRegExp = this.concatRegExp(this.dateParts);
        this.bindEvents();
        this.element.setAttribute('spellcheck', 'false');
        this.update(new Date());
    }

    private concatRegExp(dateParts:DatePart[]):RegExp {
        let regExp = '';
        dateParts.forEach((datePart) => {
           regExp += datePart.getRegExpString();
        });
        return new RegExp(`^${regExp}$`, 'i');
    }

    private bindEvents():void {
        this.element.addEventListener('focus', () => this.focus());

        this.element.addEventListener('keydown', (e) => this.keydown(e));
        this.element.addEventListener('paste', () => this.paste());

        document.addEventListener('keydown', (e:KeyboardEvent) => {
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
        
        // Prevent Default
        this.element.addEventListener('dragenter', (e) => e.preventDefault());
        this.element.addEventListener('dragover', (e) => e.preventDefault());
        this.element.addEventListener('drop', (e) => e.preventDefault());
        this.element.addEventListener('cut', (e) => e.preventDefault());

        let caretStart:number;
        let down = false;
        
        let mousedown = () => {
            clearInterval(interval);
            down = true;
            this.element.setSelectionRange(void 0, void 0);
            setTimeout(() => {
                caretStart = this.element.selectionStart;
            });
        };
        
        let mouseup = () => {
            if (!down) return;
            down = false;
            let pos = this.element.selectionStart === caretStart ? this.element.selectionEnd : this.element.selectionStart;
            this.selectedIndex = this.getNearestSelectableIndex(pos);
            if (this.element.selectionStart > 0 || this.element.selectionEnd < this.element.value.length) {
                this.update();
            }
        };
        
        let touchstart = () => {
            this.element.removeEventListener('mousedown', mousedown);
            document.removeEventListener('mouseup', mouseup);
            document.removeEventListener('touchstart', touchstart);
        }
        
        this.element.addEventListener('mousedown', mousedown);
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('touchstart', touchstart);

        let lastStart:number;
        let lastEnd:number;
        let interval = setInterval(() => {
            if (!this.pasting &&
                (this.element.selectionStart !== 0 ||
                 this.element.selectionEnd !== this.element.value.length) &&
                (this.element.selectionStart !== lastStart ||
                 this.element.selectionEnd !== lastEnd)) {
                this.selectedIndex = this.getNearestSelectableIndex(this.element.selectionStart + (this.element.selectionEnd - this.element.selectionStart) / 2);
                this.update()
            }
            lastStart = this.element.selectionStart;
            lastEnd = this.element.selectionEnd;
        });
    }
    
    private shiftTabDown = false;
    private tabDown = false;
    private pasting:boolean = false;
    
    private paste():void {
        this.pasting = true;
        let originalValue = this.element.value;
        setTimeout(() => {
            if (!this.dateStringRegExp.test(this.element.value)) {
                this.element.value = originalValue;
                this.pasting = false;
                return;
            }
            let newDate = new Date(this.curDate.valueOf());
            let strPrefix = '';
            this.dateParts.forEach((datePart) => {
                let val = this.element.value.replace(strPrefix, '').match(datePart.getRegExpString())[0];
                strPrefix += val;
                if (!datePart.isSelectable()) return;
                newDate = datePart.getDateFromString(newDate, val);
            });
            this.update(newDate);
            this.pasting = false;
        });
    }

    private textBuffer:string = '';

    private keydown(e:KeyboardEvent):void {
        if ((e.keyCode === KeyCodes.HOME || e.keyCode === KeyCodes.END) && e.shiftKey) return;
        if (e.keyCode === KeyCodes.C && e.ctrlKey) return;
        if (e.keyCode === KeyCodes.A && e.ctrlKey) return;
        if (e.keyCode === KeyCodes.V && e.ctrlKey) return;
        if ((e.keyCode === KeyCodes.LEFT || e.keyCode === KeyCodes.RIGHT) && e.shiftKey) return;

        if (e.keyCode === KeyCodes.HOME) {
            this.selectedIndex = this.getFirstSelectable();
            this.update();
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.END) {
            this.selectedIndex = this.getLastSelectable();
            this.update();
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.LEFT) {
            this.selectedIndex = this.getPreviousSelectable();
            this.update();
            e.preventDefault();
        } else if (e.shiftKey && e.keyCode === KeyCodes.TAB) {
            let previousSelectable = this.getPreviousSelectable();
            if (previousSelectable !== this.selectedIndex) {
                this.selectedIndex = previousSelectable;
                this.update();
                e.preventDefault();
            }
        } else if (e.keyCode === KeyCodes.RIGHT) {
            this.selectedIndex = this.getNextSelectable();
            this.update();
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.TAB) {
            let nextSelectable = this.getNextSelectable();
            if (nextSelectable !== this.selectedIndex) {
                this.selectedIndex = nextSelectable;
                this.update();
                e.preventDefault();
            }
        } else if (e.keyCode === KeyCodes.UP) {
            let newDate = this.dateParts[this.selectedIndex].increment(this.curDate);
            this.update(newDate);
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.DOWN) {
            let newDate = this.dateParts[this.selectedIndex].decrement(this.curDate);
            this.update(newDate);
            e.preventDefault();
        } else {
            e.preventDefault();
        }

        let keyPressed = <any>this.keyMap[e.keyCode];

        if (e.keyCode === KeyCodes.BACKSPACE) {
            this.backspace();
        } else if (keyPressed !== void 0) {
            this.textBuffer += keyPressed;
        } else if (!e.shiftKey) {
            this.textBuffer = '';
        }

        if (this.textBuffer.length > 0) {
            let orig = this.curDate.valueOf();
            let result = this.dateParts[this.selectedIndex].getDateFromString(this.curDate, this.textBuffer);
            if (result !== void 0 && this.dateParts[this.selectedIndex].getMaxBufferSize(result) !== void 0 && this.textBuffer.length >= this.dateParts[this.selectedIndex].getMaxBufferSize(result)) {
                this.selectedIndex = this.getNextSelectable();
            }
            if (result === void 0) {
                this.textBuffer = this.textBuffer.slice(0, this.textBuffer.length - 1);
            } else {
                this.update(result);
            }
        }
    }

    private backspace():void {
        if (this.textBuffer.length < 2) {
            let orig = this.curDate.valueOf();
            let result = this.dateParts[this.selectedIndex].getDateFromString(this.curDate, 'ZERO_OUT');
            if (result.valueOf() !== orig) {
                this.update(result);
            }
        }
        this.textBuffer = this.textBuffer.slice(0, this.textBuffer.length - 1);
    }

    private keyMap:{} = <[key:string]>{
        '48': '0', '96': '0', '49': '1', '97': '1',
        '50': '2', '98': '2', '51': '3', '99': '3',
        '52': '4', '100': '4', '53': '5', '101': '5',
        '54': '6', '102': '6', '55': '7', '103': '7',
        '56': '8', '104': '8', '57': '9', '105': '9',
        '65': 'a', '66': 'b', '67': 'c', '68': 'd',
        '69': 'e', '70': 'f', '71': 'g', '72': 'h',
        '73': 'i', '74': 'j', '75': 'k', '76': 'l',
        '77': 'm', '78': 'n', '79': 'o', '80': 'p',
        '81': 'q', '82': 'r', '83': 's', '84': 't',
        '85': 'u', '86': 'v', '87': 'w', '88': 'x',
        '89': 'y', '90': 'z'
    }

    private getPreviousSelectable():number {
        let index = this.selectedIndex;
        while (--index >= 0) {
            if (this.dateParts[index].isSelectable()) return index;
        }
        return this.selectedIndex;
    }

    private getNextSelectable():number {
        let index = this.selectedIndex;
        while (++index < this.dateParts.length) {
            if (this.dateParts[index].isSelectable()) return index;
        }
        return this.selectedIndex;
    }

    private selecting:boolean = false;

    private getNearestSelectableIndex(caretPosition:number):number {
        let pos = 0;
        let nearestSelectableIndex;
        let nearestSelectableDistance;
        for (let i = 0; i < this.dateParts.length; i++) {
            if (this.dateParts[i].isSelectable()) {
                let fromLeft = caretPosition - pos;
                let fromRight = caretPosition - (pos + this.dateParts[i].toString().length);
                if (fromLeft > 0 && fromRight < 0) return i;
                let dist = Math.min(Math.abs(fromLeft), Math.abs(fromRight));
                if (nearestSelectableIndex == void 0 || dist <= nearestSelectableDistance) {
                    nearestSelectableIndex = i;
                    nearestSelectableDistance = dist;
                }
            }
            pos += this.dateParts[i].toString().length;
        }
        return nearestSelectableIndex;
    }

    private focus():void {
        if (this.tabDown) {
            this.selectedIndex = this.getFirstSelectable();
            setTimeout(() => {
               this.update();
            });
        } else if (this.shiftTabDown) {
            this.selectedIndex = this.getLastSelectable();
            setTimeout(() => {
               this.update();
            });
        }
    }

    private getFirstSelectable():number {
        for (let i = 0; i < this.dateParts.length; i++) {
            if (this.dateParts[i].isSelectable()) return i;
        }
        return void 0;
    }

    private getLastSelectable():number {
        for (let i = this.dateParts.length - 1; i >= 0; i--) {
            if (this.dateParts[i].isSelectable()) return i;
        }
        return void 0;
    }


    private lastSelectedIndex:number;

    public update(date?:Date):void {
        if (date === void 0) date = this.curDate;
        if (this.minDate !== void 0 && date.valueOf() < this.minDate.valueOf()) date = new Date(this.minDate.valueOf());
        if (this.maxDate !== void 0 && date.valueOf() < this.maxDate.valueOf()) date = new Date(this.maxDate.valueOf());
        if (this.selectedIndex !== this.lastSelectedIndex) {
            this.textBuffer = '';
        }
        this.lastSelectedIndex = this.selectedIndex;

        this.curDate = new Date(date.valueOf());
        let dateString = '';

        this.dateParts.forEach((datePart) => {
            dateString += datePart.setValue(date).toString();
        });

        this.element.value = dateString;
        this.updateSelection();
    }

    private updateSelection():void {
        if (this.selectedIndex === void 0 || document.activeElement !== this.element) return;
        let start = 0;
        for (let i = 0; i < this.selectedIndex; i++) {
            start += this.dateParts[i].toString().length;
        }
        let end = start + this.dateParts[this.selectedIndex].toString().length;
        this.element.setSelectionRange(start, end);
    }
}