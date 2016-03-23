class DragHandle {
    public dragging = false;
    
    constructor(pickerManager:PickerManager) {
        let offsetX = 0;
        let cancelDrag = false;
        let startTime:number = 0;
        listen.drag(pickerManager.container, {
            dragStart: (e) => {
                let x = (<MouseEvent>e).clientX;
                if (x === void 0) {
                    x = (<TouchEvent>e).changedTouches[0].clientX;
                }
                offsetX = x;
                cancelDrag = false;
            },
            dragMove: (e) => {
                if (cancelDrag) return;
                let x = (<MouseEvent>e).clientX;
                if (x === void 0) {
                    x = (<TouchEvent>e).changedTouches[0].clientX;
                }
                
                if (!this.dragging && Math.abs(x - offsetX) > 20) {
                    this.dragging = true;
                    offsetX = x;
                    pickerManager.removeActiveClasses();
                    startTime = new Date().valueOf();
                    pickerManager.closeBubble();
                    pickerManager.currentPicker.getDragWrapper().classList.add('datium-dragging');
                }
                
                if (this.dragging) {
                    pickerManager.currentPicker.getDragWrapper().style.transform = `translateX(${x - offsetX}px)`;
                    e.preventDefault();
                    if (x - offsetX < -120) {
                        cancelDrag = true;
                        this.dragging = false;
                        pickerManager.header.next();
                    } else if (x - offsetX > 120) {
                        cancelDrag = true;
                        this.dragging = false;
                        pickerManager.header.previous();
                    }
                }
                
            },
            dragEnd: (e) => {
                let x = (<MouseEvent>e).clientX;
                if (x === void 0) {
                    x = (<TouchEvent>e).changedTouches[0].clientX;
                }
                if (Math.abs(x - offsetX) > 30 && new Date().valueOf() - startTime < 100) {
                    cancelDrag = true;
                    this.dragging = false;
                    if (x - offsetX < 0) {
                        pickerManager.header.next();
                    } else {
                        pickerManager.header.previous();
                    }
                } else {
                    setTimeout(() => {
                        this.dragging = false;
                    });
                    pickerManager.currentPicker.getDragWrapper().classList.remove('datium-dragging');
                    pickerManager.currentPicker.getDragWrapper().style.transform = `translateX(0px)`;
                }
            },  
        })
    }
}