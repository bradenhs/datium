import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import Header from 'src/header/Header';
import {IDatiumOptions} from 'src/DatiumOptions';

export default class YearPicker extends Picker {
    
	constructor(container:HTMLElement, private viewManager:ViewManager, opts:IDatiumOptions) {
        super(container, viewManager, 'datium-year', opts);
        this.height = this.opts.small ? 120 : 180;
    }
    
    protected populatePicker(picker:HTMLElement, date:Date):void {
        let startYear:number = date.getFullYear();
        while (startYear % 10 !== 0) startYear--;
        
        picker.classList.add('datium-year-view');
        
        for (let year = startYear; year <= startYear + 10; year++) {
            let yearElement = document.createElement('datium-year-element');
            
            if (year === this.viewManager.getSelectedDate().getFullYear()) {
                yearElement.classList.add('datium-current-selection');
            }
            yearElement.innerHTML = year.toString() + '<datium-bubble>' + year.toString() + '</datium-bubble>';
            yearElement.setAttribute('datium-data', year.toString());
            
            let inactive = false;
            
            let dStart = new Date(year, 0, 1, 0, 0, 0, -1);
            let dEnd = new Date(year + 1, 0, 1, 0, 0, 0, 1);           
            
            if (this.opts.minDate !== void 0 && dEnd.valueOf() < this.opts.minDate.valueOf()) {
                inactive = true;
            } else if (this.opts.maxDate !== void 0 && dStart.valueOf() > this.opts.maxDate.valueOf()) {
                inactive = true;
            }
            
            if (inactive) {
                yearElement.classList.add('datium-year-inactive');
            } else {
                yearElement.classList.add('datium-year-selectable');
            }
            
            picker.appendChild(yearElement);
        }
    }
}