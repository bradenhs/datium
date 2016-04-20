/// <reference path="Picker.ts" />

class YearPicker extends Picker implements IPicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
        
        listen.tap(container, 'datium-year-element[datium-data]', (e) => {
           let el:Element = <Element>e.target || e.srcElement;
           let year = new Date(el.getAttribute('datium-data')).getFullYear();
           
           let date = new Date(this.selectedDate === void 0 ?
                               this.options.initialDate.valueOf() :
                               this.selectedDate.valueOf());
                               
           date.setFullYear(year);
           
           trigger.zoomIn(element, {
               date: date,
               currentLevel: Level.YEAR
           })
        });
        
        listen.down(container, 'datium-year-element', (e) => {
            let el:HTMLElement = <HTMLElement>(e.target || e.srcElement);
            let text = new Date(el.getAttribute('datium-data')).getFullYear().toString();
            let offset = this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 35,
                y: offset.y + 15,
                text: text
           });
        });
    }
    
    public create(date:Date, transition:Transition) {
        
        let minYear = Math.floor(date.getFullYear()/10)*10;
        this.min = new Date(minYear, 0);
        this.min.setFullYear(minYear);
        
        let maxYear = Math.ceil(date.getFullYear()/10)*10;
        this.max = new Date(Math.ceil(date.getFullYear()/10)*10, 0);
        this.max.setFullYear(maxYear);
        
        if (this.min.valueOf() === this.max.valueOf()) {
            this.max.setFullYear(this.max.getFullYear() + 10);
        }
        
        let iterator = new Date(this.min.valueOf());
        
        this.picker = document.createElement('datium-picker');
        
        this.transitionIn(transition, this.picker);
        
        do {
            
            let yearElement = document.createElement('datium-year-element');
            
            yearElement.innerHTML = iterator.getFullYear().toString();
            yearElement.setAttribute('datium-data', iterator.toISOString());
            
            this.picker.appendChild(yearElement);
            
            iterator.setFullYear(iterator.getFullYear() + 1);
        } while (iterator.valueOf() <= this.max.valueOf());
        
        this.attach();
        
        this.setSelectedDate(this.selectedDate);
        this.setValid();
    }
    
    public updateOptions(options:IOptions) {
        this.options = options;
        this.setValid();
    }
    
    private setValid() {
        let yearElements = this.pickerContainer.querySelectorAll('datium-year-element');
        for (let i = 0; i < yearElements.length; i++) {
            let el = yearElements.item(i);
            let date = new Date(el.getAttribute('datium-data'));
            let next = new Date(date.getFullYear() + 1, 0);
            if (date.valueOf() < this.options.maxDate.valueOf() &&
                next.valueOf() > this.options.minDate.valueOf() &&
                this.options.isYearValid(date)) {
                el.classList.remove('datium-invalid');
            } else {
                el.classList.add('datium-invalid');
            }
        }
    }
    
    public setSelectedDate(selectedDate:Date) {
        if (selectedDate === void 0) return;
        this.selectedDate = new Date(selectedDate.valueOf());
        
        let yearElements = this.pickerContainer.querySelectorAll('datium-year-element');
        for (let i = 0; i < yearElements.length; i++) {
            let el = yearElements.item(i);
            let date = new Date(el.getAttribute('datium-data'));
            if (date.getFullYear() === selectedDate.getFullYear() && this.defined) {
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