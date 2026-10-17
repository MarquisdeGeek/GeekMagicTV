const GeekMagic = require('../../lib/magic');


// Support the display of any time/date, so TV and film productions can use this code
// their next show :)
async function create(theTime, theDate) {
    let canvasBuffer = await GeekMagic.Generator.generateGeekMagicImageBuffer();
    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: 100,
        text: `${theTime}`,
        align: 'center',
        fontSize: 50,
        color: '#ff59cd'
    });

    // Date
    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: 30,
        text: `${theDate.dayName}`,
        align: 'center',
        fontSize: 30,
        color: '#99b5db'
    });

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: 160,
        text: `${theDate.dayOfWeekOrdinal} ${theDate.month}`,
        align: 'center',
        fontSize: 30,
        color: '#99b5db'
    });

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: 210,
        text: `${theDate.year}`,
        align: 'center',
        fontSize: 25,
        color: '#ccca67'
    });


  return canvasBuffer;
}

module.exports = {
  create
};
