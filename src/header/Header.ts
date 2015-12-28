import {onTap} from 'src/common/Events';
import ViewManager, {ViewLevel} from 'src/common/ViewManager';

export default class Header {
	private decadeLabel:Element;
	private yearLabel:Element;
	private monthLabel:Element;
	private dayLabel:Element;
	private hourLabel:Element;
	private minuteLabel:Element;
	
	private decadeLabelText:HTMLElement;
	private yearLabelText:HTMLElement;
	private monthLabelText:HTMLElement;
	private dayLabelText:HTMLElement;
	private hourLabelText:HTMLElement;
	private minuteLabelText:HTMLElement;
	
	private decadeExtendedLabelText:HTMLElement;
	private yearExtendedLabelText:HTMLElement;
	private monthExtendedLabelText:HTMLElement;
	private dayExtendedLabelText:HTMLElement;
	private hourExtendedLabelText:HTMLElement;
	private minuteExtendedLabelText:HTMLElement;
	
	constructor(el:Element, private viewManager:ViewManager) {
		
		this.decadeLabel = el.querySelector('.datium-decade-label');
		this.yearLabel = el.querySelector('.datium-year-label');
		this.monthLabel = el.querySelector('.datium-month-label');
		this.dayLabel = el.querySelector('.datium-day-label');
		this.hourLabel = el.querySelector('.datium-hour-label');
		this.minuteLabel = el.querySelector('.datium-minute-label');
		
		this.decadeLabelText = <HTMLElement>this.decadeLabel.querySelector('datium-label-text');
		this.yearLabelText = <HTMLElement>this.yearLabel.querySelector('datium-label-text');
		this.monthLabelText = <HTMLElement>this.monthLabel.querySelector('datium-label-text');
		this.dayLabelText = <HTMLElement>this.dayLabel.querySelector('datium-label-text');
		this.hourLabelText = <HTMLElement>this.hourLabel.querySelector('datium-label-text');
		this.minuteLabelText = <HTMLElement>this.minuteLabel.querySelector('datium-label-text');
				
		this.decadeExtendedLabelText = <HTMLElement>this.decadeLabel.querySelector('datium-extended-label-text');
		this.yearExtendedLabelText = <HTMLElement>this.yearLabel.querySelector('datium-extended-label-text');
		this.monthExtendedLabelText = <HTMLElement>this.monthLabel.querySelector('datium-extended-label-text');
		this.dayExtendedLabelText = <HTMLElement>this.dayLabel.querySelector('datium-extended-label-text');
		this.hourExtendedLabelText = <HTMLElement>this.hourLabel.querySelector('datium-extended-label-text');
		this.minuteExtendedLabelText = <HTMLElement>this.minuteLabel.querySelector('datium-extended-label-text');
		
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
	
	private months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
	
	private days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
	
	private updateLabels(date:Date, level:ViewLevel):void {
		// Decade
		let decadeStart = date.getFullYear();
		while (decadeStart % 10 !== 0) decadeStart--;
		let decadeText = decadeStart + ' - ' + (decadeStart + 10);
		// Year
		let yearText = date.getFullYear().toString();
		// Month
		let monthText = this.months[date.getMonth()];
		// Day
		let day = date.getDate();
		let dayPrefix = '';
		if (day < 10) {
			dayPrefix = '0';
		}
		let dayText = this.days[date.getDay()] + ' ' + dayPrefix + day;
		// Hour
		let hour = date.getHours();
		let meridiem = 'AM';
		if (hour === 0) {
			hour = 12;
		} else if (hour === 12) {
			meridiem = 'PM';
		} else if (hour > 12) {
			hour -= 12;
			meridiem = 'PM';
		}
		let hourPrefix = '';
		if (hour < 10) {
			hourPrefix = '0';
		}
		let hourText = hourPrefix + hour + meridiem;
		// Minute
		let minute = date.getMinutes();
		let minutePrefix = '';
		if (minute < 10) {
			minutePrefix = '0';
		}
		let minuteText = hourPrefix + hour + ':' + minutePrefix + minute + meridiem;
		
		this.decadeLabelText.innerText = decadeText;
		this.yearLabelText.innerText = yearText;
		this.monthLabelText.innerText = monthText;
		this.monthExtendedLabelText.innerText = yearText;		
		this.dayLabelText.innerText = dayText;
		this.dayExtendedLabelText.innerText = monthText + ' ' + yearText;
		this.hourLabelText.innerText = level === ViewLevel.MINUTE ? '' : hourText;
		this.hourExtendedLabelText.innerText = dayText + ' ' + monthText + ' ' + yearText;
		this.minuteLabelText.innerText = minuteText;
	}
	
	private viewChanged(date:Date, level:ViewLevel):void {
		this.updateLabels(date, level);
		if (level === ViewLevel.DECADE) {
			this.mkBottom(this.decadeLabel);
			this.mkHiddenBottom(this.yearLabel, this.monthLabel, this.dayLabel, this.hourLabel, this.minuteLabel);
		}
		if (level === ViewLevel.YEAR) {
			this.mkTop(this.decadeLabel);
			this.mkBottom(this.yearLabel);
			this.mkHiddenBottom(this.monthLabel, this.dayLabel, this.hourLabel, this.minuteLabel);
		}
		if (level === ViewLevel.MONTH) {
			this.mkHiddenTop(this.decadeLabel);
			this.mkTop(this.yearLabel);
			this.mkBottom(this.monthLabel);
			this.mkHiddenBottom(this.dayLabel, this.hourLabel, this.minuteLabel);			
		}
		if (level === ViewLevel.DAY) {
			this.mkHiddenTop(this.decadeLabel, this.yearLabel);
			this.mkTop(this.monthLabel);
			this.mkBottom(this.dayLabel);
			this.mkHiddenBottom(this.hourLabel, this.minuteLabel);			
		}
		if (level === ViewLevel.HOUR) {
			this.mkHiddenTop(this.decadeLabel, this.yearLabel, this.monthLabel);
			this.mkTop(this.dayLabel);
			this.mkBottom(this.hourLabel);
			this.mkHiddenBottom(this.minuteLabel);			
		}
		if (level === ViewLevel.MINUTE) {
			this.mkHiddenTop(this.decadeLabel, this.yearLabel, this.monthLabel, this.dayLabel);
			this.mkTop(this.hourLabel);
			this.mkBottom(this.minuteLabel);	
		}
		if (level === ViewLevel.SECOND) {
			this.mkHiddenTop(this.decadeLabel, this.yearLabel, this.monthLabel, this.dayLabel, this.hourLabel);
			this.mkTop(this.minuteLabel);
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