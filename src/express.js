import EventEmitter from "wolfy87-eventemitter";
import mixin from "merge-descriptors";
import req from "./request";
import res from "./response";
import proto from "./application";
import { parseKey } from "./utils";
import mockXhr from "./adapters/xhr";
import mockFetch from "./adapters/fetch";
import logger from "./logger";

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */

function createApplication() {
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  mixin(app, EventEmitter.prototype, false);
  mixin(app, proto, false);

  // expose the prototype that will get set on requests
  app.request = Object.create(req, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  });

  // expose the prototype that will get set on responses
  app.response = Object.create(res, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  });

  app.debug = function(flag) {
    logger.debug(flag);
  };
  app.mock = function(strategy, mockMap) {
    Object.keys(mockMap).forEach(key => {
      const { method, path } = parseKey(key);
      app[method](path, mockMap[key]);
    });
    if (strategy === "xhr") {
      mockXhr(app);
    } else {
      mockFetch(app);
    }
  };
  app.init();
  return app;
}

export default createApplication;
