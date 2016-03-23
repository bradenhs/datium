/// <reference path="picker.ts" />

class MinutePicker extends Picker implements IPicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
    }
    
    public updateOptions(options:IOptions) {
        
    }
    
    public getHeight() {
        return 230;
    }
    
    public getLevel() {
        return Level.MINUTE;
    }
}