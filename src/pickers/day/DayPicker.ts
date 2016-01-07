import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import Header from 'src/header/Header';

export default class DayPicker extends Picker {
	constructor(container:HTMLElement, private viewManager:ViewManager) {
        super(container, viewManager, 'datium-day');
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
				picker.appendChild(this.mkDay(d, d.getMonth() !== date.getMonth()));
				d.setDate(1 + d.getDate());
			}
			rows++;
		} while(d.getMonth() === date.getMonth());
		this.height = rows * 37;
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
		el.innerText = date.getDate().toString();
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