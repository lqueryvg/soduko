
InvalidAspect = new Error("Missing a valid aspect. Aspect is not a function.");
InvalidObject = new Error(
        "Missing valid object or an array of valid objects.");
InvalidMethod = new Error("Missing valid method to apply aspect on.");

function doBefore (beforeFunc, func) {
    return function () {
        beforeFunc.apply(this, arguments);
        return func.apply(this, arguments);
    };
}

function doAfter (func, afterFunc) {
    return function () {
        var res = func.apply(this, arguments);
        afterFunc.apply(this, arguments);
        return res;
    };
}

Aspects = function () {
};
Aspects.prototype = {
    _addIntroduction: function (intro, obj) {
        for (var m in intro.prototype) {
            obj.prototype[m] = intro.prototype[m];
        }
    },
    addIntroduction: function (aspect, objs) {
        var oType = typeof (objs);

        if (typeof (aspect) !== 'function')
            throw (InvalidAspect);

        if (oType === 'function') {
            this._addIntroduction(aspect, objs);
        } else if (oType === 'object') {
            for (var n = 0; n < objs.length; n++) {
                this._addIntroduction(aspect, objs[n]);
            }
        } else {
            throw InvalidObject;
        }
    },
    addBefore: function (aspect, obj, funcs) {
        var fType = typeof (funcs);

        if (typeof (aspect) !== 'function')
            throw (InvalidAspect);

        if (fType !== 'object')
            funcs = Array(funcs);

        for (var n = 0; n < funcs.length; n++) {
            var fName = funcs[n];
            var old = obj.prototype[fName];

            if (!old)
                throw InvalidMethod;

            var res = doBefore(aspect, old);
            obj.prototype[fName] = res;
        }
    },
    addAfter: function (aspect, obj, funcs) {
        if (typeof (aspect) !== 'function')
            throw InvalidAspect;

        if (typeof (funcs) !== 'object')
            funcs = Array(
                    funcs);

        for (var n = 0; n < funcs.length; n++) {
            var fName = funcs[n];
            var old = obj.prototype[fName];

            if (!old)
                throw InvalidMethod;

            var res = doAfter(old, aspect);
            obj.prototype[fName] = res;
        }
    },
    addAround: function (aspect, obj, funcs) {
        if (typeof (aspect) !== 'function')
            throw InvalidAspect;

        if (typeof (funcs) !== 'object')
            funcs = Array(
                    funcs);

        for (var n = 0; n < funcs.length; n++) {
            var fName = funcs[n];
            var old = obj.prototype[fName];
            if (!old)
                throw InvalidMethod;

            var res = aspect(old);
            obj.prototype[fName] = res;
        }

        return true;
    }
};