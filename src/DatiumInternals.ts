class DatiumInternals {
    private options:IOptions;
    
    private input:Input = new Input();
    
    constructor(options:IOptions) {
        this.update(options);
    }
    
    public update = (options:IOptions) => {
        this.options = OptionSanitizer.sanitize(options);
        
        this.input.update(this.options);
        
    }
}