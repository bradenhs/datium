class YearPicker implements IPicker {
    constructor(private element:Element) {
        
    }
    
    public updateOptions(options:IOptions) {
        
    }
    
    public getHeight() {
        return 100;
    }
    
    public getLevel() {
        return Level.YEAR;
    }
    
    public destroy(transition:Transition) {
        
    }
    
    public create(transition:Transition) {
        
    }
    
    public needsTransition(date:Date) {
        
    }
    
    public getDate():Date {
        return null;
    }
}