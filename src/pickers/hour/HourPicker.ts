import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import clockTemplate from 'src/pickers/clock.html!text';

export default class HourPicker extends Picker {
    
	constructor(container:HTMLElement, private viewManager:ViewManager) {
        super(container, viewManager, 'datium-hour-selectable');
        this.height = 300;
    }
    
    protected populatePicker(picker:HTMLElement, date:Date):void {
        picker.innerHTML = clockTemplate;
        let meridiem = date.getHours() < 12 ? 'am' : 'pm';
        let clock = picker.querySelector('datium-clock');
        
        for (let hour = 1; hour <= 12; hour++) {
            let angle = (hour - 6) * 30;
            let label = hour.toString() + meridiem;
            let data = hour;
            if (meridiem === 'pm') data += 12;
            if (hour === 12) data -= 12;            
            clock.appendChild(this.mkTick(angle, label, data));
        }
    }
    
    private mkTick(angle:number, label:string, data:number):HTMLElement {
        let tick = document.createElement('datium-tick');
        let tickLabel = document.createElement('datium-tick-label');
        
        tickLabel.innerText = label;
        tickLabel.style.transform = `rotate(${-angle}deg)`;
        tickLabel.setAttribute('datium-data', data.toString());
        //tickLabel.className = 'datium-hour-selectable';
        tick.appendChild(document.createElement('datium-tick-mark'));
        tick.appendChild(tickLabel);
        
        tick.style.transform = `rotate(${angle}deg)`;
        
        return tick;
    }
}