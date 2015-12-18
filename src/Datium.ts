import template from 'src/view/markup.html!text';

// When in develop this file is empty and so nothing really happens but when building
// in production this file is filled temporarily with stlyes so that styles can be
// added to the page dynamically when in production.
import stylesheet from 'temp/stylesheet.css!text';

export interface IViewParams {
	primary: string;
	primaryText: string;
	secondary: string;
	secondaryText: string;
}

interface IOptions {
	element: HTMLElement;
	max: string;
	min: string;
}

class Datium {
    private static insertedStyles: boolean = false;
    
    constructor(options:IOptions) {
        this.insertAfter(options.element, this.createView());
        this.insertStyles();
    }
    
    private insertStyles():void {
        if (Datium.insertedStyles || stylesheet === '') return;
        Datium.insertedStyles = true;
        
        let styles = document.createElement('style');
        styles.innerText = stylesheet;
        
        document.head.appendChild(styles);        
    }
    
    private createView():HTMLElement {
        let el = document.createElement('dm-datiumRANDOM');
        el.innerHTML = template;
        return el;
    }
    
    private insertAfter(node:Node, newNode:Node):void {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    }
}

(<any>window).Datium = Datium;
