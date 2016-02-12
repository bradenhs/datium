import {formatBlocks, IFormatBlock} from 'src/input/FormatBlocks';
import DatePart from 'src/input/DatePart';

export default class DisplayParser {
    
    public static parse(format:string):DatePart[] {        
        
        let index = 0;                
        let inEscapedSegment = false;
        let dateParts:DatePart[] = [];
        let textBuffer = '';
        
        let pushPlainText = () => {
            if (textBuffer.length > 0) {
                dateParts.push(new DatePart(textBuffer));
                textBuffer = '';
            }
        }
        
        let increment;        
        while (index < format.length) {            
            if (!inEscapedSegment && format[index] === '[') {
                inEscapedSegment = true;
                index++;
                continue;
            } else if (inEscapedSegment && format[index] === ']') {
                inEscapedSegment = false;
                index++;
                continue;
            } else if (inEscapedSegment) {
                textBuffer += format[index];
                index++;
                continue;
            } else if (formatBlocks.some((block:IFormatBlock) => {
                if (this.findAt(format, index, `{${block.code}}`)) {
                    pushPlainText();
                    dateParts.push(new DatePart(block, false));
                    increment = block.code.length + 2;
                    return true;
                } else if (this.findAt(format, index, block.code)) {
                    pushPlainText();
                    dateParts.push(new DatePart(block));
                    increment = block.code.length;
                    return true;
                }
            })) {
                index += increment;
            } else {
                textBuffer += format[index];
                index++;
            }
        }
        
        pushPlainText();
        
        return dateParts;
    }    
    
    private static findAt(str:string, index:number, search:string) {
        return str.slice(index, index + search.length) === search;
    }
}