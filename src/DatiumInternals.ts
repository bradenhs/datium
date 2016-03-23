const enum Level {
    YEAR, MONTH, DATE, HOUR,
    MINUTE, SECOND, NONE
}

class DatiumInternals {
    private options:IOptions = <any>{};
    
    private input:Input;
    private pickerManager:PickerManager;
    
    constructor(private element:HTMLInputElement, options:IOptions) {
        if (element === void 0) throw 'element is required';
        element.setAttribute('spellcheck', 'false');
        
        this.input = new Input(element);
        this.pickerManager = new PickerManager(element);
        
        this.updateOptions(options);
        
        listen.goto(element, (e) => this.goto(e.date, e.level, e.update));
        
        this.goto(this.options['defaultDate'], Level.NONE, true);
    }
    
    public goto(date:Date, level:Level, update:boolean = true) {
        if (this.pickerManager.dragging) return;
        if (date === void 0) date = new Date();
        
        if (this.options.minDate !== void 0 && date.valueOf() < this.options.minDate.valueOf()) {
            date = new Date(this.options.minDate.valueOf());
        }
        
        if (this.options.maxDate !== void 0 && date.valueOf() > this.options.maxDate.valueOf()) {
            date = new Date(this.options.maxDate.valueOf());
        }
        
        trigger.viewchanged(this.element, {
            date: date,
            level: level,
            update: update
        });
    }
    
    public updateOptions(newOptions:IOptions = <any>{}) {
        this.options = OptionSanitizer.sanitize(newOptions, this.options);        
        this.input.updateOptions(this.options);
        this.pickerManager.updateOptions(this.options, this.input.getLevels());
    }
}