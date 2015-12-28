import {Transition, IPicker} from 'src/pickers/IPicker';
import ViewManager from 'src/ViewManager';

export default class MinutePicker implements IPicker {
	constructor(private container:HTMLElement, private viewManager:ViewManager) {}
	
	public create(transition:Transition, date:Date):void {
		
	}
	
	public getHeight():number {
		return 90;
	}
	
	public destroy(transition:Transition):void {
		
	}
}