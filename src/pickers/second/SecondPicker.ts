import TimePicker from 'src/pickers/TimePicker';
import ViewManager from 'src/common/ViewManager';
import Header from 'src/header/Header';

export default class SecondPicker extends TimePicker {
    
	constructor(container:HTMLElement, viewManager:ViewManager, header:Header) {
        super(container, viewManager, 'datium-second', header);
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
    
    protected rotationToTime(rotation:number):number {
        let num = Math.round(rotation / 6) - 30;
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