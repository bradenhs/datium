
class Picker {
    protected pickerContainer:HTMLElement;
    protected min:Date = new Date();
    protected max:Date = new Date();
    protected picker:HTMLElement;
    
    constructor(element:HTMLElement, container:HTMLElement) {
        this.pickerContainer = <HTMLElement>container.querySelector('datium-picker-container');
    }
    
    public create(date:Date, transition:Transition) {
    }
    
    public remove(transition:Transition) {
        
    }
    
    public getDate():Date {
        return null;
    }
    
    public getMin():Date {
        return this.min;
    }
    
    public getMax():Date {
        return this.max;
    }
    
    public getLevel() {
        return Level.YEAR;
    }
    
    public setSelectedDate(date:Date):void {
        
    }
    
    protected transitionOut(transition:Transition) {
        if (transition === Transition.SLIDE_LEFT) {
            this.picker.classList.add('datium-picker-right');
        } else if (transition === Transition.SLIDE_RIGHT) {
            this.picker.classList.add('datium-picker-left');
        } else if (transition === Transition.ZOOM_IN) {
            this.picker.classList.add('datium-picker-out');
        } else {
            this.picker.classList.add('datium-picker-in');
        }
    }
    
    protected transitionIn(transition:Transition) {
        if (transition === Transition.SLIDE_LEFT) {
            this.picker.classList.add('datium-picker-left');
        } else if (transition === Transition.SLIDE_RIGHT) {
            this.picker.classList.add('datium-picker-right');
        } else if (transition === Transition.ZOOM_IN) {
            this.picker.classList.add('datium-picker-in');
        } else {
            this.picker.classList.add('datium-picker-out');
        }
    }
    
    protected getTransitionClass(transition:Transition) {
        return ['datium-transition-left', 'datium-transition-right',
                'datium-transition-in','datium-transition-out'][transition];
    }
}
