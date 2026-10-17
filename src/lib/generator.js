const sharp = require('sharp');
const fs = require('fs').promises;

const logger = require('./logger');

/**
 * Generates a base 240x240 baseline JPEG image with centered text.
 */
async function generateGeekMagicImageBuffer(text = "") {
  try {
    const width = 240;
    const height = 240;
    const backgroundColor = '#1e293b';
    const textColor = '#f8fafc';

    const cleanText = text.replace(/<br\s*\/?>/gi, '\n');
    const lines = cleanText.split('\n');

    const fontSize = lines.length > 2 ? 20 : 24;
    const lineHeight = fontSize * 1.3;

    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 + (fontSize);

    const textNodes = lines.map((line, index) => {
      const yPos = startY + (index * lineHeight);
      return `
        <text
          x="50%"
          y="${yPos}"
          font-family="sans-serif, Arial, DejaVu Sans"
          font-size="${fontSize}px"
          font-weight="bold"
          fill="${textColor}"
          text-anchor="middle"
        >
          ${line.trim()}
        </text>
      `;
    }).join('');

    const svgOverlay = `
      <svg width="${width}" height="${height}">
        ${textNodes}
      </svg>
    `;

    return await sharp({
      create: { width, height, channels: 3, background: backgroundColor }
    })
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .toFormat('jpeg', { quality: 90, progressive: false })
    .toBuffer();

  } catch (error) {
    logger.error('[Generator Error]: Failed to generate base text buffer:', error.message);
    throw error;
  }
}

/**
 * Superimposes a new text layer over an existing image buffer at specific coordinates with formatting.
 *
 * @param {Buffer} inputBuffer - The base image binary buffer to manipulate.
 * @param {Object} options - Configuration for the new text string layer.
 * @param {number} options.x - The horizontal anchor coordinate position (0 to 240).
 * @param {number} options.y - The vertical baseline coordinate position (0 to 240).
 * @param {string} options.text - The raw string message to composite onto the graphic.
 * @param {string} [options.align='center'] - Text alignment constraint. Accepts: 'left', 'center', or 'right'.
 * @param {number} [options.fontSize=16] - Size of the text in pixels.
 * @param {string} [options.color='#f8fafc'] - Color of the text layer (hex/rgb string).
 * @returns {Promise<Buffer>} Resolves to a modified baseline JPEG binary buffer.
 */
async function drawTextToBuffer(inputBuffer, options = {}) {
  if (!Buffer.isBuffer(inputBuffer)) {
    throw new Error('[Generator Error]: Input must be a valid raw binary Buffer.');
  }

  const {
    x = 120,
    y = 120,
    text = '',
    align = 'center',
    fontSize = 16,
    color = '#f8fafc'
  } = options;

  try {
    // Read dimensions of the incoming buffer to match the SVG overlay viewport exactly
    const metadata = await sharp(inputBuffer).metadata();
    const width = metadata.width || 240;
    const height = metadata.height || 240;

    // Map user friendly text positioning arguments into standard SVG vector rules
    let textAnchor = 'middle';
    let svgX = x.toString();

    if (align === 'left') {
      textAnchor = 'start';
    } else if (align === 'right') {
      textAnchor = 'end';
    } else if (align === 'center') {
      textAnchor = 'middle';
    }

    // Wrap your additional text string into a clean vector container line
    const svgOverlay = `
      <svg width="${width}" height="${height}">
        <text
          x="${svgX}"
          y="${y}"
          font-family="sans-serif, Arial, DejaVu Sans"
          font-size="${fontSize}px"
          font-weight="bold"
          fill="${color}"
          text-anchor="${textAnchor}"
        >
          ${text}
        </text>
      </svg>
    `;

    // Flatten the vector string directly into the base pixel pipeline
    return await sharp(inputBuffer)
      .composite([{
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }])
      .toFormat('jpeg', { quality: 90, progressive: false })
      .toBuffer();

  } catch (error) {
    logger.error('[Generator Error]: Failed to append text layer processing frame:', error.message);
    throw error;
  }
}


/**
 * Draws a colored bar (rectangle) with a strict single-pixel border onto an existing image buffer.
 * 
 * @param {Buffer} inputBuffer - The base image binary buffer to manipulate.
 * @param {Object} options - Configuration parameters for the structural bar layer.
 * @param {number} options.x - The horizontal starting coordinate (0 to 240).
 * @param {number} options.y - The vertical starting coordinate (0 to 240).
 * @param {number} options.w - The width of the bar in pixels.
 * @param {number} options.h - The height of the bar in pixels.
 * @param {string} options.barColor - Fill color of the inner rectangle (hex or keyword, e.g., '#38bdf8').
 * @param {string} options.borderColor - Stroke color of the single-pixel border outline (hex or keyword).
 * @returns {Promise<Buffer>} Resolves to a modified baseline JPEG binary buffer.
 */
async function drawColorBarToBuffer(inputBuffer, options = {}) {
  if (!Buffer.isBuffer(inputBuffer)) {
    throw new Error('[Generator Error]: Input must be a valid raw binary Buffer.');
  }

  const {
    x = 0,
    y = 0,
    w = 240,
    h = 20,
    barColor = '#38bdf8',
    borderColor = '#ffffff'
  } = options;

  try {
    // Read the metadata from the incoming base canvas to align vector layers exactly
    const metadata = await sharp(inputBuffer).metadata();
    const width = metadata.width || 240;
    const height = metadata.height || 240;

    // Build the SVG overlay grid vector shape
    // Note: rect elements draw their stroke centered on the perimeter line,
    // so using shape-rendering="crispEdges" locks it down to sharp, distinct single pixel bounds.
    const svgOverlay = `
      <svg width="${width}" height="${height}">
        <rect 
          x="${x}" 
          y="${y}" 
          width="${w}" 
          height="${h}" 
          fill="${barColor}" 
          stroke="${borderColor}" 
          stroke-width="1"
          shape-rendering="crispEdges"
        />
      </svg>
    `;

    // Composite the vector geometry into your working binary block sequence
    return await sharp(inputBuffer)
      .composite([{
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }])
      .toFormat('jpeg', { quality: 90, progressive: false })
      .toBuffer();

  } catch (error) {
    logger.error('[Generator Error]: Failed to render vector bar layer payload:', error.message);
    throw error;
  }
}


/**
 * Loads an existing local JPG/PNG file, resizes/crops it perfectly to 240x240,
 * flattens alpha channels, and outputs a strict baseline JPEG hardware buffer.
 * 
 * @param {string} inputFilePath - Path to the source image asset file on disk (e.g. './photos/cat.png')
 * @returns {Promise<Buffer>} Resolves to a compiled baseline JPEG memory Buffer.
 */
async function generateImageBufferFromFile(inputFilePath) {
  try {
    // 1. Resolve and load the raw file into memory
    const resolvedPath = require('path').resolve(inputFilePath);

    // 2. pipeline through sharp to enforce microchip constraints
    return await sharp(resolvedPath)
      .resize(240, 240, {
        fit: 'cover',       // Fills the 240x240 box without stretching aspect ratios
        position: 'center'  // Centers the crop window safely
      })
      // Flatten transparency alpha layers into a dark background to prevent rendering panics
      .flatten({ background: '#000000' })
      .toFormat('jpeg', {
        quality: 85,
        progressive: false // FORCES BASELINE JPEG STRUCTURE (CRITICAL FOR FREEZING)
      })
      .toBuffer()
      .catch((error) => {
          logger.error(`[Generator Error]: Failed to load file: ${error.message}`);
          return generateGeekMagicImageBuffer();
      });

  } catch (error) {
    logger.error(`[Generator Error]: Failed to render file to buffer: ${error.message}`);
  }

  // Oops - at least give them a blank canvas
  return generateGeekMagicImageBuffer();
}


/**
 * Utility method to save an image buffer down to a local file.
 */
async function saveImageBufferToFile(buffer, outputPath) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('[Generator Error]: Input must be a raw binary Buffer.');
  }
  try {
    await fs.writeFile(outputPath, buffer);
    logger.info(`[Generator]: Image successfully written to file -> ${outputPath}`);
  } catch (error) {
    logger.error(`[Generator Error]: Failed to write file to disk at ${outputPath}:`, error.message);
    throw error;
  }
}


module.exports = {
  generateGeekMagicImageBuffer,
  drawTextToBuffer,
  drawColorBarToBuffer,
  generateImageBufferFromFile,
  saveImageBufferToFile
};
