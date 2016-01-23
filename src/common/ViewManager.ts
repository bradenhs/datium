import {IDatiumOptions} from 'src/DatiumOptions';

// Order here is important
export enum ViewLevel {
	SECOND,
	MINUTE,
	HOUR,
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
	private observers:((date:Date, level:ViewLevel, lastDate?:Date, lastLevel?:ViewLevel, selectedDate?:Date) => void)[] = [];
	
	public registerObserver(observer:(date:Date, level:ViewLevel, lastDate?:Date, lastLevel?:ViewLevel, selectedDate?:Date) => void):void {
		observer(this.date, this.level, this.lastDate, this.lastLevel, this.selectedDate);
		this.observers.push(observer);
	}
	
	private notifyObservers():void {
		for (let key in this.observers) {
			this.observers[key](this.date, this.level, this.lastDate, this.lastLevel, this.selectedDate);
		}
	}
    
    public getViewLevel():ViewLevel {
        return this.level;
    }
    
    public getSelectedDate():Date {
        return this.selectedDate;
    }
	
	constructor(private opts:IDatiumOptions) {
        this.selectedDate = new Date(); // this will be anything in the text box initially maybe
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
        //somehow do an initial load here...
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
    
	private goToView(value:number, level:ViewLevel):void {
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
			this.date.setMonth(value);
            previousEnd = new Date(this.date.getFullYear(), value, 1, 0, 0, -1);
            nextStart = new Date(this.date.getFullYear(), value + 1, 1, 0, 0, 1);
			break;
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
        
		this.notifyObservers();
	}
    
    private levelToString(level:ViewLevel):string {
        switch (level) {
            case ViewLevel.YEAR: return 'YEAR';
            case ViewLevel.MONTH: return 'MONTH';
            case ViewLevel.DAY: return 'DAY';
            case ViewLevel.HOUR: return 'HOUR';
            case ViewLevel.MINUTE: return 'MINUTE';
            case ViewLevel.SECOND: return 'SECOND';
            default: return 'NULL';
        }
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
		this.goToView(newValue, newLevel);
	}
	
	private getValue(level:ViewLevel):number {
		switch(level) {
			case ViewLevel.SECOND: return this.date.getMinutes();
			case ViewLevel.MINUTE: return this.date.getHours();
			case ViewLevel.HOUR: return this.date.getDate();
			case ViewLevel.DAY: return this.date.getMonth();
			case ViewLevel.MONTH: return this.date.getFullYear();
			default: return this.date.getFullYear();
		}
	}
}