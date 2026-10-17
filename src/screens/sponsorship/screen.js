const GeekMagic = require('../../lib/magic');


async function create(amount, backgroundImagePath) {
  let sponsorshipBuffer = await GeekMagic.Generator.generateGeekMagicImageBuffer();
  sponsorshipBuffer = await GeekMagic.Generator.generateImageBufferFromFile(backgroundImagePath);

  sponsorshipBuffer = await GeekMagic.Generator.drawTextToBuffer(sponsorshipBuffer, {
      x: 120,
      y: 210,
      text: `${amount.raised ? amount.raised : "Net Down"}`,
      align: 'center',
      fontSize: 60,
      color: '#eb96dd'
  });

  // 2. A central bar chart of progress
  const raised = parseFloat(amount.raised.substring(1));
  const target = parseFloat(amount.target.substring(1));
  const fraction = raised / target;
  const width = Math.floor(fraction * 240);
  sponsorshipBuffer = await GeekMagic.Generator.drawColorBarToBuffer(sponsorshipBuffer, {
      x: 0,
      y: 100,
      w: 240,
      h: 30,
      barColor: '#012418', // Emerald green fill matrix block
      borderColor: '#f8fafc'
  });
  //
  sponsorshipBuffer = await GeekMagic.Generator.drawColorBarToBuffer(sponsorshipBuffer, {
      x: 0,
      y: 100,
      w: width,
      h: 30,
      barColor: '#10b981', // Emerald green fill matrix block
      borderColor: '#f8fafc'
  });


  // 3. The current time
  const currentTime = GeekMagic.Helper.getFormattedTime();
  sponsorshipBuffer = await GeekMagic.Generator.drawTextToBuffer(sponsorshipBuffer, {
      x: 120,
      y: 70,
      text: `${currentTime}`,
      align: 'center',
      fontSize: 50,
      color: '#99b5db'
  });

  return sponsorshipBuffer;
}

module.exports = {
  create
};
