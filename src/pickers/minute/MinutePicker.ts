import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';

export default class MinutePicker extends Picker {
    
	constructor(container:HTMLElement, private viewManager:ViewManager) {
        super(container, viewManager, 'datium-minute-selectable');
    }
    
    protected populatePicker(picker:HTMLElement, data:Date):void {
        
    }
}