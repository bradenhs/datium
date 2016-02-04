import {onTap} from 'src/common/Events';
import ViewManager, {ViewLevel} from 'src/common/ViewManager';
import {IDatiumOptions} from 'src/DatiumOptions';

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
    
    private nextViewElement:Element;
    private previousViewElement:Element;
    
    private spanLabelsContainer:Element;
	
	constructor(el:Element, private viewManager:ViewManager, private opts:IDatiumOptions) {
        this.spanLabelsContainer = el.querySelector('datium-span-labels');
        
        this.nextViewElement = el.querySelector('datium-next-view');
        this.previousViewElement = el.querySelector('datium-previous-view');
        
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
		
        switch(this.opts.maxView) {
            case ViewLevel.SECOND:
                this.hourLabel.classList.add('datium-max-view');
                break;
            case ViewLevel.MINUTE:
                this.dayLabel.classList.add('datium-max-view');
                break;
            case ViewLevel.MERIDIEM:    
            case ViewLevel.HOUR:
                this.monthLabel.classList.add('datium-max-view');
                break;
            case ViewLevel.DAY:
            case ViewLevel.DATE:
                this.yearLabel.classList.add('datium-max-view');
                break;
            case ViewLevel.MONTH:
                this.decadeLabel.classList.add('datium-max-view');
                break;
        }
        
		// Bind events
		onTap(el.querySelector('datium-span-labels'), () => {
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
	
	private days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
	
    public updateDayLabel(date:Date) {
        if (this.level === ViewLevel.HOUR || this.level === ViewLevel.MERIDIEM) {
            if (this.opts.militaryTime) {
                this.dayLabelText.innerHTML = this.getDayText(date) + ' <datium-changing-label>' + this.getHourText(date) + '</datium-changing-label>';
            } else {
                this.dayLabelText.innerHTML = this.getDayText(date) + ' <datium-changing-label>' + this.getHourText(date) + this.getMeridiemText(date) + '</datium-changing-label>';
            }
        } else {
            this.dayLabelText.innerHTML = this.getDayText(date);
        }
    }
    
    public updateHourLabel(date:Date) {
        if (this.level === ViewLevel.SECOND) {
            this.hourLabelText.innerHTML = '';    
        } else if (this.level === ViewLevel.MINUTE) {
            this.hourLabelText.innerHTML = this.getHourText(date) + ':<datium-changing-label>' + this.getMinuteText(date) + '</datium-changing-label>';
            if (!this.opts.militaryTime) {
                this.hourLabelText.innerHTML += this.getMeridiemText(date);   
            }
        } else {
            this.hourLabelText.innerHTML = this.getHourText(date);
            if (!this.opts.militaryTime) {
                this.hourLabelText.innerHTML += this.getMeridiemText(date); 
            }
        }
    }
    
    public updateMinuteLabel(date:Date) {
        if (this.level === ViewLevel.SECOND) {            
            this.minuteLabelText.innerHTML = this.getHourText(date) + ':' + this.getMinuteText(date) + ':<datium-changing-label>' + this.getSecondText(date) + '</datium-changing-label>';
            if (!this.opts.militaryTime) {
                this.minuteLabelText.innerHTML += this.getMeridiemText(date);
            }
        } else {
            this.minuteLabelText.innerHTML = this.getHourText(date) + ':' + this.getMinuteText(date);
            if (!this.opts.militaryTime) {
                this.minuteLabelText.innerHTML += this.getMeridiemText(date);
            }
        }
    }
    
    private getDecadeText(date:Date):string {
		let decadeStart = date.getFullYear();
		while (decadeStart % 10 !== 0) decadeStart--;
		return decadeStart + ' - ' + (decadeStart + 10);        
    }
    
    private getYearText(date:Date):string {
        return date.getFullYear().toString();
    }
    
    private getMonthText(date:Date):string {
        return this.months[date.getMonth()];
    }
    
    private getDayText(date:Date):string {
		let day = date.getDate();
		let dayPrefix = '';
		if (day < 10) {
			dayPrefix = '0';
		}
		return this.days[date.getDay()] + ' ' + dayPrefix + day;
    }
    
    private getHourText(date:Date):string {        
		let hour = date.getHours();
        if (!this.opts.militaryTime) {
            if (hour === 0) {
                hour = 12;
            } else if (hour > 12) {
                hour -= 12;
            }
        }
		let hourPrefix = '';
		if (hour < 10) {
			hourPrefix = '0';
		}
		return hourPrefix + hour;
    }
    
    private getMeridiemText(date:Date):string {
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
		return meridiem;
    }
    
    private getMinuteText(date:Date):string {        
		let minute = date.getMinutes();
		let minutePrefix = '';
		if (minute < 10) {
			minutePrefix = '0';
		}
		return minutePrefix + minute;
    }
    
    private getSecondText(date:Date):string {        
		let minute = date.getSeconds();
		let minutePrefix = '';
		if (minute < 10) {
			minutePrefix = '0';
		}
		return minutePrefix + minute;
    }
    
	private updateLabels(date:Date, level:ViewLevel):void {
		this.decadeLabelText.innerHTML = this.getDecadeText(date);
		this.yearLabelText.innerHTML = this.getYearText(date);
		this.monthLabelText.innerHTML = this.getMonthText(date);
		this.monthExtendedLabelText.innerHTML = this.getYearText(date);		
        this.updateDayLabel(date);
		this.dayExtendedLabelText.innerHTML = this.getMonthText(date) + ' ' + this.getYearText(date);
        this.updateHourLabel(date);		
		this.hourExtendedLabelText.innerHTML = this.getDayText(date) + ' ' + this.getMonthText(date) + ' ' + this.getYearText(date);
        this.updateMinuteLabel(date);
	}
    
    private level:ViewLevel;
    	
	private viewChanged(date:Date, level:ViewLevel):void {
        if (level < this.opts.endView) return;
        this.level = level;
		this.updateLabels(date, level);
		if (level === ViewLevel.YEAR) {
			this.mkBottom(this.decadeLabel);
			this.mkHiddenBottom(this.yearLabel, this.monthLabel, this.dayLabel, this.hourLabel, this.minuteLabel);
		} else if (level === ViewLevel.MONTH) {
			this.mkTop(this.decadeLabel);
			this.mkBottom(this.yearLabel);
			this.mkHiddenBottom(this.monthLabel, this.dayLabel, this.hourLabel, this.minuteLabel);
		} else if (level === ViewLevel.DATE || level === ViewLevel.DAY) {
			this.mkHiddenTop(this.decadeLabel);
			this.mkTop(this.yearLabel);
			this.mkBottom(this.monthLabel);
			this.mkHiddenBottom(this.dayLabel, this.hourLabel, this.minuteLabel);			
		} else if (level === ViewLevel.HOUR || level === ViewLevel.MERIDIEM) {
			this.mkHiddenTop(this.decadeLabel, this.yearLabel);
			this.mkTop(this.monthLabel);
			this.mkBottom(this.dayLabel);
			this.mkHiddenBottom(this.hourLabel, this.minuteLabel);			
		} else if (level === ViewLevel.MINUTE) {
			this.mkHiddenTop(this.decadeLabel, this.yearLabel, this.monthLabel);
			this.mkTop(this.dayLabel);
			this.mkBottom(this.hourLabel);
			this.mkHiddenBottom(this.minuteLabel);			
		} else if (level === ViewLevel.SECOND) {
			this.mkHiddenTop(this.decadeLabel, this.yearLabel, this.monthLabel, this.dayLabel);
			this.mkTop(this.hourLabel);
			this.mkBottom(this.minuteLabel);	
		}
        if (level === this.opts.maxView) {
            this.spanLabelsContainer.classList.add('datium-header-inactive');
        } else {
            this.spanLabelsContainer.classList.remove('datium-header-inactive');
        }
        
        if (this.viewManager.isNextDisabled()) {
            this.nextViewElement.classList.add('datium-view-change-disabled');
        } else {
            this.nextViewElement.classList.remove('datium-view-change-disabled');
        }
        
        if (this.viewManager.isPreviousDisabled()) {
            this.previousViewElement.classList.add('datium-view-change-disabled');
        } else {
            this.previousViewElement.classList.remove('datium-view-change-disabled');
        }
	}
	
    private changeClass(element:Element, classesToAdd:string[], classesToRemove:string[]):void {
        for (let key in classesToRemove) {
            element.classList.remove(classesToRemove[key]);
        }
        for (let key in classesToAdd) {
            element.classList.add(classesToAdd[key]);
        }
    }
    
	private mkTop(...elements:Element[]) {
		for (let key in elements) {
            this.changeClass(elements[key], ['datium-top'], ['datium-hidden-top', 'datium-bottom', 'datium-hidden-bottom']);
		}
	}
	
	private mkHiddenTop(...elements:Element[]) {
		for (let key in elements) {
            this.changeClass(elements[key], ['datium-top', 'datium-hidden-top'], ['datium-bottom', 'datium-hidden-bottom']);
		}
	}
	
	private mkBottom(...elements:Element[]) {
		for (let key in elements) {
            this.changeClass(elements[key], ['datium-bottom'], ['datium-top', 'datium-hidden-top', 'datium-hidden-bottom']);
		}
	}
	
	private mkHiddenBottom(...elements:Element[]) {
		for (let key in elements) {
            this.changeClass(elements[key], ['datium-bottom', 'datium-hidden-bottom'], ['datium-top', 'datium-hidden-top']);
		}
	}
}