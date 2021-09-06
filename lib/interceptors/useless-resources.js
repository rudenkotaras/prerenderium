const useless = [
  "google-analytics.com",
  "api.mixpanel.com",
  "fonts.googleapis.com",
  "stats.g.doubleclick.net",
  "mc.yandex.ru",
  "use.typekit.net",
  "beacon.tapfiliate.com",
  "js-agent.newrelic.com",
  "api.segment.io",
  "woopra.com",
  "static.olark.com",
  "static.getclicky.com",
  "fast.fonts.com",
  "youtube.com/embed",
  "cdn.heapanalytics.com",
  "googleads.g.doubleclick.net",
  "pagead2.googlesyndication.com",
  "fullstory.com/rec",
  "navilytics.com/nls_ajax.php",
  "log.optimizely.com/event",
  "hn.inspectlet.com",
  "tpc.googlesyndication.com",
  "partner.googleadservices.com",
];

/**
 * @param {{}} request
 * @returns {boolean}
 */
module.exports = function (request) {
  const url = request.url();

  for (let i = 0; i < useless.length; i++) {
    if (~url.indexOf(useless[i])) {
      return true;
    }
  }
};