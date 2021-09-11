const forbiddenHeaders = new Set(["host", "user-agent"]);

const filterHeaders = (object, forbiddenKeys) => {
  const result = {};

  if (typeof object !== "object") {
    return result;
  }

  for (const [key, value] of Object.entries(object)) {
    if (!forbiddenKeys.has(key)) {
      result[key] = value;
    }
  }

  return result;
};

module.exports = (object) => filterHeaders(object, forbiddenHeaders);
