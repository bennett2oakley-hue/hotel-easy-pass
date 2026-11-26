"use strict";

const crypto = require("node:crypto");
const APP_SLUG = "hotel-easy-pass";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(status, body) {
  return { status, body: JSON.stringify(body), headers: { "Content-Type": "application/json; charset=utf-8" } };
}
async function rawBody(req, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > (maxBytes || 1024 * 1024)) throw Object.assign(new Error("Request body too large"), { statusCode: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
function verifyStripeSignature(raw, header, secret, now) {
  if (!header || !secret) return false;
  const parts = String(header).split(",").map(x => x.trim());
  const t = parts.find(x => x.startsWith("t="));
  const v1 = parts.filter(x => x.startsWith("v1=")).map(x => x.slice(3));
  if (!t || !v1.length) return false;
  const timestamp = Number(t.slice(2));
  if (!Number.isInteger(timestamp) || Math.abs((now || Math.floor(Date.now() / 1000)) - timestamp) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(String(timestamp) + ".").update(raw).digest();
  return v1.some(value => {
    if (!/^[a-f0-9]{64}$/i.test(value)) return false;
    const supplied = Buffer.from(value, "hex");
    return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
  });
}
function configured() {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    /^price_[A-Za-z0-9]+$/.test(process.env.STRIPE_PRICE_UNLOCK || ""));
}
async function supabaseUser(token) {
  if (!token) return null;
  const response = await fetch(process.env.SUPABASE_URL.replace(/\/$/, "") + "/auth/v1/user", {
    headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: "Bearer " + token }
  });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null);
  return user && UUID_RE.test(user.id || "") ? user : null;
}
async function stripe(path, method, params) {
  const response = await fetch("https://api.stripe.com/v1/" + path, {
    method: method || "GET",
    headers: { Authorization: "Bearer " + process.env.STRIPE_SECRET_KEY, ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    ...(params ? { body: params.toString() } : {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Stripe request failed");
  return data;
}
async function createCheckout(req) {
  if (!configured()) return json(503, { ok: false, error: "Hotel Easy Pass billing is not configured yet." });
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const user = await supabaseUser(token);
  if (!user) return json(401, { ok: false, error: "Create an account or sign in before unlocking Hotel Easy Pass." });
  const existing = await supabaseAdmin(
    "app_entitlements?user_id=eq." + encodeURIComponent(user.id) +
    "&app_slug=eq." + APP_SLUG + "&status=eq.active&select=id",
    { method: "GET" }
  );
  if (Array.isArray(existing) && existing.length) {
    return json(409, { ok: false, error: "This account has already unlocked Hotel Easy Pass." });
  }
  const appUrl = (process.env.APP_URL || "https://hotel-easy-pass.onrender.com").replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", appUrl + "/traveler.html?unlock=success&session_id={CHECKOUT_SESSION_ID}");
  params.set("cancel_url", appUrl + "/traveler.html?unlock=cancel");
  params.set("client_reference_id", user.id);
  if (user.email) params.set("customer_email", user.email);
  params.set("line_items[0][price]", process.env.STRIPE_PRICE_UNLOCK);
  params.set("line_items[0][quantity]", "1");
  params.set("metadata[app_slug]", APP_SLUG);
  params.set("metadata[user_id]", user.id);
  params.set("metadata[plan]", "lifetime");
  params.set("payment_intent_data[metadata][app_slug]", APP_SLUG);
  params.set("payment_intent_data[metadata][user_id]", user.id);
  params.set("payment_intent_data[metadata][plan]", "lifetime");
  params.set("allow_promotion_codes", "true");
  try {
    const session = await stripe("checkout/sessions", "POST", params);
    return session.url ? json(200, { ok: true, url: session.url }) : json(502, { ok: false, error: "Stripe did not return a checkout URL." });
  } catch (error) {
    console.error("Hotel Easy Pass checkout failed:", error.message);
    return json(502, { ok: false, error: "Checkout could not be started. Please try again." });
  }
}
async function supabaseAdmin(path, options) {
  const base = process.env.SUPABASE_URL.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(base + "/rest/v1/" + path, {
    ...options,
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", ...(options?.headers || {}) }
  });
  if (!response.ok) throw new Error("Supabase request failed (" + response.status + "): " + (await response.text()).slice(0, 300));
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  return response.json().catch(() => null);
}
async function fulfillSession(session) {
  const metadata = session.metadata || {};
  if (session.mode !== "payment" || session.payment_status !== "paid" ||
      metadata.app_slug !== APP_SLUG || !UUID_RE.test(metadata.user_id || "") || metadata.plan !== "lifetime") return;
  await supabaseAdmin("app_entitlements?on_conflict=user_id%2Capp_slug", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([{
      user_id: metadata.user_id,
      app_slug: APP_SLUG,
      plan: "lifetime",
      status: "active",
      stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id || null,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
      updated_at: new Date().toISOString()
    }])
  });
}
async function setPaymentAccessStatus(paymentIntentId, status) {
  if (!paymentIntentId || typeof paymentIntentId !== "string") return;
  await supabaseAdmin(
    "app_entitlements?stripe_payment_intent_id=eq." + encodeURIComponent(paymentIntentId),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() })
    }
  );
}
async function webhook(req) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json(503, { ok: false, error: "Webhook is not configured." });
  let raw;
  try { raw = await rawBody(req, 1024 * 1024); }
  catch (error) { return json(error.statusCode || 400, { ok: false, error: error.message }); }
  if (!verifyStripeSignature(raw, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET)) return json(400, { ok: false, error: "Invalid Stripe signature." });
  let event;
  try { event = JSON.parse(raw.toString("utf8")); }
  catch { return json(400, { ok: false, error: "Invalid webhook JSON." }); }
  try {
    const prior = await supabaseAdmin(
      "stripe_webhook_events?event_id=eq." + encodeURIComponent(event.id) + "&select=event_id",
      { method: "GET" }
    );
    if (Array.isArray(prior) && prior.length) return json(200, { received: true, duplicate: true });
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await fulfillSession(event.data.object);
    } else if (event.type === "charge.refunded") {
      await setPaymentAccessStatus(event.data.object.payment_intent, "refunded");
    } else if (event.type === "charge.dispute.created") {
      await setPaymentAccessStatus(event.data.object.payment_intent, "revoked");
    }
    await supabaseAdmin("stripe_webhook_events?on_conflict=event_id", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify([{ event_id: event.id, event_type: event.type, processed_at: new Date().toISOString() }])
    });
    return json(200, { received: true });
  } catch (error) {
    console.error("Hotel Easy Pass webhook failed:", error.message);
    return json(500, { received: false, error: "Webhook processing failed; Stripe may retry this event." });
  }
}
module.exports = { createCheckout, webhook, verifyStripeSignature };
