ngm.factory("datium.PickerManager", function() {
var PickerManager = (function () {
    function PickerManager(element) {
        var _this = this;
        this.element = element;
        this.isOpen = false;
        this.container = this.createView();
        this.insertAfter(element, this.container);
        this.pickerContainer = this.container.querySelector('datium-picker-container');
        this.header = new Header(element, this.container);
        this.yearPicker = new YearPicker(element, this.container);
        this.monthPicker = new MonthPicker(element, this.container);
        this.datePicker = new DatePicker(element, this.container);
        this.hourPicker = new HourPicker(element, this.container);
        this.minutePicker = new MinutePicker(element, this.container);
        this.secondPicker = new SecondPicker(element, this.container);
        listen.down(this.container, '*', function (e) { _this.addActiveClasses(e); });
        listen.up(document, function () {
            _this.closeBubble();
            _this.removeActiveClasses();
        });
        listen.mousedown(this.container, function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        listen.viewchanged(element, function (e) { return _this.viewchanged(e.date, e.level, e.update); });
        listen.openBubble(element, function (e) {
            _this.openBubble(e.x, e.y, e.text);
        });
        listen.updateBubble(element, function (e) {
            _this.updateBubble(e.x, e.y, e.text);
        });
        listen.swipeLeft(this.container, function () {
            if (_this.secondPicker.isDragging() ||
                _this.minutePicker.isDragging() ||
                _this.hourPicker.isDragging())
                return;
            _this.header.next();
        });
        listen.swipeRight(this.container, function () {
            if (_this.secondPicker.isDragging() ||
                _this.minutePicker.isDragging() ||
                _this.hourPicker.isDragging())
                return;
            _this.header.previous();
        });
        listen.blur(this.element, function () {
            _this.closePicker();
        });
        listen.up(document, function () {
            _this.closeBubble();
        });
        listen.updateDefinedState(element, function (e) {
            switch (e.level) {
                case 0 /* YEAR */:
                    _this.yearPicker.setDefined(e.defined);
                    break;
                case 1 /* MONTH */:
                    _this.monthPicker.setDefined(e.defined);
                    break;
                case 2 /* DATE */:
                    _this.datePicker.setDefined(e.defined);
                    break;
                case 3 /* HOUR */:
                    _this.hourPicker.setDefined(e.defined);
                    break;
                case 4 /* MINUTE */:
                    _this.minutePicker.setDefined(e.defined);
                    break;
                case 5 /* SECOND */:
                    _this.secondPicker.setDefined(e.defined);
                    break;
            }
        });
        listen.down(element, function (e) {
            if (e.changedTouches !== void 0) {
                _this.clientX = e.changedTouches[0].clientX;
            }
            else {
                _this.clientX = e.clientX;
            }
        });
    }
    PickerManager.prototype.openPicker = function () {
        var _this = this;
        clearTimeout(this.openingTimeout);
        this.openingTimeout = setTimeout(function () {
            _this.container.classList.remove('datium-closed');
            _this.isOpen = true;
            _this.adjustHeight(_this.currentPicker.getHeight());
        }, 25);
    };
    PickerManager.prototype.closePicker = function () {
        clearTimeout(this.openingTimeout);
        this.isOpen = false;
        this.container.classList.add('datium-closed');
        this.adjustHeight(0);
    };
    PickerManager.prototype.closeBubble = function () {
        if (this.bubble === void 0)
            return;
        this.bubble.classList.remove('datium-bubble-visible');
        setTimeout(function (bubble) {
            bubble.remove();
        }, this.options.transition ? 200 : 0, this.bubble);
        this.bubble = void 0;
    };
    PickerManager.prototype.openBubble = function (x, y, text) {
        if (this.bubble !== void 0) {
            this.closeBubble();
        }
        this.bubble = document.createElement('datium-bubble');
        this.container.appendChild(this.bubble);
        this.updateBubble(x, y, text);
        setTimeout(function (bubble) {
            bubble.classList.add('datium-bubble-visible');
        }, 0, this.bubble);
    };
    PickerManager.prototype.updateBubble = function (x, y, text) {
        this.bubble.innerHTML = text;
        this.bubble.style.top = y + 'px';
        this.bubble.style.left = x + 'px';
    };
    PickerManager.prototype.viewchanged = function (date, level, update) {
        if (level === 6 /* NONE */ || this.element !== document.activeElement || !this.options.showPicker) {
            if (update)
                this.updateSelectedDate(date);
            this.closePicker();
            return;
        }
        var transition;
        if (this.currentPicker === void 0) {
            this.currentPicker = this.getPicker(level);
            this.currentPicker.create(date, 2 /* ZOOM_IN */);
        }
        else if ((transition = this.getTransition(date, level)) !== void 0) {
            this.currentPicker.remove(transition);
            this.currentPicker = this.getPicker(level);
            this.currentPicker.create(date, transition);
        }
        if (update)
            this.updateSelectedDate(date);
        if (this.isOpen)
            this.adjustHeight(this.currentPicker.getHeight());
        this.openPicker();
    };
    PickerManager.prototype.updateSelectedDate = function (date) {
        this.date = date;
        this.yearPicker.setSelectedDate(date);
        this.monthPicker.setSelectedDate(date);
        this.datePicker.setSelectedDate(date);
        this.hourPicker.setSelectedDate(date);
        this.minutePicker.setSelectedDate(date);
        this.secondPicker.setSelectedDate(date);
    };
    PickerManager.prototype.getTransition = function (date, level) {
        if (level > this.currentPicker.getLevel())
            return 2 /* ZOOM_IN */;
        if (level < this.currentPicker.getLevel())
            return 3 /* ZOOM_OUT */;
        if (date.valueOf() < this.currentPicker.getMin().valueOf())
            return 0 /* SLIDE_LEFT */;
        if (date.valueOf() > this.currentPicker.getMax().valueOf())
            return 1 /* SLIDE_RIGHT */;
        return void 0;
    };
    PickerManager.prototype.adjustHeight = function (height) {
        var topSpace = this.element.getBoundingClientRect().top;
        var bottomSpace = window.innerHeight - this.element.getBoundingClientRect().bottom;
        var inputHeight = this.element.getBoundingClientRect().bottom - this.element.getBoundingClientRect().top;
        var marginTop = parseInt(getComputedStyle(this.element).getPropertyValue('margin-top'), 10);
        var marginBottom = parseInt(getComputedStyle(this.element).getPropertyValue('margin-bottom'), 10);
        var origin;
        var topAdjust;
        if (bottomSpace < 325 && topSpace > 325) {
            topAdjust = -inputHeight - 85 - marginTop;
            if (this.isOpen) {
                topAdjust -= height;
            }
            origin = 130;
        }
        else {
            topAdjust = -marginBottom;
            origin = 5;
        }
        var marginLeft = parseInt(getComputedStyle(this.element).getPropertyValue('margin-left'), 10);
        var scale = this.isOpen ? 'scale(1)' : 'scale(.01)';
        this.container.style.transform = "translate(" + marginLeft + "px, " + topAdjust + "px) " + scale;
        var xDiff = this.clientX - this.container.getBoundingClientRect().left;
        if (xDiff < 10)
            xDiff = 10;
        if (xDiff > 220)
            xDiff = 220;
        this.container.style.transformOrigin = xDiff + "px " + origin + "px";
        this.pickerContainer.style.transform = "translateY(" + (height - 280) + "px)";
    };
    PickerManager.prototype.getPicker = function (level) {
        return [this.yearPicker, this.monthPicker, this.datePicker, this.hourPicker, this.minutePicker, this.secondPicker][level];
    };
    PickerManager.prototype.removeActiveClasses = function () {
        var activeElements = this.container.querySelectorAll('.datium-active');
        for (var i = 0; i < activeElements.length; i++) {
            activeElements[i].classList.remove('datium-active');
        }
        this.container.classList.remove('datium-active');
    };
    PickerManager.prototype.addActiveClasses = function (e) {
        var el = e.srcElement || e.target;
        while (el !== this.container) {
            el.classList.add('datium-active');
            el = el.parentElement;
        }
        this.container.classList.add('datium-active');
    };
    PickerManager.prototype.updateOptions = function (options) {
        this.header.updateMaxLevel(this.startLevel);
        var themeUpdated = this.options === void 0 ||
            this.options.theme === void 0 ||
            this.options.theme.primary !== options.theme.primary ||
            this.options.theme.primary_text !== options.theme.primary_text ||
            this.options.theme.secondary !== options.theme.secondary ||
            this.options.theme.secondary_accent !== options.theme.secondary_accent ||
            this.options.theme.secondary_text !== options.theme.secondary_text;
        this.options = options;
        if (themeUpdated) {
            this.insertStyles();
        }
        this.header.updateOptions(options);
        this.yearPicker.updateOptions(options);
        this.monthPicker.updateOptions(options);
        this.datePicker.updateOptions(options);
        this.hourPicker.updateOptions(options);
        this.minutePicker.updateOptions(options);
        this.secondPicker.updateOptions(options);
    };
    PickerManager.prototype.createView = function () {
        var el = document.createElement('datium-container');
        el.innerHTML = header + "\n        <datium-picker-container-wrapper>\n            <datium-picker-container></datium-picker-container>\n        </datium-picker-container-wrapper>";
        el.classList.add('datium-closed');
        return el;
    };
    PickerManager.prototype.insertAfter = function (node, newNode) {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    };
    PickerManager.prototype.insertStyles = function () {
        var head = document.head || document.getElementsByTagName('head')[0];
        var styleElement = document.createElement('style');
        var styleId = "datium-style" + (PickerManager.stylesInserted++);
        var existingStyleId = this.getExistingStyleId();
        if (existingStyleId !== null) {
            this.container.classList.remove(existingStyleId);
        }
        this.container.classList.add(styleId);
        var transformedCss = css.replace(/_primary_text/g, this.options.theme.primary_text);
        transformedCss = transformedCss.replace(/_primary/g, this.options.theme.primary);
        transformedCss = transformedCss.replace(/_secondary_text/g, this.options.theme.secondary_text);
        transformedCss = transformedCss.replace(/_secondary_accent/g, this.options.theme.secondary_accent);
        transformedCss = transformedCss.replace(/_secondary/g, this.options.theme.secondary);
        transformedCss = transformedCss.replace(/_id/g, styleId);
        styleElement.type = 'text/css';
        if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = transformedCss;
        }
        else {
            styleElement.appendChild(document.createTextNode(transformedCss));
        }
        head.appendChild(styleElement);
    };
    PickerManager.prototype.getExistingStyleId = function () {
        for (var i = 0; i < this.container.classList.length; i++) {
            if (/^datium-style\d+$/.test(this.container.classList.item(i))) {
                return this.container.classList.item(i);
            }
        }
        return null;
    };
    PickerManager.stylesInserted = 0;
    return PickerManager;
}());
return PickerManager;
});