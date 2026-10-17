const GeekMagic = require('../../lib/magic');
const timeScreen = require('../../screens/time/screen');


async function callback (tvHardware) {
    const currentTime = GeekMagic.Helper.getFormattedTime();
    const currentDate = GeekMagic.Helper.getStructuredDate();
    const canvasBuffer = await timeScreen.create(currentTime, currentDate);

    // To save locally, for debugging/trialing layouts, or deploying to an alternate source
    // await GeekMagic.Generator.saveImageBufferToFile(canvasBuffer, "clock.jpg")
    
    await tvHardware.uploadImageBuffer(canvasBuffer, "clock.jpg");
}


module.exports = { callback };
