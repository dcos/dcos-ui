const RECORD_PATTERN = /^\d+\n.+/;

export default function read(input) {
  const records = [];
  let rest = input;

  while (RECORD_PATTERN.test(rest)) {
    const delimiterPosition = rest.indexOf("\n");

    const recordLength = parseInt(rest.substring(0, delimiterPosition), 10);

    const recordStartPosition = delimiterPosition + 1;
    const recordEndPosition = recordStartPosition + recordLength;

    if (isNaN(recordLength) || rest.length < recordEndPosition) {
      return [records, rest];
    }

    const record = rest.substring(recordStartPosition, recordEndPosition);
    rest = rest.substring(recordEndPosition);

    records.push(record);
  }

  return [records, rest];
}
