function handleDelegateEvent(parent:Element, delegateClass:string, callback:(e?:MouseEvent|TouchEvent) => void) {
	return (e:MouseEvent|TouchEvent) => {
		e.preventDefault();
		var target = e.srcElement;
		while(!target.isEqualNode(parent)) {
			if (target.classList.contains(delegateClass)) {
				callback(e);
				return;
			}
			target = target.parentElement;
		}
	}
}

function attachEventsDelegate(events:string[], parent:Element, delegateClass:string, callback:(e?:MouseEvent|TouchEvent) => void) {
    for (let key in events) {
        let event:string = events[key];
        parent.addEventListener(event, handleDelegateEvent(parent, delegateClass, callback));
    }
}

function attachEvents(events:string[], element:Element|Document, callback:(e?:MouseEvent|TouchEvent) => void) {
    for (let key in events) {
        let event:string = events[key];
        element.addEventListener(event, (e:MouseEvent|TouchEvent) => {
           e.preventDefault();
           callback(e); 
        });
    }
}

export function onTap(parent:Element, delegateClass:string, callback:(e?:Event) => void);
export function onTap(element:Element, callback:(e?:Event) => void);
export function onTap(...params:any[]) {
    if (params.length === 3) {        
        attachEventsDelegate(['touchend', 'click'], params[0], params[1], params[2]);
    } else if (params.length === 2) {
        attachEvents(['touchend', 'click'], params[0], params[1]);
    }
}

interface DragCallbacks {
    dragStart?:(e?:MouseEvent|TouchEvent) => void;
    dragMove?:(e?:MouseEvent|TouchEvent) => void;
    dragEnd?:(e?:MouseEvent|TouchEvent) => void;
}

export function onDrag(parent:Element, delegateClass:string, callbacks:DragCallbacks) {
    let dragging:boolean = false;
    let readyToStartDrag = false;
    attachEventsDelegate(['touchstart', 'mousedown'], parent, delegateClass, (e?:MouseEvent|TouchEvent) => {
        readyToStartDrag = true;
    });
    attachEvents(['touchmove', 'mousemove'], document, (e?:MouseEvent|TouchEvent) => {
        if (readyToStartDrag) {
            readyToStartDrag = false;
            dragging = true;
            if (callbacks.dragStart !== void 0) {
                callbacks.dragStart(e);
            }
        }
        if (dragging && callbacks.dragMove !== void 0) {
            callbacks.dragMove(e);
        }
    });
    attachEvents(['touchend', 'mouseup'], document, (e?:MouseEvent|TouchEvent) => {
        if (dragging && callbacks.dragEnd !== void 0) {
            callbacks.dragEnd(e);
        }
        readyToStartDrag = false;
        dragging = false;
    });
}