/// <reference path="../../common/Common.ts" />
class Picker extends Common {
    protected pickerContainer:HTMLElement;
    protected min:Date = new Date();
    protected max:Date = new Date();
    protected picker:HTMLElement;
    protected dragWrapper:HTMLElement;
    protected selectedDate:Date;
    
    constructor(element:HTMLElement, private container:HTMLElement) {
        super();
        this.pickerContainer = <HTMLElement>container.querySelector('datium-picker-container');
    }
    
    public create(date:Date, transition:Transition) {
    }
    
    public remove(transition:Transition) {
        if (this.dragWrapper === void 0) return;
        this.transitionOut(transition);
        setTimeout((dragWrapper:HTMLElement) => {
            dragWrapper.remove();
        }, 400, this.dragWrapper);        
    }
    
    protected getOffset(el:HTMLElement):{x:number, y:number} {
        let x = el.getBoundingClientRect().left - this.container.getBoundingClientRect().left;
        let y = el.getBoundingClientRect().top - this.container.getBoundingClientRect().top;
        return { x: x, y: y };
    }
    
    public updateOptions(options:IOptions) {
        
    }
    
    protected attach() {
        this.dragWrapper = document.createElement('datium-drag-wrapper');
        this.dragWrapper.appendChild(this.picker);
        this.pickerContainer.appendChild(this.dragWrapper);
    }
    
    public getDragWrapper():HTMLElement {
        return this.dragWrapper;
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
    
    protected transitionOut(transition:Transition) {
        if (transition === Transition.SLIDE_LEFT) {
            this.picker.classList.add('datium-to-right');
        } else if (transition === Transition.SLIDE_RIGHT) {
            this.picker.classList.add('datium-to-left');
        } else if (transition === Transition.ZOOM_IN) {
            this.picker.classList.add('datium-to-out');
        } else {
            this.picker.classList.add('datium-to-in');
        }
    }
    
    protected transitionIn(transition:Transition) {
        if (transition === Transition.SLIDE_LEFT) {
            this.picker.classList.add('datium-from-right');
        } else if (transition === Transition.SLIDE_RIGHT) {
            this.picker.classList.add('datium-from-left');
        } else if (transition === Transition.ZOOM_IN) {
            this.picker.classList.add('datium-from-in');
        } else {
            this.picker.classList.add('datium-from-out');
        }
    }
}
