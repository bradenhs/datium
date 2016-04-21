ngm.factory("datium.Datium",
["datium.DatiumInternals", 
function(DatiumInternals) {
window['Datium'] = (function () {
    function Datium(element, options) {
        var internals = new DatiumInternals(element, options);
        this['updateOptions'] = function (options) { return internals.updateOptions(options); };
        this['isValid'] = function () { return internals.isValid(); };
        this['getDate'] = function () { return internals.getDate(); };
        this['isDirty'] = function () { return internals.isDirty(); };
        this['setDirty'] = function (dirty) { return internals.setDirty(dirty); };
        this['setDate'] = function (d) { return internals.setDate(d); };
        this['setDefined'] = function () { return internals.setDefined(); };
        this['toString'] = function () { return internals.toString(); };
        this['getInvalidReasons'] = function () { return internals.getInvalidReasons(); };
    }
    return Datium;
}());
return Datium;
}]);