"use client";

/**
 * Studio state — Jotai atoms.
 *
 * Anything that used to live in AppClient's useState and get drilled through
 * <Dashboard> as props is an atom here instead. Components subscribe to just
 * the atoms they use via useAtom / useAtomValue / useSetAtom.
 *
 * Async workflows (refresh account, refresh jobs, generate, top up, logout)
 * are write-only "action atoms" so any component can trigger them without a
 * callback prop:  const generate = useSetAtom(generateAtom);
 */
import { atom } from "jotai";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { apiUrl } from "@/lib/site";
import { firstGivenName } from "@/lib/utils";
import type {
  DashboardView,
  GenerateSettings,
  StudioJob,
  StudioUser,
} from "@/components/dashboard/types";

/* ── State atoms ───────────────────────────────────────────────────────── */

export const userAtom = atom<StudioUser | null>(null);
export const jobsAtom = atom<StudioJob[]>([]);
/** False until Firebase has replayed any persisted session for this origin. */
export const authResolvedAtom = atom(false);

export const promptAtom = atom("");
export const negativePromptAtom = atom("");
export const modeAtom = atom<"text2img" | "img2img">("text2img");
export const imageAtom = atom<File | null>(null);

export const busyAtom = atom(false);
export const errorAtom = atom<string | null>(null);

export const dashboardViewAtom = atom<DashboardView>("image");

/* ── Helpers ───────────────────────────────────────────────────────────── */

async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { error?: string })?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* ── Action atoms ──────────────────────────────────────────────────────── */

/** Reload the signed-in user's account (credits, profile) from the API. */
export const refreshMeAtom = atom(null, async (_get, set) => {
  const target = firebaseAuth.currentUser;
  if (!target) {
    set(userAtom, null);
    return;
  }
  const token = await target.getIdToken();
  const res = await jsonFetch<{ user: StudioUser | null }>(
    apiUrl("/api/auth/me"),
    { headers: { Authorization: `Bearer ${token}` } },
  );
  set(
    userAtom,
    res.user
      ? {
          ...res.user,
          displayName:
            firstGivenName(res.user.displayName) ||
            firstGivenName(target.displayName) ||
            res.user.displayName,
        }
      : null,
  );
});

/** Reload the job list from the API. */
export const refreshJobsAtom = atom(null, async (_get, set) => {
  if (!firebaseAuth.currentUser) return;
  const res = await jsonFetch<{ jobs: StudioJob[] }>(apiUrl("/api/jobs"), {
    headers: await authHeaders(),
  });
  set(jobsAtom, res.jobs);
});

/** Submit a generation job, then refresh jobs + balance. */
export const generateAtom = atom(
  null,
  async (get, set, settings: GenerateSettings) => {
    set(errorAtom, null);
    set(busyAtom, true);
    try {
      const form = new FormData();
      form.set("prompt", get(promptAtom));
      form.set("negativePrompt", get(negativePromptAtom));
      form.set("mode", get(modeAtom));
      form.set("kind", settings.kind);
      form.set("model", settings.model);
      form.set("aspect", settings.aspect);
      if (settings.duration) form.set("duration", settings.duration);
      if (settings.camera) form.set("camera", settings.camera);
      if (settings.strength != null) {
        form.set("strength", String(settings.strength));
      }
      const image = get(imageAtom);
      if (image) form.set("image", image);

      await jsonFetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: await authHeaders(),
        body: form,
      });

      set(promptAtom, "");
      set(negativePromptAtom, "");
      set(imageAtom, null);
      await set(refreshJobsAtom);
      await set(refreshMeAtom);
    } catch (e) {
      set(errorAtom, errorMessage(e, "Generation failed"));
    } finally {
      set(busyAtom, false);
    }
  },
);

/** Start a Paystack checkout for 100 credits and redirect to it. */
export const topUpAtom = atom(null, async (_get, set) => {
  set(errorAtom, null);
  set(busyAtom, true);
  try {
    const res = await jsonFetch<{ hostedUrl: string }>(
      apiUrl("/api/credits/checkout"),
      {
        method: "POST",
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
        body: JSON.stringify({ credits: 100 }),
      },
    );
    window.location.href = res.hostedUrl;
  } catch (e) {
    set(errorAtom, errorMessage(e, "Top-up failed"));
  } finally {
    set(busyAtom, false);
  }
});

/** Sign out of Firebase and clear studio state. */
export const logoutAtom = atom(null, async (_get, set) => {
  set(errorAtom, null);
  set(busyAtom, true);
  try {
    await signOut(firebaseAuth);
    set(userAtom, null);
    set(jobsAtom, []);
  } catch (e) {
    set(errorAtom, errorMessage(e, "Logout failed"));
  } finally {
    set(busyAtom, false);
  }
});

/** "Use this prompt" — copy a prompt into the composer and open the image view. */
export const usePromptAtom = atom(null, (_get, set, prompt: string) => {
  set(promptAtom, prompt);
  set(dashboardViewAtom, "image");
});
