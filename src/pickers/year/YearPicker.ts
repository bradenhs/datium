import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import Header from 'src/header/Header';

export default class YearPicker extends Picker {
    
	constructor(container:HTMLElement, private viewManager:ViewManager) {
        super(container, viewManager, 'datium-year');
        this.height = 180;
    }
    
    protected populatePicker(picker:HTMLElement, date:Date):void {
        let startYear:number = date.getFullYear();
        while (startYear % 10 !== 0) startYear--;
        
        for (let year = startYear; year <= startYear + 10; year++) {
            let yearElement = document.createElement('datium-year-element');
            yearElement.className = 'datium-year-selectable';
            yearElement.innerText = year.toString();
            yearElement.setAttribute('datium-data', year.toString());
            picker.appendChild(yearElement);
        }
    }
}