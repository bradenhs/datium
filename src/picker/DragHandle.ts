class DragHandle {
    public dragging = false;
    
    private startX:number;
    private cancelDrag:boolean;
    private startTime:number;
    
    constructor(private pickerManager:PickerManager) {
        listen.drag(pickerManager.container, {
            dragStart: (e) => this.dragStart(e),
            dragMove: (e) => this.dragMove(e),
            dragEnd: (e) => this.dragEnd(e),  
        });
    }
    
    private dragStart(e:MouseEvent|TouchEvent) {
        this.startX = this.getClientX(e);
        this.cancelDrag = false;
    }
    
    private dragMove(e:MouseEvent|TouchEvent) {
        if (this.cancelDrag) return;
        let x = this.getClientX(e);
        
        let diff = x - this.startX;
        
        if (!this.dragging && Math.abs(diff) > 20) {
            this.dragging = true;
            this.startX = x;
            this.pickerManager.removeActiveClasses();
            this.startTime = new Date().valueOf();
            this.pickerManager.closeBubble();
            this.pickerManager.currentPicker.getDragWrapper().classList.add('datium-dragging');
        }
        
        if (this.dragging) {
            this.pickerManager.currentPicker.getDragWrapper().style.transform = `translateX(${diff}px)`;
            e.preventDefault();
            if (diff < -100) {
                this.cancelDrag = true;
                this.dragging = false;
                this.pickerManager.header.next();
            } else if (diff > 100) {
                this.cancelDrag = true;
                this.dragging = false;
                this.pickerManager.header.previous();
            }
        }
        
    }
    
    private dragEnd(e:MouseEvent|TouchEvent) {
        if (!this.dragging) return;
        let x = this.getClientX(e);
        if (Math.abs(x - this.startX) > 30 && new Date().valueOf() - this.startTime < 200) {
            this.cancelDrag = true;
            this.dragging = false;
            if (x - this.startX < 0) {
                this.pickerManager.header.next();
            } else {
                this.pickerManager.header.previous();
            }
        } else {
            setTimeout(() => {
                this.dragging = false;
            });
            this.pickerManager.currentPicker.getDragWrapper().classList.remove('datium-dragging');
            this.pickerManager.currentPicker.getDragWrapper().style.transform = `translateX(0px)`;
        }
    }
    
    private getClientX(e:any) {
        if (e.clientX === void 0) return e.changedTouches[0].clientX;
        return e.clientX;
    }
    
    
}