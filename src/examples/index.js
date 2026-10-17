// Load environment variables from the .env file immediately at startup
require('dotenv').config();

const ms = require('ms');

const GeekMagic = require('../lib/magic');

const stdTrains = require('./std/trains');
const stdClock = require('./std/clock');
const stdCRUK = require('./std/cruk');
const stdOS = require('./std/os');


// 1. Initialize hardware layout controller with explicitly passed arguments
const tvHardware = new GeekMagic.GeekMagicTV({
  url: process.env.GEEKMAGIC_URL || 'http://192.168.0.81',
  version: process.env.GEEKMAGIC_VERSION || 'standard' 
});

  
(async function() {

    // Time between images
    tvHardware.setSlideshowInterval(20);

    // Prepare the generation loop, at minute intervals (which means some will be invoked
    // more often than necessary)
    const intervalTimeMillis = ms(`1 minute`);
    async function callback () {

        await stdClock.callback(tvHardware);

        await stdCRUK.callback(tvHardware);

        await stdOS.callback(tvHardware);

        for(let i=0;i<1;++i) {
            await stdTrains.callback(tvHardware, process.env.TRAIN_STATION_1, process.env.TRAIN_STATION_2, i);
        }
    }
 
    // And now, start...
    callback();
    setInterval(callback, intervalTimeMillis);

}());
