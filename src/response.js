import http from "./http";
import { defineGetter } from "./utils";

var res = Object.create(http.ServerResponse.prototype);

var charsetRegExp = /;\s*charset\s*=/;

res.status = function status(code) {
  this.statusCode = code;
  return this;
};

res.links = function(links) {
  throw Error("yet not implement in browser");
};

res.send = function send(body) {
  throw Error("yet not implement in browser");
};

res.json = function json(obj) {
  this.setHeader("Content-Type", "application/json");
  this.respData = JSON.stringify(obj);
  this._isFinished = true;
  this.emit("finish");
  return this;
  // throw Error('yet not implement in browser');
};

res.jsonp = function jsonp(obj) {
  throw Error("yet not implement in browser");
};

res.sendStatus = function sendStatus(statusCode) {
  throw Error("yet not implement in browser");
};

res.sendFile = function sendFile(path, options, callback) {
  throw Error("yet not implement in browser");
};

res.sendfile = function(path, options, callback) {
  throw Error("yet not implement in browser");
};

res.download = function download(path, filename, options, callback) {
  throw Error("yet not implement in browser");
};

res.contentType = res.type = function contentType(type) {
  throw Error("yet not implement in browser");
};

res.format = function(obj) {
  throw Error("yet not implement in browser");
};

res.attachment = function attachment(filename) {
  throw Error("yet not implement in browser");
};

res.append = function append(field, val) {
  throw Error("yet not implement in browser");
};

res.set = res.header = function header(field, val) {
  throw Error("yet not implement in browser");
};

res.get = function(field) {
  return this.getHeader(field);
};

res.clearCookie = function clearCookie(name, options) {
  throw Error("yet not implement in browser");
};

res.cookie = function(name, value, options) {
  throw Error("yet not implement in browser");
};

res.location = function location(url) {
  throw Error("yet not implement in browser");
};

res.redirect = function redirect(url) {
  throw Error("yet not implement in browser");
};

res.vary = function(field) {
  throw Error("yet not implement in browser");
};

res.render = function render(view, options, callback) {
  throw Error("yet not implement in browser");
};

export default res;
