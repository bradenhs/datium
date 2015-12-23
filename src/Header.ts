import {onTap} from 'src/Events';
import ViewManager, {ViewLevel} from 'src/ViewManager';

export default class Header {
	private decadeLabel:Element;
	private yearLabel:Element;
	private monthLabel:Element;
	private dayLabel:Element;
	private hourLabel:Element;
	private minuteLabel:Element;
	
	constructor(el:Element, private viewManager:ViewManager) {
		
		this.decadeLabel = el.querySelector('.datium-decade-label');
		this.yearLabel = el.querySelector('.datium-year-label');
		this.monthLabel = el.querySelector('.datium-month-label');
		this.dayLabel = el.querySelector('.datium-day-label');
		this.hourLabel = el.querySelector('.datium-hour-label');
		this.minuteLabel = el.querySelector('.datium-minute-label');
		
		// Bind events
		onTap(el, 'datium-top', () => {
			viewManager.zoomOut();
		});
		
		onTap(el.querySelector('datium-previous-view'), () => {
			viewManager.previous();
		});
		
		onTap(el.querySelector('datium-next-view'), () => {
			viewManager.next();
		});
		
		viewManager.registerObserver((date:Date, level:ViewLevel) => {
			this.viewChanged(date, level);
		});
	}
	
	private viewChanged(date:Date, level:ViewLevel):void {
		if (level === ViewLevel.DECADE) {
			this.mkHiddenTop();
			this.mkTop();
			this.mkBottom(this.decadeLabel);
			this.mkHiddenBottom(this.yearLabel, this.monthLabel, this.dayLabel, this.hourLabel, this.minuteLabel);
		}
		if (level === ViewLevel.YEAR) {
			this.mkTop(this.decadeLabel);
			this.mkBottom(this.yearLabel);
		}
		if (level === ViewLevel.MONTH) {
			
		}
		if (level === ViewLevel.DAY) {
			
		}
		if (level === ViewLevel.HOUR) {
			
		}
		if (level === ViewLevel.MINUTE) {
			
		}
		if (level === ViewLevel.SECOND) {
			
		}
	}
	
	private mkTop(...elements:Element[]) {
		for (let key in elements) {
			elements[key].className = 'datium-top';
		}
	}
	
	private mkHiddenTop(...elements:Element[]) {
		for (let key in elements) {
			elements[key].className = 'datium-top datium-hidden-top';
		}
	}
	
	private mkBottom(...elements:Element[]) {
		for (let key in elements) {
			elements[key].className = 'datium-bottom';
		}
	}
	
	private mkHiddenBottom(...elements:Element[]) {
		for (let key in elements) {
			elements[key].className = 'datium-bottom datium-hidden-bottom';
		}
	}
}