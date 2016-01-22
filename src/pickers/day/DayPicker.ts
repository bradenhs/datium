import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import Header from 'src/header/Header';
import {IDatiumOptions} from 'src/DatiumOptions';

export default class DayPicker extends Picker {
	constructor(container:HTMLElement, private viewManager:ViewManager, opts:IDatiumOptions) {
        super(container, viewManager, 'datium-day', opts);
	}
	
	protected populatePicker(picker:HTMLElement, date:Date):void {	
        picker.classList.add('datium-day-view');	
		let d = new Date(date.valueOf());
		d.setDate(1);
		d.setDate(1 - d.getDay());
		
		for (let i = 0; i < 7; i++) {
			picker.appendChild(this.mkDayLabel(i));
		}
		let rows = 1;
		do {
			for (let i = 0; i < 7; i++) {
                let inactive = d.getMonth() !== date.getMonth();
                
                let dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, -1);
                let dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 1);
                
                if (this.opts.minDate !== void 0 && dEnd.valueOf() < this.opts.minDate.valueOf()) {
                    inactive = true;
                } else if (this.opts.maxDate !== void 0 && dStart.valueOf() > this.opts.maxDate.valueOf()) {
                    inactive = true;
                }   
				picker.appendChild(this.mkDay(d, inactive));
				d.setDate(1 + d.getDate());
			}
			rows++;
		} while(d.getMonth() === date.getMonth());
        if (this.opts.small) {
            this.height = rows * 24;
        } else {
            this.height = rows * 37;
        }
		
	}
	
	private days:string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
	
	private mkDayLabel(weekday:number):HTMLElement {
		let el = document.createElement('datium-day-element');
		el.innerText = this.days[weekday];
		el.className = 'datium-weekday-label';
		return el;
	}
	
	private mkDay(date:Date, inactive:boolean):HTMLElement {
		let el = document.createElement('datium-day-element');
		el.innerHTML = date.getDate().toString() + '<datium-bubble>' + date.getDate().toString() + '</datium-bubble>';
		el.setAttribute('datium-data', date.getDate().toString());
        let selectedDate = this.viewManager.getSelectedDate();
        if (date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()) {
            el.classList.add('datium-current-selection');
        }
		if (inactive) {
			el.classList.add('datium-day-inactive');
		} else {
            el.classList.add('datium-day-selectable');
		}
		return el;
	}	
}