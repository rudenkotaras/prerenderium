const DefaultForbiddenHeaders = new Set(["host", "user-agent"]);

/**
 * @param {Object} object
 * @param {Array?} forbiddenHeaders
 * @returns {Object}
 */
const filterHeaders = (object, forbiddenHeaders) => {
  const result = {};

  if (typeof object !== "object") {
    return result;
  }

  const forbiddenKeysSet = Array.isArray(forbiddenHeaders)
    ? new Set(forbiddenHeaders)
    : DefaultForbiddenHeaders;

  for (const [key, value] of Object.entries(object)) {
    if (!forbiddenKeysSet.has(key)) {
      result[key] = value;
    }
  }

  return result;
};

module.exports = filterHeaders;
