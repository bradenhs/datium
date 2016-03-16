class Picker {
    private options:IOptions;
    private picker:HTMLElement;
    
    constructor(private element:HTMLInputElement) {
        this.insertAfter(element, this.createView());
    }
    
    public updateOptions(options:IOptions) {
        let themeUpdated = false;
        if (this.options === void 0 ||
            this.options.theme === void 0 ||
            this.options.theme.primary !== options.theme.primary ||
            this.options.theme.primary_text !== options.theme.primary_text ||
            this.options.theme.secondary !== options.theme.secondary ||
            this.options.theme.secondary_accent !== options.theme.secondary_accent ||
            this.options.theme.secondary_text !== options.theme.secondary_text) {
            themeUpdated = true;
        }
        
        this.options = options;
        
        if (themeUpdated) {
            this.insertStyles();
        }
    }
    
    private createView():HTMLElement {
        this.picker = document.createElement('datium-container');
        this.picker.innerHTML = header;
        
        return this.picker;
    }
    
    private insertAfter(node:Node, newNode:Node):void {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    }
    
    static stylesInserted:number = 0;
    
    private insertStyles() {
        let head = document.head || document.getElementsByTagName('head')[0];
        let styleElement = document.createElement('style');
        
        let styleId = "datium-style" + (Picker.stylesInserted++);
        
        let existingStyleId = this.getExistingStyleId();
        if (existingStyleId !== null) {
            this.picker.classList.remove(existingStyleId);
        }
        
        this.picker.classList.add(styleId);
        
        let transformedCss = css.replace(/_primary_text/g, this.options.theme.primary);
        transformedCss = transformedCss.replace(/_primary/g, this.options.theme.primary_text);
        transformedCss = transformedCss.replace(/_secondary_text/g, this.options.theme.secondary_text);
        transformedCss = transformedCss.replace(/_secondary_accent/g, this.options.theme.secondary_accent);
        transformedCss = transformedCss.replace(/_secondary/g, this.options.theme.secondary);
        transformedCss = transformedCss.replace(/_id/g, styleId);
        
        styleElement.type = 'text/css';
        if ((<any>styleElement).styleSheet){
            (<any>styleElement).styleSheet.cssText = transformedCss;
        } else {
            styleElement.appendChild(document.createTextNode(transformedCss));
        }

        head.appendChild(styleElement);  
    }
    
    private getExistingStyleId():string {
        for (let i = 0; i < this.picker.classList.length; i++) {
            if (/^datium-style\d+$/.test(this.picker.classList.item(i))) {
                return this.picker.classList.item(i);
            }
        }
        return null;
    }
}
