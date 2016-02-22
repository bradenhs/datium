/// <reference path="OptionSanitizer.ts" />
/// <reference path="FormatBlocks.ts" />
/// <reference path="DatePart.ts" />
/// <reference path="DisplayParser.ts" />

(<any>window)['Datium'] = (function() {
    let options:IOptions;
    
    return class {
        constructor(opts:IOptions) {
            new DatepickerInput(opts.element, 'h:mma {ddd} MMM Do, YYYY');
            this.updateOptions(opts);
        }
        
        updateOptions(opts:IOptions):void {
            options = OptionSanitizer.sanitize(opts);
        }
    }
})();

const enum KeyCodes {
    RIGHT = 39, LEFT = 37, TAB = 9, UP = 38,
    DOWN = 40, V = 86, C = 67, A = 65, HOME = 36,
    END = 35, BACKSPACE = 8
}

let DatepickerInput = (() => {
    let selectedIndex:number;
    let curDate:Date;
    let dateParts:DatePart[];
    let dateStringRegExp:RegExp;
    let element:HTMLInputElement;
    let displayAs:String;
    let minDate:Date;
    let maxDate:Date;
    
    let shiftTabDown = false;
    let tabDown = false;
    let pasting:boolean = false;
    
    let textBuffer:string = '';
    
    function concatRegExp(dateParts:DatePart[]):RegExp {
        let regExp = '';
        dateParts.forEach((datePart) => {
           regExp += datePart.getRegExpString();
        });
        return new RegExp(`^${regExp}$`, 'i');
    }
    
    function bindEvents():void {
        element.addEventListener('focus', () => focus());

        element.addEventListener('keydown', (e) => keydown(e));
        element.addEventListener('paste', () => paste());

        document.addEventListener('keydown', (e:KeyboardEvent) => {
            if (e.shiftKey && e.keyCode === KeyCodes.TAB) {
                shiftTabDown = true;
            } else if (e.keyCode === KeyCodes.TAB) {
                tabDown = true;
            }
            setTimeout(() => {
               shiftTabDown = false;
               tabDown = false;
            });
        });
        
        // Prevent Default
        element.addEventListener('dragenter', (e) => e.preventDefault());
        element.addEventListener('dragover', (e) => e.preventDefault());
        element.addEventListener('drop', (e) => e.preventDefault());
        element.addEventListener('cut', (e) => e.preventDefault());

        let caretStart:number;
        let down = false;
        
        let mousedown = () => {
            clearInterval(interval);
            down = true;
            element.setSelectionRange(void 0, void 0);
            setTimeout(() => {
                caretStart = element.selectionStart;
            });
        };
        
        let mouseup = () => {
            if (!down) return;
            down = false;
            let pos = element.selectionStart === caretStart ? element.selectionEnd : element.selectionStart;
            selectedIndex = getNearestSelectableIndex(pos);
            if (element.selectionStart > 0 || element.selectionEnd < element.value.length) {
                update();
            }
        };
        
        let touchstart = () => {
            element.removeEventListener('mousedown', mousedown);
            document.removeEventListener('mouseup', mouseup);
            document.removeEventListener('touchstart', touchstart);
        };
        
        element.addEventListener('mousedown', mousedown);
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('touchstart', touchstart);

        let lastStart:number;
        let lastEnd:number;
        var interval = setInterval(() => {
            if (!pasting &&
                (element.selectionStart !== 0 ||
                 element.selectionEnd !== element.value.length) &&
                (element.selectionStart !== lastStart ||
                 element.selectionEnd !== lastEnd)) {
                selectedIndex = getNearestSelectableIndex(element.selectionStart + (element.selectionEnd - element.selectionStart) / 2);
                update()
            }
            lastStart = element.selectionStart;
            lastEnd = element.selectionEnd;
        });
    }
    
    function paste():void {
        pasting = true;
        let originalValue = element.value;
        setTimeout(() => {
            if (!dateStringRegExp.test(element.value)) {
                element.value = originalValue;
                pasting = false;
                return;
            }
            let newDate = new Date(curDate.valueOf());
            let strPrefix = '';
            dateParts.forEach((datePart) => {
                let val = element.value.replace(strPrefix, '').match(datePart.getRegExpString())[0];
                strPrefix += val;
                if (!datePart.isSelectable()) return;
                newDate = datePart.getDateFromString(newDate, val);
            });
            update(newDate);
            pasting = false;
        });
    }
    
    function keydown(e:KeyboardEvent):void {
        if ((e.keyCode === KeyCodes.HOME || e.keyCode === KeyCodes.END) && e.shiftKey) return;
        if (e.keyCode === KeyCodes.C && e.ctrlKey) return;
        if (e.keyCode === KeyCodes.A && e.ctrlKey) return;
        if (e.keyCode === KeyCodes.V && e.ctrlKey) return;
        if ((e.keyCode === KeyCodes.LEFT || e.keyCode === KeyCodes.RIGHT) && e.shiftKey) return;

        if (e.keyCode === KeyCodes.HOME) {
            selectedIndex = getFirstSelectable();
            update();
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.END) {
            selectedIndex = getLastSelectable();
            update();
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.LEFT) {
            selectedIndex = getPreviousSelectable();
            update();
            e.preventDefault();
        } else if (e.shiftKey && e.keyCode === KeyCodes.TAB) {
            let previousSelectable = getPreviousSelectable();
            if (previousSelectable !== selectedIndex) {
                selectedIndex = previousSelectable;
                update();
                e.preventDefault();
            }
        } else if (e.keyCode === KeyCodes.RIGHT) {
            selectedIndex = getNextSelectable();
            update();
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.TAB) {
            let nextSelectable = getNextSelectable();
            if (nextSelectable !== selectedIndex) {
                selectedIndex = nextSelectable;
                update();
                e.preventDefault();
            }
        } else if (e.keyCode === KeyCodes.UP) {
            let newDate = dateParts[selectedIndex].increment(curDate);
            update(newDate);
            e.preventDefault();
        } else if (e.keyCode === KeyCodes.DOWN) {
            let newDate = dateParts[selectedIndex].decrement(curDate);
            update(newDate);
            e.preventDefault();
        } else {
            e.preventDefault();
        }

        let keyPressed = (<any>{
            '48': '0', '96': '0', '49': '1', '97': '1',
            '50': '2', '98': '2', '51': '3', '99': '3',
            '52': '4', '100': '4', '53': '5', '101': '5',
            '54': '6', '102': '6', '55': '7', '103': '7',
            '56': '8', '104': '8', '57': '9', '105': '9',
            '65': 'a', '66': 'b', '67': 'c', '68': 'd',
            '69': 'e', '70': 'f', '71': 'g', '72': 'h',
            '73': 'i', '74': 'j', '75': 'k', '76': 'l',
            '77': 'm', '78': 'n', '79': 'o', '80': 'p',
            '81': 'q', '82': 'r', '83': 's', '84': 't',
            '85': 'u', '86': 'v', '87': 'w', '88': 'x',
            '89': 'y', '90': 'z'
        })[e.keyCode];

        if (e.keyCode === KeyCodes.BACKSPACE) {
            backspace();
        } else if (keyPressed !== void 0) {
            textBuffer += keyPressed;
        } else if (!e.shiftKey) {
            textBuffer = '';
        }

        if (textBuffer.length > 0) {
            let orig = curDate.valueOf();
            let result = dateParts[selectedIndex].getDateFromString(curDate, textBuffer);
            if (result !== void 0 && dateParts[selectedIndex].getMaxBufferSize(result) !== void 0 && textBuffer.length >= dateParts[selectedIndex].getMaxBufferSize(result)) {
                selectedIndex = getNextSelectable();
            }
            if (result === void 0) {
                textBuffer = textBuffer.slice(0, textBuffer.length - 1);
            } else {
                update(result);
            }
        }
    }
    
    
    function backspace():void {
        if (textBuffer.length < 2) {
            let orig = curDate.valueOf();
            let result = dateParts[selectedIndex].getDateFromString(curDate, 'ZERO_OUT');
            if (result.valueOf() !== orig) {
                update(result);
            }
        }
        textBuffer = textBuffer.slice(0, textBuffer.length - 1);
    }

    function getPreviousSelectable():number {
        let index = selectedIndex;
        while (--index >= 0) {
            if (dateParts[index].isSelectable()) return index;
        }
        return selectedIndex;
    }

    function getNextSelectable():number {
        let index = selectedIndex;
        while (++index < dateParts.length) {
            if (dateParts[index].isSelectable()) return index;
        }
        return selectedIndex;
    }

    let selecting:boolean = false;

    function getNearestSelectableIndex(caretPosition:number):number {
        let pos = 0;
        let nearestSelectableIndex:number;
        let nearestSelectableDistance:number;
        for (let i = 0; i < dateParts.length; i++) {
            if (dateParts[i].isSelectable()) {
                let fromLeft = caretPosition - pos;
                let fromRight = caretPosition - (pos + dateParts[i].toString().length);
                if (fromLeft > 0 && fromRight < 0) return i;
                let dist = Math.min(Math.abs(fromLeft), Math.abs(fromRight));
                if (nearestSelectableIndex == void 0 || dist <= nearestSelectableDistance) {
                    nearestSelectableIndex = i;
                    nearestSelectableDistance = dist;
                }
            }
            pos += dateParts[i].toString().length;
        }
        return nearestSelectableIndex;
    }

    function focus():void {
        if (tabDown) {
            selectedIndex = getFirstSelectable();
            setTimeout(() => {
               update();
            });
        } else if (shiftTabDown) {
            selectedIndex = getLastSelectable();
            setTimeout(() => {
               update();
            });
        }
    }

    function getFirstSelectable():number {
        for (let i = 0; i < dateParts.length; i++) {
            if (dateParts[i].isSelectable()) return i;
        }
        return void 0;
    }

    function getLastSelectable():number {
        for (let i = dateParts.length - 1; i >= 0; i--) {
            if (dateParts[i].isSelectable()) return i;
        }
        return void 0;
    }


    let lastSelectedIndex:number;

    /**
     * @param {Date=} date (optional).
     */
    function update(date?:Date):void {
        if (date === void 0) date = curDate;
        if (minDate !== void 0 && date.valueOf() < minDate.valueOf()) date = new Date(minDate.valueOf());
        if (maxDate !== void 0 && date.valueOf() < maxDate.valueOf()) date = new Date(maxDate.valueOf());
        if (selectedIndex !== lastSelectedIndex) {
            textBuffer = '';
        }
        lastSelectedIndex = selectedIndex;

        curDate = new Date(date.valueOf());
        let dateString = '';

        dateParts.forEach((datePart) => {
            dateString += datePart.setValue(date).toString();
        });

        element.value = dateString;
        updateSelection();
    }

    function updateSelection():void {
        if (selectedIndex === void 0 || document.activeElement !== element) return;
        let start = 0;
        for (let i = 0; i < selectedIndex; i++) {
            start += dateParts[i].toString().length;
        }
        let end = start + dateParts[selectedIndex].toString().length;
        element.setSelectionRange(start, end);
    }
    
    return class {
        constructor(el:HTMLInputElement, dispAs:string, private min?:Date, private max?:Date) {
            element = el;
            displayAs = dispAs;
            minDate = min;
            maxDate = max;
            dateParts = DisplayParser.parse(dispAs);
            dateStringRegExp = concatRegExp(dateParts);
            bindEvents();
            element.setAttribute('spellcheck', 'false');
            update(new Date());
        }
    }
})();