/// <reference path="FormatBlocks.ts" />
/// <reference path="DatePart.ts" />


class DisplayParser {   
    
    public static parse = (format:string):DatePart[] => {
        
        let index = 0;                
        let inEscapedSegment = false;
        let dateParts:DatePart[] = [];
        let textBuffer = "";
        
        let pushPlainText = () => {
            if (textBuffer.length > 0) {
                let dp = new DatePart(textBuffer, void 0);
                dateParts.push(dp);
                textBuffer = "";
            }
        }
        
        let increment:number;        
        while (index < format.length) {            
            if (!inEscapedSegment && format[index] === "[") {
                inEscapedSegment = true;
                index++;
                continue;
            } else if (inEscapedSegment && format[index] === "]") {
                inEscapedSegment = false;
                index++;
                continue;
            } else if (inEscapedSegment) {
                textBuffer += format[index];
                index++;
                continue;
            } else {
                let found = formatBlocks.some((block:IFormatBlock) => {
                    if (DisplayParser.findAt(format, index, `{${block.code}}`)) {
                        pushPlainText();
                        let dp = new DatePart(block, false)
                        dateParts.push(dp);
                        increment = block.code.length + 2;
                        return true;
                    } else if (DisplayParser.findAt(format, index, block.code)) {
                        pushPlainText();
                        let dp = new DatePart(block, void 0);
                        dateParts.push(dp);
                        increment = block.code.length;
                        return true;
                    }
                });
                
                if (found) {
                    index += increment;
                } else {
                    textBuffer += format[index];
                    index++;
                }
            }
        }
        
        pushPlainText();
        
        return dateParts;
    }
    
    private static findAt = (str:string, index:number, search:string) => {
        return str.slice(index, index + search.length) === search;
    }
}
