const FormData = require('form-data');


class GeekMagicTVConfig {
static timeoutDefault = 1000;

  /**
   * @param {Object} config
   * @param {string} config.url - The base IP/URL of the device (e.g., 'http://192.168.0.81')
   * @param {string} [config.version='standard'] - Hardware/firmware version identifier
   */
  constructor(config = {}) {
    if (!config.url) {
      throw new Error('[GeekMagicTVConfig] Initialization Error: A base device URL is required.');
    }

    // Clean up trailing slash if present
    this.baseUrl = config.url.replace(/\/\$/, '');
    this.version = config.version || 'standard';

    // Expose all dynamically resolved endpoints and paths
    this.uploadEndpoint = this._resolveUploadEndpoint();
    this.deleteEndpoint = `${this.baseUrl}/photo/delete`;
    this.intervalEndpoint = `${this.baseUrl}/photo/interval`;
    this.settingsEndpoint = `${this.baseUrl}/set`;
    this.statusEndpoint = this._resolveStatusEndpoint();
    this.localCachePath = './.device_cache';
  }

  /**
   * Internal mapper to resolve upload asset routes by firmware profile traits.
   * @private
   */
  _resolveUploadEndpoint() {
    switch (this.version.toLowerCase()) {
      case 'v1':
      case 'legacy':
        return `${this.baseUrl}/doUpload?dir=%2Fimage%2F`;
      case 'clone':
      case 'filesystem':
        return `${this.baseUrl}/filesystem`;
      case 's3':
        return `${this.baseUrl}/show_image`;
      case 'standard':
      default:
        return `${this.baseUrl}/photo/upload`;
    }
  }

  /**
   * Internal mapper to resolve system configuration status JSON paths.
   * @private
   */
  _resolveStatusEndpoint() {
    switch (this.version.toLowerCase()) {
      case 'v1':
      case 'legacy':
        return `${this.baseUrl}/v.json`;
      default:
        return `${this.baseUrl}/app.json`;
    }
  }

  /**
   * Resolves the expected form field string name parameter used by the multipart form pipeline.
   * @returns {string} 'update' or 'file'
   */
  getFormFieldName() {
    return (this.version === 'clone' || this.version === 'filesystem') ? 'update' : 'file';
  }


  //
  getResultBase() {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
      'Origin': this.baseUrl,
      'Referer': `${this.baseUrl}/photo`,
      'Accept': '*/*'
    };

    return {
      config: {
          headers,
          timeout: GeekMagicTVConfig.timeoutDefault
        }
      };
  }


  getIntervalParams(targetInterval) {
    let axp = this.getResultBase();
    axp.url = `${this.intervalEndpoint}?val=${targetInterval}`;

    return axp;
  }


  getImageListParams() {
    let axp = this.getResultBase();
    axp.url = `${this.baseUrl}/photo/list`;

    return axp;
  }


  getConfigParams() {
    let axp = this.getResultBase();
    axp.url = `${this.baseUrl}/config`;

    return axp;
  }


  getUploadImageParams(imageBuffer, filename) {
    let axp = this.getResultBase();
    axp.url = `${this.uploadEndpoint}`;

    // Determine form field parameter name based on version quirks
    const fieldName = (this.version === 'clone' || this.version === 'filesystem') ? 'update' : 'file';

    const form = new FormData();

    form.append(fieldName, imageBuffer, {
      filename: filename,
      contentType: 'image/jpeg'
    });

    axp.form = form;
    axp.config = {...axp.headers, ...form.getHeaders()};

    return axp;
  }

  
  getDeleteImageParams(filename) {
    let axp = this.getResultBase();
    axp.url = `${this.deleteEndpoint}?name=${encodeURIComponent(filename)}`;

    return axp;
  }

}

module.exports = GeekMagicTVConfig;
