// Load environment variables from the .env file immediately at startup
require('dotenv').config();

const ms = require('ms');

const GeekMagic = require('../lib/magic');
const stdOS = require('./std/os');


// 1. Initialize hardware layout controller with explicitly passed arguments
const tvHardware = new GeekMagic.GeekMagicTV({
  url: process.env.GEEKMAGIC_URL || 'http://192.168.0.81',
  version: process.env.GEEKMAGIC_VERSION || 'standard' 
});


// 2. Start it up
(async function run() {
    await stdOS.callback(tvHardware);
    setInterval(stdOS.callback.bind(null,tvHardware), ms(`10 minutes`));
}());
