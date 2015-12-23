import {Transition, IPicker} from 'src/pickers/IPicker';
import ViewManager from 'src/ViewManager';

export default class SecondPicker implements IPicker {
	constructor(private container:HTMLElement, private viewManager:ViewManager) {}
	
	public create(transition:Transition, date:Date):void {
		
	}
	
	public getHeight():number {
		return 130;
	}
	
	public destroy(transition:Transition):void {
		
	}
}