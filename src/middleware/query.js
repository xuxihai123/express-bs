import merge from "utils-merge";
import parseUrl from "./parse-url";
import qs from "qs";

/**
 * @param {Object} options
 * @return {Function}
 * @api public
 */

export default function query(options) {
  var opts = merge({}, options);
  var queryparse = qs.parse;

  if (typeof options === "function") {
    queryparse = options;
    opts = undefined;
  }

  if (opts !== undefined && opts.allowPrototypes === undefined) {
    // back-compat for qs module
    opts.allowPrototypes = true;
  }

  return function query(req, res, next) {
    if (!req.query) {
      var val = parseUrl(req).query;
      req.query = queryparse(val, opts);
    }

    next();
  };
}
