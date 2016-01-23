import {IDatiumOptions} from 'src/DatiumOptions';
import ViewManager, {ViewLevel} from 'src/common/ViewManager';

export default class InputManager {
    private currentDate:Date;
    constructor(private opts:IDatiumOptions) {
        
    }
    
    private longMonthNames:string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    private shortMonthNames:string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    private appendOrdinalTo(i:number):string {
        let j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }
    
    private fourDigitYearRegex = new RegExp('YYYY', 'g');
    private twoDigitYearRegex = new RegExp('YY', 'g');
    
    private longMonthNameRegex = new RegExp('MMMM', 'g');
    private shortMonthNameRegex = new RegExp('MMM', 'g');
    
    private paddedMonthDigitRegex = new RegExp('MM', 'g');
    private monthDigitRegex = new RegExp('M', 'g');
    
    private paddedDayOfMonthRegex = new RegExp('DD', 'g');
    private dayOfMonthWithOrdinalRegex = new RegExp('Do', 'g');
    private dayOfMonthRegex = new RegExp('D', 'g');
    
    private unixTimeStampRegex = new RegExp('X', 'g');
    private unixMillisecondTimeStampRegex = new RegExp('x', 'g');
    
    private paddedMilitaryTimeRegex = new RegExp('HH', 'g');
    private militaryTimeRegex = new RegExp('H', 'g');
    
    private paddedHourRegex = new RegExp('hh', 'g');
    private hourRegex = new RegExp('h', 'g');
    
    private capitalMeridiemRegex = new RegExp('A', 'g');
    private lowercaseMeridiemRegex = new RegExp('a', 'g');
    
    private paddedMinutesRegex = new RegExp('mm', 'g');
    private minutesRegex = new RegExp('m', 'g');
    
    private paddedSecondsRegex = new RegExp('ss', 'g');
    private secondsRegex = new RegExp('s', 'g');
    
    private utcOffsetWithColonRegex = new RegExp('ZZ', 'g');
    private utcOffsetRegex = new RegExp('Z', 'g');
    
    private militaryToNormal(hour):number {
        if (hour === 0) return 12;
        if (hour > 12) return hour - 12;
        return hour; 
    }
    
    private getUTCOffset(date:Date, includeColon:boolean):string {
        let tzo = -date.getTimezoneOffset();
        let dif = tzo >= 0 ? '+' : '-';
        let colon = includeColon ? ':' : '';
        return dif + this.pad(tzo / 60, 2) + colon + this.pad(tzo % 60, 2);
    }
    
    
    
    public update(date:Date, level:ViewLevel, lastDate:Date, lastLevel:ViewLevel, selectedDate:Date):void {
        if (this.currentDate !== void 0 && this.currentDate.valueOf() === selectedDate.valueOf() && level === lastLevel) {
            return;
        }
        this.currentDate = new Date(selectedDate.valueOf());
        
        let result = this.opts.displayFormat;
        
        // Get time parts
        
        // DO MATCHEDS WITH REGEX INSTEAD
        
        let fourDigitYear = this.pad(this.currentDate.getFullYear(), 4);
        let twoDigitYear = fourDigitYear.slice(2, 4); 
        
        let longMonthName = this.longMonthNames[this.currentDate.getMonth()];
        let shortMonthName = this.shortMonthNames[this.currentDate.getMonth()];
        
        let paddedMonthDigit = this.pad(this.currentDate.getMonth() + 1, 2);
        let monthDigit = (this.currentDate.getMonth() + 1).toString();
        
        let paddedDayOfMonth = this.pad(this.currentDate.getDate(), 2);
        let dayOfMonthWithOrdinal = this.appendOrdinalTo(this.currentDate.getDate());
        let dayOfMonth = this.currentDate.getDate().toString();
        
        let unixTimeStamp = Math.round(this.currentDate.valueOf() / 1000).toString();
        let unixMillisecondTimeStamp = this.currentDate.valueOf().toString();
        
        let paddedMilitaryTime = this.pad(this.currentDate.getHours(), 2);
        let militaryTime = this.currentDate.getHours().toString();
        
        let paddedHour = this.pad(this.militaryToNormal(this.currentDate.getHours()), 2);
        let hour = this.militaryToNormal(this.currentDate.getHours()).toString();
        
        let capitalMeridiem = this.currentDate.getHours() > 11 ? 'PM' : 'AM';
        let lowercaseMeridiem = capitalMeridiem.toLowerCase();
        
        let paddedMinutes = this.pad(this.currentDate.getMinutes(), 2);
        let minutes = this.currentDate.getMinutes().toString();
        
        let paddedSeconds = this.pad(this.currentDate.getSeconds(), 2);
        let seconds = this.currentDate.getSeconds().toString();
        
        let utcOffsetWithColon = this.getUTCOffset(this.currentDate, true);
        let utcOffset = this.getUTCOffset(this.currentDate, false);
        
        //result.match(this.fourDigitYearRegex);
        
        result = result.replace(this.fourDigitYearRegex, fourDigitYear);
        result = result.replace(this.twoDigitYearRegex, twoDigitYear);
        result = result.replace(this.longMonthNameRegex, longMonthName);
        result = result.replace(this.shortMonthNameRegex, shortMonthName);
        result = result.replace(this.paddedMonthDigitRegex, paddedMonthDigit);
        result = result.replace(this.monthDigitRegex, monthDigit);
        result = result.replace(this.paddedDayOfMonthRegex, paddedDayOfMonth);
        result = result.replace(this.dayOfMonthWithOrdinalRegex, dayOfMonthWithOrdinal);
        result = result.replace(this.dayOfMonthRegex, dayOfMonth);
        result = result.replace(this.unixTimeStampRegex, unixTimeStamp);
        result = result.replace(this.unixMillisecondTimeStampRegex, unixMillisecondTimeStamp);
        result = result.replace(this.paddedMilitaryTimeRegex, paddedMilitaryTime);
        result = result.replace(this.militaryTimeRegex, militaryTime);
        result = result.replace(this.paddedHourRegex, paddedHour);
        result = result.replace(this.hourRegex, hour);
        result = result.replace(this.capitalMeridiemRegex, capitalMeridiem);
        result = result.replace(this.lowercaseMeridiemRegex, lowercaseMeridiem);
        result = result.replace(this.paddedMinutesRegex, paddedMinutes);
        result = result.replace(this.minutesRegex, minutes);
        result = result.replace(this.paddedSecondsRegex, paddedSeconds);
        result = result.replace(this.secondsRegex, seconds);
        result = result.replace(this.utcOffsetWithColonRegex, utcOffsetWithColon);
        result = result.replace(this.utcOffsetRegex, utcOffset);
        
        this.opts.element.value = result;
    }
    
    private pad(num:number, totalDigits:number):string {
        let result = num.toString();
        while (result.length < totalDigits) {
            result = '0' + result;
        }
        return result;
    }
}