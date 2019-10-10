import IncomingMessage from "./IncomingMessage";
import ServerResponse from "./ServerResponse";

const METHODS = [
  "GET",
  "POST",
  "PUT",
  "HEAD",
  "DELETE",
  "OPTIONS",
  "TRACE",
  "COPY",
  "LOCK",
  "MKCOL",
  "MOVE",
  "PURGE",
  "PROPFIND",
  "PROPPATCH",
  "UNLOCK",
  "REPORT",
  "MKACTIVITY",
  "CHECKOUT",
  "MERGE",
  "M-SEARCH",
  "NOTIFY",
  "SUBSCRIBE",
  "UNSUBSCRIBE",
  "PATCH",
  "SEARCH",
  "CONNECT"
];

export const methods = METHODS.map(method => method.toLowerCase());

export default { IncomingMessage, ServerResponse, METHODS };
