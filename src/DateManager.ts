enum Level {
    YEAR, MONTH, DATE, HOUR, MINUTE, SECOND, NONE
}


class DateManager {
    private options:IOptions;
    
    public update(options:IOptions) {
        this.options = options;
    }
    
    public goTo(date:Date, level:Level) {
        
    }
    
    public getDefaultDate() {
        return new Date();
    }
}