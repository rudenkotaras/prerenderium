const objectFingerprint = (object) => {
  return new URLSearchParams(
    Object.keys(object)
      .sort()
      .reduce((r, k) => ((r[k] = object[k]), r), {})
  ).toString();
};

module.exports = objectFingerprint;
