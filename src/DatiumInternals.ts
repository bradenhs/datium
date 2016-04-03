const enum Level {
    YEAR, MONTH, DATE, HOUR,
    MINUTE, SECOND, NONE
}

class DatiumInternals {
    private options:IOptions = <any>{};
    
    private input:Input;
    //private pickerManager:PickerManager;
    
    private levels:Level[];
    private date:Date;
    
    constructor(private element:HTMLInputElement, options:IOptions) {
        if (element === void 0) throw 'element is required';
        element.setAttribute('spellcheck', 'false');
        
        this.input = new Input(element);
        //this.pickerManager = new PickerManager(element);
        
        this.updateOptions(options);
        
        listen.goto(element, (e) => this.goto(e.date, e.level, e.update));
        listen.zoomOut(element, (e) => this.zoomOut(e.date, e.currentLevel, e.update));
        listen.zoomIn(element, (e) => this.zoomIn(e.date, e.currentLevel, e.update));
        
        this.goto(this.options['defaultDate'], Level.NONE, true);
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
        if (newLevel === void 0) newLevel = currentLevel;
        trigger.goto(this.element, {
           date: date,
           level: newLevel,
           update: update 
        });
    }
    
    public goto(date:Date, level:Level, update:boolean = true) {
        if (date !== void 0) {
            if (date.valueOf() < this.options.minDate.valueOf()) {
                date = new Date(this.options.minDate.valueOf());
            }
            
            if (date.valueOf() > this.options.maxDate.valueOf()) {
                date = new Date(this.options.maxDate.valueOf());
            }
        }
        
        if (date === void 0 && update === false) {
            this.date = new Date();
            level = this.input.getLevels().slice().sort()[0];
        } else {
            this.date = date;
        }
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
        
        /*
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
        */
    }
}