import http from "./http";
import { defineGetter } from "./utils";

var req = Object.create(http.IncomingMessage.prototype);

req.get = req.header = function header(name) {
  throw Error("yet not implement in browser");
};

req.accepts = function() {
  throw Error("yet not implement in browser");
};

req.acceptsEncodings = function() {
  throw Error("yet not implement in browser");
};

req.acceptsCharsets = function() {
  throw Error("yet not implement in browser");
};

req.acceptsLanguages = function() {
  throw Error("yet not implement in browser");
};

req.range = function range(size, options) {
  throw Error("yet not implement in browser");
};

req.param = function param(name, defaultValue) {
  throw Error("yet not implement in browser");
};

req.is = function is(types) {
  throw Error("yet not implement in browser");
};

defineGetter(req, "protocol", function protocol() {
  throw Error("yet not implement in browser");
});

defineGetter(req, "secure", function secure() {
  return this.protocol === "https";
});

defineGetter(req, "ip", function ip() {
  throw Error("yet not implement in browser");
});

defineGetter(req, "ips", function ips() {
  throw Error("yet not implement in browser");
});

defineGetter(req, "subdomains", function subdomains() {
  throw Error("yet not implement in browser");
});

defineGetter(req, "path", function path() {
  throw Error("yet not implement in browser");
});

defineGetter(req, "hostname", function hostname() {
  throw Error("yet not implement in browser");
});

defineGetter(req, "fresh", function() {
  throw Error("yet not implement in browser");
});

defineGetter(req, "stale", function stale() {
  throw Error("yet not implement in browser");
});

defineGetter(req, "xhr", function xhr() {
  var val = this.get("X-Requested-With") || "";
  return val.toLowerCase() === "xmlhttprequest";
});

export default req;
