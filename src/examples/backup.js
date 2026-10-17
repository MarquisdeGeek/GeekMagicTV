// Load environment variables from the .env file immediately at startup
require('dotenv').config();

// Example of reaching into the library direction
const GeekMagicTV = require('../lib/geekmagictv');
const { getFormattedTime } = require('../lib/helper');


const tvHardware = new GeekMagicTV({
  url: process.env.GEEKMAGIC_URL || 'http://192.168.0.81',
  version: process.env.GEEKMAGIC_VERSION || 'standard' 
});

  
(async function() {
    const currentTime = getFormattedTime();

    await tvHardware.backup(`backup_${currentTime}`);
    await tvHardware.deleteAllImages();

    await tvHardware.setSlideshowInterval(0);

    const themeList = GeekMagicTV.getThemeList();
    themeList.forEach(async (theme) => {
        await tvHardware.setTheme(theme, false);
    });

    logger.info(await tvHardware.getPhotoList());
    logger.info(await tvHardware.getModeOptions());
    logger.info(`Downloading individual photos not supported`);
}());
