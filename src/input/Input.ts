class Input {
    private options:IOptions;
    private dateParts:IDatePart[];
    private selectedDatePart:IDatePart;
    
    constructor(public element:HTMLInputElement, private dateManager:DateManager) {
        new KeyboardEventHandler(this, dateManager);
        new MouseEventHandler(this);
    }
    
    public getFirstSelectableDatePart() {
        for (let i = 0; i < this.dateParts.length; i++) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return void 0;
    }

    public getLastSelectableDatePart() {
        for (let i = this.dateParts.length - 1; i >= 0; i--) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return void 0;
    }
    
    public getNextSelectableDatePart() {
        let i = this.dateParts.indexOf(this.selectedDatePart);
        while (++i < this.dateParts.length) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return this.selectedDatePart;
    }
    
    public getPreviousSelectableDatePart() {
        let i = this.dateParts.indexOf(this.selectedDatePart);
        while (--i >= 0) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return this.selectedDatePart;
    }
    
    public getNearestSelectableDatePart(pos:number) {        
        let distance:number = Number.MAX_VALUE;
        let nearestDatePart:IDatePart;
        let start = 0;
        
        for (let i = 0; i < this.dateParts.length; i++) {
            let datePart = this.dateParts[i];
            
            if (datePart.isSelectable()) {
                let fromLeft = pos - start;
                let fromRight = pos - (start + datePart.toString().length);
                
                if (fromLeft > 0 && fromRight < 0) return datePart;
                
                let d = Math.min(Math.abs(fromLeft), Math.abs(fromRight));
                if (d <= distance) {
                    nearestDatePart = datePart;
                    distance = d;
                }
            }
            
            start += datePart.toString().length;
        }
        
        return nearestDatePart;        
    }
    
    public setSelectedDatePart(datePart:IDatePart) {
        this.selectedDatePart = datePart;
    }
    
    public getSelectedDatePart() {
        return this.selectedDatePart;
    }
    
    public update(options:IOptions) {
        this.options = options;
        
        this.dateParts = Parser.parse(options.displayAs);
        this.selectedDatePart = void 0;
        
        this.updateView();
    }
    
    public updateView() {
        let dateString = '';
        this.dateParts.forEach((datePart) => {
            dateString += datePart.toString(); 
        });
        this.element.value = dateString;
        
        if (this.selectedDatePart === void 0) return;
        
        let start = 0;
        
        let i = 0;
        while (this.dateParts[i] !== this.selectedDatePart) {
            start += this.dateParts[i++].toString().length;
        }
        
        let end = start + this.selectedDatePart.toString().length;
        
        this.element.setSelectionRange(start, end);
    }
}