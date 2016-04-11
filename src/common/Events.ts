interface IListenerReference {
    element: Element|Document|Window;
    reference: EventListener;
    event: string;
}

interface IDragCallbacks {
    dragStart?:(e?:MouseEvent|TouchEvent) => void;
    dragMove?:(e?:MouseEvent|TouchEvent) => void;
    dragEnd?:(e?:MouseEvent|TouchEvent) => void;
}

namespace listen {
    let matches = document.documentElement.matches || document.documentElement.msMatchesSelector;
    
    function handleDelegateEvent(parent:Element, delegateSelector:string, callback:(e?:MouseEvent|TouchEvent) => void) {
        return (e:MouseEvent|TouchEvent) => {
            var target = e.srcElement || <Element>e.target;
            while(target !== null && !target.isEqualNode(parent)) {
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
    
    export function blur(element:Element|Document|Window, callback:(e?:FocusEvent) => void):IListenerReference[] {
        return attachEvents(['blur'], element, (e) => {
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
    
    export function mousemove(element:Element|Document|Window, callback:(e?:MouseEvent) => void):IListenerReference[] {
        return attachEvents(['mousemove'], element, (e) => {
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
    
    export function tap(element:Element|Document, callback:(e?:Event) => void):IListenerReference[];
    export function tap(parent:Element|Document, delegateSelector:string, callback:(e?:Event) => void):IListenerReference[];
    export function tap(...params:any[]):IListenerReference[] {
        let startTouchX:number, startTouchY:number;
        
        let handleStart = (e:TouchEvent) => {
            startTouchX = e.touches[0].clientX;
            startTouchY = e.touches[0].clientY;
        }
        
        let handleEnd = (e:TouchEvent, callback:(e?:Event) => void) => {
            if (e.changedTouches === void 0) {
                e.preventDefault();
                callback(e);
                return;
            }
            
            let xDiff = e.changedTouches[0].clientX - startTouchX;
            let yDiff = e.changedTouches[0].clientY - startTouchY;
            
            if (Math.sqrt(xDiff * xDiff + yDiff * yDiff) < 10) {
                e.preventDefault();
                callback(e);
            }
        }
        
        let listeners:IListenerReference[] = [];
        
        if (params.length === 3) {
            listeners = listeners.concat(attachEventsDelegate(['touchstart'], params[0], params[1], handleStart));
            listeners = listeners.concat(attachEventsDelegate(['touchend', 'click'], params[0], params[1], (e:TouchEvent) => {
                handleEnd(e, params[2]);
            }));
        } else if (params.length === 2) {
            listeners = listeners.concat(attachEvents(['touchstart'], params[0], handleStart));
            listeners = listeners.concat(attachEvents(['touchend', 'click'], params[0], (e:TouchEvent) => {
                handleEnd(e, params[1]);
            }));
        }
        return listeners;
    }
    
    function swipe(element:Element, direction:string, callback:(e?:Event) => void) {
        let startTouchX:number, startTouchY:number, startTime:number;
        let touchMoveListener:IListenerReference;
        let scrollingDisabled:boolean;
        
        attachEvents(['touchstart'], element, (e:TouchEvent) => {
            startTouchX = e.touches[0].clientX;
            startTouchY = e.touches[0].clientY;
            startTime = new Date().valueOf();
            scrollingDisabled = false;
            touchMoveListener = attachEvents(['touchmove'], document, (e:TouchEvent) => {
                let xDiff = Math.abs(e.changedTouches[0].clientX - startTouchX);
                let yDiff = Math.abs(e.changedTouches[0].clientY - startTouchY);
                if (xDiff > yDiff && xDiff > 20) {
                    scrollingDisabled = true;
                } else if (yDiff > xDiff && yDiff > 20) {
                    scrollingDisabled = false;
                }
                if (new Date().valueOf() - startTime > 500) {
                    scrollingDisabled = false;
                }
                if (scrollingDisabled) {
                    e.preventDefault();
                }
            })[0]; 
        });
        
        attachEvents(['touchend'], element, (e:TouchEvent) => {
            document.removeEventListener(touchMoveListener.event, touchMoveListener.reference);
            if (startTouchX === void 0 || startTouchY === void 0) return;
            if (new Date().valueOf() - startTime > 500) return;
            let xDiff = e.changedTouches[0].clientX - startTouchX;
            let yDiff = e.changedTouches[0].clientY - startTouchY;
            if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 20) {
                e.preventDefault();
                if (direction === 'left' && xDiff < 0) {
                    callback(e);
                }
                if (direction === 'right' && xDiff > 0) {
                    callback(e);
                }
            } 
        });
    }

    export function swipeLeft(element:Element, callback:(e?:Event) => void) {
        swipe(element, 'left', callback);
    }

    export function swipeRight(element:Element, callback:(e?:Event) => void) {
        swipe(element, 'right', callback);
    }
    
    export function drag(element:Element, callbacks:IDragCallbacks):void;
    export function drag(parent:Element, delegateSelector:string, callbacks:IDragCallbacks):void;
    export function drag(...params:any[]):void {
        let dragging:boolean = false;
        
        let callbacks:IDragCallbacks = params[params.length-1];
        
        let startEvents = (e?:MouseEvent|TouchEvent) => {
            dragging = true;
            if (callbacks.dragStart !== void 0) {
                callbacks.dragStart(e);
                e.preventDefault();
            }
            
            let listeners:IListenerReference[] = [];
            
            listeners = listeners.concat(attachEvents(['touchmove', 'mousemove'], document, (e?:MouseEvent|TouchEvent) => {
                if (dragging && callbacks.dragMove !== void 0) {
                    callbacks.dragMove(e);
                    e.preventDefault();
                }
            }));
            listeners = listeners.concat(attachEvents(['touchend', 'mouseup'], document, (e?:MouseEvent|TouchEvent) => {
                if (dragging && callbacks.dragEnd !== void 0) {
                    callbacks.dragEnd(e);
                    e.preventDefault();
                }
                dragging = false;
                removeListeners(listeners);            
            }));  
        }
        
        if (params.length === 3) {
            attachEventsDelegate(['touchstart', 'mousedown'], params[0], params[1], startEvents);
        } else {
            attachEvents(['touchstart', 'mousedown'], params[0], startEvents);
        }
    }
    
    // CUSTOM
    
    export function goto(element:Element, callback:(e?:{date:Date, level:Level, update?:boolean}) => void):IListenerReference[] {
        return attachEvents(['datium-goto'], element, (e:CustomEvent) => {
            callback(e.detail);
        });
    }
    
    export function zoomOut(element:Element, callback:(e?:{date:Date, currentLevel:Level, update?:boolean}) => void):IListenerReference[] {
        return attachEvents(['datium-zoom-out'], element, (e:CustomEvent) => {
            callback(e.detail);
        });
    }
    
    export function zoomIn(element:Element, callback:(e?:{date:Date, currentLevel:Level, update?:boolean}) => void):IListenerReference[] {
        return attachEvents(['datium-zoom-in'], element, (e:CustomEvent) => {
            callback(e.detail);
        });
    }
    
    export function viewchanged(element:Element, callback:(e?:{date:Date, level:Level, update?:boolean}) => void):IListenerReference[] {
        return attachEvents(['datium-viewchanged'], element, (e:CustomEvent) => {
            callback(e.detail);
        });
    }
    
    export function openBubble(element:Element, callback:(e:{x:number, y:number, text:string}) => void):IListenerReference[] {
        return attachEvents(['datium-open-bubble'], element, (e:CustomEvent) => {
            callback(e.detail);
        });
    }
    
    export function updateBubble(element:Element, callback:(e:{x:number, y:number, text:string}) => void):IListenerReference[] {
        return attachEvents(['datium-update-bubble'], element, (e:CustomEvent) => {
            callback(e.detail);
        });
    }
    
    export function confirmPick(element:Element, callback:(e?:{date:Date, currentLevel:Level}) => void):IListenerReference[] {
        return attachEvents(['datium-confirm-pick'], element, (e:CustomEvent) => {
            callback(e.detail);
        });
    }
    
    export function updateDefinedState(element:Element, callback:(e:{defined:boolean, level:Level}) => void):IListenerReference[] {
        return attachEvents(['datium-update-defined-state'], element, (e:CustomEvent) => {
            callback(e.detail);
        })
    }
    
    export function removeListeners(listeners:IListenerReference[]) {
        listeners.forEach((listener) => {
           listener.element.removeEventListener(listener.event, listener.reference); 
        });
    }
}

namespace trigger {
    export function goto(element:Element, data?:{date:Date, level:Level, update?:boolean}) {
        element.dispatchEvent(new CustomEvent('datium-goto', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    
    export function zoomOut(element:Element, data?:{date:Date, currentLevel:Level, update?:boolean}) {
        element.dispatchEvent(new CustomEvent('datium-zoom-out', {
            bubbles: false, 
            cancelable: true,
            detail: data
        }));
    }
    
    export function zoomIn(element:Element, data?:{date:Date, currentLevel:Level, update?:boolean}) {
        element.dispatchEvent(new CustomEvent('datium-zoom-in', {
            bubbles: false, 
            cancelable: true,
            detail: data
        }));
    }
    
    export function confirmPick(element:Element, data?:{date:Date, currentLevel:Level}) {
        element.dispatchEvent(new CustomEvent('datium-confirm-pick', {
            bubbles: false, 
            cancelable: true,
            detail: data
        }));
    }
    
    export function viewchanged(element:Element, data?:{date:Date, level:Level, update?:boolean}) {
        element.dispatchEvent(new CustomEvent('datium-viewchanged', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    
    export function openBubble(element:Element, data:{x:number, y:number, text:string}) {
        element.dispatchEvent(new CustomEvent('datium-open-bubble', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    
    export function updateBubble(element:Element, data:{x:number, y:number, text:string}) {
        element.dispatchEvent(new CustomEvent('datium-update-bubble', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    
    export function updateDefinedState(element:Element, data:{defined:boolean, level:Level}) {
        element.dispatchEvent(new CustomEvent('datium-update-defined-state', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
}