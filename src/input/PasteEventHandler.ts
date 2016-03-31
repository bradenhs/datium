class PasteEventHander {
    constructor(private input:Input) {
        listen.paste(input.element, () => this.paste());
    }
    
    private paste() {
        //TODO fix this cause it's not working
        let originalValue = this.input.element.value;
        setTimeout(() => {
           if (!this.input.format.test(this.input.element.value)) {
               this.input.element.value = originalValue;
               return;
           } 
           
           let newDate = this.input.getSelectedDatePart().getValue();
           
           let strPrefix = '';
           for (let i = 0; i < this.input.dateParts.length; i++) {
               let datePart = this.input.dateParts[i];
               
               let regExp = new RegExp(datePart.getRegEx().source.slice(1, -1), 'i');
               
               let val = this.input.element.value.replace(strPrefix, '').match(regExp)[0];
               strPrefix += val;
               
               if (!datePart.isSelectable()) continue;
               
               datePart.setValue(newDate);
               if (datePart.setValue(val)) {
                   this.input.blurDatePart(datePart);
                   newDate = datePart.getValue();
               } else {
                   // TODO set all dateparts back to original value
                   this.input.element.value = originalValue;
                   return;
               }
           }
           
           trigger.goto(this.input.element, {
               date: newDate,
               level: this.input.getSelectedDatePart().getLevel()
           });
        });
    }
}