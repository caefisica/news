import { SourceError } from "../errors";
import type { RawItem } from "../types";
import { profilePosts } from "./graphql";

const USERNAME = /^[A-Za-z0-9._]{1,30}$/u;
const SHORTCODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
// Instagram media ids start with the creation time, in milliseconds since this epoch.
const ID_EPOCH_MS = 1_314_220_021_721;
const ID_TIME_SHIFT = 23n;

// A shortcode is the media id written in base 64. The grid has no timestamp, so
// the id gives it. For a reel it lands up to a minute before the post page's time.
export function shortcodeTime(shortcode: string): Date {
  let id = 0n;
  for (const char of shortcode) {
    const digit = SHORTCODE_ALPHABET.indexOf(char);
    if (digit < 0) {
      throw new SourceError("Instagram devolvió una publicación con un código inválido.");
    }
    id = id * 64n + BigInt(digit);
  }
  return new Date(Number(id >> ID_TIME_SHIFT) + ID_EPOCH_MS);
}

export async function fetchInstagram(url: string): Promise<RawItem[]> {
  const { origin, pathname } = new URL(url);
  const username = pathname.split("/").find(Boolean) ?? "";
  if (!USERNAME.test(username)) {
    throw new SourceError(`La dirección ${url} no es la de una cuenta de Instagram.`);
  }

  const nodes = await profilePosts(origin, username);

  // The grid also lists collab posts that another account published.
  const own = nodes.filter((node) => node.user?.username?.toLowerCase() === username.toLowerCase());
  if (own.length === 0) {
    throw new SourceError(`La cuenta @${username} no devolvió publicaciones.`);
  }

  return own.map((node) => {
    if (!node.code || !node.display_uri) {
      throw new SourceError("Instagram devolvió una publicación incompleta.");
    }
    const path = node.product_type === "clips" ? "reel" : "p";
    return {
      guid: node.code,
      link: `https://www.instagram.com/${path}/${node.code}/`,
      author: username,
      description: node.caption?.text,
      published: shortcodeTime(node.code).toISOString(),
      image: node.display_uri,
    };
  });
}
