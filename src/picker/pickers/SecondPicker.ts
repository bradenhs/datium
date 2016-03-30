/// <reference path="TimePicker.ts" />

class SecondPicker extends TimePicker implements ITimePicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
    }
    
    public updateOptions(options:IOptions) {
        
    }
    
    public getHeight() {
        return 180;
    }
    
    public getLevel() {
        return Level.SECOND;
    }
}