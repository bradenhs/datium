import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import monthTemplate from 'src/pickers/month/month-picker.html!text';
import Header from 'src/header/Header';

export default class MonthPicker extends Picker {   
	constructor(container:HTMLElement, private viewManager:ViewManager) {
        super(container, viewManager, 'datium-month');
        this.height = 180;
    }    
    protected populatePicker(picker:HTMLElement, date:Date):void {
        picker.innerHTML = monthTemplate;
        picker.classList.add('datium-month-view');
        
        for (let i = 0; i < picker.childNodes.length; i++) {
            let node = <HTMLElement>picker.childNodes.item(i);
            if (node.attributes !== void 0) {
                let val = node.attributes.getNamedItem('datium-data').nodeValue;
                if (parseInt(val) === this.viewManager.getSelectedDate().getMonth() &&
                    date.getFullYear() === this.viewManager.getSelectedDate().getFullYear()) {
                    node.classList.add('datium-current-selection');
                    break;
                }
            }
        }
    }
}