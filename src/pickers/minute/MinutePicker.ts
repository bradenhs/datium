import TimePicker from 'src/pickers/TimePicker';
import ViewManager from 'src/common/ViewManager';
import Header from 'src/header/Header';
import {IDatiumOptions} from 'src/DatiumOptions';

export default class MinutePicker extends TimePicker {
    
	constructor(container:HTMLElement, viewManager:ViewManager, header:Header, opts:IDatiumOptions) {
        super(container, viewManager, 'datium-minute', header, opts);
    }
    
    protected updateHandElements():void {
        this.minuteHandElement.style.transform = `rotate(${this.rotation}deg)`;
        
        let hourAngle = this.date.getHours() * 30 + 180 + this.time/2;
        this.hourHandElement.style.transform = `rotate(${hourAngle}deg)`;       
    }
    
    protected updateHeaderTime():void {
        let date = new Date(this.date.valueOf());
        date.setMinutes(this.time);
        this.header.updateHourLabel(date);
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
        this.time = date.getMinutes();
    }
    
    protected timeToRotation(time:number):number {
        return this.normalizeRotation(time * 6 + 180);
    }
    
    protected getZoomToTime():number {
        return this.time;
    }
    
    protected rotationToTime(rotation:number):number {
        let num = Math.round(rotation / 6) - 30;
        num = Math.round(num / this.opts.minuteSelectionInterval) * this.opts.minuteSelectionInterval;
        while(num < 0) num += 60;
        while(num >= 60) num -= 60;
        return num;
    }
    
    protected getCurrentTimeRotation(date:Date, selectedDate:Date):number {
        if (date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate() &&
            date.getHours() === selectedDate.getHours()) {
            return this.timeToRotation(selectedDate.getMinutes());    
        }
        return void 0;
    }
    
    protected updateTimeBubbleElement():void {
        let timeBubbleRotation = -this.rotation;
        this.timeBubbleElement.innerHTML = this.padNum(this.time)+'m';
        this.timeBubbleElement.style.transform = `rotate(${timeBubbleRotation}deg)`;        
    } 
}