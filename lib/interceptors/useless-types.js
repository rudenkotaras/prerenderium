const useful = ["document", "script", "xhr", "fetch"];

/**
 * @param {{}} request
 * @returns {boolean}
 */
module.exports = function (request) {
  if (!useful.includes(request.resourceType())) {
    return true;
  }
};
