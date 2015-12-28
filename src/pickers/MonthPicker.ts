import {Transition, IPicker} from 'src/pickers/IPicker';
import ViewManager from 'src/ViewManager';

export default class MonthPicker implements IPicker {
	constructor(private container:HTMLElement, private viewManager:ViewManager) {}
	
	public create(transition:Transition, date:Date):void {
		
	}
	
	public getHeight():number {
		return 260;
	}
	
	public destroy(transition:Transition):void {
		
	}
}