import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';

export default class HourPicker extends Picker {
    
	constructor(container:HTMLElement, private viewManager:ViewManager) {
        super(container, viewManager, 'datium-hour-selectable');
    }
    
    protected populatePicker(picker:HTMLElement, data:Date):void {
        
    }
}