const HostUtil = {
  /**
   * Util to "transform" a string to a valid hostname following the RFC-952
   * standard. It mirrors the `dcos/mesos_state` implementation.
   * The util  will remove empty labels and use the string to label util
   * to ensure that labels don't include invalid characters and don't exceed
   * the character limit.
   *
   * @param {string} string
   * @return {string} hostname
   */
  stringToHostname(string) {
    if (string == null) {
      return null;
    }

    return string
      .split(".")
      .filter(function(string) {
        return string !== "";
      })
      .map(HostUtil.stringToLabel)
      .join(".");
  },

  /**
   * Util to "convert" a given string to a RFC-952 compliant DNS label.
   * It mirrors the respective `dcos/mesos_state` implementation.
   * The util  will strip invalid characters and ensures that the label don't
   * exceed the character limit.
   *
   * @param {string} string
   * @return {string} label
   */
  stringToLabel(string) {
    const LABEL_MAX_LENGTH = 63;

    if (string == null) {
      return "";
    }

    string = string.toLowerCase();

    // Strip all invalid character including leading and trailing dashes
    // or replace them with dashes.
    string = string.replace(/(_)|^-+|-+$|[^a-z0-9-]/g, function(match, p1) {
      // Replace underscores (first capture group) with dashes
      if (p1 != null) {
        return "-";
      }

      // Strip any other invalid character
      return "";
    });

    // Trim labels if they exceed the allowed max length
    if (string.length > LABEL_MAX_LENGTH) {
      // Remove all dashes and groups of dashes that have an offset larger or
      // equal to the allowed max length before trimming the label to ensure
      // that no label ends with a dash.
      string = string.replace(/[-]+/g, function(match, offset) {
        if (offset + match.length >= LABEL_MAX_LENGTH) {
          return "";
        }

        return match;
      });

      // Trim the label to the allowed max length
      string = string.slice(0, LABEL_MAX_LENGTH);
    }

    return string;
  }
};

module.exports = HostUtil;
