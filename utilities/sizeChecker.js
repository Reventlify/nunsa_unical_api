exports.sizeChecker = (base64) => {
  const buffer = Buffer.from(base64.substring(base64.indexOf(",") + 1));
  const sizes = {
    Byte: buffer.length,
    KB: ((Number(buffer.length) * 6) / 8) * Number(Math.pow(10, -3)),
    MB: ((Number(buffer.length) * 6) / 8) * Number(Math.pow(10, -6)),
  };
  return sizes;
};
