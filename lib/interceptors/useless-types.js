const useful = ["document", "script", "xhr", "fetch"];

/**
 * @param {{}} request
 * @returns {boolean}
 */
module.exports = (request) => {
  if (~useful.indexOf(request.resourceType())) {
    return true;
  }
};
