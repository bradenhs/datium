/// <reference path="../../common/Common.ts" />
class Picker extends Common {
    protected pickerContainer:HTMLElement;
    protected min:Date = new Date();
    protected max:Date = new Date();
    protected picker:HTMLElement;
    protected selectedDate:Date;
    protected options:IOptions;
    protected defined:boolean = false;
    
    constructor(protected element:HTMLElement, protected container:HTMLElement) {
        super();
        this.pickerContainer = <HTMLElement>container.querySelector('datium-picker-container');
    }
    
    public create(date:Date, transition:Transition) {
    }
    
    public setDefined(defined:boolean) {
        this.defined = defined;
        this.setSelectedDate(this.selectedDate);
    }
    
    public remove(transition:Transition) {
        if (this.picker === void 0) return;
        clearTimeout(this.transitionInTimeout);
        this.transitionOut(transition, this.picker);
        setTimeout((picker:HTMLElement) => {
            picker.parentNode.removeChild(picker);
        }, this.options.transition ? 500 : 0, this.picker);        
    }
    
    protected getOffset(el:HTMLElement):{x:number, y:number} {
        let x = el.getBoundingClientRect().left - this.container.getBoundingClientRect().left;
        let y = el.getBoundingClientRect().top - this.container.getBoundingClientRect().top;
        return { x: x, y: y };
    }
    
    public updateOptions(options:IOptions) {
        this.options = options;
    }
    
    protected attach() {
        this.pickerContainer.appendChild(this.picker);
    }
    
    public getMin():Date {
        return this.min;
    }
    
    public getMax():Date {
        return this.max;
    }
    
    public setSelectedDate(date:Date):void {
        this.selectedDate = new Date(date.valueOf());
    }
    
    protected transitionOut(transition:Transition, picker:HTMLElement) {
        if (transition === Transition.SLIDE_LEFT) {
            picker.classList.add('datium-picker-right');
        } else if (transition === Transition.SLIDE_RIGHT) {
            picker.classList.add('datium-picker-left');
        } else if (transition === Transition.ZOOM_IN) {
            picker.classList.add('datium-picker-out');
        } else {
            picker.classList.add('datium-picker-in');
        }
    }
    
    protected transitionInTimeout:number;
    
    protected transitionIn(transition:Transition, picker:HTMLElement) {
        let cls:string;
        if (transition === Transition.SLIDE_LEFT) {
            cls = 'datium-picker-left';
        } else if (transition === Transition.SLIDE_RIGHT) {
            cls = 'datium-picker-right';
        } else if (transition === Transition.ZOOM_IN) {
            cls = 'datium-picker-in';
        } else {
            cls = 'datium-picker-out';
        }
        picker.classList.add(cls);
        clearTimeout(this.transitionInTimeout);
        this.transitionInTimeout = setTimeout((p:HTMLElement) => {
            p.classList.remove(cls);
        }, this.options.transition ? 100 : 0, picker);
    }
}
