const BASE_URL = "https://api.traini.ac/v1";

async function getJson(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "uk-train-tracker/1.0",
    },
    signal: AbortSignal.timeout(15000),
  });

  const body = await response.json();

  if (!response.ok || body.type === "error") {
    throw new Error(
      body.error?.message ?? `HTTP ${response.status}`
    );
  }

  return body;
}

/**
 * Get the next train departing from a station.
 *
 * @param {string} place - Origin station name or CRS code.
 * @param {string|null} callingAt - Optional station the train must stop at.
 * @returns {Promise<object|null>}
 */
async function getNextTrainFrom(place, callingAt = null, index = 0) {
  const station = encodeURIComponent(place);
  const params = new URLSearchParams({ limit: String(index + 1) });

  if (callingAt) {
    params.set("calling_at", callingAt);
  }

  const result = await getJson(
    `/departures/${station}?${params}`
  );

  return result.data[index]
    ? formatDeparture(
        result.data[index],
        result.request.station.resolution.name
      )
    : null;
}

async function getNextTrainTo(from, place, index = 0) {
  return getNextTrainFrom(from, place, index);
}


function formatDeparture(departure, fromStation) {
  const time = departure.departs;
  const estimate = time.estimate;
  const expectedTime = estimate.at ?? null;

  return {
    headcode: departure.train.headcode,
    trainId: departure.train.id,
    operator: departure.train.operator?.name ?? null,
    from: fromStation,
    destination: departure.destination.name,
    scheduledDeparture: time.scheduled,
    expectedDeparture: expectedTime,
    delayMinutes: time.delay_minutes,
    platform:
      departure.platform.type === "known"
        ? departure.platform.number
        : null,
    status:
      estimate.type === "cancelled"
        ? "Cancelled"
        : estimate.type === "delayed_no_estimate"
          ? "Delayed; time unknown"
          : time.delay_minutes == null
            ? "Unknown"
            : time.delay_minutes > 0
              ? `${time.delay_minutes} min late`
              : time.delay_minutes < 0
                ? `${Math.abs(time.delay_minutes)} min early`
                : "On time",
  };
}


module.exports = { getNextTrainFrom, getNextTrainTo };
