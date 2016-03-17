class Header {
    private yearLabel:Element;
    private monthLabel:Element;
    private dateLabel:Element;
    private hourLabel:Element;
    private minuteLabel:Element;
    private secondLabel:Element;
    
    private labels:Element[];
    
    private options:IOptions;
    
    constructor(private element:HTMLElement, private container:HTMLElement) {
        listen.viewchanged(element, (e) => this.viewchanged(e.date, e.level));
        
        this.yearLabel = container.querySelector('datium-span-label.datium-year');
        this.monthLabel = container.querySelector('datium-span-label.datium-month');
        this.dateLabel = container.querySelector('datium-span-label.datium-date');
        this.hourLabel = container.querySelector('datium-span-label.datium-hour');
        this.minuteLabel = container.querySelector('datium-span-label.datium-minute');
        this.secondLabel = container.querySelector('datium-span-label.datium-second');
        
        this.labels = [this.yearLabel, this.monthLabel, this.dateLabel, this.hourLabel, this.minuteLabel, this.secondLabel];
    }
    
    private viewchanged(date:Date, level:Level) {
        this.labels.forEach((label, i) => {
            label.classList.remove('datium-top');
            label.classList.remove('datium-bottom');
            label.classList.remove('datium-hidden');
                        
            if (i < level) {
                label.classList.add('datium-top');
                label.innerHTML = this.getHeaderTopText(date, i);
            } else {
                label.classList.add('datium-bottom');
                label.innerHTML = this.getHeaderBottomText(date, i);
            }
            
            if (i < level - 1 || i > level) {
                label.classList.add('datium-hidden');
            }
        });
    }
    
    // genreAL USE?
    private getMonth(date:Date):string {
        return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][date.getMonth()];
    }
    
    // genreAL USE?
    private getDay(date:Date):string {
        return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
    }
    
    private getHeaderTopText(date:Date, level:Level):string {
        switch(level) {
            case Level.YEAR:
                return this.getDecade(date);
            case Level.MONTH:
                return date.getFullYear().toString();
            case Level.DATE:
                return `${this.getMonth(date)} ${date.getFullYear()}`;
            case Level.HOUR:
            case Level.MINUTE:
                return `${this.getDay(date)} ${this.pad(date.getDate())} ${this.getMonth(date)} ${date.getFullYear()}`;
        }
    }
    
    // genreAL USE?
    private pad(num:number|string, size:number = 2) {
        let str = num.toString();
        while(str.length < size) str = '0' + str;
        return str;
    }
    
    // general use?
    private getDecade(date:Date):string {
        return `${Math.floor(date.getFullYear()/10)*10} - ${Math.ceil((date.getFullYear() + 1)/10)*10}`;
    }
    
    // general use?
    private getHours(date:Date):string {
        let num = date.getHours();
        if (num === 0) num = 12;
        if (num > 12) num -= 12;
        return num.toString();
    }
    
    // general use?
    private getMeridiem(date:Date):string {
        return date.getHours() < 12 ? 'AM' : 'PM';
    }
    
    private getHeaderBottomText(date:Date, level:Level):string {
        switch(level) {
            case Level.YEAR:
                return this.getDecade(date);
            case Level.MONTH:
                return date.getFullYear().toString();
            case Level.DATE:
                return this.getMonth(date);
            case Level.HOUR:
                return `${this.getDay(date)} ${this.pad(date.getDate())} <datium-variable>${this.getHours(date)}${this.getMeridiem(date)}</datium-variable>`;
            case Level.MINUTE:
                return `${this.getHours(date)}:<datium-variable>${this.pad(date.getMinutes())}</datium-variable>${this.getMeridiem(date)}`;
            case Level.SECOND:
                return `${this.getHours(date)}:${this.pad(date.getMinutes())}:<datium-variable>${this.pad(date.getSeconds())}</datium-variable>${this.getMeridiem(date)}`;
        }
    }
    
    private updateOptions(options:IOptions) {
        this.options = options;
    }
}