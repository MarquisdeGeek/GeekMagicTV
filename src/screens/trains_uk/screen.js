const GeekMagic = require('../../lib/magic');


function formatTime(datetime) {
  if (!datetime) return null;

  const date = new Date(datetime);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}


// Support the display of any time/date, so TV and film productions can use this code
// their next show :)
async function create(toPlace, backgroundImagePath) {
    let canvasBuffer = await GeekMagic.Generator.generateGeekMagicImageBuffer();

    if (backgroundImagePath) {
        canvasBuffer = await GeekMagic.Generator.generateImageBufferFromFile(backgroundImagePath);
    }

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: 20,
        text: `${toPlace.operator}`,
        align: 'center',
        fontSize: 15,
        color: '#ff59cd'
    });


    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: 40,
        text: `${toPlace.from} to`,
        align: 'center',
        fontSize: 16,
        color: '#99b5db'
    });

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: 60,
        text: `${toPlace.destination}`,
        align: 'center',
        fontSize: 20,
        color: '#99b5db'
    });

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: 120,
        text: `${formatTime(toPlace.scheduledDeparture)}`,
        align: 'center',
        fontSize: 50,
        color: '#ccca67'
    });

    if (toPlace.delayMinutes) {
        canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
            x: 120,
            y: 150,
            text: `Delay: ${toPlace.delayMinutes} m`,
            align: 'center',
            fontSize: 30,
            color: '#ff5252'
        });
    }

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: 180,
        text: `${toPlace.status}`,
        align: 'center',
        fontSize: 20,
        color: '#ccca67'
    });

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: 215,
        text: `Platform ${toPlace.platform === null ? 'TBD' : toPlace.platform}`,
        align: 'center',
        fontSize: 30,
        color: '#99b5db'
    });


  return canvasBuffer;
}

module.exports = {
  create
};
