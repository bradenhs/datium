import {Picker} from 'src/pickers/Picker';
import ViewManager from 'src/common/ViewManager';
import Header from 'src/header/Header';
import {IDatiumOptions} from 'src/DatiumOptions';

export default class MonthPicker extends Picker {   
	constructor(container:HTMLElement, private viewManager:ViewManager, opts:IDatiumOptions) {
        super(container, viewManager, 'datium-month', opts);
        this.height = 180;
    }    
    private months:string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    protected populatePicker(picker:HTMLElement, date:Date):void {
        picker.classList.add('datium-month-view');
        
        for (let month = 0; month < 12; month++) {
            let el = document.createElement('datium-month-element');
            el.setAttribute('datium-data', month.toString());
            el.innerHTML = `${this.months[month]}<datium-bubble>${this.months[month]}</datium-bubble>`;
            let inactive = false;
            
            let dStart = new Date(date.getFullYear(), month, 1, 0, 0, 0, -1);
            let dEnd = new Date(date.getFullYear(), month + 1, 1, 0, 0, 0, -1);
            
            if (this.opts.minDate !== void 0 && dEnd.valueOf() < this.opts.minDate.valueOf()) {
                inactive = true;
            } else if (this.opts.maxDate !== void 0 && dStart.valueOf() > this.opts.maxDate.valueOf()) {
                inactive = true;
            }
            
            if (inactive) {
                el.classList.add('datium-month-inactive');
            } else {
                el.classList.add('datium-month-selectable');
            }
            if (month === this.viewManager.getSelectedDate().getMonth() &&
                date.getFullYear() === this.viewManager.getSelectedDate().getFullYear() &&
                date.getMonth() === this.viewManager.getSelectedDate().getMonth()) {
                el.classList.add('datium-current-selection');
            }
            picker.appendChild(el);
        }
    }
}