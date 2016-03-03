class Parser {
    public static parse(format:string):IDatePart[] {
        let textBuffer = '';
        let dateParts:IDatePart[] = [];
    
        let index = 0;                
        let inEscapedSegment = false;
        
        let pushPlainText = () => {
            if (textBuffer.length > 0) {
                dateParts.push(new PlainText(textBuffer).setSelectable(false));
                textBuffer = '';
            }
        }
        
        while (index < format.length) {     
            if (!inEscapedSegment && format[index] === '[') {
                inEscapedSegment = true;
                index++;
                continue;
            }
            
            if (inEscapedSegment && format[index] === ']') {
                inEscapedSegment = false;
                index++;
                continue;
            }
            
            if (inEscapedSegment) {
                textBuffer += format[index];
                index++;
                continue;
            }
            
            let found = false;
            
            for (let code in formatBlocks) {
                if (Parser.findAt(format, index, `{${code}}`)) {
                    pushPlainText();
                    dateParts.push(new formatBlocks[code]().setSelectable(false));
                    index += code.length + 2;
                    found = true;
                    break;
                } else if (Parser.findAt(format, index, code)) {
                    pushPlainText();
                    dateParts.push(new formatBlocks[code]());
                    index += code.length;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                textBuffer += format[index];
                index++;
            }
            
        }
        
        pushPlainText();
                
        return dateParts;
    }
    
    private static findAt (str:string, index:number, search:string) {
        return str.slice(index, index + search.length) === search;
    }
}