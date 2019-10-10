import query from "./middleware/query";
import init from "./middleware/init";
import setPrototypeOf from "setprototypeof";
import merge from "utils-merge";
import flatten from "array-flatten";
import logger from "./logger";
import { methods } from "./http";
import Router from "./router";
import finalhandler from "./finalHandler";

var slice = Array.prototype.slice;
var debug = logger("express:application");
var app = {};

var trustProxyDefaultSymbol = "@@symbol:trust_proxy_default";

app.init = function init() {
  this.cache = {};
  this.engines = {};
  this.settings = {};

  this.defaultConfiguration();
};

app.defaultConfiguration = function defaultConfiguration() {
  var env = process.env.NODE_ENV || "development";

  // default settings
  this.enable("x-powered-by");
  this.set("etag", "weak");
  this.set("env", env);
  this.set("query parser", "extended");
  this.set("subdomain offset", 2);
  this.set("trust proxy", false);

  // trust proxy inherit back-compat
  Object.defineProperty(this.settings, trustProxyDefaultSymbol, {
    configurable: true,
    value: true
  });

  debug("booting in %s mode", env);

  this.on("mount", function onmount(parent) {
    // inherit trust proxy
    if (
      this.settings[trustProxyDefaultSymbol] === true &&
      typeof parent.settings["trust proxy fn"] === "function"
    ) {
      delete this.settings["trust proxy"];
      delete this.settings["trust proxy fn"];
    }

    // inherit protos
    setPrototypeOf(this.request, parent.request);
    setPrototypeOf(this.response, parent.response);
    setPrototypeOf(this.engines, parent.engines);
    setPrototypeOf(this.settings, parent.settings);
  });

  // setup locals
  this.locals = Object.create(null);

  // top-most app is mounted at /
  this.mountpath = "/";

  // default locals
  this.locals.settings = this.settings;

  // default configuration
  // this.set('view', View);
  // this.set('views', resolve('views'));
  this.set("jsonp callback name", "callback");

  if (env === "production") {
    this.enable("view cache");
  }
};

app.lazyrouter = function lazyrouter() {
  if (!this._router) {
    this._router = new Router({
      caseSensitive: this.enabled("case sensitive routing"),
      strict: this.enabled("strict routing")
    });

    this._router.use(query(this.get("query parser fn")));
    this._router.use(init(this));
  }
};

app.handle = function handle(req, res, callback) {
  var router = this._router;

  // final handler
  var done =
    callback ||
    finalhandler(req, res, {
      env: this.get("env"),
      onerror: logerror.bind(this)
    });

  // no routes
  if (!router) {
    debug("no routes defined on app");
    done();
    return;
  }

  router.handle(req, res, done);
};

app.use = function use(fn) {
  var offset = 0;
  var path = "/";

  // default path to '/'
  // disambiguate app.use([fn])
  if (typeof fn !== "function") {
    var arg = fn;

    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0];
    }

    // first arg is the path
    if (typeof arg !== "function") {
      offset = 1;
      path = fn;
    }
  }

  var fns = flatten(slice.call(arguments, offset));

  if (fns.length === 0) {
    throw new TypeError("app.use() requires a middleware function");
  }

  // setup router
  this.lazyrouter();
  var router = this._router;

  fns.forEach(function(fn) {
    // non-express app
    if (!fn || !fn.handle || !fn.set) {
      return router.use(path, fn);
    }

    debug(".use app under %s", path);
    fn.mountpath = path;
    fn.parent = this;

    // restore .app property on req and res
    router.use(path, function mounted_app(req, res, next) {
      var orig = req.app;
      fn.handle(req, res, function(err) {
        setPrototypeOf(req, orig.request);
        setPrototypeOf(res, orig.response);
        next(err);
      });
    });

    // mounted an app
    fn.emit("mount", this);
  }, this);

  return this;
};

app.route = function route(path) {
  this.lazyrouter();
  return this._router.route(path);
};

app.engine = function engine(ext, fn) {
  if (typeof fn !== "function") {
    throw new Error("callback function required");
  }

  // get file extension
  var extension = ext[0] !== "." ? "." + ext : ext;

  // store engine
  this.engines[extension] = fn;

  return this;
};

app.param = function param(name, fn) {
  this.lazyrouter();

  if (Array.isArray(name)) {
    for (var i = 0; i < name.length; i++) {
      this.param(name[i], fn);
    }

    return this;
  }

  this._router.param(name, fn);

  return this;
};

app.set = function set(setting, val) {
  if (arguments.length === 1) {
    // app.get(setting)
    return this.settings[setting];
  }

  debug('set "%s" to %o', setting, val);

  // set value
  this.settings[setting] = val;

  return this;
};

app.match = function(path, method) {
  return !!this._router.isMatch(path, method);
};

app.path = function path() {
  return this.parent ? this.parent.path() + this.mountpath : "";
};

app.enabled = function enabled(setting) {
  return Boolean(this.set(setting));
};

app.disabled = function disabled(setting) {
  return !this.set(setting);
};

app.enable = function enable(setting) {
  return this.set(setting, true);
};

app.disable = function disable(setting) {
  return this.set(setting, false);
};

methods.forEach(function(method) {
  app[method] = function(path) {
    if (method === "get" && arguments.length === 1) {
      // app.get(setting)
      return this.set(path);
    }

    this.lazyrouter();

    var route = this._router.route(path);
    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
});

app.all = function all(path) {
  this.lazyrouter();

  var route = this._router.route(path);
  var args = slice.call(arguments, 1);

  for (var i = 0; i < methods.length; i++) {
    route[methods[i]].apply(route, args);
  }

  return this;
};

app.render = function render(name, options, callback) {
  throw Error("yet not implement in browser");
};

app.listen = function listen() {
  throw Error("yet not implement in browser");
};

function logerror(err) {
  if (this.get("env") !== "test") console.error(err.stack || err.toString());
}

function tryRender(view, options, callback) {
  try {
    view.render(options, callback);
  } catch (err) {
    callback(err);
  }
}

export default app;
