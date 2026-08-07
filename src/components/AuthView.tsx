import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { assetUrl } from "../lib/assets";

export function AuthView() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !email) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).toString() },
    });
    setBusy(false);
    setMessage(error ? "CONNECTION REFUSED. CHECK THE EMAIL ADDRESS." : "LINK SENT. OPEN THE EMAIL ON THIS DEVICE.");
  }

  return (
    <main className="auth-screen">
      <div className="auth-photo" aria-hidden="true">
        <img src={assetUrl("assets/photos/underwater-fighter.webp")} alt="" />
      </div>
      <section className="auth-panel">
        <p className="eyebrow">PERSONAL ARCHIVE // RESTRICTED ACCESS</p>
        <h1>IRON<span>GROWTH</span></h1>
        <p className="auth-copy">ONE YEAR. TWO MILESTONES. NO SESSION ERASED.</p>
        <form onSubmit={submit}>
          <label htmlFor="email">ATHLETE EMAIL</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <button className="primary-command" type="submit" disabled={busy}>{busy ? "SENDING..." : "GET MAGIC LINK"}</button>
        </form>
        {message && <p className="form-message" role="status">{message}</p>}
      </section>
    </main>
  );
}
