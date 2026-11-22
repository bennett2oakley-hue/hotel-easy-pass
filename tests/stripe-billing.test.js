"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { verifyStripeSignature } = require("../stripe-billing");

test("Hotel Easy Pass verifies valid Stripe webhook signatures", () => {
  const secret = "whsec_hotel_test_secret";
  const timestamp = 1795363200;
  const raw = Buffer.from('{"id":"evt_hotel_test","type":"checkout.session.completed"}');
  const digest = crypto.createHmac("sha256", secret).update(String(timestamp) + ".").update(raw).digest("hex");
  assert.equal(verifyStripeSignature(raw, "t=" + timestamp + ",v1=" + digest, secret, timestamp), true);
});

test("Hotel Easy Pass rejects invalid Stripe webhook signatures", () => {
  const raw = Buffer.from('{"id":"evt_hotel_test"}');
  assert.equal(verifyStripeSignature(raw, "t=1795363200,v1=" + "0".repeat(64), "whsec_hotel_test_secret", 1795363200), false);
});

test("Hotel Easy Pass rejects stale Stripe webhook signatures", () => {
  const secret = "whsec_hotel_test_secret";
  const timestamp = 1795363200;
  const raw = Buffer.from("{}");
  const digest = crypto.createHmac("sha256", secret).update(String(timestamp) + ".").update(raw).digest("hex");
  assert.equal(verifyStripeSignature(raw, "t=" + timestamp + ",v1=" + digest, secret, timestamp + 301), false);
});
