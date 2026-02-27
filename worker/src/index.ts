interface Env {
  ACCESS_CODES: KVNamespace;
  ANTHROPIC_API_KEY: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
} as const;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === "/api/validate-code" && request.method === "POST") {
      return handleValidateCode(request, env);
    }

    if (url.pathname === "/api/narrative" && request.method === "POST") {
      return handleNarrative(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

async function validateCode(code: string, env: Env): Promise<boolean> {
  const stored = await env.ACCESS_CODES.get(code, "json") as {
    active?: boolean;
    maxUses?: number;
    currentUses?: number;
  } | null;
  if (!stored || !stored.active) return false;
  if (stored.maxUses && (stored.currentUses ?? 0) >= stored.maxUses) return false;
  return true;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

async function handleValidateCode(request: Request, env: Env): Promise<Response> {
  try {
    const { code } = await request.json() as { code: string };
    const valid = await validateCode(code, env);
    return jsonResponse({ valid });
  } catch {
    return jsonResponse({ valid: false, error: "Invalid request" }, 400);
  }
}

async function handleNarrative(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      messages: unknown[];
      system: string;
      max_tokens?: number;
    };

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: body.max_tokens ?? 300,
        system: body.system,
        messages: body.messages,
        stream: true,
      }),
    });

    return new Response(anthropicResponse.body, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return jsonResponse({ error: "Narrative generation failed" }, 500);
  }
}
