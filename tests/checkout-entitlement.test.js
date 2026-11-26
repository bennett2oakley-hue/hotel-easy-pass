"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createCheckout } = require("../stripe-billing");

test("an account with an active lifetime entitlement cannot start another checkout", async (t) => {
  const envKeys = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_PRICE_UNLOCK"
  ];
  const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  const originalFetch = global.fetch;
  t.after(() => {
    for (const key of envKeys) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
    global.fetch = originalFetch;
  });

  Object.assign(process.env, {
    STRIPE_SECRET_KEY: "sk_test_fixture",
    STRIPE_WEBHOOK_SECRET: "whsec_test_fixture",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "anon_fixture",
    SUPABASE_SERVICE_ROLE_KEY: "service_fixture",
    STRIPE_PRICE_UNLOCK: "price_fixture"
  });

  let stripeCheckoutCalls = 0;
  global.fetch = async (url) => {
    if (String(url).endsWith("/auth/v1/user")) {
      return new Response(JSON.stringify({
        id: "123e4567-e89b-42d3-a456-426614174000",
        email: "buyer@example.com"
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (String(url).includes("/rest/v1/app_entitlements?")) {
      return new Response(JSON.stringify([{ id: "existing-entitlement" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (String(url).includes("api.stripe.com/v1/checkout/sessions")) {
      stripeCheckoutCalls += 1;
      return new Response(JSON.stringify({ url: "https://checkout.stripe.test/session" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    throw new Error("Unexpected request: " + url);
  };

  const result = await createCheckout({ headers: { authorization: "Bearer user-token" } });
  assert.equal(result.status, 409);
  assert.equal(JSON.parse(result.body).ok, false);
  assert.equal(stripeCheckoutCalls, 0);
});
