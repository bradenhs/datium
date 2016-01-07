// Order here is important
export enum ViewLevel {
	SECOND,
	MINUTE,
	HOUR,
	DAY,
	MONTH,
	YEAR,
	DECADE
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
	
	constructor() {
		this.date = new Date();
        this.selectedDate = new Date(this.date.valueOf());
		this.level = ViewLevel.DECADE;
		this.lastDate = this.date;
		this.lastLevel = this.level;
	}
	
	private goToView(value:number, level:ViewLevel):void {
		this.lastDate = new Date(this.date.valueOf());
		this.lastLevel = this.level;
		this.level = level;
		switch(level) {
		case ViewLevel.DECADE:
		case ViewLevel.YEAR:
			this.date.setFullYear(value);
			break;
		case ViewLevel.MONTH:
			this.date.setMonth(value);
			break;
		case ViewLevel.DAY:
			this.date.setDate(value);
			break;
		case ViewLevel.HOUR:
			this.date.setHours(value);
			break;
		case ViewLevel.MINUTE:
			this.date.setMinutes(value);
			break;
		default:
			this.date.setSeconds(value);
			break;
		}
        if (this.level < this.lastLevel) {
            this.selectedDate = new Date(this.date.valueOf());
        }
		this.notifyObservers();
	}
	
	public next():void {
		let change = this.level === ViewLevel.DECADE ? 10 : 1;
		let value:number = this.getValue(this.level) + change;
		this.goToView(value, this.level);
	}
	
	public previous():void {
		let change = this.level === ViewLevel.DECADE ? 10 : 1;
		let value:number = this.getValue(this.level) - change;
		this.goToView(value, this.level);
	}
	
	public zoomOut():void {
		let newLevel:ViewLevel = this.level === ViewLevel.DECADE ? this.level : this.level + 1;
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
			case ViewLevel.SECOND: return this.date.getSeconds();
			case ViewLevel.MINUTE: return this.date.getMinutes();
			case ViewLevel.HOUR: return this.date.getHours();
			case ViewLevel.DAY: return this.date.getDate();
			case ViewLevel.MONTH: return this.date.getMonth();
			default: return this.date.getFullYear();
		}
	}
}