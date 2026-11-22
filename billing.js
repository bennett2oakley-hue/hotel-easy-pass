(function () {
  "use strict";
  let client = null;
  let user = null;
  let hasAccess = false;
  let ready = false;

  function status(message) {
    const node = document.getElementById("hepBillingStatus");
    if (node) node.textContent = message;
  }
  function paint() {
    const signedIn = !!user;
    const auth = document.getElementById("hepBillingAuth");
    const signOut = document.getElementById("hepSignOut");
    const unlock = document.getElementById("hepUnlock");
    if (auth) auth.classList.toggle("hidden", signedIn);
    if (signOut) signOut.classList.toggle("hidden", !signedIn);
    if (unlock) unlock.classList.toggle("hidden", !signedIn || hasAccess);
    if (hasAccess) status("Hotel Easy Pass is unlocked for this account.");
    else if (signedIn) status("Signed in as " + (user.email || "your account") + ". Complete the one-time unlock to use Traveler Pass.");
    else status("Create an account or sign in, then unlock Traveler Pass with a one-time payment.");
    window.hepBilling = { ready, hasAccess, user, refresh };
    window.dispatchEvent(new CustomEvent("hep-billing-ready", { detail: { ready, hasAccess } }));
  }
  async function refresh() {
    if (!client || !user) {
      hasAccess = false;
      ready = true;
      paint();
      return false;
    }
    const result = await client.from("app_entitlements").select("status,plan").eq("app_slug", "hotel-easy-pass").maybeSingle();
    if (result.error) {
      hasAccess = false;
      ready = true;
      status("Billing access is not available yet. The Hotel Easy Pass database setup must be completed.");
      paint();
      return false;
    }
    hasAccess = result.data?.status === "active" && result.data?.plan === "lifetime";
    ready = true;
    paint();
    return hasAccess;
  }
  async function init() {
    try {
      const response = await fetch("/api/config", { cache: "no-store" });
      const config = await response.json();
      if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase?.createClient) {
        ready = true;
        status("Account billing is not configured yet. Local preview is unavailable until the dedicated Hotel Easy Pass database is restored and configured.");
        paint();
        return;
      }
      client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const session = await client.auth.getSession();
      user = session.data.session?.user || null;
      await refresh();
      client.auth.onAuthStateChange((_event, nextSession) => {
        user = nextSession?.user || null;
        setTimeout(refresh, 0);
      });
      const unlockState = new URLSearchParams(location.search).get("unlock");
      if (unlockState === "success") {
        status("Payment received. Confirming your unlock now…");
        setTimeout(refresh, 2500);
      } else if (unlockState === "cancel") {
        status("Checkout was canceled. No payment was taken.");
      }
    } catch (error) {
      ready = true;
      status("Account billing could not connect. Refresh and try again.");
      paint();
    }
  }
  window.hepSignUp = async function () {
    if (!client) return status("Billing is not configured yet.");
    const email = document.getElementById("hepEmail").value.trim();
    const password = document.getElementById("hepPassword").value;
    if (!email || password.length < 8) return status("Enter a valid email and a password of at least 8 characters.");
    status("Creating your account…");
    const result = await client.auth.signUp({ email, password });
    if (result.error) return status(result.error.message);
    user = result.data.user || null;
    if (result.data.session) await refresh();
    else status("Account created. Check your email to confirm, then sign in.");
  };
  window.hepSignIn = async function () {
    if (!client) return status("Billing is not configured yet.");
    const email = document.getElementById("hepEmail").value.trim();
    const password = document.getElementById("hepPassword").value;
    if (!email || !password) return status("Enter your email and password.");
    status("Signing in…");
    const result = await client.auth.signInWithPassword({ email, password });
    if (result.error) return status(result.error.message);
    user = result.data.user || null;
    await refresh();
  };
  window.hepSignOut = async function () {
    if (client) await client.auth.signOut();
    user = null;
    hasAccess = false;
    await refresh();
  };
  window.hepStartCheckout = async function () {
    if (!client || !user) return status("Sign in before purchasing.");
    status("Opening secure Stripe Checkout…");
    const session = await client.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return status("Your sign-in expired. Sign in again.");
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Checkout is unavailable.");
      location.href = data.url;
    } catch (error) {
      status(error.message || "Checkout could not be started. No payment was taken.");
    }
  };
  init();
})();
