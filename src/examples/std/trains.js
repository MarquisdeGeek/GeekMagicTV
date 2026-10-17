// Load environment variables from the .env file immediately at startup
require('dotenv').config();

const path = require('path');

const trainsScreen = require('../../screens/trains_uk/screen');
const dtoTrains = require('../../dto/trains_uk/train-ac');

const defaultStation1 = process.env.TRAIN_STATION_1 || `ltn`;
const defaultStation2 = process.env.TRAIN_STATION_2 || `stp`;
const imagePath = `src/examples/res/trains_uk`;


async function callback(tvHardware, station1 = defaultStation1, station2 = defaultStation2, whichTrain = 0) {
    const nextTo = await dtoTrains.getNextTrainTo(station1, station2, whichTrain);
    const bg1 = `${path.join(imagePath, station1.toLocaleLowerCase())}.jpg`;
    const canvasBufferTo = await trainsScreen.create(nextTo, bg1);
    await tvHardware.uploadImageBuffer(canvasBufferTo, `train_out_${whichTrain}.jpg`);

    const nextFrom = await dtoTrains.getNextTrainTo(station2, station1, whichTrain);
    const bg2 = `${path.join(imagePath, station2.toLocaleLowerCase())}.jpg`;
    const canvasBufferFrom = await trainsScreen.create(nextFrom, bg2);
    await tvHardware.uploadImageBuffer(canvasBufferFrom, `train_in_${whichTrain}.jpg`);
}


module.exports = { callback };
