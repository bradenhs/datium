const enum StepDirection {
    UP, DOWN
}

class Header extends Common {
    private yearLabel:Element;
    private monthLabel:Element;
    private dateLabel:Element;
    private hourLabel:Element;
    private minuteLabel:Element;
    private secondLabel:Element;
    
    private labels:Element[];
    
    private options:IOptions;
    
    private level:Level;
    private date:Date;
    
    constructor(private element:HTMLElement, private container:HTMLElement) {
        super();
        
        listen.viewchanged(element, (e) => this.viewchanged(e.date, e.level));
        
        this.yearLabel = container.querySelector('datium-span-label.datium-year');
        this.monthLabel = container.querySelector('datium-span-label.datium-month');
        this.dateLabel = container.querySelector('datium-span-label.datium-date');
        this.hourLabel = container.querySelector('datium-span-label.datium-hour');
        this.minuteLabel = container.querySelector('datium-span-label.datium-minute');
        this.secondLabel = container.querySelector('datium-span-label.datium-second');
        
        this.labels = [this.yearLabel, this.monthLabel, this.dateLabel, this.hourLabel, this.minuteLabel, this.secondLabel];
        
        let previousButton = container.querySelector('datium-prev');
        let nextButton = container.querySelector('datium-next');
        let spanLabelContainer = container.querySelector('datium-span-label-container');
        
        listen.tap(previousButton, () => this.previous());
        listen.tap(nextButton, () => this.next());
        listen.tap(spanLabelContainer, () => this.zoomOut());
    }
    
    public updateMaxLevel(level:Level) {
        this.yearLabel.classList.remove('datium-max-level');
        this.monthLabel.classList.remove('datium-max-level');
        this.dateLabel.classList.remove('datium-max-level');
        this.hourLabel.classList.remove('datium-max-level');
        this.minuteLabel.classList.remove('datium-max-level');
        
        switch (level) {
            case Level.MONTH:
                this.yearLabel.classList.add('datium-max-level');
                break;
            case Level.DATE:
                this.monthLabel.classList.add('datium-max-level');
                break;
            case Level.HOUR:
                this.dateLabel.classList.add('datium-max-level');
                break;
            case Level.MINUTE:
                this.hourLabel.classList.add('datium-max-level');
                break;
            case Level.SECOND:
                this.minuteLabel.classList.add('datium-max-level');
                break;
        }
    }
    
    public previous() {
        trigger.goto(this.element, {
           date: this.stepDate(StepDirection.DOWN),
           level: this.level,
           update: false
        });
    }
    
    public next() {
        trigger.goto(this.element, {
           date: this.stepDate(StepDirection.UP),
           level: this.level,
           update: false
        });
    }
    
    private zoomOut() {
        trigger.zoomOut(this.element, {
            date: this.date,
            currentLevel: this.level,
            update: false
        });
    }
    
    private stepDate(stepType:StepDirection):Date {
        let date = new Date(this.date.valueOf());
        let direction = stepType === StepDirection.UP ? 1 : -1;
        
        switch (this.level) {
            case Level.YEAR:
                date.setFullYear(date.getFullYear() + 10 * direction);               
                break;
            case Level.MONTH:
                date.setFullYear(date.getFullYear() + direction);
                break;
            case Level.DATE:
                date.setMonth(date.getMonth() + direction);
                break;
            case Level.HOUR:
                date.setDate(date.getDate() + direction);
                break;
            case Level.MINUTE:
                date.setHours(date.getHours() + direction);
                break;
            case Level.SECOND:
                date.setMinutes(date.getMinutes() + direction);
                break;
        }
        
        return date;
    }
    
    private viewchanged(date:Date, level:Level) {
        // TODO think about making a "viewDate" and a "selectedDate"
        
        this.date = date;
        this.level = level;
        this.labels.forEach((label, labelLevel) => {
            label.classList.remove('datium-top');
            label.classList.remove('datium-bottom');
            label.classList.remove('datium-hidden');
                        
            if (labelLevel < level) {
                label.classList.add('datium-top');
                label.innerHTML = this.getHeaderTopText(this.date, labelLevel);
            } else {
                label.classList.add('datium-bottom');
                label.innerHTML = this.getHeaderBottomText(this.date, labelLevel);
            }
            
            if (labelLevel < level - 1 || labelLevel > level) {
                label.classList.add('datium-hidden');
            }
        });
    }
    
    private getHeaderTopText(date:Date, level:Level):string {
        if (date === void 0) return;
        switch(level) {
            case Level.YEAR:
                return this.getDecade(date);
            case Level.MONTH:
                return date.getFullYear().toString();
            case Level.DATE:
                return `${this.getShortMonths()[date.getMonth()]} ${date.getFullYear()}`;
            case Level.HOUR:
            case Level.MINUTE:
                return `${this.getShortDays()[date.getDay()]} ${this.pad(date.getDate())} ${this.getShortMonths()[date.getMonth()]} ${date.getFullYear()}`;
        }
    }
    
    private getHeaderBottomText(date:Date, level:Level):string {
        if (date === void 0) return;
        switch(level) {
            case Level.YEAR:
                return this.getDecade(date);
            case Level.MONTH:
                return date.getFullYear().toString();
            case Level.DATE:
                return this.getShortMonths()[date.getMonth()];
            case Level.HOUR:
                if (this.options.militaryTime) {
                    return `${this.getShortDays()[date.getDay()]} ${this.pad(date.getDate())} <datium-variable>${this.pad(date.getHours())}<datium-lower>hr</datium-lower></datium-variable>`;
                } else {
                    return `${this.getShortDays()[date.getDay()]} ${this.pad(date.getDate())} <datium-variable>${this.getHours(date)}${this.getMeridiem(date)}</datium-variable>`;    
                }
            case Level.MINUTE:
                if (this.options.militaryTime) {
                    return `${this.pad(date.getHours())}:<datium-variable>${this.pad(date.getMinutes())}</datium-variable>`;    
                } else {
                    return `${this.getHours(date)}:<datium-variable>${this.pad(date.getMinutes())}</datium-variable>${this.getMeridiem(date)}`;
                }
            case Level.SECOND:
                if (this.options.militaryTime) {
                    return `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:<datium-variable>${this.pad(date.getSeconds())}</datium-variable>`;   
                } else {
                    return `${this.getHours(date)}:${this.pad(date.getMinutes())}:<datium-variable>${this.pad(date.getSeconds())}</datium-variable>${this.getMeridiem(date)}`;    
                }
        }
    }
    
    public updateOptions(options:IOptions) {
        let updateView = this.options !== void 0 && this.options.militaryTime !== options.militaryTime;
        this.options = options;
        if (updateView) {
            this.viewchanged(this.date, this.level);
        }
    }
}