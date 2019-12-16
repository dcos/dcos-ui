import format from "date-fns/format";
import distanceInWordsStrict from "date-fns/distance_in_words_strict";
import getTime from "date-fns/get_time";

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

type strToMsReturn<T> = T extends string ? number : null;

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
    return format(
      new Date(ms).valueOf() + new Date(ms).getTimezoneOffset() * 60000,
      "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"
    );
  },

  /**
   * Creates a UTC time string from time provided
   * @param  {Date|Number} ms number to convert to UTC time string
   * @return {String} time string with the format 'YYYY-MM-DD'
   */
  msToUTCDay(ms: Date | number): string {
    return format(
      new Date(ms).valueOf() + new Date(ms).getTimezoneOffset() * 60000,
      "YYYY-MM-DD"
    );
  },

  /**
   * Creates a log timestamp string from time provided
   * @param  {Date|Number} ms number to convert to ANSI C time string
   * @return {String} time string with the format 'YYYY-MM-DD hh:mm:ss'
   */
  msToLogTime(ms: Date | number): string {
    return format(
      new Date(ms).valueOf() + new Date(ms).getTimezoneOffset() * 60000,
      "YYYY-MM-DD hh:mm:ss"
    );
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
    }
    if (formatType === longMonthDateTime) {
      return longMonthDateTimeFormat;
    }
    // default to full numeric date time format
    return fullDateTimeFormat;
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
    return distanceInWordsStrict(Date.now(), ms, {
      addSuffix: !suppressRelativeTime,
      partialMethod: "round"
    });
  },

  strToMs<T extends string | null>(str: T): strToMsReturn<T> {
    if (typeof str !== "string") {
      // ugly return cast necessary as per https://github.com/Microsoft/TypeScript/issues/24929
      return null as strToMsReturn<T>;
    }

    const dateStr = str.toUpperCase();

    return (getTime(dateStr) ||
      getTime(
        format(new Date(dateStr).toISOString(), "YYYY-MM-DDTHH:mm:ssZ")
      )) as strToMsReturn<T>;
  },

  getDuration(time: number): string {
    return distanceInWordsStrict(0, time);
  },

  isValidDate(dateString: string) {
    if (dateString === null) {
      return false;
    }

    const date: Date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
};

export default DateUtil;
