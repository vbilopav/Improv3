"use strict";
var _this = this;
(function () {
    var _entries = {};
    window.subscribe = function (name, handler) {
        var doSub = function (n) {
            var entry = _entries[n];
            if (!entry) {
                entry = _entries[n] = [];
            }
            return _entries[n].push(handler) - 1;
        };
        if (name instanceof Array) {
            var result = [];
            for (var _i = 0, name_1 = name; _i < name_1.length; _i++) {
                var i = name_1[_i];
                result.push({ "name": i, index: doSub(i) });
            }
            return result;
        }
        else {
            return doSub(name);
        }
    };
    window.unsubscribe = function (name, ref) {
        var result = false;
        if (ref instanceof Array === false) {
            ref = [{ "name": name, index: ref }];
        }
        for (var _i = 0, ref_1 = ref; _i < ref_1.length; _i++) {
            var item = ref_1[_i];
            var entry = _entries[item.name];
            if (!entry) {
                continue;
            }
            entry.splice(item.index, 1);
            if (!result) {
                result = true;
            }
        }
        return result;
    };
    window.publish = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var doPub = function (n) {
            var entry = _entries[n];
            if (!entry) {
                return;
            }
            entry.forEach(function (f) { return f.apply(_this, args); });
        };
        if (name instanceof Array) {
            for (var _a = 0, name_2 = name; _a < name_2.length; _a++) {
                var i = name_2[_a];
                doPub(i);
            }
        }
        else {
            doPub(name);
        }
    };
})();
