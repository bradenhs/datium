import TimePicker from 'src/pickers/TimePicker';
import ViewManager from 'src/common/ViewManager';

export default class SecondPicker extends TimePicker {
    
	constructor(container:HTMLElement, viewManager:ViewManager) {
        super(container, viewManager, 'datium-second');
    }
    
    protected updateHandElements():void {
        let secondAngle = this.timeToRotation(this.time);
        this.secondHandElement.style.transform = `rotate(${secondAngle}deg)`;
        
        let minuteAngle = this.date.getMinutes() * 5 + 180;
        this.minuteHandElement.style.transform = `rotate(${minuteAngle}deg)`;
        
        let hourAngle = this.date.getHours() * 30 + 180;
        this.hourHandElement.style.transform = `rotate(${hourAngle}deg)`;       
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
        while(num < 0) num += 60;
        while(num > 60) num -= 60;
        return num;
    }
    
    protected updateCurrentPickElement():void {
        this.currentPickElement.innerText = this.padNum(this.time) + 's';
    }
    
    private padNum(num:number):string {
        return num < 10 ? '0' + num.toString() : num.toString();
    }
    
    protected updateTimeBubbleElement():void {
        let timeBubbleRotation = -this.rotation;
        this.timeBubbleElement.innerText = this.padNum(this.time) + 's';
        this.timeBubbleElement.style.transform = `rotate(${timeBubbleRotation}deg)`;        
    } 
}