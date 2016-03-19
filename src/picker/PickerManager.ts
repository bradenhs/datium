const enum Transition {
    ZOOM_IN,
    ZOOM_OUT,
    SLIDE_RIGHT,
    SLIDE_LEFT
}

class PickerManager {
    private options:IOptions;
    private container:HTMLElement;
    private header:Header;
    
    private yearPicker:IPicker;
    private monthPicker:IPicker;
    private datePicker:IPicker;
    private hourPicker:IPicker;
    private minutePicker:IPicker;
    private secondPicker:IPicker;
    
    private pickerContainer:HTMLElement;
    
    constructor(private element:HTMLInputElement) {
        this.container = this.createView();
        
        this.insertAfter(element, this.container);
        
        this.pickerContainer = <HTMLElement>this.container.querySelector('datium-picker-container');
        
        this.header = new Header(element, this.container);
        
        this.yearPicker = new YearPicker(element);
        this.monthPicker = new MonthPicker(element);
        this.datePicker = new DatePicker(element);
        this.hourPicker = new HourPicker(element);
        this.minutePicker = new MinutePicker(element);
        this.secondPicker = new SecondPicker(element);
                
        listen.down(this.container, '*', (e) => this.down(e));
        listen.up(document, () => this.up());
        
        listen.mousedown(this.container, (e) => {
           e.preventDefault();
           e.stopPropagation();
           return false; 
        });
        
        listen.viewchanged(element, (e) => this.viewchanged(e.date, e.level));
    }
    
    private viewchanged(date:Date, level:Level) {
        let height = 10;
        switch(level) {
            case Level.YEAR:
                height = this.yearPicker.getHeight();
                break;
            case Level.MONTH:
                height = this.monthPicker.getHeight();
                break;
            case Level.DATE:
                height = this.datePicker.getHeight();
                break;
            case Level.HOUR:
                height = this.hourPicker.getHeight();
                break;
            case Level.MINUTE:
                height = this.minutePicker.getHeight();
                break;
            case Level.SECOND:
                height = this.secondPicker.getHeight();
                break;
            default:
                return;
        }
        this.pickerContainer.style.transform = `translateY(${height-280}px)`;
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
        
        this.header.updateOptions(options, levels);
        
        this.yearPicker.updateOptions(options);
        this.monthPicker.updateOptions(options);
        this.datePicker.updateOptions(options);
        this.hourPicker.updateOptions(options);
        this.minutePicker.updateOptions(options);
        this.secondPicker.updateOptions(options);
    }
    
    private createView():HTMLElement {
        let el = document.createElement('datium-container');
        el.innerHTML = header + `
        <datium-picker-container-wrapper>
            <datium-picker-container></datium-picker-container>
        </datium-picker-container-wrapper>`;
        
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
