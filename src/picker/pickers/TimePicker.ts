/// <reference path="Picker.ts" />

class TimePicker extends Picker {
    protected timeDrag:HTMLElement;
    protected timeDragArm:HTMLElement;
    
    protected secondHand:HTMLElement;
    protected hourHand:HTMLElement;
    protected minuteHand:HTMLElement;
    
    protected dragging:boolean = false;
    public isDragging():boolean {
        return this.dragging;
    }
    
    protected rotation:number = 0;
    
    protected dragStart(e:MouseEvent|TouchEvent) {
        let minuteAdjust = 0;
        if (this.getLevel() === Level.HOUR) {
            minuteAdjust = (Math.PI * this.selectedDate.getMinutes() / 30) / 12;
        }
        trigger.openBubble(this.element, {
           x: -70 * Math.sin(this.rotation + minuteAdjust) + 140, 
           y: 70 * Math.cos(this.rotation + minuteAdjust) + 175,
           text: this.getBubbleText()
        });
        this.picker.classList.add('datium-dragging');
        this.dragging = true;
        this.moved = 0;
    }
    
    private moved:number = 0;
    protected dragMove(e:MouseEvent|TouchEvent) {
        
        let point = {
            x: this.picker.getBoundingClientRect().left + 140 - this.getClientCoor(e).x,
            y: this.getClientCoor(e).y - this.picker.getBoundingClientRect().top - 120
        }
        
        let r = Math.atan2(point.x, point.y);
        this.rotation = this.normalizeRotation(r);
        
        let newDate = this.getElementDate(this.timeDrag);
        
        
        
        let goto = true;
        if (this.getLevel() === Level.HOUR) {
            newDate.setHours(this.rotationToTime(this.rotation));
            goto = this.options.isHourSelectable(newDate);
        } else if (this.getLevel() === Level.MINUTE) {
            newDate.setMinutes(this.rotationToTime(this.rotation));  
            goto = this.options.isMinuteSelectable(newDate);          
        } else if (this.getLevel() === Level.SECOND) {
            newDate.setSeconds(this.rotationToTime(this.rotation));
            goto = this.options.isHourSelectable(newDate);
        }
        
        if (this.moved++ > 1) {
            trigger.updateBubble(this.element, {
                x: -70 * Math.sin(this.rotation) + 140, 
                y: 70 * Math.cos(this.rotation) + 175,
                text: this.getBubbleText()
            });
        }
        
        this.updateLabels(newDate);
        if (goto) {
            trigger.goto(this.element, {
                date: newDate,
                level: this.getLevel(),
                update: false
            });
        }
        
        this.updateElements();
    }
    
    protected dragEnd(e:MouseEvent|TouchEvent) {
        this.picker.classList.remove('datium-dragging');
        
        let date = this.getElementDate(this.timeDrag);
        let zoomIn = true;
        if (this.getLevel() === Level.HOUR) {
            date.setHours(this.rotationToTime(this.rotation));
            date = this.round(date);
            zoomIn = this.options.isHourSelectable(date);
        } else if (this.getLevel() === Level.MINUTE) {
            date.setMinutes(this.rotationToTime(this.rotation));
            date = this.round(date);
            zoomIn = this.options.isMinuteSelectable(date);
        } else if (this.getLevel() === Level.SECOND) {
            date.setSeconds(this.rotationToTime(this.rotation));
            date = this.round(date);
            zoomIn = this.options.isSecondSelectable(date);
        }
        
        if (zoomIn) {
            trigger.zoomIn(this.element, {
                date: date,
                currentLevel: this.getLevel()
            });
        }
        
        this.dragging = false;
        
        this.updateElements();
    }
    
    protected updateElements() {
        this.timeDragArm.style.transform = `rotate(${this.rotation}rad)`;
        if (this.getLevel() == Level.HOUR) {
            let minuteAdjust = 0;
            if (!this.dragging) {
                minuteAdjust = (Math.PI * this.selectedDate.getMinutes() / 30) / 12;
            }
            this.timeDragArm.style.transform = `rotate(${this.rotation + minuteAdjust}rad)`;
            this.hourHand.style.transform = `rotate(${this.rotation + minuteAdjust}rad)`;
        } else if (this.getLevel() === Level.MINUTE) {
            
            let t = this.selectedDate.getHours();
            let r1 =  (t + 6) / 6 * Math.PI;
            
            let r = this.rotation;
            r = this.putRotationInBounds(r);
            r1 += (r+Math.PI)/12;
            
            this.hourHand.style.transform = `rotate(${r1}rad)`;
            this.minuteHand.style.transform = `rotate(${this.rotation}rad)`;
        } else if (this.getLevel() === Level.SECOND) {
            
            let t = this.selectedDate.getHours();
            let r1 =  (t + 6) / 6 * Math.PI;
            
            
            
            let t2 = this.selectedDate.getMinutes();
            let r2 = this.timeToRotation(t2);
            
            let r = r2;
            r = this.putRotationInBounds(r);
            r1 += (r+Math.PI)/12;
            
            this.hourHand.style.transform = `rotate(${r1}rad)`;
            this.minuteHand.style.transform = `rotate(${r2}rad)`;
            this.secondHand.style.transform = `rotate(${this.rotation}rad)`;
        }
    }
    
    protected putRotationInBounds(r:number, factor:number = 2) {
        while (r > Math.PI) r -= Math.PI * factor;
        while (r < -Math.PI) r += Math.PI * factor;
        return r;
    }
    
    protected normalizeRotation(r:number, factor:number = 2) {
        return r - Math.round((r - this.rotation) / Math.PI / factor) * Math.PI * factor;
    }
    
    public setSelectedDate(date:Date) {
        this.selectedDate = new Date(date.valueOf());
        
        if (this.getLevel() === Level.HOUR) {
            this.rotation = this.normalizeRotation((date.getHours() + 6) / 6 * Math.PI, 2);
        } else if (this.getLevel() === Level.MINUTE) {
            this.rotation = this.normalizeRotation((date.getMinutes() + 30) / 30 * Math.PI, 2);            
        } else if (this.getLevel() === Level.SECOND) {
            this.rotation = this.normalizeRotation((date.getSeconds() + 30) / 30 * Math.PI, 2);
        }
        
        if (this.timeDragArm !== void 0) {
            this.updateElements();
        }
        
        if (this.picker !== void 0) {
            this.updateLabels(date);
        }
    }
    
    public getHeight() {
        return 240;
    }
    
    protected floor(date:Date):Date { throw 'unimplemented' }
    protected ceil(date:Date):Date { throw 'unimplemented' }
    protected round(date:Date):Date { throw 'unimplemented' }
    protected updateLabels(date:Date, forceUpdate:boolean = false) { throw 'unimplemented' }
    protected getElementDate(el:Element):Date { throw 'unimplemented' }
    protected getBubbleText():string { throw 'unimplemented' }
    protected rotationToTime(rotation:number):number { throw 'unimplemented' }
    protected timeToRotation(time:number):number { throw 'unimplemented' }
    public getLevel():Level { throw 'unimplemented' }
}