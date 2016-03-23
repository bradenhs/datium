/// <reference path="picker.ts" />

class SecondPicker extends Picker implements IPicker {
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