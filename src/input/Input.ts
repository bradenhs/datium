class Input {
    private options: IOptions;
    private selectedDatePart: IDatePart;
    private textBuffer: string = "";
    public dateParts: IDatePart[];
    public format: RegExp;
    private date:Date;
    private level:Level;
    
    constructor(public element: HTMLInputElement) {
        new KeyboardEventHandler(this);
        new MouseEventHandler(this);
        new PasteEventHander(this);
        
        listen.viewchanged(element, (e) => this.viewchanged(e.date, e.level, e.update));
        listen.blur(element, () => {
            this.textBuffer = '';
            this.blurDatePart(this.selectedDatePart);
        });
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
    
    public updateDateFromBuffer() {
        if (this.selectedDatePart.setValueFromPartial(this.textBuffer)) {
            let newDate = this.selectedDatePart.getValue();
            if (this.textBuffer.length >= this.selectedDatePart.getMaxBuffer()) {
                this.textBuffer = '';
                this.selectedDatePart.setDefined(true);
                let lastDatePart = this.selectedDatePart;
                this.selectedDatePart = this.getNextSelectableDatePart();
                this.blurDatePart(lastDatePart);
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
            let lastSelected = this.selectedDatePart;
            this.selectedDatePart = datePart;
            this.blurDatePart(lastSelected);
        }
    }
    
    public blurDatePart(blurredDatePart:IDatePart) {
        if (blurredDatePart === void 0) return;
        
        let date = blurredDatePart.getValue();
        let level = blurredDatePart.getLevel();
        
        if (level === Level.YEAR) {
            if (this.options.isYearValid(date)) return;
        } else if (level === Level.MONTH) {
            if (this.options.isMonthValid(date)) return;
        } else if (level === Level.DATE) {
            if (this.options.isDateValid(date)) return;
        } else if (level === Level.HOUR) {
            if (this.options.isHourValid(date)) return;
        } else if (level === Level.MINUTE) {
            if (this.options.isMinuteValid(date)) return;
        } else if (level === Level.SECOND) {
            if (this.options.isSecondValid(date)) return;
        }
        
        this.dateParts.forEach((datePart) => {
            if (datePart.getLevel() === level) {
                datePart.setDefined(false);
            }
        });
    }
    
    public getSelectedDatePart() {
        return this.selectedDatePart;
    }
    
    public updateOptions(options:IOptions) {
        this.options = options;
        
        this.dateParts = Parser.parse(options);
        this.selectedDatePart = void 0;
        
        let format:string = '^';
        this.dateParts.forEach((datePart) => {
            format += `(${datePart.getRegEx().source.slice(1,-1)})`;
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
        this.level = level;
        this.dateParts.forEach((datePart) => {
            if (update) datePart.setValue(this.date);
            if (update && level === datePart.getLevel() && this.textBuffer.length > 0) {
                datePart.setDefined(true);
            }
            if (datePart.isSelectable() &&
                datePart.getLevel() === level &&
                this.getSelectedDatePart() !== void 0 &&
                level !== this.getSelectedDatePart().getLevel()) {
                this.setSelectedDatePart(datePart);
            }
        });
        this.updateView();
    }
    
    public triggerViewChange() {
        trigger.viewchanged(this.element, {
            date: this.getSelectedDatePart().getValue(),
            level: this.getSelectedDatePart().getLevel(),
            update: false
        });        
    }
    
}