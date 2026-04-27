/* ============================================================
   shelfSounds.js — @web-kits/audio integration for Shelf page
   Sounds: card open → slide, card close → page-exit
   ============================================================ */

let shelfPatch = null;
let audioReady = false;
let _ensureReady = null;

async function initShelfSounds() {
  try {
    const mod = await import("https://esm.sh/@web-kits/audio@0.1.0");
    _ensureReady = mod.ensureReady;

    shelfPatch = await mod.loadPatch("scripts/shelf-sounds.json");

    // Try to resume AudioContext immediately on load.
    // Some browsers allow this if the user has interacted with
    // the domain before or if autoplay policy is lenient.
    try {
      await mod.ensureReady();
      audioReady = true;
    } catch (_) {}

    // Unlock on the earliest possible user activation events.
    // mousedown fires before click, keydown catches keyboard users,
    // touchstart catches mobile users — all before a full "click".
    const unlock = async () => {
      if (audioReady) return;
      try {
        await mod.ensureReady();
        audioReady = true;
      } catch (_) {}
    };

    const gestureEvents = ["mousedown", "pointerdown", "keydown", "touchstart"];
    for (const evt of gestureEvents) {
      document.addEventListener(evt, unlock, { once: true, capture: true });
    }
  } catch (e) {
    console.warn("Shelf sounds failed to load:", e);
  }
}

/**
 * Play a shelf sound with optional randomisation.
 * @param {string} name   — sound id from the patch
 * @param {object} [opts] — override options (detune, volume, etc.)
 */
function playShelfSound(name, opts) {
  if (!shelfPatch) return;

  // Attempt a late unlock if somehow still locked
  if (!audioReady && _ensureReady) {
    _ensureReady()
      .then(() => { audioReady = true; })
      .catch(() => {});
  }

  if (!audioReady) return;

  try {
    shelfPatch.play(name, opts);
  } catch (_) {}
}

/**
 * Generate slight random variations so every sound feels unique.
 * - detune: pitch shift in cents (±80 cents ≈ less than a semitone)
 * - volume: subtle loudness variation (0.85 – 1.15)
 */
function randomSoundOpts() {
  return {
    detune: (Math.random() - 0.5) * 160,   // –80 … +80 cents
    volume: 0.85 + Math.random() * 0.3,     //  0.85 … 1.15
  };
}

// Start loading immediately
initShelfSounds();
