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
	private level:ViewLevel = ViewLevel.MONTH;
	
	private date:Date;
	private observers:((date:Date, level:ViewLevel) => void)[] = [];
	
	public registerObserver(observer:(date:Date, level:ViewLevel) => void):void {
		observer(this.date, this.level);
		this.observers.push(observer);
	}
	
	private notifyObservers():void {
		for (let key in this.observers) {
			this.observers[key](this.date, this.level);
		}
	}
	
	constructor() {
		this.date = new Date();
		this.zeroFrom(ViewLevel.MONTH);
	}
	
	private goToView(value:number, level:ViewLevel):void {
		this.zeroFrom(level);
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
		this.notifyObservers();
	}
	
	private zeroFrom(level:ViewLevel) {
		this.date.setMilliseconds(0);
		if (level > ViewLevel.SECOND) this.date.setSeconds(0); else return;
		if (level > ViewLevel.MINUTE) this.date.setMinutes(0); else return;
		if (level > ViewLevel.HOUR) this.date.setHours(0); else return;
		if (level > ViewLevel.DAY) this.date.setDate(1); else return;
		if (level > ViewLevel.MONTH) this.date.setMonth(0); else return;		
	}
	
	public next():void {
		let value:number = this.getValue(this.level) + 1;
		this.goToView(value, this.level);
	}
	
	public previous():void {
		let value:number = this.getValue(this.level) - 1;
		this.goToView(value, this.level);
	}
	
	public zoomOut():void {
		let newLevel:ViewLevel = this.level === ViewLevel.DECADE ? this.level : this.level - 1;
		let value:number = this.getValue(newLevel);
		this.goToView(value, newLevel);
	}
	
	public zoomTo(newValue:number):void {
		let newLevel:ViewLevel = this.level === ViewLevel.SECOND ? this.level : this.level + 1;
		this.goToView(newValue, newLevel);
	}
	
	private getValue(level:ViewLevel):number {
		switch(this.level) {
			case ViewLevel.SECOND: return this.date.getSeconds();
			case ViewLevel.MINUTE: return this.date.getMinutes();
			case ViewLevel.HOUR: return this.date.getHours();
			case ViewLevel.DAY: return this.date.getDate();
			case ViewLevel.MONTH: return this.date.getMonth();
			default: return this.date.getFullYear();
		}
	}
}