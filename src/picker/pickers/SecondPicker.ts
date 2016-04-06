/// <reference path="TimePicker.ts" />

class SecondPicker extends TimePicker implements ITimePicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
        
        listen.drag(container, '.datium-second-drag', {
            dragStart: (e) => this.dragStart(e),
            dragMove: (e) => this.dragMove(e),
            dragEnd: (e) => this.dragEnd(e), 
        });
        
        listen.tap(container, '.datium-second-element', (e) => {
            let el:Element = <Element>e.target || e.srcElement;
            
            trigger.zoomIn(this.element, {
                date: this.getElementDate(el),
                currentLevel: Level.SECOND
            });
        });
        
        listen.down(container, '.datium-second-element', (e) => {
            let el:HTMLElement = <HTMLElement>(e.target || e.srcElement);
            let seconds = new Date(el.getAttribute('datium-data')).getSeconds();
            
            let offset = this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 25,
                y: offset.y + 3,
                text: this.getBubbleText(seconds)
           });
        });
    }
    
    protected ceil(date:Date):Date {
        let ceiledDate = new Date(date.valueOf());
        let upper = ceiledDate.getSeconds() + 1;
        let orig = ceiledDate.getSeconds();
        while (!this.options.isSecondValid(ceiledDate)) {
            if (upper > 59) upper = 0;
            ceiledDate.setSeconds(upper++);
            if (this.options.isSecondValid(ceiledDate)) break;
            if (upper === orig) break;
        }
        return ceiledDate;
    }
    
    protected floor(date:Date):Date {
        let flooredDate = new Date(date.valueOf());
        let lower = flooredDate.getSeconds() - 1;
        let orig = flooredDate.getSeconds();
        while (!this.options.isSecondValid(flooredDate)) {
            if (lower < 0) lower = 59;
            flooredDate.setSeconds(lower--);
            if (this.options.isSecondValid(flooredDate)) break;
            if (lower === orig) break;
        }
        return flooredDate;
    }
    
    protected round(date:Date):Date {
        let roundedDate = new Date(date.valueOf());
        let lower = roundedDate.getSeconds() - 1;
        let upper = roundedDate.getSeconds() + 1;
        while (!this.options.isSecondValid(roundedDate)) {
            
            if (lower < 0) lower = 59;
            roundedDate.setSeconds(lower--);
            if (this.options.isSecondValid(roundedDate)) break;
            if (lower === upper) break;
            
            if (upper > 59) upper = 0;
            roundedDate.setSeconds(upper++);
            if (lower === upper) break;
        }
        return roundedDate;
    }
    
    protected getBubbleText(seconds?:number) {
        if (seconds === void 0) {
            seconds = this.rotationToTime(this.rotation); 
        }
        
        let d = new Date(this.selectedDate.valueOf());
        d.setSeconds(seconds);
        d = this.round(d);
        seconds = d.getSeconds();
        
        let start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
        let end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds() + 1);
        
        if (start.valueOf() > this.options.maxDate.valueOf() ||
            end.valueOf() < this.options.minDate.valueOf()) {
            return '--';
        }
        
        return this.pad(seconds)+'s';
    }
    
    protected getElementDate(el:Element) {
        let d = new Date(el.getAttribute('datium-data'));
        let year = d.getFullYear();
        let month = d.getMonth();
        let dateOfMonth = d.getDate();
        let hours = d.getHours();
        let minutes = d.getMinutes();
        let seconds = d.getSeconds();
        
        
        let newDate = new Date(this.selectedDate.valueOf());
        newDate.setFullYear(year);
        newDate.setMonth(month);
        if (newDate.getMonth() !== month) {
            newDate.setDate(0);
        }
        newDate.setDate(dateOfMonth);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(seconds);
        return newDate;
    }
    
    protected rotationToTime(r:number) {
        while (r > Math.PI) r -= 2*Math.PI;
        while (r < -Math.PI) r += 2*Math.PI;
        let t = (r / Math.PI * 30) + 30;
        return t >= 59.5 ? 0 : Math.round(t);
    }
    
    protected timeToRotation(t:number) {
        return this.normalizeRotation((t + 30) / 30 * Math.PI);
    }
    
    public create(date:Date, transition:Transition) {
        this.dragging = false;
        this.min = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
        this.max = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + 1);
        
        let iterator = new Date(this.min.valueOf());
        
        this.picker = document.createElement('datium-picker');
        this.picker.classList.add('datium-second-picker');
        
        this.transitionIn(transition, this.picker);
        
        for (let i = 0; i < 12; i++) {
            let tick = document.createElement('datium-tick');
            let tickLabel = document.createElement('datium-tick-label');
            tickLabel.classList.add('datium-second-element');
            let tickLabelContainer = document.createElement('datium-tick-label-container');
            let r = i * Math.PI/6 + Math.PI;
            tickLabelContainer.appendChild(tickLabel);
            tick.appendChild(tickLabelContainer);
            tick.style.transform = `rotate(${r}rad)`;
            tickLabelContainer.style.transform = `rotate(${2*Math.PI - r}rad)`;
            tickLabel.setAttribute('datium-clock-pos', i.toString());
            
            let d = new Date(date.valueOf());
            
            let seconds = this.rotationToTime(r);
            d.setSeconds(seconds);
            
            tickLabel.setAttribute('datium-data', d.toISOString());
            this.picker.appendChild(tick);
        }
        
        this.secondHand = document.createElement('datium-second-hand');
        this.minuteHand = document.createElement('datium-minute-hand');
        this.hourHand = document.createElement('datium-hour-hand');
        this.timeDragArm = document.createElement('datium-time-drag-arm');
        this.timeDrag = document.createElement('datium-time-drag');
        this.timeDrag.classList.add('datium-second-drag');
        
        this.timeDrag.setAttribute('datium-data', date.toISOString());
        
        this.timeDragArm.appendChild(this.timeDrag);
        this.picker.appendChild(this.timeDragArm);
        this.picker.appendChild(this.hourHand);
        this.picker.appendChild(this.minuteHand);
        this.picker.appendChild(this.secondHand);
        
        this.attach();
        this.setSelectedDate(this.selectedDate);
    }
    
    private lastLabelDate:Date;
    
    protected updateLabels(date:Date, forceUpdate:boolean = false) {
        if (date === void 0) return;
        this.lastLabelDate = date;
        
        let labels = this.picker.querySelectorAll('[datium-clock-pos]');
        for (let i = 0; i < labels.length; i++) {
            let label = labels.item(i);
            let r = Math.PI*parseInt(label.getAttribute('datium-clock-pos'), 10)/6-3*Math.PI;
            let time = this.rotationToTime(r);
            
            let d = new Date(label.getAttribute('datium-data'));
            
            label.setAttribute('datium-data', d.toISOString());
            
            let start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
            let end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds() + 1);
            if (end.valueOf() > this.options.minDate.valueOf() &&
                start.valueOf() < this.options.maxDate.valueOf() &&
                this.options.isSecondValid(d)) {
                label.classList.remove('datium-inactive');
            } else {
                label.classList.add('datium-inactive');
            }
            
            label.innerHTML = this.pad(time);
        }
        
    }
    
    public updateOptions(options:IOptions) {
        if (this.options !== void 0) {
            this.options = options;
            this.updateLabels(this.lastLabelDate, true);
        }
        this.options = options;
    }
    
    public getLevel() {
        return Level.SECOND;
    }
}