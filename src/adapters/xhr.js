import Util from '../utils';
import HTTP_STATUS_CODES from '../http/status';
import http from '../http';

export default function createServer(handler) {
  // 备份原生 XMLHttpRequest
  window._XMLHttpRequest = window.XMLHttpRequest;
  window._ActiveXObject = window.ActiveXObject;

  window.XMLHttpRequest = MockXMLHttpRequest;

  /*
    PhantomJS
    TypeError: '[object EventConstructor]' is not a constructor (evaluating 'new Event("readystatechange")')
    https://github.com/bluerail/twitter-bootstrap-rails-confirm/issues/18
    https://github.com/ariya/phantomjs/issues/11289
*/
  try {
    new window.Event('custom');
  } catch (exception) {
    window.Event = function(type, bubbles, cancelable, detail) {
      var event = document.createEvent('CustomEvent'); // MUST be 'CustomEvent'
      event.initCustomEvent(type, bubbles, cancelable, detail);
      return event;
    };
  }

  var XHR_STATES = {
    // The object has been constructed.
    UNSENT: 0,
    // The open() method has been successfully invoked.
    OPENED: 1,
    // All redirects (if any) have been followed and all HTTP headers of the response have been received.
    HEADERS_RECEIVED: 2,
    // The response's body is being received.
    LOADING: 3,
    // The data transfer has been completed or something went wrong during the transfer (e.g. infinite redirects).
    DONE: 4,
  };

  var XHR_EVENTS = 'readystatechange loadstart progress abort error load timeout loadend'.split(' ');
  var XHR_REQUEST_PROPERTIES = 'timeout withCredentials'.split(' ');
  var XHR_RESPONSE_PROPERTIES = 'readyState responseURL status statusText responseType response responseText responseXML'.split(' ');

  function MockXMLHttpRequest() {
    // 初始化 custom 对象，用于存储自定义属性
    this.custom = {
      events: {},
      requestHeaders: {},
      responseHeaders: {},
    };
  }

  MockXMLHttpRequest._settings = {
    timeout: '10-100',
    /*
        timeout: 50,
        timeout: '10-100',
     */
  };

  MockXMLHttpRequest.setup = function(settings) {
    Util.extend(MockXMLHttpRequest._settings, settings);
    return MockXMLHttpRequest._settings;
  };

  Util.extend(MockXMLHttpRequest, XHR_STATES);
  Util.extend(MockXMLHttpRequest.prototype, XHR_STATES);

  // 标记当前对象为 MockXMLHttpRequest
  MockXMLHttpRequest.prototype.mock = true;

  // 是否拦截 Ajax 请求
  MockXMLHttpRequest.prototype.match = false;

  // 初始化 Request 相关的属性和方法
  Util.extend(MockXMLHttpRequest.prototype, {
    // https://xhr.spec.whatwg.org/#the-open()-method
    // Sets the request method, request URL, and synchronous flag.
    open: function(method, url, async, username, password) {
      var that = this;

      Util.extend(this.custom, {
        method: method,
        url: url,
        async: typeof async === 'boolean' ? async : true,
        username: username,
        password: password,
        options: {
          url: url,
          type: method,
        },
      });

      this.custom.timeout = (function(timeout) {
        if (typeof timeout === 'number') return timeout;
        if (typeof timeout === 'string' && !~timeout.indexOf('-')) return parseInt(timeout, 10);
        if (typeof timeout === 'string' && ~timeout.indexOf('-')) {
          var tmp = timeout.split('-');
          var min = parseInt(tmp[0], 10);
          var max = parseInt(tmp[1], 10);
          return Math.round(Math.random() * (max - min)) + min;
        }
      })(MockXMLHttpRequest._settings.timeout);

      var isMatch = handler.match(this.custom.url, this.custom.method);
      console.log(`xhr match: ${this.custom.method} ${this.custom.url}  ${isMatch}`);
      function handle(event) {
        // 同步属性 NativeXMLHttpRequest => MockXMLHttpRequest
        for (var i = 0; i < XHR_RESPONSE_PROPERTIES.length; i++) {
          try {
            that[XHR_RESPONSE_PROPERTIES[i]] = xhr[XHR_RESPONSE_PROPERTIES[i]];
          } catch (e) {
            // ignore
          }
        }
        // 触发 MockXMLHttpRequest 上的同名事件
        that.dispatchEvent(new Event(event.type /*, false, false, that*/));
      }

      // 如果未找到匹配的数据模板，则采用原生 XHR 发送请求。
      if (!isMatch) {
        // 创建原生 XHR 对象，调用原生 open()，监听所有原生事件
        var xhr = createNativeXMLHttpRequest();
        this.custom.xhr = xhr;

        // 初始化所有事件，用于监听原生 XHR 对象的事件
        for (var i = 0; i < XHR_EVENTS.length; i++) {
          xhr.addEventListener(XHR_EVENTS[i], handle);
        }

        // xhr.open()
        if (username) xhr.open(method, url, async, username, password);
        else xhr.open(method, url, async);

        // 同步属性 MockXMLHttpRequest => NativeXMLHttpRequest
        for (var j = 0; j < XHR_REQUEST_PROPERTIES.length; j++) {
          try {
            xhr[XHR_REQUEST_PROPERTIES[j]] = that[XHR_REQUEST_PROPERTIES[j]];
          } catch (e) {
            //ignore
          }
        }

        return;
      }

      // 找到了匹配的数据模板，开始拦截 XHR 请求
      this.match = true;
      this.readyState = MockXMLHttpRequest.OPENED;
      this.dispatchEvent(new Event('readystatechange' /*, false, false, this*/));
    },
    // https://xhr.spec.whatwg.org/#the-setrequestheader()-method
    // Combines a header in author request headers.
    setRequestHeader: function(name, value) {
      // 原生 XHR
      if (!this.match) {
        this.custom.xhr.setRequestHeader(name, value);
        return;
      }

      // 拦截 XHR
      var requestHeaders = this.custom.requestHeaders;
      if (requestHeaders[name]) requestHeaders[name] += ',' + value;
      else requestHeaders[name] = value;
    },
    getReqRawHeaders: function() {
      var reqHeaders = this.custom.requestHeaders;
      return Object.keys(reqHeaders).reduce((list, key) => {
        list.push(key, reqHeaders[key]);
        return list;
      }, []);
    },
    timeout: 0,
    withCredentials: false,
    upload: {},
    // https://xhr.spec.whatwg.org/#the-send()-method
    // Initiates the request.
    send: function send(data) {
      var that = this;
      this.custom.options.body = data;

      // 原生 XHR
      if (!this.match) {
        this.custom.xhr.send(data);
        return;
      }

      // 拦截 XHR
      // X-Requested-With header
      this.setRequestHeader('X-Requested-With', 'MockXMLHttpRequest');
      // loadstart The fetch initiates.
      this.dispatchEvent(new Event('loadstart' /*, false, false, this*/));

      var rawHeaders = this.getReqRawHeaders();
      var request = new http.IncomingMessage();
      request.headers = this.custom.requestHeaders;
      request.method = this.custom.method;
      request.url = this.custom.url;
      request.rawHeaders = rawHeaders;
      request.rawBody = data;
      var contentType = request.headers['Content-Type'];
      if (/json/.test(contentType)) {
        try {
          request.body = JSON.parse(data);
        } catch (e) {
          console.log(e);
        }
      }
      request.httpVersion = '1.1';
      var response = new http.ServerResponse(request);

      response.once('finish', done);

      handler(request, response);

      function done() {
        that.readyState = MockXMLHttpRequest.HEADERS_RECEIVED;
        that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/));
        that.readyState = MockXMLHttpRequest.LOADING;
        that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/));

        that.status = 200;
        that.statusText = HTTP_STATUS_CODES[200];

        that.responseHeaders = that.custom.responseHeaders = response.responseHeaders;
        that.response = that.responseText = response.respData;

        that.readyState = MockXMLHttpRequest.DONE;
        that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/));
        that.dispatchEvent(new Event('load' /*, false, false, that*/));
        that.dispatchEvent(new Event('loadend' /*, false, false, that*/));
      }
    },
    // https://xhr.spec.whatwg.org/#the-abort()-method
    // Cancels any network activity.
    abort: function abort() {
      // 原生 XHR
      if (!this.match) {
        this.custom.xhr.abort();
        return;
      }

      // 拦截 XHR
      this.readyState = MockXMLHttpRequest.UNSENT;
      this.dispatchEvent(new Event('abort', false, false, this));
      this.dispatchEvent(new Event('error', false, false, this));
    },
  });

  // 初始化 Response 相关的属性和方法
  Util.extend(MockXMLHttpRequest.prototype, {
    responseURL: '',
    status: MockXMLHttpRequest.UNSENT,
    statusText: '',
    // https://xhr.spec.whatwg.org/#the-getresponseheader()-method
    getResponseHeader: function(name) {
      // 原生 XHR
      if (!this.match) {
        return this.custom.xhr.getResponseHeader(name);
      }

      // 拦截 XHR
      return this.custom.responseHeaders[name.toLowerCase()];
    },
    // https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method
    // http://www.utf8-chartable.de/
    getAllResponseHeaders: function() {
      // 原生 XHR
      if (!this.match) {
        return this.custom.xhr.getAllResponseHeaders();
      }

      // 拦截 XHR
      var responseHeaders = this.custom.responseHeaders;
      var headers = '';
      for (var h in responseHeaders) {
        if (!responseHeaders.hasOwnProperty(h)) continue;
        headers += h + ': ' + responseHeaders[h] + '\r\n';
      }
      return headers;
    },
    overrideMimeType: function(/*mime*/) {},
    responseType: '', // '', 'text', 'arraybuffer', 'blob', 'document', 'json'
    response: null,
    responseText: '',
    responseXML: null,
  });

  // EventTarget
  Util.extend(MockXMLHttpRequest.prototype, {
    addEventListener: function addEventListener(type, handle) {
      var events = this.custom.events;
      if (!events[type]) events[type] = [];
      events[type].push(handle);
    },
    removeEventListener: function removeEventListener(type, handle) {
      var handles = this.custom.events[type] || [];
      for (var i = 0; i < handles.length; i++) {
        if (handles[i] === handle) {
          handles.splice(i--, 1);
        }
      }
    },
    dispatchEvent: function dispatchEvent(event) {
      var handles = this.custom.events[event.type] || [];
      for (var i = 0; i < handles.length; i++) {
        handles[i].call(this, event);
      }

      var ontype = 'on' + event.type;
      if (this[ontype]) this[ontype](event);
    },
  });

  // Inspired by jQuery
  function createNativeXMLHttpRequest() {
    var isLocal = (function() {
      var rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/;
      var rurl = /^([\w.+-]+:)(?:\/\/([^/?#:]*)(?::(\d+)|)|)/;
      var ajaxLocation = location.href;
      var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
      return rlocalProtocol.test(ajaxLocParts[1]);
    })();

    return window.ActiveXObject ? (!isLocal && createStandardXHR()) || createActiveXHR() : createStandardXHR();

    function createStandardXHR() {
      try {
        return new window._XMLHttpRequest();
      } catch (e) {
        // ignore
      }
    }

    function createActiveXHR() {
      try {
        return new window._ActiveXObject('Microsoft.XMLHTTP');
      } catch (e) {
        // ignore
      }
    }
  }
}
