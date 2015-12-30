import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import clockTemplate from 'src/pickers/clock.html!text';
import {onDrag, onTap} from 'src/common/Events';

export default class HourPicker extends Picker {
    
    protected timeDragElement:HTMLElement;
    protected currentPickElement:HTMLElement;
    protected clockElement:Element;
    private clockMiddleElement:HTMLElement;
    private hourHandElement:HTMLElement;
    
    protected rotation:number;
    protected time:number;
        
    private meridiem:string;
    
	constructor(container:HTMLElement, private viewManager:ViewManager) {
        super(container, viewManager, 'datium-hour-selectable');
        this.height = 300;
        
        onDrag(container, 'datium-time-drag', {
           dragStart: (e:Event) => { this.dragStart(e); },
           dragMove: (e:MouseEvent) => { this.dragMove(e); },
           dragEnd: (e:Event) => { this.dragEnd(e); }
        });
        
        onTap(container, "datium-clock-middle", (e:Event) => {
            this.meridiem = this.meridiem === 'am' ? 'pm' : 'am';
            this.clockMiddleElement.innerText = this.meridiem;
            this.updateTime(this.time);
            for (let key in this.tickLabels) {
                let tickLabel = this.tickLabels[key];
                let data = parseInt(tickLabel.getAttribute('datium-data'));
                data = this.meridiem === 'am' ? data - 12 : data + 12;
                tickLabel.setAttribute('datium-data', data.toString());
            }
        });
    }
    
    private dragStart(e:Event):void {
        this.timeDragElement.classList.add('datium-is-dragging');
    }
    
    private dragMove(e:Event):void {
        let centerX = this.clockElement.getBoundingClientRect().left + 100;
        let centerY = this.clockElement.getBoundingClientRect().top + 100;
        
        let clientX = (<MouseEvent>e).clientX === void 0 ? (<TouchEvent>e).touches[0].clientX : (<MouseEvent>e).clientX;
        let clientY = (<MouseEvent>e).clientY === void 0 ? (<TouchEvent>e).touches[0].clientY : (<MouseEvent>e).clientY;
        
        let offsetX = centerX - clientX;
        let offsetY = centerY - clientY;        
        
        let newRotation = 180-Math.atan2(offsetX, offsetY)*180/Math.PI;        
        this.rotation = this.normalizeRotation(newRotation);
        
        this.setTimeDragRotation(this.rotation);        
        this.time = this.rotationToTime(this.rotation);
        this.updateTime(this.time);
        this.setHourRotationFromTime(this.time);
    }
    
    private setTimeDragRotation(angle:number):void {
        this.timeDragElement.style.transform = `rotate(${angle}deg)`;
        
    }
    
    private setHourRotationFromTime(time:number):void {
        let angle = this.timeToRotation(time);
        this.hourHandElement.style.transform = `rotate(${angle}deg)`;
        
    }
    
    protected rotationToTime(rotation:number):number {
        let num = (rotation) / 30 - 6;
        num = Math.round(num < 0 ? num + 12 : num);
        while(num < 0) num += 12;
        while(num > 12) num -= 12;
        return num === 0 ? 12 : num;
    }
    
    protected timeToRotation(time:number):number {
        return this.normalizeRotation(time * 30 + 180);
    }
    
    private updateTime(time:number):void {
        this.currentPickElement.innerText = time.toString() + this.meridiem;
    }
    
    private normalizeRotation(newRotation:number):number {
        while (newRotation + 180 < this.rotation) newRotation += 360;
        while (newRotation - 180 > this.rotation) newRotation -= 360;
        return newRotation;
    }
    
    private dragEnd(e:Event):void {
        this.rotation = this.timeToRotation(this.time);
        this.setTimeDragRotation(this.rotation);
        this.timeDragElement.classList.remove('datium-is-dragging');
        
        let zoomToTime = this.meridiem === 'pm' ? this.time + 12 : this.time;
        this.viewManager.zoomTo(zoomToTime);
    }
    
    protected populatePicker(picker:HTMLElement, date:Date):void {
        picker.innerHTML = clockTemplate;
        this.meridiem = date.getHours() < 12 ? 'am' : 'pm';
        this.clockElement = picker.querySelector('datium-clock');
        this.currentPickElement = <HTMLElement>picker.querySelector('datium-pick');
        this.clockMiddleElement = <HTMLElement>picker.querySelector('datium-clock-middle');
        this.hourHandElement = <HTMLElement>picker.querySelector('datium-hour-hand');
        
        this.clockMiddleElement.innerText = this.meridiem;
        this.tickLabels = [];
        for (let hour = 1; hour <= 12; hour++) {
            let angle = (hour - 6) * 30;
            let label = hour.toString();
            let data = hour;
            if (this.meridiem === 'pm') data += 12;
            if (hour === 12) data -= 12;
            this.clockElement.appendChild(this.mkTick(angle, label, data));
        }
        this.timeDragElement = <HTMLElement>picker.querySelector('.datium-time-drag');
        this.rotation = 180;
        this.time = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        if (this.time === 0) this.time = 12;
        this.setTimeDragRotation(this.timeToRotation(this.time));
        this.updateTime(this.time);
        
        this.setHourRotationFromTime(this.time);
    }
    
    private tickLabels:HTMLElement[];
    
    private mkTick(angle:number, label:string, data:number):HTMLElement {
        let tick = document.createElement('datium-tick');
        let tickLabel = document.createElement('datium-tick-label');
        
        tickLabel.innerText = label;
        tickLabel.style.transform = `rotate(${-angle}deg)`;
        tickLabel.setAttribute('datium-data', data.toString());
        tickLabel.className = 'datium-hour-selectable';
        tick.appendChild(document.createElement('datium-tick-mark'));
        tick.appendChild(tickLabel);
        tick.style.transform = `rotate(${angle}deg)`;
        
        this.tickLabels.push(tickLabel);
        return tick;
    }
}