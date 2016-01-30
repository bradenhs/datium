import {IDatiumOptions} from 'src/DatiumOptions';
import ViewManager, {ViewLevel} from 'src/common/ViewManager';
import {onKeyDown, onDown, onUp, onFocus, onBlur, KeyCodes, onPaste} from 'src/common/Events';

export default class InputManager {
    private currentDate:Date;
    private levelOrder:ViewLevel[];
    constructor(private opts:IDatiumOptions, private viewManager:ViewManager) {
        let dateStr = this.join(this.split(this.opts.displayFormat), '[~', '~]');
        
        // YEAR
        dateStr = this.replace(dateStr, this.fourDigitYearRegex, 'YYYY');
        dateStr = this.replace(dateStr, this.twoDigitYearRegex, 'YY');
        
        // MONTH
        dateStr = this.replace(dateStr, this.longMonthNameRegex, 'MMMM');
        dateStr = this.replace(dateStr, this.shortMonthNameRegex, 'MMM');
        dateStr = this.replace(dateStr, this.paddedMonthDigitRegex, 'MM');
        dateStr = this.replace(dateStr, this.monthDigitRegex, 'M');
        
        // DAY
        dateStr = this.replace(dateStr, this.paddedDayOfMonthRegex, 'DD');
        dateStr = this.replace(dateStr, this.dayOfMonthWithOrdinalRegex, 'Do');
        dateStr = this.replace(dateStr, this.dayOfMonthRegex, 'D');
        
        // MISC
        dateStr = this.replace(dateStr, this.unixTimeStampRegex, 'X');
        dateStr = this.replace(dateStr, this.unixMillisecondTimeStampRegex, 'x');
        
        // HOUR
        dateStr = this.replace(dateStr, this.paddedMilitaryTimeRegex, 'HH');
        dateStr = this.replace(dateStr, this.militaryTimeRegex, 'H');
        dateStr = this.replace(dateStr, this.paddedHourRegex, 'hh');
        dateStr = this.replace(dateStr, this.hourRegex, 'h');
        dateStr = this.replace(dateStr, this.capitalMeridiemRegex, 'A');
        dateStr = this.replace(dateStr, this.lowercaseMeridiemRegex, 'a');
        
        // MINUTE
        dateStr = this.replace(dateStr, this.paddedMinutesRegex, 'mm');
        dateStr = this.replace(dateStr, this.minutesRegex, 'm');
        
        // SECOND
        dateStr = this.replace(dateStr, this.paddedSecondsRegex, 'ss');
        dateStr = this.replace(dateStr, this.secondsRegex, 's');
        
        // MISC
        dateStr = this.replace(dateStr, this.utcOffsetWithColonRegex, 'X');
        dateStr = this.replace(dateStr, this.utcOffsetRegex, 'x');
        
        let split = this.split(dateStr);
        this.levelOrder = [];
        for (let i:number = 1; i < split.length; i+=2) {
            if ((split[i].charAt(0) === '~' && split[i].charAt(split[i].length - 1) === '~') ||
                split[i].toLowerCase() === 'a') {
                continue;
            } else {
                let level = this.getLevel(split[i]);
                if (level !== void 0 && this.levelOrder.indexOf(level) === -1) {
                    this.levelOrder.push(level);
                }
            }
        }
        let tabPressed = false;
        let shiftTabPressed = false;
        onKeyDown(document, (e:KeyboardEvent) => {
            if (e.shiftKey && e.keyCode === KeyCodes.TAB) {
                shiftTabPressed = true;
            } else if (e.keyCode === KeyCodes.TAB) {
                tabPressed = true;
            }
            setTimeout(() => {
                shiftTabPressed = false;
                tabPressed = false;
            });
        });
        onKeyDown(this.opts.element, (e:KeyboardEvent) => {
            this.keyDown(e);
        });
        let downed = false;
        onDown(this.opts.element, () => {
            if (this.opts.element === document.activeElement) {
                downed = true;
                this.downEvent();
            } else {
                this.stopUpdate = true;
            }
        });
        onFocus(this.opts.element, (e) => {
            if (tabPressed) {
                this.viewManager.changeViewLevel(this.levelOrder[0]);
            } else if (shiftTabPressed) {
                this.viewManager.changeViewLevel(this.levelOrder[this.levelOrder.length - 1]);  
            } else {
                setTimeout(() => {
                    this.stopUpdate = false;
                    downed = true;
                    this.selectionStart = this.opts.element.selectionStart;
                    this.upEvent();
                    downed = false;
                });
            }
        })
        onUp(this.opts.element, () => {
            if (downed) {
                this.upEvent();
            }
            downed = false;
        });
        onPaste(this.opts.element, (event:ClipboardEvent) => {
            let originalValue = this.opts.element.value;
            setTimeout(() => {
                let d = new Date(this.opts.element.value);
                if (d.toString() === "Invalid Date") {
                    this.opts.element.value = originalValue;
                }
            });
        });
    }
    
    private textBuffer:string = '';
    private keyDown(e:KeyboardEvent):void {
        if (e.keyCode === KeyCodes.LEFT || (e.shiftKey && e.keyCode === KeyCodes.TAB)) {
            if (this.previous()) {
                e.preventDefault();    
            }
        } else if (e.keyCode === KeyCodes.RIGHT || e.keyCode === KeyCodes.TAB) {
            if (this.next()) {
                e.preventDefault();
            }
        } else if (e.keyCode === KeyCodes.UP) {
            this.viewManager.increment();
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.DOWN) {
            this.viewManager.decrement();
            e.preventDefault();
        }
        
    }
    
    private getLevelFormat():string {
        switch (this.viewManager.getViewLevel()) {
            case ViewLevel.SECOND:
            case ViewLevel.MINUTE:
            case ViewLevel.HOUR:
            case ViewLevel.DAY:
            case ViewLevel.MONTH:
            case ViewLevel.YEAR:
        }
        return '';
    }
    
    private stopUpdate:boolean = false;
    
    private selectionStart:number;
    
    private downEvent():void {
        setTimeout(() => {
            this.selectionStart = this.opts.element.selectionStart;
        });
    }
    
    private upEvent():void {
        if (this.opts.element.selectionStart === 0 &&
            this.opts.element.selectionEnd === this.opts.element.value.length) {
            return;
        }
        
        let select;
        if (this.opts.element.selectionStart === this.selectionStart) {
            select = this.opts.element.selectionEnd;
        } else if (this.opts.element.selectionEnd === this.selectionStart) {
            select = this.opts.element.selectionStart;
        } else {
            select = this.selectionStart;
        }
        
        let secondDiff = this.getDiff(this.secondSelection, select);
        let minuteDiff = this.getDiff(this.minuteSelection, select);
        let hourDiff = this.getDiff(this.hourSelection, select);
        let dayDiff = this.getDiff(this.daySelection, select);
        let monthDiff = this.getDiff(this.monthSelection, select);
        let yearDiff = this.getDiff(this.yearSelection, select);
        
        let diffs = [secondDiff, minuteDiff, hourDiff, dayDiff, monthDiff, yearDiff];
        
        let lowestDiff;
        let lowestDiffIndex;
        for (let i = 0; i < diffs.length; i++) {
            if (lowestDiff === void 0) {
                lowestDiff = diffs[i];
                lowestDiffIndex = i;
            } else if (diffs[i] !== void 0 && diffs[i] < lowestDiff) {
                lowestDiff = diffs[i];
                lowestDiffIndex = i;
            }
        }
        
        let closestSelection:Selection;
        let selectedViewLevel:ViewLevel;
        switch(lowestDiffIndex) {
            case 0: //second
                closestSelection = this.secondSelection;
                selectedViewLevel = ViewLevel.SECOND;
                break;
            case 1: //minute
                closestSelection = this.minuteSelection;
                selectedViewLevel = ViewLevel.MINUTE;
                break;
            case 2: //hour
                closestSelection = this.hourSelection;
                selectedViewLevel = ViewLevel.HOUR;
                break;
            case 3: //day
                closestSelection = this.daySelection;
                selectedViewLevel = ViewLevel.DAY;
                break;
            case 4: //month
                closestSelection = this.monthSelection;
                selectedViewLevel = ViewLevel.MONTH;
                break;
            case 5: //year
                closestSelection = this.yearSelection;
                selectedViewLevel = ViewLevel.YEAR;
                break;
        }
        
        if (closestSelection === void 0) {
            this.viewManager.changeViewLevel(this.opts.startView); // TODO figure this out better
        } else {
            this.viewManager.changeViewLevel(selectedViewLevel);
            this.opts.element.setSelectionRange(closestSelection.start, closestSelection.end);            
        }        
    }
    
    private getDiff(selection:Selection, select:number):number {
        if (selection !== void 0) {
            let startDiff = Math.abs(select - selection.start);
            let endDiff = Math.abs(select - selection.end);
            return Math.min(startDiff, endDiff);
        }
        return void 0;
    }
    
    private getIntervalForLevel(level:ViewLevel):number {
        switch(level) {
            case ViewLevel.SECOND: return this.opts.secondSelectionInterval;
            case ViewLevel.MINUTE: return this.opts.minuteSelectionInterval;
            case ViewLevel.HOUR: return this.opts.hourSelectionInterval;
            default: return 1;
        }
    }
    
    private previous():boolean {
        let curIndex = this.levelOrder.indexOf(this.viewManager.getViewLevel());
        if (curIndex !== void 0 && curIndex - 1 > -1) {
            this.viewManager.changeViewLevel(this.levelOrder[curIndex - 1]);
            return true;
        }
        return false;
    }
    
    private next():boolean {
        let curIndex = this.levelOrder.indexOf(this.viewManager.getViewLevel());
        if (curIndex !== void 0 && curIndex + 1 < this.levelOrder.length) {
            this.viewManager.changeViewLevel(this.levelOrder[curIndex + 1]);
            return true;
        }
        return false;
    }
    
    private getLevel(str:string):ViewLevel {
        switch(str) {
            case 'YYYY':
            case 'YY':
                return ViewLevel.YEAR;
            case 'MMMM':
            case 'MMM':
            case 'MM':
            case 'M':
                return ViewLevel.MONTH;
            case 'DD':
            case 'Do':
            case 'D':
                return ViewLevel.DAY;
            case 'A':
            case 'a':
            case 'HH':
            case 'H':
            case 'hh':
            case 'h':
                return ViewLevel.HOUR;
            case 'mm':
            case 'm':
                return ViewLevel.MINUTE;
            case 'ss':
            case 's':
                return ViewLevel.SECOND;
        }
        return void 0;
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
    
    private split(str:string):string[] {
        return str.split(/\[([^[\]]+)\]/g);
    }
    
    private replace(str:string, regex:RegExp, replaceWith:string):string {
        let splits = this.split(str);
        for (let i = 0; i < splits.length; i += 2) {
            splits[i] = splits[i].replace(regex, '['+replaceWith+']');
        }
        return this.join(splits, '[', ']');
    }
    
    private join(array:string[], leftJoin:string, rightJoin:string):string {
        let join = leftJoin;
        while (array.length > 1) {
            array[1] = [array[0], array[1]].join(join);
            array.splice(0, 1);
            join = join === leftJoin ? rightJoin : leftJoin;
        }
        return array[0];
    }
    
    public update(date:Date, level:ViewLevel, lastDate:Date, lastLevel:ViewLevel, selectedDate:Date):void {
        if (this.stopUpdate) return;
        if (this.currentDate !== void 0 && this.currentDate.valueOf() === selectedDate.valueOf() && level === lastLevel) {
            return;
        }
        this.currentDate = new Date(selectedDate.valueOf());
                
        let fourDigitYear = 'Y'+this.pad(this.currentDate.getFullYear(), 4);
        let twoDigitYear = 'Y'+fourDigitYear.slice(3, 5); 
        
        let longMonthName = 'M'+this.longMonthNames[this.currentDate.getMonth()];
        let shortMonthName = 'M'+this.shortMonthNames[this.currentDate.getMonth()];
        
        let paddedMonthDigit = 'M'+this.pad(this.currentDate.getMonth() + 1, 2);
        let monthDigit = 'M'+(this.currentDate.getMonth() + 1).toString();
        
        let paddedDayOfMonth = 'D'+this.pad(this.currentDate.getDate(), 2);
        let dayOfMonthWithOrdinal = 'D'+this.appendOrdinalTo(this.currentDate.getDate());
        let dayOfMonth = 'D'+this.currentDate.getDate().toString();
        
        let unixTimeStamp = 'X'+Math.round(this.currentDate.valueOf() / 1000).toString();
        let unixMillisecondTimeStamp = 'X'+this.currentDate.valueOf().toString();
        
        let paddedMilitaryTime = 'H'+this.pad(this.currentDate.getHours(), 2);
        let militaryTime = 'H'+this.currentDate.getHours().toString();
        
        let paddedHour = 'H'+this.pad(this.militaryToNormal(this.currentDate.getHours()), 2);
        let hour = 'H'+this.militaryToNormal(this.currentDate.getHours()).toString();
        
        let capitalMeridiem = 'A'+(this.currentDate.getHours() > 11 ? 'PM' : 'AM');
        let lowercaseMeridiem = 'A'+capitalMeridiem.toLowerCase();
        
        let paddedMinutes = 'm'+this.pad(this.currentDate.getMinutes(), 2);
        let minutes = 'm'+this.currentDate.getMinutes().toString();
        
        let paddedSeconds = 's'+this.pad(this.currentDate.getSeconds(), 2);
        let seconds = 's'+this.currentDate.getSeconds().toString();
        
        let utcOffsetWithColon = 'Z'+this.getUTCOffset(this.currentDate, true);
        let utcOffset = 'Z'+this.getUTCOffset(this.currentDate, false);
        
        let result = this.join(this.split(this.opts.displayFormat), '[~', '~]');
        
        // YEAR
        result = this.replace(result, this.fourDigitYearRegex, fourDigitYear);
        result = this.replace(result, this.twoDigitYearRegex, twoDigitYear);
        
        // MONTH
        result = this.replace(result, this.longMonthNameRegex, longMonthName);
        result = this.replace(result, this.shortMonthNameRegex, shortMonthName);
        result = this.replace(result, this.paddedMonthDigitRegex, paddedMonthDigit);
        result = this.replace(result, this.monthDigitRegex, monthDigit);
        
        // DAY
        result = this.replace(result, this.paddedDayOfMonthRegex, paddedDayOfMonth);
        result = this.replace(result, this.dayOfMonthWithOrdinalRegex, dayOfMonthWithOrdinal);
        result = this.replace(result, this.dayOfMonthRegex, dayOfMonth);
        
        // MISC
        result = this.replace(result, this.unixTimeStampRegex, unixTimeStamp);
        result = this.replace(result, this.unixMillisecondTimeStampRegex, unixMillisecondTimeStamp);
        
        // HOUR
        result = this.replace(result, this.paddedMilitaryTimeRegex, paddedMilitaryTime);
        result = this.replace(result, this.militaryTimeRegex, militaryTime);
        result = this.replace(result, this.paddedHourRegex, paddedHour);
        result = this.replace(result, this.hourRegex, hour);
        result = this.replace(result, this.capitalMeridiemRegex, capitalMeridiem);
        result = this.replace(result, this.lowercaseMeridiemRegex, lowercaseMeridiem);
        
        // MINUTE
        result = this.replace(result, this.paddedMinutesRegex, paddedMinutes);
        result = this.replace(result, this.minutesRegex, minutes);
        
        // SECOND
        result = this.replace(result, this.paddedSecondsRegex, paddedSeconds);
        result = this.replace(result, this.secondsRegex, seconds);
        
        // MISC
        result = this.replace(result, this.utcOffsetWithColonRegex, utcOffsetWithColon);
        result = this.replace(result, this.utcOffsetRegex, utcOffset);
        
        let secondSearches = [paddedSeconds, seconds];
        let minuteSearches = [paddedMinutes, minutes];
        let hourSearches = [paddedMilitaryTime, militaryTime, paddedHour, hour];
        let daySearches = [paddedDayOfMonth, dayOfMonthWithOrdinal, monthDigit];
        let monthSearches = [longMonthName, shortMonthName, paddedMonthDigit, monthDigit];
        let yearSearches = [fourDigitYear, twoDigitYear];

        this.secondSelection = void 0;
        this.minuteSelection = void 0;
        this.hourSelection = void 0;
        this.daySelection = void 0;
        this.monthSelection = void 0;
        this.yearSelection = void 0;

        let split = this.split(result);
        for (let i:number = 1; i < split.length; i+=2) {
            if (split[i].charAt(0) === '~' && split[i].charAt(split[i].length - 1) === '~') {
                split[i] = split[i].slice(1, split[i].length - 1);
            } else {
                
                if (this.secondSelection === void 0) {
                    this.secondSelection = this.updateSelectionGroup(secondSearches, split, i);
                }
                if (this.minuteSelection === void 0) {
                    this.minuteSelection = this.updateSelectionGroup(minuteSearches, split, i);
                }
                if (this.hourSelection === void 0) {
                    this.hourSelection = this.updateSelectionGroup(hourSearches, split, i);
                }
                if (this.daySelection === void 0) {
                    this.daySelection = this.updateSelectionGroup(daySearches, split, i);
                }
                if (this.monthSelection === void 0) {
                    this.monthSelection = this.updateSelectionGroup(monthSearches, split, i);
                }
                if (this.yearSelection === void 0) {
                    this.yearSelection=  this.updateSelectionGroup(yearSearches, split, i);
                }
                
                split[i] = split[i].slice(1, split[i].length);
            }
        }        
        result = split.join('');
        
        this.opts.element.value = result;
        if (this.opts.element === document.activeElement) {
            let selectionStart, selectionEnd;
            switch (level) {
                case ViewLevel.SECOND:
                    if (this.secondSelection === void 0) break;
                    selectionStart = this.secondSelection.start;
                    selectionEnd = this.secondSelection.end;
                    break;
                case ViewLevel.MINUTE:
                    if (this.minuteSelection === void 0) break;
                    selectionStart = this.minuteSelection.start;
                    selectionEnd = this.minuteSelection.end;
                    break;
                case ViewLevel.HOUR:
                    if (this.hourSelection === void 0) break;
                    selectionStart = this.hourSelection.start;
                    selectionEnd = this.hourSelection.end;
                    break;
                case ViewLevel.DAY:
                    if (this.daySelection === void 0) break;
                    selectionStart = this.daySelection.start;
                    selectionEnd = this.daySelection.end;
                    break;
                case ViewLevel.MONTH:
                    if (this.monthSelection === void 0) break;
                    selectionStart = this.monthSelection.start;
                    selectionEnd = this.monthSelection.end;
                    break;
                case ViewLevel.YEAR:
                    if (this.yearSelection === void 0) break;
                    selectionStart = this.yearSelection.start;
                    selectionEnd = this.yearSelection.end;
                    break;
            }
            if (selectionStart !== void 0 && selectionEnd !== void 0) {
                this.opts.element.setSelectionRange(selectionStart, selectionEnd);
            }
        }
    }
    
    private updateSelectionGroup(searches:string[], split:string[], i:number):Selection {                    
        let found = searches.indexOf(split[i]);
        if (found > -1) {
            let start = this.getLengthUntil(split, i);
            return new Selection({
                start: start,
                end: start + searches[found].length - 1
            });
        }
        return void 0;
    }
    
    private secondSelection:Selection;
    private minuteSelection:Selection;
    private hourSelection:Selection;
    private daySelection:Selection;
    private monthSelection:Selection;
    private yearSelection:Selection;
    
    private getLengthUntil(array:string[], until:number) {
        let length = 0;
        for (let i = 0; i < until; i++) {
            length += array[i].length;
        }
        return length;
    }
    
    private pad(num:number, totalDigits:number):string {
        let result = num.toString();
        while (result.length < totalDigits) {
            result = '0' + result;
        }
        return result;
    }
}

interface ISelection {
    start:number;
    end:number;
}

class Selection {
    public start:number;
    public end:number;
    public constructor(data:ISelection) {
        this.start = data.start;
        this.end = data.end;
    }
}


// TODO finish this
class Format {
    public acceptedChars:string;
    protected validate(currentEntry:string):boolean {
        return false;
    }
}