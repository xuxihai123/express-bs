export function defineGetter(obj, name, getter) {
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: true,
    get: getter
  });
}

export function stringify(value, replacer, spaces, escape) {
  // v8 checks arguments.length for optimizing simple call
  // https://bugs.chromium.org/p/v8/issues/detail?id=4730
  var json =
    replacer || spaces
      ? JSON.stringify(value, replacer, spaces)
      : JSON.stringify(value);

  if (escape) {
    json = json.replace(/[<>&]/g, function(c) {
      switch (c.charCodeAt(0)) {
        case 0x3c:
          return "\\u003c";
        case 0x3e:
          return "\\u003e";
        case 0x26:
          return "\\u0026";

        default:
          return c;
      }
    });
  }

  return json;
}

export function parseKey(key) {
  let method = "get";
  let path = key;
  if (key.indexOf(" ") > -1) {
    let splited = key.split(" ");
    method = splited[0].toLowerCase();
    path = splited[1];
  }
  return { method, path };
}

/*
    ## Utilities
*/
var Util = {};

Util.extend = function extend() {
  var target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    options,
    name,
    src,
    copy,
    clone;

  if (length === 1) {
    target = this;
    i = 0;
  }

  for (; i < length; i++) {
    options = arguments[i];
    if (!options) continue;

    for (name in options) {
      src = target[name];
      copy = options[name];

      if (target === copy) continue;
      if (copy === undefined) continue;

      if (Util.isArray(copy) || Util.isObject(copy)) {
        if (Util.isArray(copy)) clone = src && Util.isArray(src) ? src : [];
        if (Util.isObject(copy)) clone = src && Util.isObject(src) ? src : {};

        target[name] = Util.extend(clone, copy);
      } else {
        target[name] = copy;
      }
    }
  }

  return target;
};

Util.each = function each(obj, iterator, context) {
  var i, key;
  if (this.type(obj) === "number") {
    for (i = 0; i < obj; i++) {
      iterator(i, i);
    }
  } else if (obj.length === +obj.length) {
    for (i = 0; i < obj.length; i++) {
      if (iterator.call(context, obj[i], i, obj) === false) break;
    }
  } else {
    for (key in obj) {
      if (iterator.call(context, obj[key], key, obj) === false) break;
    }
  }
};

Util.type = function type(obj) {
  return obj === null || obj === undefined
    ? String(obj)
    : Object.prototype.toString
        .call(obj)
        .match(/\[object (\w+)\]/)[1]
        .toLowerCase();
};

Util.each("String Object Array RegExp Function".split(" "), function(value) {
  Util["is" + value] = function(obj) {
    return Util.type(obj) === value.toLowerCase();
  };
});

Util.isObjectOrArray = function(value) {
  return Util.isObject(value) || Util.isArray(value);
};

Util.isNumeric = function(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

Util.keys = function(obj) {
  var keys = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) keys.push(key);
  }
  return keys;
};
Util.values = function(obj) {
  var values = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) values.push(obj[key]);
  }
  return values;
};

Util.noop = function() {};

export default Util;
