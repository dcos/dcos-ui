// @ts-ignore
import moment from "moment";

const DEFAULT_MULTIPLICANTS = {
  ms: 1,
  sec: 1000,
  min: 60000,
  h: 3600000,
  d: 86400000
};

interface Multiplicants {
  [key: string]: number;
}

const fullDateTime = "fullDateTime";
const longMonthDateTime = "longMonthDateTime";

type FormatOptionType = typeof fullDateTime | typeof longMonthDateTime;
interface FormatOptions {
  timeZone?: string;
  hour12?: boolean;
  weekday?: "narrow" | "short" | "long";
  era?: "narrow" | "short" | "long";
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "narrow" | "short" | "long";
  day?: "numeric" | "2-digit";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "numeric" | "2-digit";
  timeZoneName?: "short" | "long";
}

const DateUtil = {
  /*
   * Composes a string expression by de-composing the given time in milliseconds
   * into it's sub-multiplicants. For example:
   *
   * 11002 = 11002 ms (11 sec, 2 ms)
   */
  msToMultiplicants(
    ms: number,
    multiplicants: Multiplicants = DEFAULT_MULTIPLICANTS
  ): string[] {
    const expressionComponents = [];
    const multiplicantKeys = Object.keys(multiplicants);

    // Start applying biggest to smallest fit
    for (let i = multiplicantKeys.length - 1; i >= 0; --i) {
      const unitName = multiplicantKeys[i];
      const unitSize = multiplicants[unitName];
      const fullFits = Math.floor(ms / unitSize);

      if (fullFits > 0) {
        expressionComponents.push(`${fullFits} ${unitName}`);
        ms = ms % unitSize;
      }
    }

    return expressionComponents;
  },

  /**
   * Creates a UTC time string from time provided
   * @param  {Date|Number} ms number to convert to UTC time string
   * @return {String} time string with the format 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
   */
  msToUTCDate(ms: Date | number): string {
    return moment(ms)
      .utc()
      .format("YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
  },

  /**
   * Creates a log timestamp string from time provided
   * @param  {Date|Number} ms number to convert to ANSI C time string
   * @return {String} time string with the format 'YYYY-MM-DD hh:mm:ss'
   */
  msToLogTime(ms: Date | number): string {
    return moment(ms)
      .utc()
      .format("YYYY-MM-DD hh:mm:ss");
  },

  /**
   * Returns format object for Intl.DateTimeFormat (and DateFormat translation macro)
   */
  getFormatOptions(formatType?: FormatOptionType): FormatOptions {
    const longMonthDateTimeFormat: FormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric"
    };
    const fullDateTimeFormat: FormatOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    };
    if (formatType === fullDateTime) {
      return fullDateTimeFormat;
    } else if (formatType === longMonthDateTime) {
      return longMonthDateTimeFormat;
    } else {
      // default to full numeric date time format
      return fullDateTimeFormat;
    }
  },

  /**
   * Creates relative time based on now and the time provided
   * @param  {Date|Number} ms number to convert to relative time string
   * @param  {Boolean} suppressRelativeTime whether to remove 'ago' from string
   * @return {String} time string relative from now
   */
  msToRelativeTime(
    ms: Date | number,
    suppressRelativeTime: boolean = false
  ): string {
    return moment(ms).fromNow(suppressRelativeTime);
  },

  strToMs(str: string | null): number | null {
    if (str == null) {
      return null;
    }

    return (
      moment(str).valueOf() || moment(str, "YYYY-MM-DDTHH:mm:ssZ").valueOf()
    );
  },

  getDuration(
    time: number,
    formatKey: moment.DurationInputArg2 = "seconds"
  ): string {
    return moment.duration(time, formatKey).humanize();
  }
};

export default DateUtil;
