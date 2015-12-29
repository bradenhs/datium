import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';

export default class SecondPicker extends Picker {
    
	constructor(container:HTMLElement, private viewManager:ViewManager) {
        super(container, viewManager, 'datium-second-selectable');
    }
    
    protected populatePicker(picker:HTMLElement, date:Date):void {
        
    }
}