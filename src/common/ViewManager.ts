import {IDatiumOptions} from 'src/DatiumOptions';

// Order here is important
export enum ViewLevel {
	SECOND,
	MINUTE,
	HOUR,
    MERIDIEM,
	DATE,
    DAY,
	MONTH,
	YEAR
}

export default class ViewManager {
	private level:ViewLevel;
	private lastLevel:ViewLevel;
	private date:Date;
    private selectedDate:Date;
	private lastDate:Date;
	private observers:((date:Date, level:ViewLevel, lastDate?:Date, lastLevel?:ViewLevel, selectedDate?:Date, transition?:boolean) => void)[] = [];
	
	public registerObserver(observer:(date:Date, level:ViewLevel, lastDate?:Date, lastLevel?:ViewLevel, selectedDate?:Date, transition?:boolean) => void):void {
		observer(this.date, this.level, this.lastDate, this.lastLevel, this.selectedDate);
		this.observers.push(observer);
	}
	
	private notifyObservers(transition:boolean = true):void {
		for (let key in this.observers) {
			this.observers[key](this.date, this.level, this.lastDate, this.lastLevel, this.selectedDate, transition);
		}
	}
    
    public getViewLevel():ViewLevel {
        return this.level;
    }
    
    public getSelectedDate():Date {
        return this.selectedDate;
    }
	
	constructor(private opts:IDatiumOptions) {
        this.selectedDate = new Date(); // TODO this will be anything in the text box initially maybe
        if (this.opts.minDate !== void 0 && this.selectedDate.valueOf() < this.opts.minDate.valueOf()) {
            this.selectedDate = new Date(this.opts.minDate.valueOf());
        }
        if (this.opts.maxDate !== void 0 && this.selectedDate.valueOf() > this.opts.maxDate.valueOf()) {
            this.selectedDate = new Date(this.opts.maxDate.valueOf());
        }
        this.date = new Date(this.selectedDate.valueOf());
		this.level = this.opts.startView;
		this.lastDate = this.date;
		this.lastLevel = this.level;
        // TODO somehow do an initial load here...
	}
    
    private previousDisabled:boolean = false;
    private nextDisabled:boolean = false;
    
    public isPreviousDisabled():boolean {
        return this.previousDisabled;
    }
    
    public isNextDisabled():boolean {
        return this.nextDisabled;
    }
    
    public refresh():void {
        this.goToView(this.getValue(this.level), this.level);
    }
    
	public goToView(value:number, level:ViewLevel):void {
		this.lastDate = new Date(this.date.valueOf());
		this.lastLevel = this.level;
		this.level = level;
        
        this.previousDisabled = false;
        this.nextDisabled = false;
        let previousEnd;
        let nextStart;
		switch(level) {
		case ViewLevel.YEAR:
			this.date.setFullYear(value);
            let y = Math.floor(value / 10) * 10;
            previousEnd = new Date(y, 0, 1, 0, 0, -1);
            nextStart = new Date(y + 11, 0, 1, 0, 0, 1);
			break;
		case ViewLevel.MONTH:
			this.date.setFullYear(value);            
            previousEnd = new Date(value, 0, 1, 0, 0, -1);
            nextStart = new Date(value + 1, 0, 1, 0, 0, 1);
			break;
        case ViewLevel.DAY:
		case ViewLevel.DATE:
			this.date.setMonth(value);
            previousEnd = new Date(this.date.getFullYear(), value, 1, 0, 0, -1);
            nextStart = new Date(this.date.getFullYear(), value + 1, 1, 0, 0, 1);
			break;
        case ViewLevel.MERIDIEM:            
		case ViewLevel.HOUR:
			this.date.setDate(value);            
            previousEnd = new Date(this.date.getFullYear(), this.date.getMonth(), value, 0, 0, -1);
            nextStart = new Date(this.date.getFullYear(), this.date.getMonth(), value + 1, 0, 0, 1);
			break;
		case ViewLevel.MINUTE:
			this.date.setHours(value);
            previousEnd = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), value, 0, -1);
            nextStart = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), value + 1, 0, 1);
			break;
		case ViewLevel.SECOND:
			this.date.setMinutes(value);            
            previousEnd = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.date.getHours(), value, -1);
            nextStart = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.date.getHours(), value + 1, 1);
			break;
		default:
			this.date.setSeconds(value);
			break;
		}
        
        if (this.opts.minDate !== void 0 && previousEnd !== void 0 && this.opts.minDate.valueOf() > previousEnd.valueOf()) {
            this.previousDisabled = true;
        }
        
        if (this.opts.maxDate !== void 0 && nextStart !== void 0 && this.opts.maxDate.valueOf() < nextStart.valueOf()) {
            this.nextDisabled = true;
        }
                
        if (this.level < this.lastLevel) {
            this.selectedDate = new Date(this.date.valueOf());
        }
        
        if (this.opts.minDate !== void 0 && this.selectedDate.valueOf() < this.opts.minDate.valueOf()) {
            this.date = new Date(this.opts.minDate.valueOf());
            this.selectedDate = new Date(this.opts.minDate.valueOf());
        }
        
        if (this.opts.minDate !== void 0 && this.selectedDate.valueOf() < this.opts.minDate.valueOf()) {
            this.date = new Date(this.opts.maxDate.valueOf());
            this.selectedDate = new Date(this.opts.maxDate.valueOf());
        }
        
		this.notifyObservers();
	}
    
    public daysInCurrentMonth():number {
        return new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0).getDate();
    }
    
    public increment():boolean {
        return this.step(true);
    }
    
    public decrement():boolean {
        return this.step(false);
    }
    
    public step(positive:boolean):boolean {
        let sign:number = positive ? 1 : -1;
        let newVal;
        let newDate = new Date(this.selectedDate.valueOf());
        switch(this.level) {
            case ViewLevel.SECOND:
                newVal = newDate.getSeconds() + this.opts.secondSelectionInterval * sign;
                if (newVal > 59) return false;
                if (newVal < 0) return false;
                newDate.setSeconds(newVal);
                break;
            case ViewLevel.MINUTE:
                newVal = newDate.getMinutes() + this.opts.minuteSelectionInterval * sign;
                if (newVal > 59) return false;
                if (newVal < 0) return false;
                newDate.setMinutes(newVal);
                break;
            case ViewLevel.MERIDIEM:
                newVal = newDate.getHours() + 12 * sign;
                if (newVal > 23) return false;
                if (newVal < 0) return false;
                newDate.setHours(newVal);
                // D.L.S. time jazz is super annoying
                if (newDate.getHours() !== newVal && this.selectedDate.getHours() > newVal) {
                    newDate.setHours(newDate.getHours() - 2);
                }
                break;
            case ViewLevel.HOUR:
                newVal = newDate.getHours() + this.opts.hourSelectionInterval * sign;
                if (newVal > 23) return false;
                if (newVal < 0) return false;
                newDate.setHours(newVal);
                // D.L.S. time jazz is super annoying
                if (newDate.getHours() !== newVal && this.selectedDate.getHours() > newVal) {
                    newDate.setHours(newDate.getHours() - 2);
                }
                break;
            case ViewLevel.DAY:
                //TODO decide if this is even worthwhile
                if (this.selectedDate.getDay() === 0 && sign < 0) return false;
                if (this.selectedDate.getDay() === 6 && sign > 0) return false;
            case ViewLevel.DATE:
                newVal = newDate.getDate() + sign;
                if (newVal > this.daysInCurrentMonth()) return false;
                if (newVal < 1) return false;
                newDate.setDate(newVal);
                break;
            case ViewLevel.MONTH:
                newVal = newDate.getMonth() + sign;
                if (newVal > 11) return false;
                if (newVal < 0) return false;
                newDate.setMonth(newVal);
                while (newDate.getMonth() !== newVal) {
                    newDate.setDate(newDate.getDate() - 1);
                }
                break;
            case ViewLevel.YEAR:
                newVal = newDate.getFullYear() + sign;
                newDate.setFullYear(newVal);
                break;
        }
        if (this.opts.minDate !== void 0 && newDate.valueOf() < this.opts.minDate.valueOf()) {
            newDate = new Date(this.opts.minDate.valueOf());
        } else if (this.opts.maxDate !== void 0 && newDate.valueOf() > this.opts.maxDate.valueOf()) {
            newDate = new Date(this.opts.maxDate.valueOf());
        }
        switch (this.level) {
            case ViewLevel.SECOND:
                if (newDate.getSeconds() === this.selectedDate.getSeconds()) return false;
                break;
            case ViewLevel.MINUTE:
                if (newDate.getMinutes() === this.selectedDate.getMinutes()) return false;
                break;
            case ViewLevel.MERIDIEM:
            case ViewLevel.HOUR:
                if (newDate.getHours() === this.selectedDate.getHours()) return false;
                break;
            case ViewLevel.DAY:
            case ViewLevel.DATE:
                if (newDate.getDate() === this.selectedDate.getDate()) return false;
                break;
            case ViewLevel.MONTH:
                if (newDate.getMonth() === this.selectedDate.getMonth()) return false;
                break;
            case ViewLevel.YEAR:
                if (newDate.getFullYear() === this.selectedDate.getFullYear()) return false;
                break; 
        }  
        this.date = new Date(newDate.valueOf());
        this.selectedDate = new Date(newDate.valueOf());
        this.notifyObservers(false);
        return true;
    }
    
    public setSelectedDate(date:Date):boolean {
        if (this.opts.minDate !== void 0 && date.valueOf() < this.opts.minDate.valueOf()) {
            return false;
        }
        if (this.opts.maxDate !== void 0 && date.valueOf() > this.opts.maxDate.valueOf()) {
            return false;
        }
        this.date = new Date(date.valueOf());
        this.selectedDate = new Date(date.valueOf());
        this.lastLevel = this.level;
        this.notifyObservers(false);
        return true;
    }
	
	public next():void {
        if (this.nextDisabled) return;
		let change = this.level === ViewLevel.YEAR ? 10 : 1;
		let value:number = this.getValue(this.level) + change;
		this.goToView(value, this.level);
	}
	
	public previous():void {
        if (this.previousDisabled) return;
		let change = this.level === ViewLevel.YEAR ? 10 : 1;
		let value:number = this.getValue(this.level) - change;
		this.goToView(value, this.level);
	}
	
	public zoomOut():void {
		let newLevel:ViewLevel = this.level === ViewLevel.YEAR ? this.level : this.level + 1;
        if (newLevel === ViewLevel.MERIDIEM || newLevel === ViewLevel.DAY) newLevel++;
        if (newLevel > this.opts.maxView) return;
		let value:number = this.getValue(newLevel);
		this.goToView(value, newLevel);
	}
    
    public changeViewLevel(newLevel:ViewLevel):void {
		let value:number = this.getValue(newLevel);
		this.goToView(value, newLevel);        
    }
	
	public zoomTo(newValue:number):void {
		let newLevel:ViewLevel = this.level - 1;
        if (newLevel === ViewLevel.HOUR || newLevel === ViewLevel.MERIDIEM || newLevel === ViewLevel.DAY || newLevel === ViewLevel.DATE) newLevel--;
		this.goToView(newValue, newLevel);
	}
	
	public getValue(level:ViewLevel):number {
		switch(level) {
			case ViewLevel.SECOND: return this.date.getMinutes();
			case ViewLevel.MINUTE: return this.date.getHours();
            case ViewLevel.MERIDIEM:
			case ViewLevel.HOUR: return this.date.getDate();
            case ViewLevel.DAY:
			case ViewLevel.DATE: return this.date.getMonth();
			case ViewLevel.MONTH: return this.date.getFullYear();
			default: return this.date.getFullYear();
		}
	}
}