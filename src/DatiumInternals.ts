import headerTemplate from 'src/header/header.html!text';
import {onDown, onMouseDown, onBlur, onFocus, onTap, onSwipeLeft, onSwipeRight, ListenerReference, removeListeners} from 'src/common/Events';
import Header from 'src/header/Header';
import ViewManager, {ViewLevel} from 'src/common/ViewManager';
import YearPicker from 'src/pickers/year/YearPicker';
import MonthPicker from 'src/pickers/month/MonthPicker';
import DayPicker from 'src/pickers/day/DayPicker';
import HourPicker from 'src/pickers/hour/HourPicker';
import MinutePicker from 'src/pickers/minute/MinutePicker';
import SecondPicker from 'src/pickers/second/SecondPicker';
import {Transition, Picker} from 'src/pickers/Picker';
import {IDatiumOptions, IDatiumTheme, SanitizeOptions} from 'src/DatiumOptions';
import mainCss from 'src/styles/main.css!text';
import headerCss from 'src/styles/header.css!text';
import pickerCss from 'src/styles/pickers.css!text';
import InputManager from 'src/InputManager';

export default class DatiumInternals {
    private static pickersOnPage: number = 0;
    
    private currentPicker:Picker;
    private yearPicker:YearPicker;
    private monthPicker:MonthPicker;
    private dayPicker:DayPicker;
    private hourPicker:HourPicker;
    private minutePicker:MinutePicker;
    private secondPicker:SecondPicker;
    
    private pickerContainer:HTMLElement;
    private viewManager:ViewManager;
    
    private datiumContainer:HTMLElement;
    private isPickerOpen:boolean = false;
    
    private pickerId:string;
    private opts:IDatiumOptions;
    private modalBackground:HTMLElement;
    
    private inputManager:InputManager;
    
    constructor(options:any) {
        this.opts = SanitizeOptions(options);
        
        DatiumInternals.pickersOnPage++;
        this.pickerId = this.getRandomId() + DatiumInternals.pickersOnPage.toString();
        
        this.datiumContainer = this.createView();
        this.pickerContainer = <HTMLElement>this.datiumContainer.querySelector('datium-all-pickers-container');
        
        if (!this.opts.transition) {
            this.datiumContainer.classList.add('datium-no-transition');
        }
        
        if (this.opts.small) {
            this.datiumContainer.classList.add('datium-small');
        }
        
        this.viewManager = new ViewManager(this.opts);
                
        onSwipeLeft(this.datiumContainer, () => {
            if (this.secondPicker.isDragging ||
                this.minutePicker.isDragging ||
                this.hourPicker.isDragging) return;
           this.viewManager.next();
        });
        
        onSwipeRight(this.datiumContainer, () => {
            if (this.secondPicker.isDragging ||
                this.minutePicker.isDragging ||
                this.hourPicker.isDragging) return;
           this.viewManager.previous(); 
        });
        
        onMouseDown(this.datiumContainer, (e) =>  {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        let reopenOnTapListeners = [];
        onFocus(this.opts.element, () => {  
            this.openPicker();        
            reopenOnTapListeners = onTap(this.opts.element, () => {
                if (!this.isPickerOpen && document.activeElement === this.opts.element) {
                    this.openPicker();
                }
            });   
        });
        
        onBlur(this.opts.element, () => {
            this.closePicker();
            removeListeners(reopenOnTapListeners);            
        });
        
        this.opts.element.setAttribute('readonly', 'true');
        
        let header = new Header(this.datiumContainer.querySelector('datium-header'), this.viewManager, this.opts);
        
        this.yearPicker = new YearPicker(this.pickerContainer, this.viewManager, this.opts);
        this.monthPicker = new MonthPicker(this.pickerContainer, this.viewManager, this.opts);
        this.dayPicker = new DayPicker(this.pickerContainer, this.viewManager, this.opts);
        this.hourPicker = new HourPicker(this.pickerContainer, this.viewManager, header, this.opts);
        this.minutePicker = new MinutePicker(this.pickerContainer, this.viewManager, header, this.opts);
        this.secondPicker = new SecondPicker(this.pickerContainer, this.viewManager, header, this.opts);
        
        this.viewManager.registerObserver((date:Date, level:ViewLevel, lastDate:Date, lastLevel:ViewLevel, selectedDate:Date, transition:boolean) => {
            this.viewChanged(date, level, lastDate, lastLevel, selectedDate, transition);
        });
        
        this.inputManager = new InputManager(this.opts, this.viewManager);
        this.viewManager.registerObserver((date:Date, level:ViewLevel, lastDate:Date, lastLevel:ViewLevel, selectedDate:Date) => {
            this.inputManager.update(date, level, lastDate, lastLevel, selectedDate);
        });
        
        if(this.opts.modal) {
            this.modalBackground = this.createModalBackground();
            document.body.appendChild(this.modalBackground);
            document.body.appendChild(this.datiumContainer);
            this.datiumContainer.classList.add('datium-modal');
        } else {
            this.insertAfter(this.opts.element, this.datiumContainer);
        }
        this.insertStyles();
        
        if (!this.opts.small && window.innerHeight < 380) {
            this.datiumContainer.classList.add('datium-landscape-view');
        }
        
        window.addEventListener('resize', () => {
            if (this.opts.small) return;
            if (window.innerHeight < 380) {
                this.datiumContainer.classList.add('datium-landscape-view');
            } else {
                this.datiumContainer.classList.remove('datium-landscape-view');
            }
        });
        
        this.viewManager.refresh();
    }
    
    private getRandomId():string {
        let returnValue = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for(let i = 0; i < 5; i++)
            returnValue += possible.charAt(Math.floor(Math.random() * possible.length));
        return "datium-"+returnValue;
    }
    
    private eventListeners:ListenerReference[] = [];
    
    private openPicker():void {
        if (this.isPickerOpen || this.opts.showPicker === false) return;
        this.isPickerOpen = true;
        if (this.opts.modal) {
            this.modalBackground.classList.add('datium-showing');
        }
        this.datiumContainer.classList.remove('datium-closed');
        
        let cancelClose = true;
        
        setTimeout(() => {
            this.inputManager.update(this.viewManager.getSelectedDate(), this.viewManager.getViewLevel(), this.viewManager.getSelectedDate(), void 0, this.viewManager.getSelectedDate());
            this.eventListeners = this.eventListeners.concat(onDown(this.opts.element, (e) => {
                cancelClose = true;
            }));
            this.eventListeners = this.eventListeners.concat(onDown(this.datiumContainer, (e) => {
                cancelClose = true;
            }));
            this.eventListeners = this.eventListeners.concat(onTap(document, (e) => {
                if (!cancelClose) {
                    this.closePicker();                
                }
                cancelClose = false;
            }));       
        });
    }
    
    private closePicker(stopBlur:boolean = false):void {
        if (this.isPickerOpen === false) return;
        if (!stopBlur && document.activeElement === this.opts.element) this.opts.element.blur();
        this.isPickerOpen = false;
        this.datiumContainer.classList.add('datium-closed');
        if (this.opts.modal) {
            this.modalBackground.classList.remove('datium-showing');
        }
        this.pickerContainer.style.height = '0px';
        
        removeListeners(this.eventListeners);
        this.eventListeners = [];
    }
    
    private viewChanged(date:Date, level:ViewLevel, lastDate:Date, lastLevel:ViewLevel, selectedDate:Date, transition:boolean) {
        if (level < this.opts.endView) {
            this.currentPicker.destroy(Transition.ZOOM_IN);
            this.closePicker(true);
            return;
        }
        let newPicker = this.getNewPicker(level);
        if (transition === false) {
            this.currentPicker.destroy(Transition.NONE);
            newPicker.create(Transition.NONE, date);
        } else if (level > lastLevel) {
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
            case ViewLevel.YEAR: return this.yearPicker;
            case ViewLevel.MONTH: return this.monthPicker;
            case ViewLevel.DAY: return this.dayPicker;
            case ViewLevel.HOUR: return this.hourPicker;
            case ViewLevel.MINUTE: return this.minutePicker;
            case ViewLevel.SECOND: return this.secondPicker;
        }
    }
    
    private insertStyles():void {
        let styles = this.transformCss(mainCss) + this.transformCss(headerCss) + this.transformCss(pickerCss);
        let styleElement = document.createElement('style');
        styleElement.innerText = styles;
        document.head.appendChild(styleElement);        
    }
    
    private primary = new RegExp('PRIMARY', 'g');
    private primaryText = new RegExp('PRIMARY_TEXT', 'g');
    private secondary = new RegExp('SECONDARY', 'g');
    private secondaryText = new RegExp('SECONDARY_TEXT', 'g');
    private secondaryAccent = new RegExp('SECONDARY_ACCENT', 'g');
    private styleInstance = new RegExp('STYLE_INSTANCE', 'g');
    
    private transformCss(css:string):string {
        let transformedCss = css.replace(this.styleInstance, this.pickerId);
        transformedCss = transformedCss.replace(this.primaryText, this.opts.theme.primaryText);
        transformedCss = transformedCss.replace(this.primary, this.opts.theme.primary);
        transformedCss = transformedCss.replace(this.secondaryAccent, this.opts.theme.secondaryAccent);
        transformedCss = transformedCss.replace(this.secondaryText, this.opts.theme.secondaryText);
        transformedCss = transformedCss.replace(this.secondary, this.opts.theme.secondary);
        return transformedCss;
    }
    
    private createModalBackground():HTMLElement {
        let el = document.createElement('datium-modal-background');
        el.style.zIndex = (this.opts.zIndex - 1).toString();
        el.classList.add(this.pickerId);
        return el;
    }
    
    private createView():HTMLElement {
        let el = document.createElement('datium-container');
        el.innerHTML = headerTemplate + '<datium-all-pickers-container></datium-all-pickers-container>';
        el.classList.add('datium-closed');
        el.classList.add(this.pickerId);
        el.style.zIndex = this.opts.zIndex.toString();
        return el;
    }
    
    private insertAfter(node:Node, newNode:Node):void {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    }
}
