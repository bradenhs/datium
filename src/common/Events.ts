enum EventType {
    CHANGE_DATE
}

class Events {
    
    static listen(element:HTMLInputElement, event:EventType, callback:(data?:any) => void) {
        element.addEventListener(event.toString(), callback);
    }
    
    static trigger(element:HTMLInputElement, event:EventType, data:any) {
        element.dispatchEvent(new CustomEvent(event.toString(), {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
}