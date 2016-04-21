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