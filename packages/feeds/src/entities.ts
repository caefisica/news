export function decodeNumericReference(reference: string): string {
  const body = reference.slice(2, -1).toLowerCase();
  const hexadecimal = body.startsWith("x");
  const digits = hexadecimal ? body.slice(1) : body;
  const validDigits =
    digits.length > 0 &&
    [...digits].every((digit) => (hexadecimal ? /[0-9a-f]/u.test(digit) : /[0-9]/u.test(digit)));
  if (!validDigits) return reference;

  const codePoint = hexadecimal ? Number.parseInt(digits, 16) : Math.trunc(Number(digits));

  if (
    !Number.isFinite(codePoint) ||
    codePoint < 0 ||
    codePoint > 0x10ffff ||
    (codePoint >= 0xd800 && codePoint <= 0xdfff)
  ) {
    return reference;
  }

  return String.fromCodePoint(codePoint);
}

const XML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"',
};

function decodeXmlEntity(entity: string): string {
  const name = entity.slice(1, -1).toLowerCase();
  return name.startsWith("#") ? decodeNumericReference(entity) : (XML_ENTITIES[name] ?? entity);
}

function decodeXml(text: string): string {
  let decoded = "";

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== "&") {
      decoded += text[index];
      continue;
    }

    const end = text.indexOf(";", index + 1);
    if (end === -1 || end - index > 32) {
      decoded += "&";
      continue;
    }

    const entity = text.slice(index, end + 1);
    decoded += decodeXmlEntity(entity);
    index = end;
  }

  return decoded;
}

// The decoder leaves declared and external entities literal.
// It validates numeric references before converting them.
export const xmlEntityDecoder = {
  setExternalEntities: () => {},
  addInputEntities: () => {},
  reset: () => {},
  setXmlVersion: () => {},
  decode: decodeXml,
};
