const osScreen = require('../../screens/os/screen');


async function callback (tvHardware) {
    const canvasBuffer = await osScreen.create();

    // await GeekMagic.Generator.saveImageBufferToFile(canvasBuffer, "os.jpg")
    
    await tvHardware.uploadImageBuffer(canvasBuffer, "os.jpg");
}


module.exports = { callback };
