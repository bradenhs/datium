interface IListenerReference {
    element: Element|Document|Window;
    reference: EventListener;
    event: string;
}

namespace listen {
    function attachEvents(events:string[], element:Element|Document|Window, callback:(e?:any) => void):IListenerReference[] {
        let listeners:IListenerReference[] = [];
        events.forEach((event) => {
            listeners.push({
                element: element,
                reference: callback,
                event: event
            });
            element.addEventListener(event, callback); 
        });
        return listeners;
    }
    
    // NATIVE
    
    export function focus(element:Element, callback:(e?:FocusEvent) => void):IListenerReference[] {
        return attachEvents(['focus'], element, (e) => {
            callback(e);
        });
    }
    
    export function mousedown(element:Element|Document|Window, callback:(e?:MouseEvent) => void):IListenerReference[] {
        return attachEvents(['mousedown'], element, (e) => {
            callback(e);
        });
    }
    
    export function mouseup(element:Element|Document|Window, callback:(e?:MouseEvent) => void):IListenerReference[] {
        return attachEvents(['mouseup'], element, (e) => {
            callback(e);
        });
    }
    
    export function paste(element:Element|Document|Window, callback:(e?:MouseEvent) => void):IListenerReference[] {
        return attachEvents(['paste'], element, (e) => {
            callback(e);
        });
    }
    
    // CUSTOM
    
    export function goto(element:Element, callback:(e?:{date:Date, level:Level}) => void):IListenerReference[] {
        return attachEvents(['datium-goto'], element, (e:CustomEvent) => {
            callback(e.detail);
        });
    }
    
    export function viewchanged(element:Element, callback:(e?:{date:Date, level:Level}) => void):IListenerReference[] {
        return attachEvents(['datium-viewchanged'], element, (e:CustomEvent) => {
            callback(e.detail);
        });
    }
    
    export function removeListeners(listeners:IListenerReference[]) {
        listeners.forEach((listener) => {
           listener.element.removeEventListener(listener.event, listener.reference); 
        });
    }
}

namespace trigger {
    export function goto(element:Element, data?:{date:Date, level:Level}) {
        element.dispatchEvent(new CustomEvent('datium-goto', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    
    export function viewchanged(element:Element, data?:{date:Date, level:Level}) {
        element.dispatchEvent(new CustomEvent('datium-viewchanged', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
}