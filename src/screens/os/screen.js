const GeekMagic = require('../../lib/magic');

const diskusage = require('diskusage');
const OSUtils = require('node-os-utils').OSUtils;

const szUnknown = `Unknown`;


function humanizeBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  let i = 0;
  while (bytes >= 1000 && i < units.length - 1) {
    bytes /= 1000;
    i++;
  }

  return `${Number(bytes.toFixed(2))} ${units[i]}`;
}

function humanizePercent(value, total = 100) {
    const asFraction = value / total;
    const asPercent = asFraction * 100;
    const asHuman = Math.floor(asPercent);

    return asHuman;
}


async function diskStats(canvasBuffer, mountPoint, y = 20) {
    const dfUsed = await diskusage.check(mountPoint);

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: y,
        text: `Disk ${mountPoint}: ${humanizeBytes(dfUsed.available)} (${humanizePercent(dfUsed.available, dfUsed.total)}%)`,
        align: 'center',
        fontSize: 20,
        color: '#b4aa19'
    });

    return canvasBuffer;
}


async function systemStats(canvasBuffer, y = 50) {
    const osutils = new OSUtils();
    const cpuUsage = await osutils.cpu.usage();
    const memInfo = await osutils.memory.info();

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: y,
        text: `CPU usage: ${cpuUsage.success ? humanizePercent(cpuUsage.data) : szUnknown}%`,
        align: 'center',
        fontSize: 20,
        color: '#ff59cd'
    });
    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y: y + 25,
        text: `Memory used: ${memInfo.success ? humanizePercent(memInfo.data.usagePercentage) : szUnknown}%`,
        align: 'center',
        fontSize: 20,
        color: '#ff59cd'
    });

    return canvasBuffer;
}


async function temperature(canvasBuffer, y = 120) {
    const osutils = new OSUtils();
    const temperature = await osutils.cpu.temperature();

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y:  y,
        text: `Temperature: ${temperature.data ? temperature.data : szUnknown}`,
        align: 'center',
        fontSize: 20,
        color: '#6b86df'
    });

    return canvasBuffer;
}


async function network(canvasBuffer, y = 120) {
    const osutils = new OSUtils();
    const overview = await osutils.network.overview();

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y:  y,
        text: `Net RX: ${overview.success ? humanizeBytes(overview.data.totalRxBytes.bytes) : szUnknown}`,
        align: 'center',
        fontSize: 20,
        color: '#ec65c4'
    });
    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y:  y + 25,
        text: `Net TX: ${overview.success ? humanizeBytes(overview.data.totalTxBytes.bytes) : szUnknown}`,
        align: 'center',
        fontSize: 20,
        color: '#ec65c4'
    });

    return canvasBuffer;
}


async function health(canvasBuffer, y = 180) {
    const osutils = new OSUtils();
    const health = await osutils.healthCheck();

    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y:  y,
        text: `System: ${health.details.system.status}`,
        align: 'center',
        fontSize: 20,
        color: '#ff8bdc'
    });
    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y:  y + 20,
        text: `Disc: ${health.details.disk.status}`,
        align: 'center',
        fontSize: 20,
        color: '#ff8bdc'
    });
    canvasBuffer = await GeekMagic.Generator.drawTextToBuffer(canvasBuffer, {
        x: 120,
        y:  y + 40,
        text: `Network: ${health.details.network.status}`,
        align: 'center',
        fontSize: 20,
        color: '#ff8bdc'
    });


    return canvasBuffer;
}


async function create() {
    let canvasBuffer = await GeekMagic.Generator.generateGeekMagicImageBuffer();

    canvasBuffer = await diskStats(canvasBuffer, `/`);
    canvasBuffer = await systemStats(canvasBuffer);
    // canvasBuffer = await temperature(canvasBuffer);
    canvasBuffer = await network(canvasBuffer);
    canvasBuffer = await health(canvasBuffer);

    return canvasBuffer;
}

module.exports = {
  create
};
