import { XMLParser } from "fast-xml-parser";

import { xmlEntityDecoder } from "./entities";
import { SourceError } from "./errors";
import type { RawItem } from "./types";

const CDATA_PROPERTY = "__cdata";
const ATTRIBUTE_PREFIX = "@_";

const parserOptions = {
  attributeNamePrefix: ATTRIBUTE_PREFIX,
  cdataPropName: CDATA_PROPERTY,
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
  preserveOrder: true,
  processEntities: false,
  trimValues: false,
};

const xmlParser = new XMLParser(parserOptions);

type XmlObject = Record<string, unknown>;

function isXmlObject(value: unknown): value is XmlObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fieldNode(value: unknown, fieldName: string): XmlObject | undefined {
  if (!Array.isArray(value)) return undefined;

  for (const child of value) {
    if (isXmlObject(child) && Object.hasOwn(child, fieldName)) return child;
  }

  return undefined;
}

function fieldValue(value: unknown, fieldName: string): unknown {
  return fieldNode(value, fieldName)?.[fieldName];
}

function collectText(value: unknown, isCdata = false): string {
  if (typeof value === "string") return isCdata ? value : xmlEntityDecoder.decode(value);
  if (Array.isArray(value)) {
    return value.map((child) => collectText(child, isCdata)).join("");
  }
  if (!isXmlObject(value)) return "";

  return Object.entries(value)
    .filter(([key]) => key !== ":@")
    .map(([key, child]) => collectText(child, isCdata || key === CDATA_PROPERTY))
    .join("");
}

function textValue(value: unknown): string | undefined {
  const text = collectText(value).trim();
  return text === "" ? undefined : text;
}

function attributeValue(value: unknown, attribute: string): string | undefined {
  if (!isXmlObject(value)) return undefined;

  const attributes = value[":@"];
  if (!isXmlObject(attributes)) return undefined;

  const valueFromAttribute = attributes[`${ATTRIBUTE_PREFIX}${attribute}`];
  return typeof valueFromAttribute === "string"
    ? xmlEntityDecoder.decode(valueFromAttribute).trim()
    : undefined;
}

function itemFromNode(item: unknown): RawItem | undefined {
  if (!Array.isArray(item)) return undefined;

  try {
    const linkNode = fieldNode(item, "link");
    const link = textValue(linkNode?.link) ?? attributeValue(linkNode, "href");
    const guid = textValue(fieldValue(item, "guid")) ?? textValue(fieldValue(item, "id")) ?? link;

    const mapped: RawItem = {
      title: textValue(fieldValue(item, "title")),
      link,
      guid,
      pubDate: textValue(fieldValue(item, "pubDate")),
      published: textValue(fieldValue(item, "published")),
      updated: textValue(fieldValue(item, "updated")),
      author: textValue(fieldValue(item, "author")) ?? textValue(fieldValue(item, "dc:creator")),
      description:
        textValue(fieldValue(item, "description")) ?? textValue(fieldValue(item, "summary")),
      content:
        textValue(fieldValue(item, "content:encoded")) ?? textValue(fieldValue(item, "content")),
    };

    return Object.values(mapped).some((value) => value !== undefined) ? mapped : undefined;
  } catch {
    return undefined;
  }
}

function collectItemNodes(value: unknown, tagName: string, result: unknown[][]): void {
  if (Array.isArray(value)) {
    for (const child of value) collectItemNodes(child, tagName, result);
    return;
  }
  if (!isXmlObject(value)) return;

  for (const [key, child] of Object.entries(value)) {
    if (key === tagName && Array.isArray(child)) {
      result.push(child);
    } else if (key !== ":@") {
      collectItemNodes(child, tagName, result);
    }
  }
}

function rootElement(parsed: unknown): { name: string; value: unknown } | undefined {
  if (!Array.isArray(parsed)) return undefined;

  for (const node of parsed) {
    if (!isXmlObject(node)) continue;
    const root = Object.entries(node).find(([key]) => key !== ":@" && !key.startsWith("?"));
    if (root) return { name: root[0], value: root[1] };
  }

  return undefined;
}

function parseDocument(xml: string): unknown[] | undefined {
  try {
    return xmlParser.parse(xml) as unknown[];
  } catch {
    return undefined;
  }
}

function parseDocumentItems(parsed: unknown[]): RawItem[] | undefined {
  const root = rootElement(parsed);
  if (!root) return undefined;

  const rootName = root.name.toLowerCase();
  if (rootName !== "rss" && rootName !== "feed" && rootName !== "rdf:rdf") return undefined;

  const tagName = rootName === "feed" ? "entry" : "item";
  const nodes: unknown[][] = [];
  collectItemNodes(root.value, tagName, nodes);
  return nodes.flatMap((node) => {
    const item = itemFromNode(node);
    return item ? [item] : [];
  });
}

export async function fetchFeed(url: string): Promise<RawItem[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "caefisica-news-reader/1.0" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new SourceError(`La fuente respondió con el código ${res.status}.`);
  }

  const xml = await res.text();

  const parsed = parseDocument(xml);
  if (parsed === undefined) {
    throw new SourceError("La respuesta no es un feed RSS ni Atom.");
  }

  const items = parseDocumentItems(parsed);
  if (items === undefined) {
    throw new SourceError("La respuesta no es un feed RSS ni Atom.");
  }
  return items;
}
