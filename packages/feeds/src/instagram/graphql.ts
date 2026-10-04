import { SourceError } from "../errors";

// Instagram retires persisted queries. A retired id answers "document not found".
const PROFILE_POSTS = {
  docId: "27553725110923321",
  name: "PolarisLoggedOutDesktopWWWProfilePostsTabContentQuery",
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";
const IG_APP_ID = "936619743392459";
// Instagram accepts any value for an anonymous query. These carry no identity.
const LSD = "AVqbxe3J_YA";
const CSRF_TOKEN = "Pl3a7Kd9sVqXwT2mRn5uYc8bHg1fEz0o";

const PAGE_SIZE = 12;
const TIMEOUT_MS = 10_000;
const ERROR_RATE_LIMITED = 1675004;

export interface MediaNode {
  pk?: string;
  code?: string;
  product_type?: string;
  user?: { username?: string };
  caption?: { text?: string } | null;
  display_uri?: string;
}

interface GraphqlResponse {
  status?: string;
  require_login?: boolean;
  error?: number;
  data?: {
    xig_user_by_username?: {
      polaris_ordered_timeline_connection?: { edges?: { node: MediaNode }[] };
    } | null;
  } | null;
  errors?: { code?: number }[];
}

function blocked(status: number): SourceError {
  if (status === 302) {
    return new SourceError("Instagram redirigió a la página de inicio de sesión (302).");
  }
  if (status === 429) {
    return new SourceError("Instagram limitó la frecuencia de consultas (429).");
  }
  return new SourceError(`Instagram rechazó la consulta (${status}).`);
}

function form(username: string): URLSearchParams {
  return new URLSearchParams({
    av: "0",
    __d: "www",
    __user: "0",
    __a: "1",
    __hs: "20681.HYP:instagram_web_pkg.2.1...0",
    dpr: "1",
    __ccg: "EXCELLENT",
    __rev: "1045311908",
    __hsi: "7674722996112187910",
    __comet_req: "7",
    lsd: LSD,
    __spin_r: "1045311908",
    __spin_b: "trunk",
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: PROFILE_POSTS.name,
    server_timestamps: "true",
    variables: JSON.stringify({ first: PAGE_SIZE, username }),
    doc_id: PROFILE_POSTS.docId,
  });
}

async function request(origin: string, username: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${origin}/api/graphql`, {
      method: "POST",
      // A redirect is the login wall. Following it would hide the block.
      redirect: "manual",
      headers: {
        Accept: "*/*",
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-CSRFToken": CSRF_TOKEN,
        "X-FB-Friendly-Name": PROFILE_POSTS.name,
        "X-FB-LSD": LSD,
        "X-IG-App-ID": IG_APP_ID,
      },
      body: form(username),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    console.error(`instagram request failed: ${String(err)}`);
    throw new SourceError("No se pudo conectar con Instagram.", { cause: err });
  }

  if (!res.ok) {
    throw blocked(res.status);
  }

  const text = (await res.text()).replace(/^for \(;;\);/u, "").trim();
  if (!text) {
    throw new SourceError("Instagram devolvió una respuesta vacía.");
  }
  return text;
}

export async function profilePosts(origin: string, username: string): Promise<MediaNode[]> {
  let json: GraphqlResponse;
  try {
    json = JSON.parse(await request(origin, username)) as GraphqlResponse;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new SourceError("Instagram devolvió una respuesta que no es JSON.", { cause: err });
    }
    throw err;
  }

  if (json.status === "fail" && json.require_login) {
    throw new SourceError("Instagram pide iniciar sesión para ver esta cuenta.");
  }
  if (json.errors?.some((e) => e.code === ERROR_RATE_LIMITED)) {
    throw new SourceError("Instagram limitó la frecuencia de consultas.");
  }
  if (json.error || !json.data) {
    throw new SourceError(
      "Instagram rechazó la consulta. Puede que el identificador de la consulta haya cambiado.",
    );
  }

  const user = json.data.xig_user_by_username;
  if (!user) {
    throw new SourceError(`La cuenta @${username} no existe.`);
  }
  const edges = user.polaris_ordered_timeline_connection?.edges;
  if (!edges) {
    throw new SourceError("Instagram devolvió una respuesta con un formato inesperado.");
  }
  return edges.map((edge) => edge.node);
}
