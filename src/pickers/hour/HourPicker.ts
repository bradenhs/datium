import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import clockTemplate from 'src/pickers/clock.html!text';
import {onDrag, onTap} from 'src/common/Events';
import TimePicker from 'src/pickers/TimePicker';
import Header from 'src/header/Header';

export default class HourPicker extends TimePicker {
    
	constructor(container:HTMLElement, viewManager:ViewManager, header:Header) {
        
        super(container, viewManager, 'datium-hour', header);
        
        onTap(container, 'datium-meridiem-switcher', () => {
           this.switchMeridiem();
        });
    }
    
    protected updateTimeBubbleElement():void {
        let timeBubbleRotation = -this.rotation;
        this.timeBubbleElement.innerText = this.padNum(this.time) + this.meridiem;
        this.timeBubbleElement.style.transform = `rotate(${timeBubbleRotation}deg)`;        
    }    
    
    protected updateHeaderTime():void {
        let date = new Date(this.date.valueOf());
        let hours = this.time;
        if (this.meridiem === 'PM' && hours !== 12) {
            hours += 12;
        } else if (this.meridiem === 'AM' && hours === 12) {
            hours = 0;
        }
        date.setHours(hours);
        this.header.updateDayLabel(date);
    }
    
    protected dragMove(e:Event):void {
        let lastTime = this.time;
        super.dragMove(e);
        if (lastTime !== this.time) {
            if (Math.round((this.rotation + 15) / 360) % 2 === 0) {
                if (this.meridiem === 'PM') this.switchMeridiem();
            } else {
                if (this.meridiem === 'AM') this.switchMeridiem();
            }
        }
    }
    
    protected getZoomToTime():number {
        let zoomToTime = this.meridiem === 'PM' ? this.time + 12 : this.time;
        if (zoomToTime === 12 || zoomToTime === 24) zoomToTime -= 12;
        return zoomToTime;
    }
    
    private switchMeridiem():void {
        this.meridiem = this.meridiem === 'AM' ? 'PM' : 'AM';
        this.updateMeridiemPicker();
        this.updateHeaderTime();
        this.updateTimeBubbleElement();
    }   
    
    private updateMeridiemPicker():void {
        let meridemSwitcher = this.clockElement.querySelector('datium-meridiem-switcher');        
        if (this.meridiem === 'AM') {
            meridemSwitcher.classList.remove('datium-pm');
            meridemSwitcher.classList.add('datium-am');
        } else {
            meridemSwitcher.classList.remove('datium-am');
            meridemSwitcher.classList.add('datium-pm');
        }
    }
    
    protected populatePicker(picker:HTMLElement, date:Date):void {
        super.populatePicker(picker, date);
        this.updateMeridiemPicker();
    }
    
    protected getLabelFromTickPosition(tickPosition:number):string {
        return tickPosition.toString();
    }
    
    protected getCurrentTimeRotation(date:Date, selectedDate:Date):number {
        if (date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()) {
            return this.timeToRotation(selectedDate.getHours());    
        }
        return void 0;
    }
    
    protected rotationToTime(rotation:number):number {
        let num = rotation / 30 - 6;
        num = Math.round(num < 0 ? num + 12 : num);
        while(num < 0) num += 12;
        while(num > 12) num -= 12;
        return num === 0 ? 12 : num;
    }
    
    protected timeToRotation(time:number):number {
        return this.normalizeRotation(time * 30 + 180);
    }
    
    protected setInitialTime(date:Date):void {
        this.time = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        if (this.time === 0) this.time = 12;
    }
    
    protected updateHandElements():void {
        this.hourHandElement.style.transform = `rotate(${this.rotation}deg)`;        
    }
    
    protected getDataFromTickPosition(tickPosition:number):number {
        if (tickPosition === 12) {
            return 0;
        } else {
            return tickPosition;
        }        
    }       
    
}