require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express = require("express");
const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

const INTERCOM_TOKEN = process.env.INTERCOM_ACCESS_TOKEN;
console.log("[Ask Fin] Token loaded:", INTERCOM_TOKEN ? "yes" : "NO — check .env file");

const PORT = process.env.BACKEND_PORT || 4567;

const INTERCOM_HEADERS = {
  Authorization: `Bearer ${INTERCOM_TOKEN}`,
  "Content-Type": "application/json",
  Accept: "application/json",
  "Intercom-Version": "2.11",
};

/**
 * Look up a visitor by their client-side visitor_id.
 */
async function lookupVisitor(visitorUserId) {
  const url = `https://api.intercom.io/visitors?user_id=${encodeURIComponent(visitorUserId)}`;
  console.log("[Ask Fin] Looking up visitor:", url);

  const res = await fetch(url, { headers: INTERCOM_HEADERS });
  if (!res.ok) {
    console.log("[Ask Fin] Visitor lookup:", res.status);
    return null;
  }

  const visitor = await res.json();
  console.log("[Ask Fin] Found visitor:", visitor.id, visitor.type);
  return { id: visitor.id, type: "lead" };
}

/**
 * Verify a cached contact ID is still valid.
 */
async function verifyContact(contactId) {
  const res = await fetch(`https://api.intercom.io/contacts/${contactId}`, {
    headers: INTERCOM_HEADERS,
  });
  if (!res.ok) return null;

  const contact = await res.json();
  console.log("[Ask Fin] Verified contact:", contact.id, contact.role);
  return { id: contact.id, type: contact.role === "user" ? "user" : "lead" };
}

/**
 * POST /api/ask-fin
 *
 * Two paths:
 * 1. contact_id provided (cached) → verify + create conversation
 * 2. visitor_id provided (first time) → lookup visitor + create conversation + return contact_id
 */
app.post("/api/ask-fin", async (req, res) => {
  console.log("[Ask Fin] Received:", JSON.stringify(req.body));

  const { visitor_id, message, contact_id } = req.body;

  if (!message) return res.status(400).json({ error: "message is required" });
  if (!visitor_id && !contact_id) return res.status(400).json({ error: "visitor_id or contact_id required" });
  if (!INTERCOM_TOKEN) return res.status(500).json({ error: "No token" });

  try {
    let person = null;

    // Path 1: cached contact ID
    if (contact_id) {
      person = await verifyContact(contact_id);
    }

    // Path 2: visitor lookup
    if (!person && visitor_id) {
      person = await lookupVisitor(visitor_id);
    }

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    // Create conversation
    console.log("[Ask Fin] Creating conversation:", person.type, person.id);

    const convRes = await fetch("https://api.intercom.io/conversations", {
      method: "POST",
      headers: INTERCOM_HEADERS,
      body: JSON.stringify({
        from: { type: person.type, id: person.id },
        body: message,
      }),
    });

    if (!convRes.ok) {
      const err = await convRes.text();
      console.error("[Ask Fin] Conversation error:", convRes.status, err);
      return res.status(502).json({ error: "Failed to create conversation", details: err });
    }

    const data = await convRes.json();
    console.log("[Ask Fin] Created conversation:", data.conversation_id);

    return res.json({
      conversation_id: data.conversation_id,
      contact_id: person.id,
    });
  } catch (err) {
    console.error("[Ask Fin] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", token: INTERCOM_TOKEN ? "loaded" : "missing" });
});

app.listen(PORT, () => {
  console.log(`[Ask Fin] Web server running on port ${PORT}`);
});
