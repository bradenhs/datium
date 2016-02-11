import {dateParts, IDatePart} from 'src/input/DateParts';

class DateStringPartCreator {
    
    public static create(format:string):IDatePart[] {        
        let i = 0;
                
        let inSquareBracket = false;
        let dateStringParts:IDatePart[] = [];
        let plainTextBuffer = '';
        while (i < format.length) {
            
            if (!inSquareBracket && format[i] === '[') {
                inSquareBracket = true;
                i++;
            } else if (inSquareBracket && format[i] === ']') {
                inSquareBracket = false;
                i++
            }
            
            if (inSquareBracket) {
                plainTextBuffer += format[i];
                i++;
                continue;
            }
            
            let foundMatch = false;
            
            for (let j = 0; j < dateParts.length; j++) {
                let datePart = dateParts[j];
                
                if (this.doesMatch(format, i, `{${datePart.formatCode}}`)) {
                    if (plainTextBuffer.length > 0) {
                        var str = plainTextBuffer;
                        dateStringParts.push({
                            str: () => str,
                            selectable: false
                        });
                        plainTextBuffer = '';
                    }
                    dateStringParts.push(datePart);
                    dateStringParts[dateStringParts.length - 1].selectable = false;
                    foundMatch = true;
                    i += datePart.formatCode.length + 2;
                    break;
                } else if (this.doesMatch(format, i, datePart.formatCode)) {
                    if (plainTextBuffer.length > 0) {
                        var str = plainTextBuffer;
                        dateStringParts.push({
                            str: () => str,
                            selectable: false
                        });
                        plainTextBuffer = '';
                    }
                    dateStringParts.push(datePart);
                    foundMatch = true;
                    i += datePart.formatCode.length;
                    break;
                }
            }
            if (!foundMatch) {
                plainTextBuffer += format[i];
                i++;
            }
        }
        if (plainTextBuffer.length > 0) {
            var str = plainTextBuffer;
            dateStringParts.push({
                str: () => str,
                selectable: false
            });
            plainTextBuffer = '';
        }
        
        return dateStringParts;
    }
    
    
    private static doesMatch(str:string, index:number, match:string) {
        return str.slice(index, index + match.length) === match;
    }
}

export const enum KeyCodes {
    RIGHT = 39,
    LEFT = 37,
    TAB = 9,
    UP = 38,
    DOWN = 40,
    V = 86,
    v = 118,
    C = 67,
    c = 99,
    A = 65,
    a = 97,
    HOME = 36,
    END = 35,
    BACKSPACE = 8
}

export default class DatepickerInput {
    
    private selectedIndex:number;
    private curDate:Date;
    private dateStringParts:IDatePart[];
    
    constructor(private element:HTMLInputElement, displayAs:string) {
        this.dateStringParts = DateStringPartCreator.create(displayAs);
        this.bindEvents();
        this.element.setAttribute('spellcheck', 'false');
        this.update(new Date());
    }
    
    private bindEvents():void {
        this.element.addEventListener('focus', () => this.focus());
        this.element.addEventListener('blur', () => this.blur());
        this.element.addEventListener('mousedown', (e) => this.mousedown(e));
        document.addEventListener('mouseup', () => this.mouseup());
        this.element.addEventListener('keydown', (e) => this.keydown(e));
        this.element.addEventListener('dragenter', (e) => e.preventDefault());
        this.element.addEventListener('dragover', (e) => e.preventDefault());
        this.element.addEventListener('drop', (e) => e.preventDefault());
        this.element.addEventListener('cut', (e) => e.preventDefault());
    }
    
    private downSelectionStart:number;
    
    private mouseup():void {
        let selectionEnd = this.element.selectionStart;
        if (selectionEnd === this.downSelectionStart) selectionEnd = this.element.selectionEnd;
        
        this.selectedIndex = this.getNearestSelectableIndex(selectionEnd);
        
        if (this.element.selectionStart !== 0 || this.element.selectionEnd !== this.element.value.length) {
            this.updateSelection();
        }
    }
    
    private keydown(e:KeyboardEvent):void {
        if ((e.keyCode === KeyCodes.HOME || e.keyCode === KeyCodes.END) && e.shiftKey) return;
        if ((e.keyCode === KeyCodes.C || e.keyCode === KeyCodes.c) && e.ctrlKey) return;
        if ((e.keyCode === KeyCodes.A || e.keyCode === KeyCodes.a) && e.ctrlKey) return;
        if ((e.keyCode === KeyCodes.V || e.keyCode === KeyCodes.v) && e.ctrlKey) return;
        if ((e.keyCode === KeyCodes.LEFT || e.keyCode === KeyCodes.RIGHT) && e.shiftKey) return;
        
        if (e.keyCode === KeyCodes.HOME) {
            this.selectedIndex = this.getFirstSelectable();
            this.updateSelection();
            e.preventDefault();    
        } else if (e.keyCode === KeyCodes.END) {
            this.selectedIndex = this.getLastSelectable();
            this.updateSelection()
            e.preventDefault();    
        } else if (e.keyCode === KeyCodes.LEFT) {
            this.selectedIndex = this.getPreviousSelectable();
            this.updateSelection()
            e.preventDefault();
        } else if (e.shiftKey && e.keyCode === KeyCodes.TAB) {
            let previousSelectable = this.getPreviousSelectable();
            if (previousSelectable !== this.selectedIndex) {
                this.selectedIndex = previousSelectable;
                this.updateSelection();
                e.preventDefault();
            }
        } else if (e.keyCode === KeyCodes.RIGHT) {
            this.selectedIndex = this.getNextSelectable();
            this.updateSelection()
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.TAB) {
            let nextSelectable = this.getNextSelectable();
            if (nextSelectable !== this.selectedIndex) {
                this.selectedIndex = nextSelectable;
                this.updateSelection();
                e.preventDefault();
            }
        } else if (e.keyCode === KeyCodes.UP) {
            let newDate = this.dateStringParts[this.selectedIndex].inc(this.curDate);
            this.update(newDate);
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.DOWN) {
            let newDate = this.dateStringParts[this.selectedIndex].dec(this.curDate);
            this.update(newDate);
            e.preventDefault();
        } else {
            e.preventDefault();
        }
    }
    
    private getPreviousSelectable():number {
        let index = this.selectedIndex;
        while (--index >= 0) {
            if (this.dateStringParts[index].selectable) return index;
        }
        return this.selectedIndex;
    }
    
    private getNextSelectable():number {
        let index = this.selectedIndex;
        while (++index < this.dateStringParts.length) {
            if (this.dateStringParts[index].selectable) return index;
        }
        return this.selectedIndex;
    }
    
    private mousedown(e:MouseEvent):void {
        if (e.button === 2) return;
        this.element.setSelectionRange(void 0, void 0);
        setTimeout(() => {
            this.downSelectionStart = this.element.selectionStart;
        });
    }
    
    private getNearestSelectableIndex(caretPosition:number):number {
        let pos = 0;
        let nearestSelectableIndex;
        let nearestSelectableDistance;
        for (let i = 0; i < this.dateStringParts.length; i++) {
            if (this.dateStringParts[i].selectable) {
                let fromLeft = caretPosition - pos;
                let fromRight = caretPosition - (pos + this.dateStringParts[i].toString().length);
                if (fromLeft > 0 && fromRight < 0) return i;
                let dist = Math.min(Math.abs(fromLeft), Math.abs(fromRight));
                if (nearestSelectableIndex == void 0 || dist <= nearestSelectableDistance) {
                    nearestSelectableIndex = i;
                    nearestSelectableDistance = dist;
                }
            }
            pos += this.dateStringParts[i].toString().length;
        }
        return nearestSelectableIndex;
    }
    
    private focus():void {
        /*
        if (this.selectedIndex === void 0) {
            this.selectedIndex = this.getFirstSelectable(); 
        }
        setTimeout(() => {
            this.updateSelection();    
        });
        */
    }
    
    private blur():void {
        this.element.setSelectionRange(void 0, void 0);
    }
    
    private getFirstSelectable():number {
        for (let i = 0; i < this.dateStringParts.length; i++) {
            if (this.dateStringParts[i].selectable) return i;
        }
        return void 0;
    }
    
    private getLastSelectable():number {
        for (let i = this.dateStringParts.length - 1; i >= 0; i--) {
            if (this.dateStringParts[i].selectable) return i;
        }
        return void 0;
    }
    
    public update(date:Date):void {
        this.curDate = new Date(date.valueOf());
        let dateString = '';
        
        for (let i = 0; i < this.dateStringParts.length; i++) {
            dateString += this.dateStringParts[i].str(date);
        }
        
        this.element.value = dateString;
        this.updateSelection();
    }
    
    private updateSelection():void {
        if (this.selectedIndex === void 0 || document.activeElement !== this.element) return;
        let start = 0;
        for (let i = 0; i < this.selectedIndex; i++) {
            start += this.dateStringParts[i].toString().length;
        }
        let end = start + this.dateStringParts[this.selectedIndex].toString().length;
        this.element.setSelectionRange(start, end);
    }
}