
class Picker {
    protected pickerContainer:HTMLElement;
    protected min:Date = new Date();
    protected max:Date = new Date();
    protected picker:HTMLElement;
    protected selectedDate:Date;
    
    constructor(element:HTMLElement, private container:HTMLElement) {
        this.pickerContainer = <HTMLElement>container.querySelector('datium-picker-container');
    }
    
    public create(date:Date, transition:Transition) {
    }
    
    public remove(transition:Transition) {
        if (this.picker === void 0) return;
        this.transitionOut(transition);
        setTimeout((picker:HTMLElement) => {
            picker.remove();
        }, 300, this.picker);        
    }
    
    protected getOffset(el:HTMLElement):{x:number, y:number} {
        let x = 0;
        let y = 0;
        do {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.parentElement;
        } while(el !== this.container);
        return {
            x: x, y: y
        }
    }
    
    
    public updateOptions(options:IOptions) {
        
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
        this.picker.classList.remove('datium-from-right');
        this.picker.classList.remove('datium-from-left');
        this.picker.classList.remove('datium-from-in');
        this.picker.classList.remove('datium-from-out');
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
