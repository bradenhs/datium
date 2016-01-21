import ViewManager, {ViewLevel} from 'src/common/ViewManager';
import {onTap} from 'src/common/Events';
import Header from 'src/header/Header';
import {IDatiumOptions} from 'src/DatiumOptions';

export enum Transition {
	SCROLL_LEFT,
	SCROLL_RIGHT,
	ZOOM_IN,
	ZOOM_OUT,
	NONE
}

export class Picker {
    
    protected container:HTMLElement;
    private picker:HTMLElement;
    
    protected height:number = 0;
    
    constructor(container:HTMLElement, viewManager:ViewManager, selectorPrefix:string, protected opts:IDatiumOptions) {
        this.container = container;
        onTap(this.container, selectorPrefix+'-selectable', (e:Event) => {
            let zoomValue = parseInt(e.srcElement.getAttribute('datium-data'));
            if (viewManager.getViewLevel() === ViewLevel.HOUR && (<any>this).meridiem === 'PM') {
                if (zoomValue === 12) zoomValue = 0;
                if (zoomValue === 24) zoomValue = 12;
                zoomValue += 12;
            }
            viewManager.zoomTo(zoomValue); 
        });
    }
    
    public create(transition:Transition, date:Date):void {
        this.picker = document.createElement('datium-picker-container');
        this.populatePicker(this.picker, date);
        
        let className = this.getTransitionClass(transition);
        if (className !== '') this.picker.classList.add(className);
        setTimeout(() => {
            if (className !== '') this.picker.classList.remove(className);
        }, 10);
        this.container.appendChild(this.picker);
    }
    
    protected populatePicker(picker:HTMLElement, date:Date):void {}
    
    public getHeight():number {
        return this.height;
    }
    
    private getTransitionClass(transition:Transition) {
        switch(transition) {
            case Transition.SCROLL_LEFT: return 'datium-transition-left';
            case Transition.SCROLL_RIGHT: return 'datium-transition-right';
            case Transition.ZOOM_IN: return 'datium-transition-in';
            case Transition.ZOOM_OUT: return 'datium-transition-out';
            default: return '';
        }
    }
    
    public destroy(transition:Transition):void {
        this.picker.classList.add(this.getTransitionClass(transition));
        setTimeout((elToRemove:HTMLElement) => {
            elToRemove.remove();
            elToRemove = null;
        }, 400, this.picker);
    }
}