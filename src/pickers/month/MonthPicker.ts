import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import monthTemplate from 'src/pickers/month/month-picker.html!text';

export default class MonthPicker extends Picker {   
	constructor(container:HTMLElement, private viewManager:ViewManager) {
        super(container, viewManager, 'datium-month-selectable');
        this.height = 180;
    }    
    protected populatePicker(picker:HTMLElement):void {
        picker.innerHTML = monthTemplate;
    }
}