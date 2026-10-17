class LoggerSingleton {
  constructor() {
    // If an instance already exists, return it to maintain the singleton pattern
    if (LoggerSingleton.instance) {
      return LoggerSingleton.instance;
    }

    this.isEnabled = true;
    LoggerSingleton.instance = this;
  }

  /**
   * Configure the global logger state.
   * @param {Object} options
   * @param {boolean} options.enabled - Toggle console output on or off completely.
   */
  configure(options = {}) {
    if (options.enabled !== undefined) {
      this.isEnabled = !!options.enabled;
    }
  }

  /**
   * Internal common log printing interface
   * @private
   */
  _printLog(method, emoji, prefix, message, optionalParams) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logHeader = `[${timestamp}] ${emoji} [${prefix}]`;

    if (optionalParams.length > 0) {
      console[method](logHeader, message, ...optionalParams);
    } else {
      console[method](logHeader, message);
    }
  }

  info(message, ...args) { this._printLog('log', 'ℹ️', 'INFO', message, args); }
  success(message, ...args) { this._printLog('log', '✅', 'SUCCESS', message, args); }
  warn(message, ...args) { this._printLog('warn', '⚠️', 'WARN', message, args); }
  error(message, ...args) { this._printLog('error', '❌', 'ERROR', message, args); }
}

// Instantiate and freeze the singleton object instance to prevent mutation changes
const loggerInstance = new LoggerSingleton();
Object.preventExtensions(loggerInstance);

module.exports = loggerInstance;
