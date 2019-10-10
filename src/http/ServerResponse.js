import EventEmitter from "wolfy87-eventemitter";
import mixin from "merge-descriptors";
import http from "http";

function ServerResponse(incomingMessage) {
  // TODO
  this.headers = {};
}

mixin(ServerResponse.prototype, EventEmitter.prototype, false);

ServerResponse.prototype.setHeader = function(name, value) {
  this.responseHeaders = this.responseHeaders || {};
  this.responseHeaders[name] = value;
};
ServerResponse.prototype.getHeader = function(name, value) {
  return this.responseHeaders;
};
ServerResponse.prototype.getHeaders = function(name, value) {
  return this.responseHeaders[name];
};
ServerResponse.prototype.getHeaderNames = function(name, value) {
  // TODO
};
ServerResponse.prototype.hasHeader = function(name, value) {
  // TODO
};
ServerResponse.prototype.removeHeader = function(name, value) {
  // TODO
};
ServerResponse.prototype.addTrailers = function(name, value) {
  // TODO
};
ServerResponse.prototype.flushHeaders = function(name, value) {
  // TODO
};

ServerResponse.prototype.end = function(name, value) {
  this.emit("finish");
};
//  // https://github.com/nodejs/node/blob/master/lib/_http_outgoing.js
//  class OutgoingMessage extends stream.Writable {
//   upgrading: boolean;
//   chunkedEncoding: boolean;
//   shouldKeepAlive: boolean;
//   useChunkedEncodingByDefault: boolean;
//   sendDate: boolean;
//   finished: boolean;
//   headersSent: boolean;
//   connection: Socket;

//   constructor();

//   setTimeout(msecs: number, callback?: () => void): this;
//   setHeader(name: string, value: number | string | string[]): void;
//   getHeader(name: string): number | string | string[] | undefined;
//   getHeaders(): OutgoingHttpHeaders;
//   getHeaderNames(): string[];
//   hasHeader(name: string): boolean;
//   removeHeader(name: string): void;
//   addTrailers(headers: OutgoingHttpHeaders | Array<[string, string]>): void;
//   flushHeaders(): void;
// }

// // https://github.com/nodejs/node/blob/master/lib/_http_server.js#L108-L256
// class ServerResponse extends OutgoingMessage {
//   statusCode: number;
//   statusMessage: string;
//   writableFinished: boolean;

//   constructor(req: IncomingMessage);

//   assignSocket(socket: Socket): void;
//   detachSocket(socket: Socket): void;
//   // https://github.com/nodejs/node/blob/master/test/parallel/test-http-write-callbacks.js#L53
//   // no args in writeContinue callback
//   writeContinue(callback?: () => void): void;
//   writeHead(statusCode: number, reasonPhrase?: string, headers?: OutgoingHttpHeaders): this;
//   writeHead(statusCode: number, headers?: OutgoingHttpHeaders): this;
// }

export default ServerResponse;
