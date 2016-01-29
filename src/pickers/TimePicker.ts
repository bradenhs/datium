import {Picker} from 'src/pickers/Picker';
import ViewManager, {ViewLevel} from 'src/common/ViewManager';
import {onDrag} from 'src/common/Events';
import clockTemplate from 'src/pickers/clock.html!text';
import Header from 'src/header/Header';
import {IDatiumOptions} from 'src/DatiumOptions';

export default class TimePicker extends Picker {
    protected rotation:number;
    protected time:number;
    protected meridiem:string;
    
    protected timeDragElement:HTMLElement;
    protected clockElement:Element;
    protected clockMiddleElement:HTMLElement;
    protected timeBubbleElement:HTMLElement;
    protected hourHandElement:HTMLElement;
    protected minuteHandElement:HTMLElement;
    protected secondHandElement:HTMLElement;
    
    protected currentTimeElement:HTMLElement;
    
    constructor(container:HTMLElement, private viewManager:ViewManager, private selectorPrefix:string, protected header:Header, opts:IDatiumOptions) {
        super(container, viewManager, selectorPrefix, opts);
        this.height = this.opts.small ? 210 : 260;
        onDrag(container, selectorPrefix+'-time-drag', {
           dragStart: (e:Event) => { this.dragStart(e); },
           dragMove: (e:MouseEvent) => { this.dragMove(e); },
           dragEnd: (e:Event) => { this.dragEnd(e); }            
        });
    }
    
    public isDragging:boolean = false;
    
    private dragStart(e:Event):void {
        this.container.parentElement.classList.add('datium-is-dragging');
        this.isDragging = true;
        this.dragMove(e);
    }
    
    
    protected dragMove(e:Event):void {
        let half = this.opts.small ? 60 : 80;
        let centerX = this.clockElement.getBoundingClientRect().left + half;
        let centerY = this.clockElement.getBoundingClientRect().top + half;
        
        let clientX = (<MouseEvent>e).clientX === void 0 ? (<TouchEvent>e).touches[0].clientX : (<MouseEvent>e).clientX;
        let clientY = (<MouseEvent>e).clientY === void 0 ? (<TouchEvent>e).touches[0].clientY : (<MouseEvent>e).clientY;
        
        let offsetX = centerX - clientX;
        let offsetY = centerY - clientY;        
        
        let lastRotation = this.rotation;
        let newRotation = this.normalizeRotation(180-Math.atan2(offsetX, offsetY)*180/Math.PI);
        
        let newTime = this.rotationToTime(newRotation);
        
        let lastMeridiem = this.meridiem;
        this.rotation = newRotation;
        if (this.shouldSwitchMeridiem(this.time, newTime)) {
            this.meridiem = this.meridiem === 'PM' ? 'AM' : 'PM';
        }
        this.rotation = lastRotation;
        
        if (!this.isInactive(newTime)) {
            this.time = newTime;
            this.rotation = newRotation;
        }
        
        this.meridiem = lastMeridiem;
        
        this.updateTimeDragElement();
        this.updateHeaderTime();
        this.updateHandElements();
        this.updateTimeBubbleElement();
    }
    
    private dragEnd(e:Event):void {
        this.rotation = this.timeToRotation(this.time);
        this.updateHeaderTime();  
        this.container.parentElement.classList.remove('datium-is-dragging');
        if (!this.isInactive(this.time)) {  
            this.viewManager.zoomTo(this.getZoomToTime());
        }
        this.isDragging = false;
    }
    
    protected updateTimeDragElement():void {
        (<any>this.timeDragElement.style).msTransform = `rotate(${this.rotation}deg)`;
        this.timeDragElement.style.webkitTransform = `rotate(${this.rotation}deg)`;  
        this.timeDragElement.style.transform = `rotate(${this.rotation}deg)`;        
    }
    
    protected mkTick(angle:number, label:string, data:number):HTMLElement {
        let tick = document.createElement('datium-tick');
        tick.classList.add('datium-active-capable');
        let tickLabel = document.createElement('datium-tick-label');
        tickLabel.classList.add('datium-active-capable');
        tickLabel.innerHTML = `<datium-span class="${this.selectorPrefix}-selectable datium-active-capable" datium-data="${data}">${label}</datium-span>`;
        
        (<any>tickLabel.style).msTransform = `rotate(${-angle}deg)`;
        tickLabel.style.webkitTransform = `rotate(${-angle}deg)`;  
        tickLabel.style.transform = `rotate(${-angle}deg)`;
        
        tick.appendChild(document.createElement('datium-tick-mark'));
        
        if (this.appendTickLabel(data)) {
            tick.appendChild(tickLabel);
        }
        
        if (this.isInactive(data)) {
            tick.classList.add('datium-time-inactive');
        }
        
        (<any>tick.style).msTransform = `rotate(${angle}deg)`;
        tick.style.webkitTransform = `rotate(${angle}deg)`;  
        tick.style.transform = `rotate(${angle}deg)`;
        
        return tick;
    }
    
    private appendTickLabel(num:number):boolean {
        let interval;
        switch (this.viewManager.getViewLevel()) {
            case ViewLevel.HOUR:
                interval = this.opts.hourSelectionInterval;
                break;
            case ViewLevel.MINUTE:
                interval = this.opts.minuteSelectionInterval;
                break;
            case ViewLevel.SECOND:
                interval = this.opts.secondSelectionInterval;
                break;
        }
        return num % interval === 0;
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
            case ViewLevel.HOUR: className = 'datium-hour-view'; break;
            case ViewLevel.MINUTE: className = 'datium-minute-view'; break;
            case ViewLevel.SECOND: className = 'datium-second-view'; break;
        }
        picker.classList.add(className);        
        
        this.hourHandElement = <HTMLElement>picker.querySelector('datium-hour-hand');
        this.minuteHandElement = <HTMLElement>picker.querySelector('datium-minute-hand');
        this.secondHandElement = <HTMLElement>picker.querySelector('datium-second-hand');
        this.clockElement = <HTMLElement>picker.querySelector('datium-clock');
        this.clockMiddleElement = <HTMLElement>picker.querySelector('datium-clock-middle');
        this.timeBubbleElement = <HTMLElement>picker.querySelector('datium-time-bubble');
        this.currentTimeElement = <HTMLElement>picker.querySelector('datium-current-time');
        
        
        this.updateCurrentTimeElement();
        
        for (let tickPosition = 1; tickPosition <= 12; tickPosition++) {
            let angle = (tickPosition - 6) * 30;
            let label = this.getLabelFromTickPosition(tickPosition);
            let padding = '';
            if (label.length < 2) padding = '0';
            label += '<datium-bubble>'+padding+label+'</datium-bubble>';
            
            let data = this.getDataFromTickPosition(tickPosition);
            
            this.clockElement.appendChild(this.mkTick(angle, label, data));
        }
        
        this.timeDragElement = <HTMLElement>picker.querySelector('.datium-time-drag');
        this.timeDragElement.classList.add(this.selectorPrefix+'-time-drag');    
        this.setInitialTime(date);    
        this.rotation = this.timeToRotation(this.time);
        this.updateTimeDragElement();           
        this.updateHandElements();
        this.updateHeaderTime();
    }
    
    protected updateCurrentTimeElement():void {
        let curTimeRotation = this.getCurrentTimeRotation(this.date, this.viewManager.getSelectedDate());
        
        (<any>this.currentTimeElement.style).msTransform = `rotate(${curTimeRotation}deg)`;
        this.currentTimeElement.style.webkitTransform = `rotate(${curTimeRotation}deg)`;  
        this.currentTimeElement.style.transform = `rotate(${curTimeRotation}deg)`;
        
        if (curTimeRotation === void 0) {
            this.currentTimeElement.classList.add('datium-hide-current-time');
        } else {
            this.currentTimeElement.classList.remove('datium-hide-current-time');
        }
    }
    
    protected padNum(num:number):string {
        return num < 10 ? '0' + num.toString() : num.toString();
    }
    
    // Overridable
    protected getCurrentTimeRotation(date:Date, selectedDate:Date):number { throw this.EmptyMethodException('getCurrentTimeRotation'); }
    protected getLabelFromTickPosition(tickPosition:number):string { throw this.EmptyMethodException('getLabelFromTickPosition'); }
    protected getDataFromTickPosition(tickPosition:number):number { throw this.EmptyMethodException('getDataFromTickPosition'); }
    protected rotationToTime(rotation:number):number { throw this.EmptyMethodException('rotationToTime'); }
    protected timeToRotation(time:number):number { throw this.EmptyMethodException('timeToRotation'); }
    protected setInitialTime(date:Date):void { throw this.EmptyMethodException('setInitialTime'); }
    protected getZoomToTime():number { throw this.EmptyMethodException('getZoomToTime'); }
    protected updateTimeBubbleElement():void { throw this.EmptyMethodException('updateTimeBubbleElement'); }
    protected updateHandElements():void { throw this.EmptyMethodException('updateHandElements'); }
    protected updateHeaderTime():void { throw this.EmptyMethodException('updateHeaderTime'); }
    protected isInactive(data:number):boolean { throw this.EmptyMethodException('isInactive'); }
    protected shouldSwitchMeridiem(lastTime?:number, newTime?:number):boolean { throw this.EmptyMethodException('shouldSwitchMeridiem'); }
    
    private EmptyMethodException(methodName:string) {
        return new Error(`Method "${methodName}" needs to be overrriden`);
    }
}