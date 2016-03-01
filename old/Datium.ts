/// <reference path="FormatBlocks.ts" />
/// <reference path="DatePart.ts" />
/// <reference path="DisplayParser.ts" />
/// <reference path="MouseEvents.ts" />

(<any>window)["Datium"] = class Datium {
    constructor(opts:IOptions) {
        new DatepickerInput(opts['element'], opts['displayAs']);
        
    }
}

const enum KeyCodes {
    RIGHT = 39, LEFT = 37, TAB = 9, UP = 38,
    DOWN = 40, V = 86, C = 67, A = 65, HOME = 36,
    END = 35, BACKSPACE = 8
}

class DatepickerInput {
    
    public selectedIndex:number;
    public curDate:Date;
    public dateParts:DatePart[];
    public dateStringRegExp:RegExp;
    public pasting:boolean = false;
    public textBuffer:string = "";
    
    constructor(public element:HTMLInputElement, private displayAs:string, private minDate?:Date, private maxDate?:Date) {
        this.dateParts = DisplayParser.parse(displayAs);
        this.dateStringRegExp = this.concatRegExp(this.dateParts);
        
        new PasteEvents(this);
        new KeyboardEvents(this);
        new MouseEvents(this);
        
        element.setAttribute("spellcheck", "false");
        this.update(new Date());
    }
    
    private concatRegExp = (dateParts:DatePart[]):RegExp => {
        let regExp = "";
        dateParts.forEach((datePart) => {
           regExp += datePart.getRegExpString();
        });
        return new RegExp(`^${regExp}$`, "i");        
    }
    
    public getPreviousSelectable = ():number => {
        let index = this.selectedIndex;
        while (--index >= 0) {
            if (this.dateParts[index].isSelectable()) return index;
        }
        return this.selectedIndex;
    }

    public getNextSelectable = ():number => {
        let index = this.selectedIndex;
        while (++index < this.dateParts.length) {
            if (this.dateParts[index].isSelectable()) return index;
        }
        return this.selectedIndex;
    }


    public getNearestSelectableIndex = (caretPosition:number):number => {
        let pos = 0;
        let nearestSelectableIndex:number;
        let nearestSelectableDistance:number;
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

    public getFirstSelectable = ():number => {
        for (let i = 0; i < this.dateParts.length; i++) {
            if (this.dateParts[i].isSelectable()) return i;
        }
        return void 0;
    }

    public getLastSelectable = ():number => {
        for (let i = this.dateParts.length - 1; i >= 0; i--) {
            if (this.dateParts[i].isSelectable()) return i;
        }
        return void 0;
    }


    private lastSelectedIndex:number;

    /**
     * @param {Date=} date (optional).
     */
    public update = (date?:Date):void => {
        if (date === void 0) date = this.curDate;
        if (this.minDate !== void 0 && date.valueOf() < this.minDate.valueOf()) date = new Date(this.minDate.valueOf());
        if (this.maxDate !== void 0 && date.valueOf() < this.maxDate.valueOf()) date = new Date(this.maxDate.valueOf());
        if (this.selectedIndex !== this.lastSelectedIndex) {
            this.textBuffer = "";
        }
        this.lastSelectedIndex = this.selectedIndex;

        this.curDate = new Date(date.valueOf());
        let dateString = "";

        this.dateParts.forEach((datePart) => {
            dateString += datePart.setValue(date).toString();
        });

        this.element.value = dateString;
        
        // Update selection
        if (this.selectedIndex === void 0 || document.activeElement !== this.element) return;
        let start = 0;
        for (let i = 0; i < this.selectedIndex; i++) {
            start += this.dateParts[i].toString().length;
        }
        let end = start + this.dateParts[this.selectedIndex].toString().length;
        this.element.setSelectionRange(start, end);
    }
}