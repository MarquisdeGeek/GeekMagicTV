const ms = require('ms');

const GeekMagic = require('../lib/magic');
const stdClock = require('./std/clock');


// 1. Initialize hardware layout controller with explicitly passed arguments
const tvHardware = new GeekMagic.GeekMagicTV({
  url: process.env.GEEKMAGIC_URL || 'http://192.168.0.81',
  version: process.env.GEEKMAGIC_VERSION || 'standard' 
});


// 2. Start it up
(async function run() {
    stdClock.callback(tvHardware);
    setInterval(stdClock.callback.bind(tvHardware), ms(`1 minute`));
}());
