class DatiumInternals {
    private options:IOptions = {};
    
    private input:Input;
    private dateManager:DateManager;
    
    constructor(private element:HTMLInputElement, options:IOptions) {
        if (element === void 0) throw 'element is required';
        
        this.dateManager = new DateManager();
        
        this.input = new Input(element, this.dateManager);
        
        this.update(options);
    }
    
    public update(newOptions:IOptions = {}) {
        this.options = OptionSanitizer.sanitize(newOptions, this.options);        
        this.input.update(this.options);
        this.dateManager.update(this.options);
    }
}