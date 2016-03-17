interface IListenerReference {
    element: Element|Document|Window;
    reference: EventListener;
    event: string;
}

namespace listen {
    let matches = document.documentElement.matches || document.documentElement.msMatchesSelector;
    
    function handleDelegateEvent(parent:Element, delegateSelector:string, callback:(e?:MouseEvent|TouchEvent) => void) {
        return (e:MouseEvent|TouchEvent) => {
            var target = e.srcElement || <Element>e.target;
            
            while(!target.isEqualNode(parent)) {
                if (matches.call(target, delegateSelector)) {
                    callback(e);
                    return;
                }
                target = target.parentElement;
            }
        }
    }
    
    function attachEventsDelegate(events:string[], parent:Element, delegateSelector:string, callback:(e?:MouseEvent|TouchEvent) => void):IListenerReference[] {
        let listeners:IListenerReference[] = [];
        for (let key in events) {
            let event:string = events[key];
            
            let newListener = handleDelegateEvent(parent, delegateSelector, callback);
            listeners.push({
                element: parent,
                reference: newListener,
                event: event
            });
            
            parent.addEventListener(event, newListener);
        }
        return listeners;
    }
    
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
    
    export function focus(element:Element|Document|Window, callback:(e?:FocusEvent) => void):IListenerReference[] {
        return attachEvents(['focus'], element, (e) => {
            callback(e);
        });
    }
    
    export function down(element:Element|Document|Window, callback:(e?:MouseEvent|TouchEvent) => void):IListenerReference[];
    export function down(parent:Element|Document|Window, delegateSelector:string, callback:(e?:MouseEvent|TouchEvent) => void):IListenerReference[];
    export function down(...params:any[]) {
        if (params.length === 3) {
            return attachEventsDelegate(['mousedown', 'touchstart'], params[0], params[1], (e) => {
                params[2](<any>e);
            });
        } else {
            return attachEvents(['mousedown', 'touchstart'], params[0], (e) => {
                params[1](<any>e);
            });        
        } 
    };
    
    export function up(element:Element|Document|Window, callback:(e?:MouseEvent) => void):IListenerReference[] {
        return attachEvents(['mouseup', 'touchend'], element, (e) => {
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