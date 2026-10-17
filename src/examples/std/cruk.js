const cruk = require('../../dto/cruk/cruk');
const sponsorshipScreen = require('../../screens/sponsorship/screen');

// Written for the night walk, so shamelessly promoting the event and team here...
const teamURL = process.env.CRUK_FUNDRAISE_TEAM_URL || 'https://fundraise.cancerresearchuk.org/team/lilys-team-169';


async function callback (tvHardware) {
    const amount = await cruk.extractFundraisingTotal(teamURL);
    const bgPath = `src/examples/res/cruk/bg.jpg`;

    const sponsorshipBuffer = await sponsorshipScreen.create(amount, bgPath);

    const imageFilename = `cruk_sponsorship.jpg`;
    await tvHardware.uploadImageBuffer(sponsorshipBuffer, imageFilename);
}


module.exports = { callback };
