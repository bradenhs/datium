import {Transition, IPicker} from 'src/pickers/IPicker';
import ViewManager from 'src/ViewManager';

export default class YearPicker implements IPicker {
	constructor(private container:HTMLElement, private viewManager:ViewManager) {}
	
	public create(transition:Transition, date:Date):void {
		
	}
	
	public getHeight():number {
		return 150;
	}
	
	public destroy(transition:Transition):void {
		
	}
}