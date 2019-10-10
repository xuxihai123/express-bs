import util from "../utils";
import EventEmitter from "wolfy87-eventemitter";
import mixin from "merge-descriptors";

function IncomingMessage(socket) {}

IncomingMessage.prototype.setTimeout = util.noop;
IncomingMessage.prototype.destroy = util.noop;

mixin(IncomingMessage.prototype, EventEmitter.prototype, false);
// class IncomingMessage extends stream.Readable {
//   constructor(socket: Socket);

//   httpVersion: string;
//   httpVersionMajor: number;
//   httpVersionMinor: number;
//   complete: boolean;
//   connection: Socket;
//   headers: IncomingHttpHeaders;
//   rawHeaders: string[];
//   trailers: { [key: string]: string | undefined };
//   rawTrailers: string[];
//   setTimeout(msecs: number, callback: () => void): this;
//   /**
//    * Only valid for request obtained from http.Server.
//    */
//   method?: string;
//   /**
//    * Only valid for request obtained from http.Server.
//    */
//   url?: string;
//   /**
//    * Only valid for response obtained from http.ClientRequest.
//    */
//   statusCode?: number;
//   /**
//    * Only valid for response obtained from http.ClientRequest.
//    */
//   statusMessage?: string;
//   socket: Socket;
//   destroy(error?: Error): void;
// }
export default IncomingMessage;
