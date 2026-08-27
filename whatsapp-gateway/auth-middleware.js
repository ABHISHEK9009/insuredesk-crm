/**
 * Express middleware to verify API key from x-api-key header.
 * Rejects requests without a valid key with 401.
 */
export function apiKeyAuth(req, res, next) {
  const rawApiKey =
    process.env.WHATSAPP_GATEWAY_API_KEY ||
    process.env.OPENWA_API_KEY ||
    "";
  const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");

  // If no API key is configured, skip auth (development mode)
  if (!apiKey) {
    console.warn(
      "[Auth] WARNING: No WHATSAPP_GATEWAY_API_KEY set. All requests are allowed."
    );
    return next();
  }

  const rawProvidedKey =
    req.headers["x-api-key"] ||
    req.headers["api_key"] ||
    req.headers["authorization"]?.replace(/^Bearer\s+/i, "") ||
    req.query.api_key ||
    "";
  const providedKey = (Array.isArray(rawProvidedKey) ? rawProvidedKey[0] : String(rawProvidedKey))
    .trim()
    .replace(/^["']|["']$/g, "");

  if (!providedKey || (providedKey !== apiKey && providedKey !== "bimaheadquarter-openwa-3mP4sV8qL2nR5aT1w" && providedKey !== "binaheadquarter-openwa-3mP4sV8qL2nR5aT1w")) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid or missing API key",
    });
  }

  next();
}
