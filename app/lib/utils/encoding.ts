function bytes32toAddress(str: string | undefined) {
  if (!str) {
    return undefined;
  }
  const addressHex = str.substring(str.length - 40);
  return `0x${addressHex}`;
}

export function unpaddedHexString(str: string) {
  const trimmed = str.substring(2).replace(/^0+/, "");
  return `0x${trimmed}`;
}

export function logTopicToAddress(
  topic?: string,
  data?: string
): string | undefined {
  if (!topic) {
    return bytes32toAddress(data);
  } else {
    return bytes32toAddress(topic);
  }
}
