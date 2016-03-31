/// <reference path="TimePicker.ts" />

class HourPicker extends TimePicker implements ITimePicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
        
        listen.drag(container, '.datium-hour-drag', {
            dragStart: (e) => this.dragStart(e),
            dragMove: (e) => this.dragMove(e),
            dragEnd: (e) => this.dragEnd(e), 
        });
        
        listen.tap(container, '.datium-hour-element', (e) => {
            let el:Element = <Element>e.target || e.srcElement;
            
            trigger.zoomIn(this.element, {
                date: this.getElementDate(el),
                currentLevel: Level.HOUR
            });
        });
        
        listen.down(container, '.datium-hour-element', (e) => {
            let el:HTMLElement = <HTMLElement>(e.target || e.srcElement);
            let hours = new Date(el.getAttribute('datium-data')).getHours();
            
            let offset = this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 25,
                y: offset.y + 3,
                text: this.getBubbleText(hours)
           });
        });
        
        listen.tap(container, 'datium-meridiem-switcher', () => {
            let newDate = new Date(this.lastLabelDate.valueOf());
            if (newDate.getHours() < 12) {
                newDate.setHours(newDate.getHours() + 12);
                this.rotation += Math.PI * 2;
            } else {
                newDate.setHours(newDate.getHours() - 12);
                this.rotation -= Math.PI * 2;
            }
            
            this.updateLabels(newDate);
            trigger.goto(this.element, {
                date: newDate,
                level: Level.HOUR,
                update: false
            });
            this.updateElements();
        });
    }
    
    protected getBubbleText(hours?:number) {
        if (hours === void 0) {
            hours = this.rotationToTime(this.rotation); 
        }
        
        let d = new Date(this.selectedDate.valueOf());
        d.setHours(hours);
        if (d.valueOf() < this.options.minDate.valueOf()) {
            hours = this.options.minDate.getHours();
        } else if (d.valueOf() > this.options.maxDate.valueOf()) {
            hours = this.options.maxDate.getHours();
        }
        
        if (this.options.militaryTime) {
            return this.pad(hours)+'hr';
        } else if (hours === 12) {
            return '12pm';
        } else if (hours === 0) {
            return '12am';
        } else if (hours > 11) {
            return (hours - 12) + 'pm';
        } else {
            return hours + 'am';
        }
    }
    
    protected getElementDate(el:Element) {
        let d = new Date(el.getAttribute('datium-data'));
        let year = d.getFullYear();
        let month = d.getMonth();
        let dateOfMonth = d.getDate();
        let hours = d.getHours();
        
        let newDate = new Date(this.selectedDate.valueOf());
        newDate.setFullYear(year);
        newDate.setMonth(month);
        if (newDate.getMonth() !== month) {
            newDate.setDate(0);
        }
        newDate.setDate(dateOfMonth);
        newDate.setHours(hours);
        return newDate;
    }
    
    protected rotationToTime(r:number) {
        while (r > 5*Math.PI) r -= 4*Math.PI;
        while (r < Math.PI) r += 4*Math.PI;
        r -= 2 * Math.PI;
        let t = (r / Math.PI * 6) + 6;
        return Math.floor(t+.000001);
    }
    
    protected timeToRotation(t:number) {
        return this.normalizeRotation((t + 6) / 6 * Math.PI);
    }
    
    public create(date:Date, transition:Transition) {
        this.min = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.max = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        
        let iterator = new Date(this.min.valueOf());
        
        this.picker = document.createElement('datium-picker');
        this.picker.classList.add('datium-hour-picker');
        
        this.transitionIn(transition, this.picker);
        
        for (let i = 0; i < 12; i++) {
            let tick = document.createElement('datium-tick');
            let tickLabel = document.createElement('datium-tick-label');
            tickLabel.classList.add('datium-hour-element');
            let tickLabelContainer = document.createElement('datium-tick-label-container');
            let r = i * Math.PI/6 + Math.PI;
            tickLabelContainer.appendChild(tickLabel);
            tick.appendChild(tickLabelContainer);
            tick.style.transform = `rotate(${r}rad)`;
            tickLabelContainer.style.transform = `rotate(${2*Math.PI - r}rad)`;
            tickLabel.setAttribute('datium-clock-pos', i.toString());
            
            let d = new Date(date.valueOf());
            
            let hours = this.rotationToTime(r);
            if (date.getHours() > 11) hours += 12;
            d.setHours(hours);
            
            tickLabel.setAttribute('datium-data', d.toISOString());
            
            this.picker.appendChild(tick);
        }
        
        this.meridiemSwitcher = document.createElement('datium-meridiem-switcher');
        if (this.options.militaryTime) {
            this.meridiemSwitcher.classList.add('datium-military-time');
        }
        
        
        this.picker.appendChild(this.meridiemSwitcher);
        
        this.hourHand = document.createElement('datium-hour-hand');
        this.timeDragArm = document.createElement('datium-time-drag-arm');
        this.timeDrag = document.createElement('datium-time-drag');
        this.timeDrag.classList.add('datium-hour-drag');
        
        this.timeDrag.setAttribute('datium-data', date.toISOString());
        
        this.timeDragArm.appendChild(this.timeDrag);
        this.picker.appendChild(this.timeDragArm);
        this.picker.appendChild(this.hourHand);
        
        this.meridiem = void 0;
        
        this.attach();
        this.setSelectedDate(this.selectedDate);
    }
    
    private meridiemSwitcher:HTMLElement;
    
    private meridiem:string;
    private lastLabelDate:Date;
    protected updateLabels(date:Date, forceUpdate:boolean = false) {
        this.lastLabelDate = date;
        
        if (this.meridiem !== void 0 &&
            (this.meridiem === 'AM' && date.getHours() < 12) ||
            (this.meridiem === 'PM' && date.getHours() > 11)) {
            if (!forceUpdate) return;
        }
        
        this.meridiem = date.getHours() < 12 ? 'AM' : 'PM';
        
        if (this.meridiem === 'AM') {
            this.meridiemSwitcher.classList.remove('datium-pm-selected');
            this.meridiemSwitcher.classList.add('datium-am-selected');
        } else {
            this.meridiemSwitcher.classList.remove('datium-am-selected');
            this.meridiemSwitcher.classList.add('datium-pm-selected');
        }
        
        let labels = this.picker.querySelectorAll('[datium-clock-pos]');
        for (let i = 0; i < labels.length; i++) {
            let label = labels.item(i);
            let r = Math.PI*parseInt(label.getAttribute('datium-clock-pos'), 10)/6-3*Math.PI;
            let time = this.rotationToTime(r);
            
            let d = new Date(label.getAttribute('datium-data'));
            if (date.getHours() > 11) {
                d.setHours(time + 12);
            } else {
                d.setHours(time);
            }
            
            label.setAttribute('datium-data', d.toISOString());
            
            let start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours());
            let end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1);
            if (end.valueOf() > this.options.minDate.valueOf() &&
                start.valueOf() < this.options.maxDate.valueOf()) {
                label.classList.remove('datium-inactive');
            } else {
                label.classList.add('datium-inactive');
            }
            
            if (this.options.militaryTime) {
                if (date.getHours() > 11) time += 12;
                label.innerHTML = this.pad(time);
            } else {
                if (time === 0) time = 12;
                label.innerHTML = time.toString();
            }
        }
        
    }
    
    public updateOptions(options:IOptions) {
        if (this.options !== void 0 && this.options.militaryTime !== options.militaryTime) {
            this.options = options;
            this.updateLabels(this.lastLabelDate, true);
        }
        this.options = options;
        
        if (this.meridiemSwitcher !== void 0) {
            if (this.options.militaryTime) {
                this.meridiemSwitcher.classList.add('datium-military-time');
            } else {
                this.meridiemSwitcher.classList.remove('datium-military-time');
            }
        }
    }
    
    public getLevel() {
        return Level.HOUR;
    }
}