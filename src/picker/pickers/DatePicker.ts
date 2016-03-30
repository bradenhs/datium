/// <reference path="Picker.ts" />

class DatePicker extends Picker implements IPicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
        
        listen.tap(container, 'datium-date-element[datium-data]', (e) => {
           let el:Element = <Element>e.target || e.srcElement;
           
           let year = new Date(el.getAttribute('datium-data')).getFullYear();
           let month = new Date(el.getAttribute('datium-data')).getMonth();
           let dateOfMonth = new Date(el.getAttribute('datium-data')).getDate();
           
           let date = new Date(this.selectedDate.valueOf());
           date.setFullYear(year);
           date.setMonth(month);
           if (date.getMonth() !== month) {
               date.setDate(0);
           }
           date.setDate(dateOfMonth);
           
           trigger.zoomIn(element, {
               date: date,
               currentLevel: Level.DATE
           })
        });
        
        listen.down(container, 'datium-date-element', (e) => {
            let el:HTMLElement = <HTMLElement>(e.target || e.srcElement);
            let text = this.pad(new Date(el.getAttribute('datium-data')).getDate());
            let offset = this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 20,
                y: offset.y + 2,
                text: text
           });
        });
    }
    
    private height:number;
    
    public create(date:Date, transition:Transition) {
        this.min = new Date(date.getFullYear(), date.getMonth());
        this.max = new Date(date.getFullYear(), date.getMonth() + 1);
        
        let start = new Date(this.min.valueOf());
        start.setDate(1 - start.getDay());
        
        let end = new Date(this.max.valueOf());
        end.setDate(end.getDate() + 7 - (end.getDay() === 0 ? 7 : end.getDay()));
        
        let iterator = new Date(start.valueOf());
        
        this.picker = document.createElement('datium-picker');
        
        this.transitionIn(transition, this.picker);
        
        for (let i = 0; i < 7; i++) {
            let header = document.createElement('datium-date-header');
            header.innerHTML = this.getDays()[i].slice(0, 2);
            this.picker.appendChild(header);
        }
        
        let times = 0;
        
        do {
            let dateElement = document.createElement('datium-date-element');
            
            dateElement.innerHTML = iterator.getDate().toString();
            
            if (iterator.getMonth() === date.getMonth()) {
                dateElement.setAttribute('datium-data', iterator.toISOString());
            }
            
            this.picker.appendChild(dateElement);
            
            iterator.setDate(iterator.getDate() + 1);
            times++;
        } while (iterator.valueOf() < end.valueOf());
        
        
        this.height = Math.ceil(times / 7) * 36 + 28;
        
        this.attach();
        
        this.setSelectedDate(this.selectedDate);
    }
    
    public setSelectedDate(selectedDate:Date) {
        this.selectedDate = new Date(selectedDate.valueOf());
        
        let dateElements = this.pickerContainer.querySelectorAll('datium-date-element');
        for (let i = 0; i < dateElements.length; i++) {
            let el = dateElements.item(i);
            let date = new Date(el.getAttribute('datium-data'));
            if (date.getFullYear() === selectedDate.getFullYear() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getDate() === selectedDate.getDate()) {
                el.classList.add('datium-selected');
            } else {
                el.classList.remove('datium-selected');
            }
        }
    }
    
    public getHeight() {
        return this.height;
    }
    
    public getLevel() {
        return Level.DATE;
    }
}