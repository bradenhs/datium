class Input {
    private options:IOptions;
    private dateParts:IDatePart[];
    
    constructor() {
    }
    
    public update(options:IOptions) {
        this.options = options;
        
        this.dateParts = Parser.parse(options.displayAs);
        
        let dateString = '';
        console.log(options.displayAs);
        this.dateParts.forEach((datePart) => {
            dateString += datePart.toString();
        });
        console.log(dateString);
    }
}