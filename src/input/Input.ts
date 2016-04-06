class Input {
    private options: IOptions;
    private selectedDatePart: IDatePart;
    private textBuffer: string = "";
    public dateParts: IDatePart[];
    public format: RegExp;
    private date:Date;
    private level:Level;
    private hasBlurred:boolean = false;
    
    constructor(public element: HTMLInputElement) {
        new KeyboardEventHandler(this);
        new MouseEventHandler(this);
        new PasteEventHander(this);
        
        listen.viewchanged(element, (e) => this.viewchanged(e.date, e.level, e.update));
        listen.blur(element, () => {
            this.textBuffer = '';
            this.hasBlurred = true;
            this.manageValidClass();
        });
    }
    
    public setDateFromString(str:string, start:number = 0, end:number = Number.MAX_VALUE):boolean {
        if (!this.format.test(str)) {
            return false;
        }
        
        let newDate = new Date(this.date.valueOf());
        
        let strPrefix = '';
        let levelsUpdated:Level[] = [];
        
        for (let i = 0; i < this.dateParts.length; i++) {
            let datePart = this.dateParts[i];
            
            let regExp = new RegExp(datePart.getRegEx().source.slice(1, -1), 'i');
            
            let match = str.replace(strPrefix, '').match(regExp);
            if (match === null) {
                datePart.setDefined(false);
                strPrefix += datePart.toString();
                continue;
            }
            
            if (levelsUpdated.indexOf(datePart.getLevel()) !== -1) {
                strPrefix += datePart.toString();
                continue;
            }
                        
            let val = match[0];
            strPrefix += val;
            if (strPrefix.length >= start && strPrefix.length - val.length <= end) {
                
                levelsUpdated.push(datePart.getLevel());
                
                if (!datePart.isSelectable()) continue;
                datePart.setDefined(true);
                
                datePart.setValue(newDate);
                if (datePart.setValue(val)) {
                    newDate = datePart.getValue();
                } else {
                    return false;
                }
                
            }
        }
        
        let level:Level = this.selectedDatePart === void 0 ? this.getFirstSelectableDatePart().getLevel() : this.selectedDatePart.getLevel(); 
        
        trigger.goto(this.element, {
            date: newDate,
            level: level
        });
        
        return true;
    }
    
    public getLevels():Level[] {
        let levels:Level[] = [];
        this.dateParts.forEach((datePart) => {
            if (levels.indexOf(datePart.getLevel()) === -1 && datePart.isSelectable()) {
                levels.push(datePart.getLevel());
            }
        });
        return levels;
    }
    
    public getTextBuffer() {
        return this.textBuffer;
    }
    
    public setTextBuffer(newBuffer:string) {
        this.textBuffer = newBuffer;
        
        if (this.textBuffer.length > 0) {
            this.updateDateFromBuffer();
        }
    }
    
    public isValid() {
        if (this.date.valueOf() < this.options.minDate.valueOf() ||
            this.date.valueOf() > this.options.maxDate.valueOf()) {
            return false;
        }
        return this.dateParts.every((datePart) => {
            return !datePart.isSelectable() ||
                   (datePart.isDefined() &&
                   datePart.isValid());
        });
    }
    
    public getDate() {
        if (this.date === void 0 ||
            !this.isValid()) return void 0;
        return this.date;
    }
    
    public setDefined(datePart:IDatePart, defined:boolean) {
        datePart.setDefined(defined);
        trigger.updateDefinedState(this.element, {
            defined: defined,
            level: datePart.getLevel()
        });
    }
    
    public updateDateFromBuffer() {
        if (this.selectedDatePart.setValueFromPartial(this.textBuffer)) {
            let newDate = this.selectedDatePart.getValue();
            if (this.textBuffer.length >= this.selectedDatePart.getMaxBuffer()) {
                this.textBuffer = '';
                this.setDefined(this.selectedDatePart, true);
                if (this.selectedDatePart.isValid()) {
                    let lastSelected = this.selectedDatePart;
                    this.selectedDatePart = this.getNextSelectableDatePart();
                }
            }
            trigger.goto(this.element, {
                date: newDate,
                level: this.selectedDatePart.getLevel()
            });
        } else {
            this.textBuffer = this.textBuffer.slice(0, -1);
        }
    }
    
    public getFirstSelectableDatePart() {
        for (let i = 0; i < this.dateParts.length; i++) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return void 0;
    }

    public getLastSelectableDatePart() {
        for (let i = this.dateParts.length - 1; i >= 0; i--) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return void 0;
    }
    
    public getNextSelectableDatePart() {
        let i = this.dateParts.indexOf(this.selectedDatePart);
        while (++i < this.dateParts.length) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return this.selectedDatePart;
    }
    
    public getPreviousSelectableDatePart() {
        let i = this.dateParts.indexOf(this.selectedDatePart);
        while (--i >= 0) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return this.selectedDatePart;
    }
    
    public getNearestSelectableDatePart(caretPosition: number) {
        let distance:number = Number.MAX_VALUE;
        let nearestDatePart:IDatePart;
        let start = 0;
        
        for (let i = 0; i < this.dateParts.length; i++) {
            let datePart = this.dateParts[i];
            
            if (datePart.isSelectable()) {
                let fromLeft = caretPosition - start;
                let fromRight = caretPosition - (start + datePart.toString().length);
                
                if (fromLeft > 0 && fromRight < 0) return datePart;
                
                let d = Math.min(Math.abs(fromLeft), Math.abs(fromRight));
                if (d <= distance) {
                    nearestDatePart = datePart;
                    distance = d;
                }
            }
            
            start += datePart.toString().length;
        }
        
        return nearestDatePart;        
    }
    
    public setSelectedDatePart(datePart:IDatePart) {
        if (this.selectedDatePart !== datePart) {
            this.textBuffer = '';
            this.selectedDatePart = datePart;
        }
    }
    
    public getSelectedDatePart() {
        return this.selectedDatePart;
    }
    
    public updateOptions(options:IOptions) {
        this.options = options;
        
        let definedLevels:Level[] = [];
        if (this.dateParts !== void 0) {
            this.dateParts.forEach((datePart) => {
                if (datePart.isDefined() &&
                    definedLevels.indexOf(datePart.getLevel()) === -1) {
                    definedLevels.push(datePart.getLevel());
                }
            })
        }
        
        this.dateParts = Parser.parse(options);
        this.selectedDatePart = void 0;
        
        let format:string = '^';
        this.dateParts.forEach((datePart) => {
            format += `((${datePart.getRegEx().source.slice(1,-1)})|(${new RegExp(datePart.toString()).source}))`;
            if (definedLevels.indexOf(datePart.getLevel()) !== -1) {
                datePart.setDefined(true);
            }
        });
        this.format = new RegExp(format+'$', 'i');
        
        this.viewchanged(this.date, this.level, true);
    }
    
    public updateView() {
        let dateString = '';
        let currentLevel:Level = this.selectedDatePart !== void 0 ? this.selectedDatePart.getLevel() : Level.NONE;
        this.dateParts.forEach((datePart) => {
            dateString += datePart.toString(); 
        });
        this.element.value = dateString;
        
        if (this.selectedDatePart === void 0) return;
        
        let start = 0;
        
        let i = 0;
        while (this.dateParts[i] !== this.selectedDatePart) {
            let datePart = this.dateParts[i++];
            start += datePart.toString().length;
        }
        
        let end = start + this.selectedDatePart.toString().length;
        
        this.element.setSelectionRange(start, end);
    }
    
    public viewchanged(date:Date, level:Level, update?:boolean) {
        this.date = date;
        this.element.dispatchEvent(new Event('input'));
        this.level = level;
        this.dateParts.forEach((datePart) => {
            if (update) datePart.setValue(this.date);
            if (update && level === datePart.getLevel() && this.textBuffer.length > 0) {
                this.setDefined(datePart, true);
            }
            if (datePart.isSelectable() &&
                datePart.getLevel() === level &&
                this.getSelectedDatePart() !== void 0 &&
                level !== this.getSelectedDatePart().getLevel()) {
                this.setSelectedDatePart(datePart);
            }
        });
        this.manageValidClass();
        this.updateView();
    }
    
    public manageValidClass() {
        if (this.date !== void 0 && this.options.invalidClass !== null && this.hasBlurred) {
            if (this.isValid()) {
                this.element.classList.remove(this.options.invalidClass);
            } else {
                this.element.classList.add(this.options.invalidClass);
            }
        }
    }
    
    public triggerViewChange() {
        trigger.viewchanged(this.element, {
            date: this.getSelectedDatePart().getValue(),
            level: this.getSelectedDatePart().getLevel(),
            update: false
        });        
    }
    
}