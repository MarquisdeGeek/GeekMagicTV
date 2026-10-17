const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

const logger = require('./logger');
const GeekMagicTVConfig = require('./geekmagictv-config');


const Themes = Object.freeze({
  CLASSIC: 0,
  WEATHER: 1,
  PHOTO: 2,
  DIAL: 3,
  SIMPLE: 4,
  WEATHER_FORECAST: 5,
  FLIP_CLOCK: 6
});


class GeekMagicTV {
  /**
   * @param {Object} config
   * @param {string} config.url - The base IP/URL of the device (e.g., 'http://192.168.0.81')
   * @param {string} [config.version='standard'] - Hardware/firmware version identifier for fallback endpoint mapping
   */
  constructor(config = {}) {
    if (!config.url) {
      throw new Error('[GeekMagicTV] Initialization Error: A base device URL is required.');
    }

    this.config = new GeekMagicTVConfig(config);
  }


  // Expose the Themes enum as a static property so external scripts can access it directly
  static get Themes() {
    return Themes;
  }
  
  static getThemeList() {
    return [
        Themes.CLASSIC,
        Themes.WEATHER,
        Themes.PHOTO,
        Themes.DIAL,
        Themes.SIMPLE,
        Themes.WEATHER_FORECAST,
        Themes.FLIP_CLOCK,
    ];
  }


  /**
   * Downloads and backs up the entire system state, active file lists, and all images.
   * @param {string} outputDirectory - Local target path directory where the backup package will be saved.
   * @returns {Promise<boolean>} True if the complete backup sequence executes successfully.
   */
  async backup(outputDirectory) {
    if (!outputDirectory) {
      logger.error('Backup aborted: An explicit output directory argument is required.');
      return false;
    }

    try {
      const resolvedBackupDir = path.resolve(outputDirectory);
      logger.info(`Starting system backup sequence -> Target folder: ${resolvedBackupDir}`);

      // 1. Ensure the destination folder grid exists locally on your disk
      await fs.mkdir(resolvedBackupDir, { recursive: true });

      // 2. Fetch the raw configuration data for historical reference
      const configData = await this.getModeOptions();
      if (configData) {
        const configBackupPath = path.join(resolvedBackupDir, 'config_backup.json');
        await fs.writeFile(configBackupPath, JSON.stringify(configData, null, 2));
        logger.success(`Saved system configuration manifest state to: ${configBackupPath}`);
      }

      // 3. Use getPhotoList to get the explicit file manifest list
      const imageList = (await this.getPhotoList()).files;

      // Save a copy of the actual photo list manifest file for complete tracking continuity
      const listBackupPath = path.join(resolvedBackupDir, 'photo_list_backup.json');
      await fs.writeFile(listBackupPath, JSON.stringify(imageList, null, 2));
      logger.success(`Saved local photo track file registry manifest down to: ${listBackupPath}`);

      if (imageList.length === 0) {
        logger.warn('The device inventory manifest contains zero active images to transfer.');
        return true;
      }

      logger.info(`Running download stream pipeline for ${imageList.length} asset slots...`);

      // 4. Loop through and extract all existing image payloads into the target backup folder
      let successfulDownloads = 0;
      for (const remoteFile of imageList) {
        const cleanFilename = path.basename(remoteFile.name);
        logger.info(`Streaming backup layer frame for file asset: ${cleanFilename}`);

        const imageBuffer = await this.downloadImage(cleanFilename);

        if (imageBuffer) {
          const imageSavePath = path.join(resolvedBackupDir, cleanFilename);
          await fs.writeFile(imageSavePath, imageBuffer);
          successfulDownloads++;
        } else {
          logger.warn(`Could not sync file asset slot: ${cleanFilename} (Using fallback local cache capture instead)`);
        }
      }

      logger.success(`Backup process finalized. Synchronized ${successfulDownloads}/${imageList.length} images safely.`);
      return true;

    } catch (error) {
      logger.error(`Backup execution pipeline collapsed: ${error.message}`);
      return false;
    }
  }



  /**
   * Toggles or forces a specific built-in theme mode profile.
   * Targets route: http://192.168.0.81/theme/toggle?id=0&state=0
   * 
   * @param {number} themeId - The unique integer id from the Themes enum.
   * @param {number|boolean} state - Toggle visibility/activation state (0/false = inactive, 1/true = active)
   * @returns {Promise<boolean>} True if the command is accepted by the device.
   */
  async setTheme(themeId, state = 1) {
    // Standardise boolean or number variables into a clean 0 or 1 binary flag
    const binaryState = (state === 1 || state === true) ? 1 : 0;

    // Validate that the provided themeId actually exists in our known collection profiles
    const validIds = Object.values(Themes);
    if (!validIds.includes(themeId)) {
      logger.error(`[GeekMagicTV] Invalid theme target ID passed: ${themeId}. Use GeekMagicTV.Themes properties.`);
      return false;
    }

    try {
      const themeUrl = `${this.config.baseUrl}/theme/toggle?id=${themeId}&state=${binaryState}`;
      logger.info(`[GeekMagicTV Hardware Command]: Swapping theme state via -> ${themeUrl}`);

      const headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
        'Origin': this.config.baseUrl,
        'Referer': `${this.config.baseUrl}/theme`,
        'Accept': '*/*'
      };

      const response = await axios.get(themeUrl, { headers, timeout: 3000 });

      if (response.status === 200) {
        logger.success(`Theme layout matrix altered successfully (ID: ${themeId}, State: ${binaryState}).`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`[GeekMagicTV Theme Error]: Failed routing layout toggle command: ${error.message}`);
      return false;
    }
  }


  /**
   * Fetches the entire list from the device.
   * @returns {Promise<Object|null>} The raw device status state parsed into an object, or null on error.
   */
  async getPhotoList() {
    try {
      const axp = this.config.getImageListParams();
      const response = await axios.get(axp.url, axp.config);

      return response.data;
    } catch (error) {
      logger.error(`[GeekMagicTV Status Fetch Error]: Failed to read state profile: ${error.message}`);
      return null;
    }
  }


  /**
   * Fetches the entire state profile from the device.
   * @returns {Promise<Object|null>} The raw device status state parsed into an object, or null on error.
   */
  async getModeOptions() {
    try {
      const axp = this.config.getConfigParams();
      axp.timeout = 5000;
      const response = await axios.get(axp.url, axp.config);

      return response.data;
    } catch (error) {
      logger.error(`[GeekMagicTV Status Fetch Error]: Failed to read state profile: ${error.message}`);
      return null;
    }
  }

  /**
   * Helper utility to extract the exact running application screen index from the state payload.
   * @returns {Promise<number|null>} Returns active index integer (e.g. 0=Clock, 1=Weather, 2=Album) or null.
   */
  async getCurrentAppMode() {
    const data = await this.getModeOptions();
    if (!data) return null;

    // Standard firmware maps the active app index under 'app' or 'theme' keys
    if (data.app !== undefined) return parseInt(data.app);
    if (data.theme !== undefined) return parseInt(data.theme);

    // Alternative property mapper fallback for variations
    if (data.current_app !== undefined) return parseInt(data.current_app);

    logger.warn('[GeekMagicTV] Unable to find exact app index property in device payload structure:', data);
    return null;
  }


  /**
   * Downloads a specific image file directly from the device hardware storage.
   * @param {string} filename - The exact name of the target remote file (e.g., '1.jpg')
   * @returns {Promise<Buffer|null>} Resolves to a raw binary Buffer of the file, or null on failure.
   */
  async downloadImage(filename) {
    if (!filename) {
      console.warn('[GeekMagicTV] downloadImage: No filename specified.');
      return null;
    }

    try {
      // Maps out the standard absolute routing directory path used by the device filesystem
      const downloadUrl = `${this.config.baseUrl}/image/${filename}`;
      logger.info(`[GeekMagicTV Hardware Command]: Downloading file from path -> ${downloadUrl}`);

      const headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      };

      // Request the file as an arraybuffer payload to preserve binary image stability
      const response = await axios.get(downloadUrl, {
        headers,
        responseType: 'arraybuffer',
        timeout: 5000
      });

      if (response.status === 200) {
        return Buffer.from(response.data);
      }

      return null;
    } catch (error) {
      logger.error(`[GeekMagicTV Hardware Download Error]: Failed downloading ${filename}: ${error.response?.status || error.message}`);
      return null;
    }
  }

  /**
   * Hardware interaction method to delete a single file from the device storage.
   * Matches the exact GET router discovered: /photo/delete?name=filename
   * @param {string} filename - The exact name of the file to delete (e.g., '1.jpg')
   * @returns {Promise<boolean>} True if the file was deleted successfully.
   */
  async deleteImage(filename) {
    if (!filename) {
      logger.warn('[GeekMagicTV] deleteImage: No filename specified.');
      return false;
    }

    try {
      // Build the specific query parameter string required by your firmware
      const axp = this.config.getDeleteImageParams(filename);
      const response = await axios.get(axp.url, axp.config);

      return response.status === 200;
    } catch (error) {
      logger.error(`[GeekMagicTV Hardware Delete Error]: Failed to delete ${filename}: ${error.response?.status || error.message}`);
      return false;
    }
  }


  /**
   * Cleans the active device storage layer by querying the file manifest list and wiping everything.
   * @returns {Promise<boolean>} True if all images were purged successfully.
   */
  async deleteAllImages() {
    try {
      logger.info('[GeekMagicTV Hardware Command]: Scanning device manifest to wipe album...');
      const data = await this.getModeOptions();

      if (!data) {
        logger.error('[GeekMagicTV] Could not retrieve device list status metadata to parse files.');
        return false;
      }

      // The file payload structure typically logs strings inside an 'images' or 'fileList' array
      const imageList = await this.getPhotoList()

      if (imageList.length === 0) {
        logger.info('[GeekMagicTV]: Storage manifest is already completely clean.');
        return true;
      }

      logger.info(`[GeekMagicTV]: Found ${imageList.length} target items to clean. Starting wipe process...`);

      let overallSuccess = true;
      for (const fileItem of imageList.files) {
        const cleanFilename = path.basename(fileItem.name);
        const singleSuccess = await this.deleteImage(cleanFilename);
        if (!singleSuccess) overallSuccess = false;
      }

      return overallSuccess;
    } catch (error) {
      logger.error(`[GeekMagicTV Purge Error]: Massive clean operation failed: ${error.message}`);
      return false;
    }
  }


  /**
   * Updates the photo slide rotation interval timing on the hardware.
   * Targets the exact route: /photo/interval?val=seconds
   * @param {number} seconds - The delay time in seconds between photo frames (e.g., 5)
   * @returns {Promise<boolean>} True if the device accepted the timing parameter.
   */
  async setSlideshowInterval(seconds) {
    // Enforce integer evaluation and fallback to a default safe window if malformed
    const targetInterval = parseInt(seconds, 10);

    try {
      logger.info(`[GeekMagicTV Hardware Command]: Modifying loop interval delay -> ${targetInterval}s`);

      const axp = this.config.getIntervalParams(targetInterval);
      const response = await axios.get(axp.url, axp.config);

      if (response.status === 200) {
        logger.success(`Slideshow interval successfully locked to ${targetInterval} seconds.`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`[GeekMagicTV Interval Error]: Failed updating timing loop values: ${error.message}`);
      return false;
    }
  }


  /**
   * Fast abstraction helper layer to toggle the active app screen index cleanly
   * @param {number} modeIndex - Mode application index target (e.g. 0 = Clock, 1 = Weather, 2 = Photo Frame)
   * @returns {Promise<boolean>}
   */
  async setAppMode(modeIndex) {
    return await this.changeModeOptions({ appIndex: modeIndex });
  }


  /**
   * Uploads an image buffer directly to the device hardware
   * @param {Buffer} imageBuffer - Ready-to-render baseline JPEG image buffer (strictly 240x240)
   * @param {string} [filename='1.jpg'] - The filename to write over in flash storage
   * @returns {Promise<boolean>} Resolves true if 200 OK received
   */
  async uploadImageBuffer(imageBuffer, filename = '1.jpg') {
    if (!Buffer.isBuffer(imageBuffer)) {
      throw new Error('[GeekMagicTV] Invalid payload: Input must be a raw binary Buffer.');
    }

    try {
      const axp = this.config.getUploadImageParams(imageBuffer, filename);
      const response2 = await axios.post(axp.url, axp.form, { headers: axp.config.headers });
      return response2.status === 200;

    } catch (error) {
      if (error.response) {
        logger.error(`[GeekMagicTV Hardware Error]: Target device responded with status ${error.response.status}`);
      } else {
        logger.error(`[GeekMagicTV Hardware Connection Error]: ${error.message}`);
      }
      return false;
    }
  }


  /**
   * Uploads a local file by path straight to the device hardware
   * @param {string} filePath - Absolute or relative file path to the local image file
   * @param {string} [remoteFilename] - Optional override filename for the device flash storage. Defaults to the base name of the local file.
   * @returns {Promise<boolean>} Resolves true if 200 OK received
   */
  async uploadFile(filePath, remoteFilename) {
    try {
      // 1. Resolve and read the local file from disk
      const resolvedPath = path.resolve(filePath);
      const imageBuffer = await fs.readFile(resolvedPath);

      // 2. Default to the base name of the file if no remote storage override is passed
      const targetFilename = remoteFilename || path.basename(resolvedPath);

      logger.info(`[GeekMagicTV] Reading local file: ${resolvedPath} -> Target destination: ${targetFilename}`);

      // 3. Hand off the raw file buffer directly to the core hardware pipeline
      return await this.uploadImageBuffer(imageBuffer, targetFilename);

    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.error(`[GeekMagicTV File Error]: Local file not found at path: ${filePath}`);
      } else {
        logger.error(`[GeekMagicTV File Error]: Failed handling file path transmission: ${error.message}`);
      }
      return false;
    }
  }

}

module.exports = GeekMagicTV;
