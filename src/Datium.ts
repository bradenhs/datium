import headerTemplate from 'src/header/header.html!text';
import {onTap, onSwipeLeft, onSwipeRight} from 'src/common/Events';
import Header from 'src/header/Header';
import ViewManager, {ViewLevel} from 'src/common/ViewManager';
import YearPicker from 'src/pickers/year/YearPicker';
import MonthPicker from 'src/pickers/month/MonthPicker';
import DayPicker from 'src/pickers/day/DayPicker';
import HourPicker from 'src/pickers/hour/HourPicker';
import MinutePicker from 'src/pickers/minute/MinutePicker';
import SecondPicker from 'src/pickers/second/SecondPicker';
import {Transition, Picker} from 'src/pickers/Picker';

// When in develop this file is empty and so nothing really happens but when building
// in production this file is filled temporarily with stlyes so that styles can be
// added to the page dynamically when in production.
import stylesheet from 'temp/stylesheet.css!text';

interface IOptions {
	element: HTMLElement;
	max: string;
	min: string;
}

class Datium {
    private static insertedStyles: boolean = false;
    
    private currentPicker:Picker;
    private yearPicker:YearPicker;
    private monthPicker:MonthPicker;
    private dayPicker:DayPicker;
    private hourPicker:HourPicker;
    private minutePicker:MinutePicker;
    private secondPicker:SecondPicker;
    
    private pickerContainer:HTMLElement;
    
    constructor(options:IOptions) {
        let el = this.createView();
        this.pickerContainer = <HTMLElement>el.querySelector('datium-all-pickers-container');   
        
        let viewManager = new ViewManager();
        
        onSwipeLeft(el, () => {
           viewManager.next();
        });
        
        onSwipeRight(el, () => {
           viewManager.previous(); 
        });
        
        let header = new Header(el.querySelector('datium-header'), viewManager);
        
        this.yearPicker = new YearPicker(this.pickerContainer, viewManager);
        this.monthPicker = new MonthPicker(this.pickerContainer, viewManager);
        this.dayPicker = new DayPicker(this.pickerContainer, viewManager);
        this.hourPicker = new HourPicker(this.pickerContainer, viewManager, header);
        this.minutePicker = new MinutePicker(this.pickerContainer, viewManager, header);
        this.secondPicker = new SecondPicker(this.pickerContainer, viewManager, header);
        
        viewManager.registerObserver((date:Date, level:ViewLevel, lastDate:Date, lastLevel:ViewLevel) => {
            this.viewChanged(date, level, lastDate, lastLevel);
        });
        
        this.insertAfter(options.element, el);
        this.insertStyles();
    }
    
    private viewChanged(date:Date, level:ViewLevel, lastDate:Date, lastLevel:ViewLevel) {
        let newPicker = this.getNewPicker(level);
        if (level > lastLevel) {
            this.currentPicker.destroy(Transition.ZOOM_IN);
            newPicker.create(Transition.ZOOM_OUT, date);
        } else if (level < lastLevel) {
            this.currentPicker.destroy(Transition.ZOOM_OUT);
            newPicker.create(Transition.ZOOM_IN, date);
        } else if (date.valueOf() < lastDate.valueOf()) {
            this.currentPicker.destroy(Transition.SCROLL_RIGHT);
            newPicker.create(Transition.SCROLL_LEFT, date);
        } else if (date.valueOf() > lastDate.valueOf()) {
            this.currentPicker.destroy(Transition.SCROLL_LEFT);
            newPicker.create(Transition.SCROLL_RIGHT, date);
        } else if (this.currentPicker === void 0) {
            newPicker.create(Transition.NONE, date);
        }
        this.pickerContainer.style.height = newPicker.getHeight() + 'px';
        this.currentPicker = newPicker;
    }
    
    private getNewPicker(level:ViewLevel):Picker {
        switch (level) {
            case ViewLevel.DECADE: return this.yearPicker;
            case ViewLevel.YEAR: return this.monthPicker;
            case ViewLevel.MONTH: return this.dayPicker;
            case ViewLevel.DAY: return this.hourPicker;
            case ViewLevel.HOUR: return this.minutePicker;
            case ViewLevel.MINUTE: return this.secondPicker;
        }
    }
    
    private insertStyles():void {
        if (Datium.insertedStyles || stylesheet === '') return;
        Datium.insertedStyles = true;
        
        let styles = document.createElement('style');
        styles.innerText = stylesheet;
        
        document.head.appendChild(styles);        
    }
    
    private createView():HTMLElement {
        let el = document.createElement('datium-container');
        el.innerHTML = headerTemplate + '<datium-all-pickers-container></datium-all-pickers-container>';
        return el;
    }
    
    private insertAfter(node:Node, newNode:Node):void {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    }
}

(<any>window).Datium = Datium;
