import TimePicker from 'src/pickers/TimePicker';
import ViewManager from 'src/common/ViewManager';
import Header from 'src/header/Header';
import {IDatiumOptions} from 'src/DatiumOptions';

export default class SecondPicker extends TimePicker {
    
	constructor(container:HTMLElement, viewManager:ViewManager, header:Header, opts:IDatiumOptions) {
        super(container, viewManager, 'datium-second', header, opts);
    }
    
    protected updateHandElements():void {
        this.secondHandElement.style.transform = `rotate(${this.rotation}deg)`;
        
        let minuteAngle = this.date.getMinutes() * 6 + 180;
        this.minuteHandElement.style.transform = `rotate(${minuteAngle}deg)`;
        
        let hourAngle = this.date.getHours() * 30 + 180 + this.rotationToTime(minuteAngle) / 2;
        this.hourHandElement.style.transform = `rotate(${hourAngle}deg)`;       
    }
    
    protected updateHeaderTime():void {
        let date = new Date(this.date.valueOf());
        date.setSeconds(this.time);
        this.header.updateMinuteLabel(date);
    }
    
    protected getLabelFromTickPosition(tickPosition:number):string {
        let label = tickPosition * 5;
        if (label === 60) label = 0;
        return this.padNum(label);
    }
    
    protected getDataFromTickPosition(tickPosition:number):number {
        let data = tickPosition * 5 
        return data === 60 ? 0 : data;        
    }
      
    protected setInitialTime(date:Date):void {
        this.time = date.getSeconds();
    }
    
    protected timeToRotation(time:number):number {
        return this.normalizeRotation(time * 6 + 180);
    }
    
    protected getZoomToTime():number {
        return this.time;
    }
    
    protected shouldSwitchMeridiem():boolean {
        return false;
    }
    
    protected isInactive(data:number):boolean {
        if (this.opts.minDate !== void 0) {
            let endDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.date.getHours(), this.date.getMinutes(), data + 1, 1);
            if (endDate.valueOf() < this.opts.minDate.valueOf()) return true;
        }
        
        if (this.opts.maxDate !== void 0) {
            let startDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.date.getHours(), this.date.getMinutes(), data, -1);
            if (startDate.valueOf() > this.opts.maxDate.valueOf()) return true;
        }
        
        return false;
    }
    
    protected getCurrentTimeRotation(date:Date, selectedDate:Date):number {
        if (date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate() &&
            date.getHours() === selectedDate.getHours() &&
            date.getMinutes() === selectedDate.getMinutes()) {
            return this.timeToRotation(selectedDate.getSeconds());    
        }
        return void 0;
    }
    
    protected rotationToTime(rotation:number):number {
        let num = Math.round(rotation / 6) - 30;
        num = Math.round(num / this.opts.secondSelectionInterval) * this.opts.secondSelectionInterval;
        while(num < 0) num += 60;
        while(num >= 60) num -= 60;
        return num;
    }
    
    protected updateTimeBubbleElement():void {
        let timeBubbleRotation = -this.rotation;
        this.timeBubbleElement.innerText = this.padNum(this.time) + 's';
        this.timeBubbleElement.style.transform = `rotate(${timeBubbleRotation}deg)`;        
    } 
}