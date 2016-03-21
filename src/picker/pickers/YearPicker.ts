/// <reference path="picker.ts" />

class YearPicker extends Picker implements IPicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
    }
    
    public updateOptions(options:IOptions) {
        
    }
    
    private pickers:{[timestamp:number]:HTMLElement;} = {};
    
    public create(date:Date, transition:Transition) {
        this.min = new Date(Math.floor(date.getFullYear()/10)*10, 0);
        this.max = new Date(Math.ceil(date.getFullYear()/10)*10 + 1, 0);
        
        let iterator = new Date(this.min.valueOf());
        
        this.pickers[this.min.valueOf()] = document.createElement('datium-picker');
        
        this.transitionIn(transition);
        
        do {
            let yearElement = document.createElement('datium-year-element');
            
            yearElement.innerHTML = iterator.getFullYear().toString();
            
            this.picker.appendChild(yearElement);
            
            iterator.setFullYear(iterator.getFullYear() + 1);
        } while (iterator.valueOf() < this.max.valueOf());
        
        this.pickerContainer.appendChild(this.picker);
        setTimeout(() => {
            this.picker.className = '';
        });
    }
    
    public remove(transition:Transition) {
        this.transitionOut(transition);
        setTimeout((picker:HTMLElement) => {
            picker.remove();
        }, 400, this.picker);        
    }
    
    
    public getHeight() {
        return 180;
    }
}