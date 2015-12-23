import {Transition, IPicker} from 'src/pickers/IPicker';
import getTransitionClass from 'src/TransitionClass';
import {onTap} from 'src/Events';
import ViewManager from 'src/ViewManager';

export default class DayPicker implements IPicker {
	private element:HTMLElement;
	private height:number;
	constructor(private container:HTMLElement, private viewManager:ViewManager) {
		onTap(this.container, 'datium-day-selectable', (e:Event) => {
			let day = parseInt(e.srcElement.getAttribute('datium-day'));
			viewManager.zoomTo(day);
		});
	}
	
	public create(transition:Transition, date:Date):void {
		this.element = document.createElement('datium-picker-container');
		
		let d = new Date(date.valueOf());
		d.setDate(1);
		d.setDate(1 - d.getDay());
		
		for (let i = 0; i < 7; i++) {
			this.element.appendChild(this.mkDayLabel(i));
		}
		let rows = 1;
		do {
			for (let i = 0; i < 7; i++) {
				this.element.appendChild(this.mkDay(d, d.getMonth() !== date.getMonth()));
				d.setDate(1 + d.getDate());
			}
			rows++;
		} while(d.getMonth() === date.getMonth());
		this.height = rows * 40;
		this.element.className = getTransitionClass(transition);
		setTimeout(() => {
			this.element.className = getTransitionClass(Transition.NONE);
		}, 10);
		this.container.appendChild(this.element);
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
		el.setAttribute('datium-day', date.getDate().toString());
		if (inactive) {
			el.className = 'datium-day-inactive';
		} else {
			el.className = 'datium-day-selectable';
		}
		return el;
	}
	
	public getHeight():number {
		return this.height;
	}
	
	public destroy(transition:Transition):void {	
		this.element.className = getTransitionClass(transition);
		setTimeout((elToRemove:HTMLElement) => {
			elToRemove.remove();
			elToRemove = null;
		}, 300, this.element);
	}
	
}