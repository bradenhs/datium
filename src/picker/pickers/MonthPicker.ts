/// <reference path="picker.ts" />

class MonthPicker extends Picker implements IPicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
    }
    
    public updateOptions(options:IOptions) {
        
    }
    
    public getHeight() {
        return 150;
    }
    
    public getLevel() {
        return Level.MONTH;
    }
}