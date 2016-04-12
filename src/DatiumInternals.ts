const enum Level {
    YEAR, MONTH, DATE, HOUR,
    MINUTE, SECOND, NONE
}

class DatiumInternals {
    private options:IOptions = <any>{};
    
    private input:Input;
    private pickerManager:PickerManager;
    
    private levels:Level[];
    private date:Date;
    
    constructor(private element:HTMLInputElement, options:IOptions) {
        if (element === void 0) throw 'element is required';
        element.setAttribute('spellcheck', 'false');
        element.setAttribute('readonly', 'readonly');
        
        this.input = new Input(element);
        this.pickerManager = new PickerManager(element);
        
        this.updateOptions(options);
        
        listen.goto(element, (e) => this.goto(e.date, e.level, e.update));
        listen.zoomOut(element, (e) => this.zoomOut(e.date, e.currentLevel, e.update));
        listen.zoomIn(element, (e) => this.zoomIn(e.date, e.currentLevel, e.update));
        
        listen.down(document, (e) => {
            let matches = document.documentElement.matches || document.documentElement.msMatchesSelector;
            var target = e.srcElement || <Element>e.target;
            if (element !== document.activeElement) return;
            while(target !== null) {
                if (target === element || target === this.pickerManager.container) {
                    return;
                }
                target = target.parentElement;
            }
            element.blur();
        });
    }
    
    public first:boolean = true;
    
    public init() {
        let initialDate = this.options.initialDate;
        
        if (initialDate === void 0) {
            initialDate = new Date();
            if (initialDate.valueOf() < this.options.minDate.valueOf()) {
                initialDate = new Date(this.options.minDate.valueOf());
            }
            if (initialDate.valueOf() > this.options.maxDate.valueOf()) {
                initialDate = new Date(this.options.maxDate.valueOf());
            }
        } else {
            this.input.dateParts.forEach((datePart) => {
                datePart.setDefined(true);
            });
        }
        
        this.goto(initialDate, Level.NONE, true);
    }
    public setDate(date:Date|string) {
        if (typeof date === 'string') {
            this.input.setDateFromString(date);
        } else {
            trigger.goto(this.element, {
                date: date,
                level: this.input.getSelectedDatePart() === void 0 ? Level.NONE : this.input.getSelectedDatePart().getLevel()
            });
        }
    }
    
    public setDefined() {
        this.input.dateParts.forEach((datePart) => {
            datePart.setDefined(true);
        });
        trigger.goto(this.element, {
            date: this.input.getDate(),
            level: this.input.getSelectedDatePart() === void 0 ? Level.NONE : this.input.getSelectedDatePart().getLevel()
        });
    }
    
    public zoomOut(date:Date, currentLevel:Level, update:boolean = true) {
        let newLevel:Level = this.levels[this.levels.indexOf(currentLevel) - 1]; 
        if (newLevel === void 0) return;
        trigger.goto(this.element, {
           date: date,
           level: newLevel,
           update: update 
        });
    }
    
    public zoomIn(date:Date, currentLevel:Level, update:boolean = true) {
        let newLevel:Level = this.levels[this.levels.indexOf(currentLevel) + 1];
        
        if (newLevel === void 0) {
            newLevel = Level.NONE;
            this.pickerManager.closePicker();
        }
        
        this.input.dateParts.forEach((datePart) => {
            if (datePart.getLevel() <= currentLevel) {
                datePart.setDefined(true);
                trigger.updateDefinedState(this.element, {
                    defined: true,
                    level: datePart.getLevel()
                });
            } 
        });
        
        trigger.goto(this.element, {
           date: date,
           level: newLevel,
           update: update 
        });
    }
    
    public toString() {
        return this.input.toString();
    }
    
    public isValid() {
        return this.input.isValid();
    }
    
    public getDate() {
        return this.input.getDate();
    }
    
    public goto(date:Date, level:Level, update:boolean = true) {
        this.date = date;
        trigger.viewchanged(this.element, {
            date: this.date,
            level: level,
            update: update
        });
    }
    
    public updateOptions(newOptions:IOptions = <any>{}) {
        this.options = OptionSanitizer.sanitize(newOptions, this.options);
             
        this.input.updateOptions(this.options);
        
        this.levels = this.input.getLevels().slice();
        this.levels.sort();
        
        if (this.pickerManager.currentPicker !== void 0) {
            let curLevel = this.pickerManager.currentPicker.getLevel();
            
            if (this.levels.indexOf(curLevel) == -1) {
                trigger.goto(this.element, {
                    date: this.date,
                    level: this.levels[0]
                })
            }
        }
        
        this.pickerManager.updateOptions(this.options);
        
        if (this.first) {
            this.first = false;
            this.init();
        }
    }
}