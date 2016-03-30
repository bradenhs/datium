/// <reference path="Picker.ts" />

class MonthPicker extends Picker implements IPicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
        
        listen.tap(container, 'datium-month-element[datium-data]', (e) => {
           let el:Element = <Element>e.target || e.srcElement;
           let year = new Date(el.getAttribute('datium-data')).getFullYear();
           let month = new Date(el.getAttribute('datium-data')).getMonth();
           
           let date = new Date(this.selectedDate.valueOf());
           date.setFullYear(year);
           date.setMonth(month);
           if (date.getMonth() !== month) {
               date.setDate(0);
           }
           
           trigger.zoomIn(element, {
               date: date,
               currentLevel: Level.MONTH
           });
        });
        
        listen.down(container, 'datium-month-element', (e) => {
            let el:HTMLElement = <HTMLElement>(e.target || e.srcElement);
            let text = this.getShortMonths()[new Date(el.getAttribute('datium-data')).getMonth()];
            let offset = this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 35,
                y: offset.y + 15,
                text: text
           });
        });
    }
    
    public create(date:Date, transition:Transition) {
        this.min = new Date(date.getFullYear(), 0);
        this.max = new Date(date.getFullYear() + 1, 0);
        
        let iterator = new Date(this.min.valueOf());
        
        this.picker = document.createElement('datium-picker');
        
        this.transitionIn(transition, this.picker);
        
        do {
            let monthElement = document.createElement('datium-month-element');
            
            monthElement.innerHTML = this.getShortMonths()[iterator.getMonth()];
            monthElement.setAttribute('datium-data', iterator.toISOString());
            
            this.picker.appendChild(monthElement);
            
            iterator.setMonth(iterator.getMonth() + 1);
        } while (iterator.valueOf() < this.max.valueOf());
        
        this.attach();
        
        this.setSelectedDate(this.selectedDate);
    }
    
    public setSelectedDate(selectedDate:Date) {
        this.selectedDate = new Date(selectedDate.valueOf());
        
        let monthElements = this.pickerContainer.querySelectorAll('datium-month-element');
        for (let i = 0; i < monthElements.length; i++) {
            let el = monthElements.item(i);
            let date = new Date(el.getAttribute('datium-data'));
            if (date.getFullYear() === selectedDate.getFullYear() &&
                date.getMonth() === selectedDate.getMonth()) {
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
        return Level.MONTH;
    }
}