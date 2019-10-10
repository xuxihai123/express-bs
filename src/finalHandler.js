import encodeUrl from "encodeurl";
import escapeHtml from "escape-html";
import statuses from "statuses";
import logger from "./logger";
import parseurl from "./middleware/parse-url";

var debug = logger("finalhandler");

var DOUBLE_SPACE_REGEXP = /\x20{2}/g;
var NEWLINE_REGEXP = /\n/g;

function createHtmlDocument(message) {
  var body = escapeHtml(message)
    .replace(NEWLINE_REGEXP, "<br>")
    .replace(DOUBLE_SPACE_REGEXP, " &nbsp;");

  return (
    "<!DOCTYPE html>\n" +
    '<html lang="en">\n' +
    "<head>\n" +
    '<meta charset="utf-8">\n' +
    "<title>Error</title>\n" +
    "</head>\n" +
    "<body>\n" +
    "<pre>" +
    body +
    "</pre>\n" +
    "</body>\n" +
    "</html>\n"
  );
}

function finalhandler(req, res, options) {
  var opts = options || {};

  var env = opts.env || process.env.NODE_ENV || "development";

  var onerror = opts.onerror;

  return function(err) {
    var headers;
    var msg;
    var status;

    if (!err && headersSent(res)) {
      debug("cannot 404 after headers sent");
      return;
    }

    if (err) {
      status = getErrorStatusCode(err);

      if (status === undefined) {
        status = getResponseStatusCode(res);
      } else {
        headers = getErrorHeaders(err);
      }

      msg = getErrorMessage(err, status, env);
    } else {
      status = 404;
      msg = "Cannot " + req.method + " " + encodeUrl(getResourceName(req));
    }

    debug("default %s", status);

    if (err && onerror) {
      setTimeout(onerror, 0, err, req, res);
    }

    if (headersSent(res)) {
      debug("cannot %d after headers sent", status);
      req.socket.destroy();
      return;
    }

    send(req, res, status, headers, msg);
  };
}

function getErrorHeaders(err) {
  if (!err.headers || typeof err.headers !== "object") {
    return undefined;
  }

  var headers = Object.create(null);
  var keys = Object.keys(err.headers);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    headers[key] = err.headers[key];
  }

  return headers;
}

function getErrorMessage(err, status, env) {
  var msg;

  if (env !== "production") {
    msg = err.stack;

    if (!msg && typeof err.toString === "function") {
      msg = err.toString();
    }
  }

  return msg || statuses[status];
}

function getErrorStatusCode(err) {
  if (typeof err.status === "number" && err.status >= 400 && err.status < 600) {
    return err.status;
  }

  if (
    typeof err.statusCode === "number" &&
    err.statusCode >= 400 &&
    err.statusCode < 600
  ) {
    return err.statusCode;
  }

  return undefined;
}

function getResourceName(req) {
  try {
    return parseUrl.original(req).pathname;
  } catch (e) {
    return "resource";
  }
}

function getResponseStatusCode(res) {
  var status = res.statusCode;

  if (typeof status !== "number" || status < 400 || status > 599) {
    status = 500;
  }

  return status;
}

function headersSent(res) {
  return typeof res.headersSent !== "boolean"
    ? Boolean(res._header)
    : res.headersSent;
}

function send(req, res, status, headers, message) {
  function write() {
    var body = createHtmlDocument(message);
    res.statusCode = status;
    res.statusMessage = statuses[status];

    setHeaders(res, headers);
    res.setHeader("Content-Security-Policy", "default-src 'none'");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Length", Buffer.byteLength(body, "utf8"));

    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(body, "utf8");
  }

  if (req._isFinished) {
    write();
    return;
  }
}

function setHeaders(res, headers) {
  if (!headers) {
    return;
  }

  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    res.setHeader(key, headers[key]);
  }
}

export default finalhandler;
