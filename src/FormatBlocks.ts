interface IFormatBlock {
    code:string;
    str(d:Date):string;
    regExp?:string;
    // leaving inc, dec and set unset will make the block unselectable
    inc?(d:Date):Date;
    dec?(d:Date):Date;
    set?(d:Date, v:string|number):Date;
    maxBuffer?(d:Date):number;
}

let formatBlocks:IFormatBlock[] = (function() {
    
    const monthNames:string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames:string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    class DateChain {
        public date:Date;
        constructor(date:Date) {
            this.date = new Date(date.valueOf());
        }
        
        public setSeconds(seconds:string|number):DateChain {
            let num:number;
            if (seconds === 'ZERO_OUT') {
                this.date.setSeconds(0);
                return this;
            } else if (typeof seconds === 'string' && /^\d+$/.test(seconds)) {
                num = parseInt(<string>seconds, 10);
            } else if (typeof seconds === 'number') {
                num = seconds;
            } else {
                this.date = void 0;
                return this;
            }
            if (num < 0 || num > 59) {
                this.date = void 0;
                return this;
            }
            this.date.setSeconds(num);
            return this;
        }
        
        public incSeconds():DateChain {
            let n = this.date.getSeconds() + 1;
            return this.setSeconds(n > 59 ? 0 : n);
        }
        
        public decSeconds():DateChain {
            let n = this.date.getSeconds() - 1;
            return this.setSeconds(n < 0 ? 59 : n);
        }
        
        public setMinutes(minutes:string|number):DateChain {
            let num:number;
            if (minutes === 'ZERO_OUT') {
                this.date.setMinutes(0);
                return this;
            } else if (typeof minutes === 'string' && /^\d+$/.test(minutes)) {
                num = parseInt(<string>minutes, 10);
            } else if (typeof minutes === 'number') {
                num = minutes;
            } else {
                this.date = void 0;
                return this;
            }
            if (num < 0 || num > 59) {
                this.date = void 0;
                return this;
            }
            this.date.setMinutes(num);
            return this;
        }
        
        public incMinutes():DateChain {
            let n = this.date.getMinutes() + 1;
            return this.setMinutes(n > 59 ? 0 : n);
        }
        
        public decMinutes():DateChain {
            let n = this.date.getMinutes() - 1;
            return this.setMinutes(n < 0 ? 59 : n);
        }
        
        public setHours(hours:string|number):DateChain {
            let num:number;
            let meridiem = this.date.getHours() > 11 ? 'PM' : 'AM';
            
            if (hours === 'ZERO_OUT') {
                this.date.setHours(meridiem === 'AM' ? 0 : 12);
                return this;
            } else if (typeof hours === 'string' && /^\d+$/.test(hours)) {
                num = parseInt(<string>hours, 10);
            } else if (typeof hours === 'number') {
                num = hours;
            } else {
                this.date = void 0;
                return this;
            }
            if (num === 0) num = 1;
            if (num < 1 || num > 12) {
                this.date = void 0;
                return this;
            }
            
            if (num === 12 && meridiem === 'AM') {
                num = 0;
            }
            if (num !== 12 && meridiem === 'PM') {
                num += 12;
            }
            this.date.setHours(num);
            return this;
        }
        
        public incHours():DateChain {
            let n = this.date.getHours() + 1;
            return this.setHours(n > 23 ? 0 : n);
        }
        
        public decHours():DateChain {
            let n = this.date.getHours() - 1;
            return this.setHours(n < 0 ? 23 : n);
        }
        
        public setMilitaryHours(hours:string|number):DateChain {
            let num:number;
            if (hours === 'ZERO_OUT') {
                this.date.setHours(0);
                return this;
            } else if (typeof hours === 'string' && /^\d+$/.test(hours)) {
                num = parseInt(<string>hours, 10);
            } else if (typeof hours === 'number') {
                num = hours;
            } else {
                this.date = void 0;
                return this;
            }
            if (num < 0 || num > 23) {
                this.date = void 0;
                return this;
            }
            if (this.date.getHours() === num + 1) {
                this.date.setHours(num);
                if (this.date.getHours() !== num) {
                    this.date.setHours(num - 1);
                }
            } else {
                this.date.setHours(num);
            }
            return this;
        }
        
        public setDate(date:string|number):DateChain {
            let num:number;
            if (date === 'ZERO_OUT') {
                this.date.setDate(1);
                return this;
            } else if (typeof date === 'string' && /\d{1,2}.*$/.test(date)) {
                num = parseInt(<string>date, 10);
            } else if  (typeof date === 'number') {
                num = date;
            } else {
                this.date = void 0;
                return this;
            }
            if (num === 0) num = 1;
            if (num < 1 || num > this.daysInMonth()) {
                this.date = void 0;
                return this;
            }
            this.date.setDate(num);
            return this;
        }
        
        public incDate():DateChain {
            let n = this.date.getDate() + 1;
            return this.setDate(n > this.daysInMonth() ? 1 : n);
        }
        
        public decDate():DateChain {
            let n = this.date.getDate() - 1;
            return this.setDate(n < 0 ? this.daysInMonth() : n);
        }
        
        public setDay(day:string|number):DateChain {
            let num:number;
            if (day === 'ZERO_OUT') {
                return this.setDay(0);
            } else if (typeof day === 'number') {
                num = day;
            } else if (typeof day === 'string' && dayNames.some((dayName) => {
                if (new RegExp(`^${day}.*$`, 'i').test(dayName)) {
                    num = dayNames.indexOf(dayName);
                    return true;
                }
            })) {
            } else {
                this.date = void 0;
                return this;
            }
            
            if (num < 0 || num > 6) {
                this.date = void 0;
                return this;
            }
            
            let offset = this.date.getDay() - num;
            this.date.setDate(this.date.getDate() - offset);
            return this;
        }
        
        public incDay():DateChain {
            let n = this.date.getDay() + 1;
            return this.setDay(n > 6 ? 0 : n);
        }
        
        public decDay():DateChain {
            let n = this.date.getDay() - 1;
            return this.setDay(n < 0 ? 6 : n);
        }
        
        public setMonth(month:string|number):DateChain {
            let num:number;
            if (month === 'ZERO_OUT') {
                this.date.setMonth(0);
                return this;
            } else if (typeof month === 'string' && /^\d+$/.test(month)) {
                num = parseInt(month, 10);
            } else if (typeof month === 'number') {
                num = month;
            } else {
                this.date = void 0;
                return this;
            }
            
            if (num === 0) num = 1;
            if (num < 1 || num > 12) {
                this.date = void 0;
                return this;
            }
            
            this.date.setMonth(num - 1);
            return this;
        }
        
        public incMonth():DateChain {
            let n = this.date.getMonth() + 2;
            return this.setDay(n > 12 ? 1 : n);
        }
        
        public decMonth():DateChain {
            let n = this.date.getMonth();
            return this.setDay(n < 1 ? 12 : n);
        }
        
        public setMonthString(month:string|number):DateChain {
            let num:number;
            
            if (month === 'ZERO_OUT') {
                this.date.setMonth(0);
                return this;
            } else if (typeof month === 'string' && monthNames.some((monthName) => {
                if (new RegExp(`^${month}.*$`, 'i').test(monthName)) {
                    num = monthNames.indexOf(monthName) + 1;
                    return true;
                }
            })) {
            } else {
                this.date = void 0;
                return this;
            }
            
            if (num < 1 || num > 12) {
                this.date = void 0;
                return this;
            }
            
            this.date.setMonth(num - 1);
            return this;
        }
        
        public setYear(year:string|number):DateChain {
            let num:number;
            if (year === 'ZERO_OUT') {
                this.date.setFullYear(0);
                return this;
            } else if (typeof year === 'string' && /^\d+$/.test(year)) {
                num = parseInt(year, 10);
            } else if (typeof year === 'number') {
                num = year;
            } else {
                this.date = void 0;
                return this;
            }        
            this.date.setFullYear(num);
            return this;
        }
        
        public setTwoDigitYear(year:string|number):DateChain {
            let base = Math.floor(this.date.getFullYear()/100)*100;
            let num:number;
            if (year === 'ZERO_OUT') {
                this.date.setFullYear(base);
                return this;
            } else if (typeof year === 'string' && /^\d+$/.test(year)) {
                num = parseInt(year, 10);
            } else if (typeof year === 'number') {
                num = year;
            } else {
                this.date = void 0;
                return this;
            }        
            this.date.setFullYear(base + num);
            return this;
        }
        
        public setUnixSecondTimestamp(seconds:string|number):DateChain {
            let num:number;
            if (seconds === 'ZERO_OUT') {
                this.date = new Date(0);
                return this;
            } else if (typeof seconds === 'string' && /^\d+$/.test(seconds)) {
                num = parseInt(seconds, 10);
            } else if (typeof seconds === 'number') {
                num = seconds;
            } else {
                this.date = void 0;
                return this;
            }        
            this.date = new Date(num * 1000);
            return this;
        }
        
        public setUnixMillisecondTimestamp(milliseconds:string|number):DateChain {
            let num:number;
            if (milliseconds === 'ZERO_OUT') {
                this.date = new Date(0);
                return this;
            } else if (typeof milliseconds === 'string' && /^\d+$/.test(milliseconds)) {
                num = parseInt(milliseconds, 10);
            } else if (typeof milliseconds === 'number') {
                num = milliseconds;
            } else {
                this.date = void 0;
                return this;
            }        
            this.date = new Date(num);
            return this;
        }
        
        public setMeridiem(meridiem:string|number):DateChain {
            let hours = this.date.getHours();
            if (meridiem === 'ZERO_OUT') return this;
            if (typeof meridiem === 'string' && /^am?$/i.test(<string>meridiem)) {
                hours -= 12;
            } else if (typeof meridiem === 'string' && /^pm?$/i.test(<string>meridiem)) {
                hours += 12;
            } else {
                this.date = void 0;
                return this;
            }
            if (hours < 0 || hours > 23) {
                return this;
            }
            this.date.setHours(hours);
            return this;
        }
        
        public incMeridiem():DateChain {
            let n = this.date.getHours() + 12;
            return this.setHours(n > 23 ? n - 24 : n);
        }
        
        public decMeridiem():DateChain {
            let n = this.date.getHours() - 12;
            return this.setHours(n < 0 ? n + 24 : n);
        }
        
        private daysInMonth():number {
            return new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
        }
        
        public maxMonthStringBuffer():number {
            let m = this.date.getMonth();
            if (m === 0) return 2; // Jan
            if (m === 1) return 1; // Feb
            if (m === 2) return 3; // Mar
            if (m === 3) return 2; // Apr
            if (m === 4) return 3; // May
            if (m === 5) return 3; // Jun
            if (m === 6) return 3; // Jul
            if (m === 7) return 2; // Aug
            if (m === 8) return 1; // Sep
            if (m === 9) return 1; // Oct
            if (m === 10) return 1; // Nov
            return 1; // Dec
        }
        
        public maxMonthBuffer():number {
            return this.date.getMonth() > 0 ? 1 : 2;
        }
        
        public maxDateBuffer():number {
            return this.date.getDate() * 10 > this.daysInMonth() ? 1 : 2;
        }
        
        public maxDayStringBuffer():number {
            return this.date.getDay() % 2 == 0 ? 2 : 1;
        }
        
        public maxMilitaryHoursBuffer():number {
            return this.date.getHours() > 2 ? 1 : 2;
        }
        
        public maxHoursBuffer():number {
            if (this.date.getHours() > 11) { // PM
                return this.date.getHours() > 13 ? 1 : 2;
            } else { // AM
                return this.date.getHours() > 1 ? 1 : 2;   
            }        
        }
        
        public maxMinutesBuffer():number {
            return this.date.getMinutes() > 5 ? 1 : 2;
        }
        
        public maxSecondsBuffer():number {
            return this.date.getSeconds() > 5 ? 1 : 2;
        }
    }

    function chain(d:Date):DateChain {
        return new DateChain(d);
    }

    function getUTCOffset(date:Date, showColon:boolean):string {
        let tzo = -date.getTimezoneOffset();
        let dif = tzo >= 0 ? '+' : '-';
        let colon = showColon ? ':' : '';
        return dif + pad(tzo / 60, 2) + colon + pad(tzo % 60, 2);
    }

    function pad(num:number, length:number):string {
        let padded = Math.abs(num).toString();
        while (padded.length < length) padded = '0' + padded;
        return padded;
    }

    function appendOrdinal(num:number):string {
        let j = num % 10;
        let k = num % 100;
        if (j == 1 && k != 11) return num + "st";
        if (j == 2 && k != 12) return num + "nd";
        if (j == 3 && k != 13) return num + "rd";
        return num + "th";
    }

    function toStandardTime(hours:number):number {
        if (hours === 0) return 12;
        return hours > 12 ? hours - 12 : hours;
    }    
    
    return <IFormatBlock[]> [
        { // FOUR DIGIT YEAR
            code: 'YYYY',
            regExp: '\\d{4,4}',
            str: (d) => d.getFullYear().toString(),
            inc: (d) => chain(d).setYear(d.getFullYear() + 1).date,
            dec: (d) => chain(d).setYear(d.getFullYear() - 1).date,
            set: (d, v) => chain(d).setYear(v).date,
            maxBuffer: (d) => 4
        },
        { // TWO DIGIT YEAR
            code: 'YY',
            regExp: '\\d{2,2}',
            str: (d) => d.getFullYear().toString().slice(-2),
            inc: (d) => chain(d).setYear(d.getFullYear() + 1).date,
            dec: (d) => chain(d).setYear(d.getFullYear() - 1).date,
            set: (d, v) => chain(d).setTwoDigitYear(v).date,
            maxBuffer: (d) => 2
        },
        { // LONG MONTH NAME
            code: 'MMMM',
            regExp: `((${monthNames.join(')|(')}))`,
            str: (d) => monthNames[d.getMonth()],
            inc: (d) => chain(d).incMonth().date,
            dec: (d) => chain(d).decMonth().date,
            set: (d, v) => chain(d).setMonthString(v).date,
            maxBuffer: (d) => chain(d).maxMonthStringBuffer()
        },
        { // SHORT MONTH NAME
            code: 'MMM',
            regExp: `((${monthNames.map((v) => v.slice(0,3)).join(')|(')}))`,
            str: (d) => monthNames[d.getMonth()].slice(0,3),
            inc: (d) => chain(d).incMonth().date,
            dec: (d) => chain(d).decMonth().date,
            set: (d, v) => chain(d).setMonthString(v).date,
            maxBuffer: (d) => chain(d).maxMonthStringBuffer()
        },
        { // PADDED MONTH
            code: 'MM',
            regExp: '\\d{2,2}',
            str: (d) => pad(d.getMonth() + 1, 2),
            inc: (d) => chain(d).incMonth().date,
            dec: (d) => chain(d).decMonth().date,
            set: (d, v) => chain(d).setMonth(v).date,
            maxBuffer: (d) => chain(d).maxMonthBuffer()
        },
        { // MONTH
            code: 'M',
            regExp: '\\d{1,2}',
            str: (d) => (d.getMonth() + 1).toString(),
            inc: (d) => chain(d).incMonth().date,
            dec: (d) => chain(d).decMonth().date,
            set: (d, v) => chain(d).setMonth(v).date,
            maxBuffer: (d) => chain(d).maxMonthBuffer()
        },
        { // PADDED DATE
            code: 'DD',
            regExp: '\\d{2,2}',
            str: (d) => pad(d.getDate(), 2),
            inc: (d) => chain(d).incDate().date,
            dec: (d) => chain(d).decDate().date,
            set: (d, v) => chain(d).setDate(v).date,
            maxBuffer: (d) => chain(d).maxDateBuffer()
        },
        { // ORDINAL DATE
            code: 'Do',
            regExp: '\\d{1,2}((th)|(nd)|(rd)|(st))',
            str: (d) => appendOrdinal(d.getDate()),
            inc: (d) => chain(d).incDate().date,
            dec: (d) => chain(d).decDate().date,
            set: (d, v) => chain(d).setDate(v).date,
            maxBuffer: (d) => chain(d).maxDateBuffer()
        },
        { // DATE
            code: 'D',
            regExp: '\\d{1,2}',
            str: (d) => d.getDate().toString(),
            inc: (d) => chain(d).incDate().date,
            dec: (d) => chain(d).decDate().date,
            set: (d, v) => chain(d).setDate(v).date,
            maxBuffer: (d) => chain(d).maxDateBuffer()
        },
        { // LONG DAY NAME
            code: 'dddd',
            regExp: `((${dayNames.join(')|(')}))`,
            str: (d) => dayNames[d.getDay()],
            inc: (d) => chain(d).incDay().date,
            dec: (d) => chain(d).decDay().date,
            set: (d, v) => chain(d).setDay(v).date,
            maxBuffer: (d) => chain(d).maxDayStringBuffer()
        },
        { // SHORT DAY NAME
            code: 'ddd',
            regExp: `((${dayNames.map((v) => v.slice(0,3)).join(')|(')}))`,
            str: (d) => dayNames[d.getDay()].slice(0,3),
            inc: (d) => chain(d).incDay().date,
            dec: (d) => chain(d).decDay().date,
            set: (d, v) => chain(d).setDay(v).date,
            maxBuffer: (d) => chain(d).maxDayStringBuffer()
        },
        { // UNIX TIMESTAMP
            code: 'X',
            regExp: '\\d{1,}',
            str: (d) => Math.floor(d.valueOf() / 1000).toString(),
            inc: (d) => new Date(d.valueOf() + 1000),
            dec: (d) => new Date(d.valueOf() - 1000),
            set: (d, v) => chain(d).setUnixSecondTimestamp(v).date
        },
        { // UNIX MILLISECOND TIMESTAMP
            code: 'x',
            regExp: '\\d{1,}',
            str: (d) => d.valueOf().toString(),
            inc: (d) => new Date(d.valueOf() + 1),
            dec: (d) => new Date(d.valueOf() - 1),
            set: (d, v) => chain(d).setUnixMillisecondTimestamp(v).date
        },
        { // PADDED MILITARY HOURS
            code: 'HH',
            regExp: '\\d{2,2}',
            str: (d) => pad(d.getHours(), 2),
            inc: (d) => chain(d).incHours().date,
            dec: (d) => chain(d).decHours().date,
            set: (d, v) => chain(d).setMilitaryHours(v).date,
            maxBuffer: (d) => chain(d).maxMilitaryHoursBuffer()
        },
        { // MILITARY HOURS
            code: 'H',
            regExp: '\\d{1,2}',
            str: (d) => d.getHours().toString(),
            inc: (d) => chain(d).incHours().date,
            dec: (d) => chain(d).decHours().date,
            set: (d, v) => chain(d).setMilitaryHours(v).date,
            maxBuffer: (d) => chain(d).maxMilitaryHoursBuffer()
        },
        { // PADDED HOURS
            code: 'hh',
            regExp: '\\d{2,2}',
            str: (d) => pad(toStandardTime(d.getHours()), 2),
            inc: (d) => chain(d).incHours().date,
            dec: (d) => chain(d).decHours().date,
            set: (d, v) => chain(d).setHours(v).date,
            maxBuffer: (d) => chain(d).maxHoursBuffer()
        },
        { // HOURS
            code: 'h',
            regExp: '\\d{1,2}',
            str: (d) => toStandardTime(d.getHours()).toString(),
            inc: (d) => chain(d).incHours().date,
            dec: (d) => chain(d).decHours().date,
            set: (d, v) => chain(d).setHours(v).date,
            maxBuffer: (d) => chain(d).maxHoursBuffer()
        },
        { // UPPERCASE MERIDIEM
            code: 'A',
            regExp: '((AM)|(PM))',
            str: (d) => d.getHours() < 12 ? 'AM' : 'PM',
            inc: (d) => chain(d).incMeridiem().date,
            dec: (d) => chain(d).decMeridiem().date,
            set: (d, v) => chain(d).setMeridiem(v).date,
            maxBuffer: (d) => 1
        },
        { // UPPERCASE MERIDIEM
            code: 'a',
            regExp: '((am)|(pm))',
            str: (d) => d.getHours() < 12 ? 'am' : 'pm',
            inc: (d) => chain(d).incMeridiem().date,
            dec: (d) => chain(d).decMeridiem().date,
            set: (d, v) => chain(d).setMeridiem(v).date,
            maxBuffer: (d) => 1
        },
        { // PADDED MINUTES
            code: 'mm',
            regExp: '\\d{2,2}',
            str: (d) => pad(d.getMinutes(), 2),
            inc: (d) => chain(d).incMinutes().date,
            dec: (d) => chain(d).decMinutes().date,
            set: (d, v) => chain(d).setMinutes(v).date,
            maxBuffer: (d) => chain(d).maxMinutesBuffer()
        },
        { // MINUTES
            code: 'm',
            regExp: '\\d{1,2}',
            str: (d) => d.getMinutes().toString(),
            inc: (d) => chain(d).incMinutes().date,
            dec: (d) => chain(d).decMinutes().date,
            set: (d, v) => chain(d).setMinutes(v).date,
            maxBuffer: (d) => chain(d).maxMinutesBuffer()
        },
        { // PADDED SECONDS
            code: 'ss',
            regExp: '\\d{2,2}',
            str: (d) => pad(d.getSeconds(), 2),
            inc: (d) => chain(d).incSeconds().date,
            dec: (d) => chain(d).decSeconds().date,
            set: (d, v) => chain(d).setSeconds(v).date,
            maxBuffer: (d) => chain(d).maxSecondsBuffer()
        },
        { // SECONDS
            code: 's',
            regExp: '\\d{1,2}',
            str: (d) => d.getSeconds().toString(),
            inc: (d) => chain(d).incSeconds().date,
            dec: (d) => chain(d).decSeconds().date,
            set: (d, v) => chain(d).setSeconds(v).date,
            maxBuffer: (d) => chain(d).maxSecondsBuffer()
        },
        { // UTC OFFSET WITH COLON
            code: 'ZZ',
            regExp: '(\\+|\\-)\\d{2,2}:\\d{2,2}',
            str: (d) => getUTCOffset(d, true) //TODO add ability to inc and dec this
        },
        { // UTC OFFSET
            code: 'Z',
            regExp: '(\\+|\\-)\\d{4,4}',
            str: (d) => getUTCOffset(d, false)
        }
    ];
})();


