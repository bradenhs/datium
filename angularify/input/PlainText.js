ngm.factory("datium.PlainText",
[function() {
var PlainText = (function () {
    function PlainText(text) {
        this.text = text;
    }
    PlainText.prototype.increment = function () { };
    PlainText.prototype.decrement = function () { };
    PlainText.prototype.setValueFromPartial = function () { return false; };
    PlainText.prototype.setValue = function () { return false; };
    PlainText.prototype.getLastValue = function () { return null; };
    PlainText.prototype.getValue = function () { return null; };
    PlainText.prototype.getRegEx = function () { return new RegExp("[" + this.text + "]"); };
    PlainText.prototype.setSelectable = function (selectable) { return this; };
    PlainText.prototype.getMaxBuffer = function () { return 0; };
    PlainText.prototype.getLevel = function () { return 6 /* NONE */; };
    PlainText.prototype.isValid = function () { return false; };
    PlainText.prototype.isSelectable = function () { return false; };
    PlainText.prototype.isDefined = function () { return false; };
    PlainText.prototype.setDefined = function () { };
    PlainText.prototype.toString = function () { return this.text; };
    return PlainText;
}());
return PlainText;
}]);