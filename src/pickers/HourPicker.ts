import {Transition, IPicker} from 'src/pickers/IPicker';
import ViewManager from 'src/ViewManager';

export default class HourPicker implements IPicker {
	constructor(private container:HTMLElement, private viewManager:ViewManager) {}
	
	public create(transition:Transition, date:Date):void {
		
	}
	
	public getHeight():number {
		return 280;
	}
	
	public destroy(transition:Transition):void {
		
	}
}