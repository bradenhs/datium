import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import clockTemplate from 'src/pickers/clock.html!text';
import {onDrag, onTap} from 'src/common/Events';
import TimePicker from 'src/pickers/TimePicker';

export default class HourPicker extends TimePicker {
    private meridiem:string;
    
	constructor(container:HTMLElement, viewManager:ViewManager) {
        super(container, viewManager, 'datium-hour');
        onTap(container, "datium-clock-middle", (e:Event) => {
            this.switchMeridiem();
        });
    }
    
    protected updateTimeBubbleElement():void {
        let timeBubbleRotation = -this.rotation;
        this.timeBubbleElement.innerText = this.time.toString() + this.meridiem;
        this.timeBubbleElement.style.transform = `rotate(${timeBubbleRotation}deg)`;        
    }    
    
    protected dragMove(e:Event):void {
        let lastTime = this.time;
        super.dragMove(e);
        if ((lastTime === 11 && this.time === 12) || (lastTime === 12 && this.time === 11)) {
            this.switchMeridiem();
        }
    }
    
    protected getZoomToTime():number {
        let zoomToTime = this.meridiem === 'PM' ? this.time + 12 : this.time;
        if (zoomToTime === 12 || zoomToTime === 24) zoomToTime -= 12;
        return zoomToTime;
    }
    
    private switchMeridiem():void {
        this.meridiem = this.meridiem === 'AM' ? 'PM' : 'AM';
        this.clockMiddleElement.innerText = this.meridiem;
        this.updateCurrentPickElement();
        for (let key in this.tickLabels) {
            let tickLabel = this.tickLabels[key];
            let data = parseInt(tickLabel.getAttribute('datium-data'));
            data = this.meridiem === 'AM' ? data - 12 : data + 12;
            tickLabel.setAttribute('datium-data', data.toString());
        }
    }   
    
    protected getLabelFromTickPosition(tickPosition:number):string {
        return tickPosition.toString();
    }  
    
    protected populatePicker(picker:HTMLElement, date:Date):void {
        this.meridiem = date.getHours() < 12 ? 'AM' : 'PM';
        super.populatePicker(picker, date);
        this.clockMiddleElement.innerText = this.meridiem;
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
    
    protected updateCurrentPickElement():void {
        this.currentPickElement.innerText = this.time.toString() + this.meridiem;
    }
    
    protected setInitialTime(date:Date):void {
        this.time = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        if (this.time === 0) this.time = 12;
    }
    
    protected updateHandElements():void {
        let angle = this.timeToRotation(this.time);
        this.hourHandElement.style.transform = `rotate(${angle}deg)`;        
    }
    
    protected getDataFromTickPosition(tickPosition:number):number {
        let data = tickPosition;
        if (this.meridiem === 'PM') data += 12;
        if (tickPosition === 12) data -= 12;
        return data;        
    }
        
    
}