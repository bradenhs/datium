class Level {
    static YEAR = 0;
    static MONTH = 1;
    static DATE = 2;
    static HOUR = 3;
    static MINUTE = 4;
    static SECOND = 5;
    static NONE = 6;
}

class DatiumInternals {
    private options:IOptions = <any>{};
    
    private input:Input;
    private picker:Picker;
    
    
    constructor(private element:HTMLInputElement, options:IOptions) {
        if (element === void 0) throw 'element is required';
        element.setAttribute('spellcheck', 'false');
        
        this.input = new Input(element);
        this.picker = new Picker(element);
        
        this.updateOptions(options);        
        
        listen.goto(element, (e) => this.goto(e.date, e.level));
        
        this.goto(this.options['defaultDate'], Level.NONE);
    }
    
    public goto(date:Date, level:Level) {
        if (date === void 0) date = new Date();
        
        if (this.options.minDate !== void 0 && date.valueOf() < this.options.minDate.valueOf()) {
            date = new Date(this.options.minDate.valueOf());
        }
        
        if (this.options.maxDate !== void 0 && date.valueOf() > this.options.maxDate.valueOf()) {
            date = new Date(this.options.maxDate.valueOf());
        }
        
        trigger.viewchanged(this.element, {
            date: date,
            level: level
        });
    }
    
    public updateOptions(newOptions:IOptions = <any>{}) {
        this.options = OptionSanitizer.sanitize(newOptions, this.options);        
        this.input.updateOptions(this.options);
        this.picker.updateOptions(this.options);
    }
}