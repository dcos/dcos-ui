interface ipObj {
  toInt(): number;
  toIp(): string;
}

export default function ipToInt(maybeIp: string): ipObj;
