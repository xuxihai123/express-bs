function logger(label) {
  return function(...args) {
    if (_flag) {
      console.log(`[${label}]`, ...args);
    }
  };
}

let _flag = false;
logger.debug = function(flag) {
  _flag = !!flag;
};

export default logger;
