document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("lightboxModal");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const contentImages = document.querySelectorAll(".content > img");

  let currentIndex = 0;
  let currentScale = 1;
  const minScale = 1;
  const maxScale = 3;
  const scaleStep = 0.1;

  // Open lightbox
  contentImages.forEach((img, index) => {
    img.addEventListener("click", () => {
      currentIndex = index;
      currentScale = 1;
      openLightbox();
    });
  });

  function openLightbox() {
    lightboxImage.src = contentImages[currentIndex].src;
    lightboxImage.style.transform = `scale(${currentScale})`;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
    currentScale = 1;
  }

  function showPrevious() {
    currentIndex = (currentIndex - 1 + contentImages.length) % contentImages.length;
    currentScale = 1;
    lightboxImage.src = contentImages[currentIndex].src;
    lightboxImage.style.transform = `scale(${currentScale})`;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % contentImages.length;
    currentScale = 1;
    lightboxImage.src = contentImages[currentIndex].src;
    lightboxImage.style.transform = `scale(${currentScale})`;
  }

  function updateImageScale(newScale) {
    currentScale = Math.max(minScale, Math.min(maxScale, newScale));
    lightboxImage.style.transform = `scale(${currentScale})`;
  }

  // Event listeners
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", showPrevious);
  lightboxNext.addEventListener("click", showNext);

  // Close on overlay click
  modal.addEventListener("click", (e) => {
    if (e.target === modal.querySelector(".lightbox-overlay")) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("active")) return;

    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      showPrevious();
    } else if (e.key === "ArrowRight") {
      showNext();
    }
  });

  // Pinch zoom with trackpad
  document.addEventListener("wheel", (e) => {
    if (!modal.classList.contains("active")) return;

    // Check for pinch gesture (Ctrl key on Mac, Ctrl/Meta on other browsers)
    if (!(e.ctrlKey || e.metaKey)) return;

    e.preventDefault();

    // Determine zoom direction: negative deltaY means zoom in
    const zoomDirection = e.deltaY > 0 ? -1 : 1;
    const newScale = currentScale + (zoomDirection * scaleStep);

    updateImageScale(newScale);
  }, { passive: false });
});

