/**
 * Helper to get the current time formatted for your text layout.
 * @returns {string} e.g., "11:07 AM"
 */
function getFormattedTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}


/**
 * Helper to get the current time formatted for your text layout.
 * @returns {string} e.g. "Thursday, 15th October 2026"
 */
function getStructuredDate() {
const date = new Date();

const day = date.getDate();
const suffix =
  day % 10 === 1 && day !== 11 ? 'st' :
  day % 10 === 2 && day !== 12 ? 'nd' :
  day % 10 === 3 && day !== 13 ? 'rd' : 'th';

  return {
    dayOfWeek: day,
    dayOfWeekOrdinal: `${day}${suffix}`,
    dayName: `${date.toLocaleDateString('en-GB', { weekday: 'long' })}`,
    month: `${date.toLocaleDateString('en-GB', { month: 'long'  })}`,
    year: `${date.toLocaleDateString('en-GB', { year: 'numeric'  })}`,
  };
}


module.exports = { 
  getFormattedTime,
  getStructuredDate
};
