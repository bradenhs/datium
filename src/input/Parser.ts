class Parser {
    public static parse(options:IOptions):IDatePart[] {
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
        
        while (index < options.displayAs.length) {     
            if (!inEscapedSegment && options.displayAs[index] === '[') {
                inEscapedSegment = true;
                index++;
                continue;
            }
            
            if (inEscapedSegment && options.displayAs[index] === ']') {
                inEscapedSegment = false;
                index++;
                continue;
            }
            
            if (inEscapedSegment) {
                textBuffer += options.displayAs[index];
                index++;
                continue;
            }
            
            let found = false;
            
            for (let code in formatBlocks) {
                if (Parser.findAt(options.displayAs, index, `{${code}}`)) {
                    pushPlainText();
                    dateParts.push(new formatBlocks[code](options).setSelectable(false));
                    index += code.length + 2;
                    found = true;
                    break;
                } else if (Parser.findAt(options.displayAs, index, code)) {
                    pushPlainText();
                    dateParts.push(new formatBlocks[code](options));
                    index += code.length;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                textBuffer += options.displayAs[index];
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