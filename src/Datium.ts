import mainTemplate from 'src/view/main.html!text';
import {onTap} from 'src/Events';
import Header from 'src/Header';
import ViewManager from 'src/ViewManager';

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
    
    private el:HTMLElement;
    private header:Header;
    private viewManager:ViewManager;
    
    constructor(options:IOptions) {
        this.el = this.createView();
        this.viewManager = new ViewManager();
        this.header = new Header(this.el.querySelector('datium-header'), this.viewManager);
        this.insertAfter(options.element, this.el);
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
        let el = document.createElement('datium-container');
        el.innerHTML = mainTemplate;
        return el;
    }
    
    private insertAfter(node:Node, newNode:Node):void {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    }
}

(<any>window).Datium = Datium;
