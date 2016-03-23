/// <reference path="picker.ts" />

class HourPicker extends Picker implements IPicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
    }
    
    public updateOptions(options:IOptions) {
        
    }
    
    public getHeight() {
        return 260;
    }
    
    public getLevel() {
        return Level.HOUR;
    }
}