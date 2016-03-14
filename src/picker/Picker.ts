class Picker {
    constructor(private element:HTMLInputElement) {
        this.insertAfter(element, this.createView());
        this.insertStyles();
    }
    
    public updateOptions(options:IOptions) {
        
    }
    
    private createView():HTMLElement {
        let el = document.createElement('datium-container');
        el.innerHTML = 'hi';
        return el;
    }
    
    private insertAfter(node:Node, newNode:Node):void {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    }
    
    private insertStyles() {        
        let head = document.head || document.getElementsByTagName('head')[0];
        let styleElement = document.createElement('style');

        styleElement.type = 'text/css';
        if ((<any>styleElement).styleSheet){
            (<any>styleElement).styleSheet.cssText = css;
        } else {
            styleElement.appendChild(document.createTextNode(css));
        }

        head.appendChild(styleElement);  
    }
}
