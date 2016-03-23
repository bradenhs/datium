/// <reference path="picker.ts" />

class YearPicker extends Picker implements IPicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
        
        listen.tap(container, 'datium-year-element[datium-data]', (e) => {
           let el:Element = <Element>e.target || e.srcElement;
           let year = parseInt(el.getAttribute('datium-data'), 10);
           
           let date = new Date(this.selectedDate.valueOf());
           date.setFullYear(year);
           
           trigger.goto(element, {
               date: date,
               level: Level.MONTH
           })
        });
        
        listen.down(container, 'datium-year-element', (e) => {
            let el:HTMLElement = <HTMLElement>(e.target || e.srcElement);
            let text = el.getAttribute('datium-data');
            let offset = this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 35,
                y: offset.y - 85,
                text: text
           });
        });
    }
    
    public create(date:Date, transition:Transition) {
        this.min = new Date(Math.floor(date.getFullYear()/10)*10, 0);
        this.max = new Date(Math.ceil(date.getFullYear()/10)*10, 0);
        
        if (this.min.valueOf() === this.max.valueOf()) {
            this.max.setFullYear(this.max.getFullYear() + 10);
        }
        
        let iterator = new Date(this.min.valueOf());
        
        this.picker = document.createElement('datium-picker');
        
        this.transitionIn(transition);
        
        do {
            let yearElement = document.createElement('datium-year-element');
            
            yearElement.innerHTML = iterator.getFullYear().toString();
            yearElement.setAttribute('datium-data', iterator.getFullYear().toString());
            
            this.picker.appendChild(yearElement);
            
            iterator.setFullYear(iterator.getFullYear() + 1);
        } while (iterator.valueOf() <= this.max.valueOf());
        
        this.pickerContainer.appendChild(this.picker);
        
        this.updateSelected();
        
    }
    
    public setSelectedDate(date:Date) {
        this.selectedDate = new Date(date.valueOf());
        this.updateSelected();
    }
    
    private updateSelected() {
        let yearElements = this.pickerContainer.querySelectorAll('datium-year-element');
        for (let i = 0; i < yearElements.length; i++) {
            let el = yearElements.item(i);
            if (parseInt(el.getAttribute('datium-data'), 10) === this.selectedDate.getFullYear()) {
                el.classList.add('datium-selected');
            } else {
                el.classList.remove('datium-selected');
            }
        }
    }
    
    public getHeight() {
        return 180;
    }
    
    public getLevel() {
        return Level.YEAR;
    }
}