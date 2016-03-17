class PickerManager {
    private options:IOptions;
    private container:HTMLElement;
    private header:Header;
    private pickers:IPicker[];
    
    constructor(private element:HTMLInputElement) {
        this.container = this.createView();
        
        this.insertAfter(element, this.container);
        
        this.header = new Header(element, this.container);
        
        listen.viewchanged(element, (e) => this.viewchanged(e.date, e.level));
        
        listen.down(this.container, '*', (e) => this.down(e));
        listen.up(document, () => this.up());
    }
    
    private up() {
        let activeElements = this.container.querySelectorAll('.datium-active');
        for (let i = 0; i < activeElements.length; i++) {
            activeElements[i].classList.remove('datium-active');
        }
        this.container.classList.remove('datium-active');
    }
    
    private down(e:MouseEvent|TouchEvent) {
        let el = e.srcElement || <Element>e.target;
        while (el !== this.container) {
            el.classList.add('datium-active');
            el = el.parentElement;
        }
        this.container.classList.add('datium-active');
    }
    
    private currentPicker:IPicker;
    
    private viewchanged(date:Date, level:Level):void {
        if (this.pickers[level] === void 0) return; // close the picker
        this.currentPicker = this.pickers[level];
    }
    
    public updateOptions(options:IOptions, levels:Level[]) {
        let themeUpdated = this.options === void 0 ||
            this.options.theme === void 0 ||
            this.options.theme.primary !== options.theme.primary ||
            this.options.theme.primary_text !== options.theme.primary_text ||
            this.options.theme.secondary !== options.theme.secondary ||
            this.options.theme.secondary_accent !== options.theme.secondary_accent ||
            this.options.theme.secondary_text !== options.theme.secondary_text;
        
        this.options = options;
        
        if (themeUpdated) {
            this.insertStyles();
        }
        
        this.pickers = [];
        levels.forEach((level) => {
            switch (level) {
                case Level.YEAR:
                    this.pickers[Level.YEAR] = new YearPicker();
                    break;
                case Level.MONTH:
                    this.pickers[Level.MONTH] = new MonthPicker();
                    break;
                case Level.DATE:
                    this.pickers[Level.DATE] = new DatePicker();
                    break;
                case Level.HOUR:
                    this.pickers[Level.HOUR] = new HourPicker();
                    break;
                case Level.MINUTE:
                    this.pickers[Level.MINUTE] = new MinutePicker();
                    break;
                case Level.SECOND:
                    this.pickers[Level.SECOND] = new SecondPicker();
                    break;
            }
        });
    }
    
    private createView():HTMLElement {
        let el = document.createElement('datium-container');
        el.innerHTML = header + '<datium-picker-container></datium-picker-container>';
        
        return el;
    }
    
    private insertAfter(node:Node, newNode:Node):void {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    }
    
    static stylesInserted:number = 0;
    
    private insertStyles() {
        let head = document.head || document.getElementsByTagName('head')[0];
        let styleElement = document.createElement('style');
        
        let styleId = "datium-style" + (PickerManager.stylesInserted++);
        
        let existingStyleId = this.getExistingStyleId();
        if (existingStyleId !== null) {
            this.container.classList.remove(existingStyleId);
        }
        
        this.container.classList.add(styleId);
        
        let transformedCss = css.replace(/_primary_text/g, this.options.theme.primary_text);
        transformedCss = transformedCss.replace(/_primary/g, this.options.theme.primary);
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
        for (let i = 0; i < this.container.classList.length; i++) {
            if (/^datium-style\d+$/.test(this.container.classList.item(i))) {
                return this.container.classList.item(i);
            }
        }
        return null;
    }
}
