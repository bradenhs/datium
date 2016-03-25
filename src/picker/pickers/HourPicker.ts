/// <reference path="picker.ts" />

class HourPicker extends Picker implements IPicker {
    constructor(element:HTMLElement, container:HTMLElement) {
        super(element, container);
        
        listen.drag(container, 'datium-time-drag', {
            dragStart: (e) => this.dragStart(e),
            dragMove: (e) => this.dragMove(e),
            dragEnd: (e) => this.dragEnd(e), 
        });
    }
    
    private offsetX:number;
    private offsetY:number;
    
    private dragStart(e:MouseEvent|TouchEvent) {
        trigger.openBubble(this.element, {
           x: -70 * Math.sin(this.rotation) + 140, 
           y: 70 * Math.cos(this.rotation) + 175,
           text: this.getTime() 
        });
        this.picker.classList.add('datium-dragging');
    }
    
    private dragMove(e:MouseEvent|TouchEvent) {
        this.getTime();
        trigger.updateBubble(this.element, {
           x: -70 * Math.sin(this.rotation) + 140, 
           y: 70 * Math.cos(this.rotation) + 175,
           text: this.getTime()
        });
        let point = this.fromCenter(this.getClientCoor(e));
        let r = Math.atan2(point.x, point.y);
        while (r - this.rotation > Math.PI) r -= 2*Math.PI;
        while (this.rotation - r < -Math.PI) r += 2*Math.PI;
        this.rotation = r;
        this.updateTimeDragArm();
    }
    
    private getTime() {
        let time = 180/Math.PI * this.rotation / 30 + 6;
        time = time > 11.5 ? 0 : Math.round(time);
        return time.toString();
        
    }
    
    private dragEnd(e:MouseEvent|TouchEvent) {
        this.picker.classList.remove('datium-dragging');
    }
    
    private fromCenter(point:{x:number, y:number}):{x:number, y:number} {
        return {
            x: this.getCenter().x - point.x,
            y: point.y - this.getCenter().y
        }
    }
    
    private getCenter():{x:number, y:number} {
        return {
            x: this.picker.getBoundingClientRect().left + 140,
            y: this.picker.getBoundingClientRect().top + 120
        }
    }
    
    private updateTimeDragArm() {
        this.timeDragArm.style.transform = `rotate(${this.rotation}rad)`;
        this.hourHand.style.transform = `rotate(${this.rotation}rad)`;
    }
    
    private rotation:number = 0;
    private timeDragArm:HTMLElement;
    private timeDrag:HTMLElement;
    private hourHand:HTMLElement;
    
    public create(date:Date, transition:Transition) {
        this.min = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.max = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        
        let iterator = new Date(this.min.valueOf());
        
        this.picker = document.createElement('datium-picker');
        this.picker.classList.add('datium-time-picker');
        
        this.transitionIn(transition, this.picker);
        
        for (let i = 0; i < 12; i++) {
            let tick = document.createElement('datium-tick');
            let tickLabel = document.createElement('datium-tick-label');
            tickLabel.innerHTML = (i === 0 ? 12 : i).toString();
            tick.appendChild(tickLabel);
            tick.style.transform = `rotate(${i * 30 + 180}deg)`;
            tickLabel.style.transform = `rotate(${i * -30 + 180}deg)`;
            this.picker.appendChild(tick);
        }
        
        this.hourHand = document.createElement('datium-hour-hand');
        this.timeDragArm = document.createElement('datium-time-drag-arm');
        this.timeDrag = document.createElement('datium-time-drag');
        this.timeDragArm.appendChild(this.timeDrag);
        this.picker.appendChild(this.timeDragArm);
        this.picker.appendChild(this.hourHand);
        
        this.attach();
        this.setSelectedDate(this.selectedDate);
    }
    
    public setSelectedDate(date:Date) {
        this.selectedDate = new Date(date.valueOf());
        this.rotation = date.getHours() * Math.PI / 6 - Math.PI;
        if (this.timeDragArm !== void 0 && this.hourHand !== void 0) {
            this.updateTimeDragArm();
        }
    }
    
    public getHeight() {
        return 240;
    }
    
    public getLevel() {
        return Level.HOUR;
    }
}