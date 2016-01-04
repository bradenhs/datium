import {Picker} from 'src/pickers/Picker';
import ViewManager, {ViewLevel} from 'src/common/ViewManager';
import {onDrag} from 'src/common/Events';
import clockTemplate from 'src/pickers/clock.html!text';

export default class TimePicker extends Picker {
    protected rotation:number;
    protected time:number;
    protected meridiem:string;
    protected tickLabels:HTMLElement[];
    
    protected timeDragElement:HTMLElement;
    protected clockElement:Element;
    protected clockMiddleElement:HTMLElement;
    protected timeBubbleElement:HTMLElement;
    protected hourHandElement:HTMLElement;
    protected minuteHandElement:HTMLElement;
    protected secondHandElement:HTMLElement;
    
    constructor(container:HTMLElement, private viewManager:ViewManager, private selectorPrefix:string) {
        super(container, viewManager, selectorPrefix);
        this.height = 330;
        onDrag(container, selectorPrefix+'-time-drag', {
           dragStart: (e:Event) => { this.dragStart(e); },
           dragMove: (e:MouseEvent) => { this.dragMove(e); },
           dragEnd: (e:Event) => { this.dragEnd(e); }            
        });
    }
    
    private dragStart(e:Event):void {
        this.timeDragElement.classList.add('datium-is-dragging');        
        this.dragMove(e);
    }
    
    protected dragMove(e:Event):void {
        let centerX = this.clockElement.getBoundingClientRect().left + 100;
        let centerY = this.clockElement.getBoundingClientRect().top + 100;
        
        let clientX = (<MouseEvent>e).clientX === void 0 ? (<TouchEvent>e).touches[0].clientX : (<MouseEvent>e).clientX;
        let clientY = (<MouseEvent>e).clientY === void 0 ? (<TouchEvent>e).touches[0].clientY : (<MouseEvent>e).clientY;
        
        let offsetX = centerX - clientX;
        let offsetY = centerY - clientY;        
        
        let newRotation = 180-Math.atan2(offsetX, offsetY)*180/Math.PI;        
        this.rotation = this.normalizeRotation(newRotation);
        
        this.updateTimeDragElement();
        
        this.time = this.rotationToTime(this.rotation);
        
        this.updateHandElements();
        this.updateTimeBubbleElement();   
    }
    
    
    
    private dragEnd(e:Event):void {
        this.rotation = this.timeToRotation(this.time);
        this.updateTimeDragElement();
        this.timeDragElement.classList.remove('datium-is-dragging');        
        this.viewManager.zoomTo(this.getZoomToTime());
    }

    
    private updateTimeDragElement():void {
        this.timeDragElement.style.transform = `rotate(${this.rotation}deg)`;        
    }
    
    
    
    protected mkTick(angle:number, label:string, data:number):HTMLElement {
        let tick = document.createElement('datium-tick');
        let tickLabel = document.createElement('datium-tick-label');
        
        tickLabel.innerText = label;
        tickLabel.style.transform = `rotate(${-angle}deg)`;
        tickLabel.setAttribute('datium-data', data.toString());
        tickLabel.className = this.selectorPrefix + '-selectable';
        tick.appendChild(document.createElement('datium-tick-mark'));
        tick.appendChild(tickLabel);
        tick.style.transform = `rotate(${angle}deg)`;
        
        this.tickLabels.push(tickLabel);
        return tick;
    }
    
    protected normalizeRotation(newRotation:number):number {
        while (newRotation + 180 < this.rotation) newRotation += 360;
        while (newRotation - 180 > this.rotation) newRotation -= 360;
        return newRotation;
    }
    
    protected date:Date;
    
    protected populatePicker(picker:HTMLElement, date:Date):void {
        this.meridiem = date.getHours() < 12 ? 'AM' : 'PM';
        this.date = date;
        picker.innerHTML = clockTemplate;
        
        let className:string = '';
        switch(this.viewManager.getViewLevel()) {
            case ViewLevel.DAY: className = 'datium-hour-view'; break;
            case ViewLevel.HOUR: className = 'datium-minute-view'; break;
            case ViewLevel.MINUTE: className = 'datium-second-view'; break;
        }
        picker.classList.add(className);        
        
        this.hourHandElement = <HTMLElement>picker.querySelector('datium-hour-hand');
        this.minuteHandElement = <HTMLElement>picker.querySelector('datium-minute-hand');
        this.secondHandElement = <HTMLElement>picker.querySelector('datium-second-hand');
        this.clockElement = <HTMLElement>picker.querySelector('datium-clock');
        this.clockMiddleElement = <HTMLElement>picker.querySelector('datium-clock-middle');
        
        this.timeBubbleElement = <HTMLElement>picker.querySelector('datium-time-bubble');
        
        
        this.tickLabels = [];
        for (let tickPosition = 1; tickPosition <= 12; tickPosition++) {
            let angle = (tickPosition - 6) * 30;
            let label = this.getLabelFromTickPosition(tickPosition);
            let data = this.getDataFromTickPosition(tickPosition);
            this.clockElement.appendChild(this.mkTick(angle, label, data));
        }
        this.timeDragElement = <HTMLElement>picker.querySelector('.datium-time-drag');
        this.timeDragElement.classList.add(this.selectorPrefix+'-time-drag');    
        this.setInitialTime(date);    
        this.rotation = this.timeToRotation(this.time);
        this.updateTimeDragElement();           
        this.updateHandElements();
    }
    
    protected padNum(num:number):string {
        return num < 10 ? '0' + num.toString() : num.toString();
    }
    
    
    
    // Overridable
    protected getLabelFromTickPosition(tickPosition:number):string { throw this.EmptyMethodException(); }
    protected getDataFromTickPosition(tickPosition:number):number { throw this.EmptyMethodException(); }
    protected rotationToTime(rotation:number):number { throw this.EmptyMethodException(); }
    protected timeToRotation(rotation:number):number { throw this.EmptyMethodException(); }
    protected setInitialTime(date:Date):void { throw this.EmptyMethodException(); }
    protected getZoomToTime():number { throw this.EmptyMethodException(); }
    protected updateTimeBubbleElement():void { throw this.EmptyMethodException(); }
    protected updateHandElements():void { throw this.EmptyMethodException(); }
    
    private EmptyMethodException() {
        return new Error('Method needs to be overrriden');
    }
}