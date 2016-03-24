/// <reference path="picker.ts" />

class HourPicker extends Picker implements IPicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
    }
    
    public create(date:Date, transition:Transition) {
        this.min = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.max = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        
        let iterator = new Date(this.min.valueOf());
        
        this.picker = document.createElement('datium-picker');
        this.transitionIn(transition, this.picker);
        
        do {
            let hourElement = document.createElement('datium-hour-element');
            
            hourElement.innerHTML = iterator.getHours().toString();
            
            this.picker.appendChild(hourElement);
            
            iterator.setHours(iterator.getHours() + 1);
        } while (iterator.valueOf() < this.max.valueOf());
        
        this.attach();
        this.setSelectedDate(this.selectedDate);
    }
    
    public getHeight() {
        return 260;
    }
    
    public getLevel() {
        return Level.HOUR;
    }
}