/* ============================================================
   shelfSounds.js — @web-kits/audio integration for Shelf page
   Sounds: hover → slide-down, card open → slide, card close → page-exit
   ============================================================ */

let shelfPatch = null;
let audioReady = false;

async function initShelfSounds() {
  try {
    const { loadPatch, ensureReady } = await import(
      "https://esm.sh/@web-kits/audio@0.1.0"
    );

    shelfPatch = await loadPatch("scripts/shelf-sounds.json");

    // Resume AudioContext on first user gesture
    const unlock = async () => {
      if (!audioReady) {
        await ensureReady();
        audioReady = true;
      }
    };
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("pointerdown", unlock, { once: true });
  } catch (e) {
    console.warn("Shelf sounds failed to load:", e);
  }
}

function playShelfSound(name) {
  if (shelfPatch && audioReady) {
    try {
      shelfPatch.play(name);
    } catch (_) {}
  }
}

// Start loading immediately
initShelfSounds();
