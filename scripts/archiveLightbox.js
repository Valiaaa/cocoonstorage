document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("lightboxModal");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentIndex = 0;
  let currentScale = 1;
  const minScale = 1;
  const maxScale = 3;
  const scaleStep = 0.1;

  // Get all masonry images in their current DOM order
  function getAllImages() {
    return Array.from(document.querySelectorAll(".masonry-col img"));
  }

  // Use event delegation on .content so dynamically added images are handled
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".masonry-col img");
    if (!img) return;

    var allImages = getAllImages();
    currentIndex = allImages.indexOf(img);
    if (currentIndex === -1) currentIndex = 0;
    currentScale = 1;
    openLightbox();
  });

  function openLightbox() {
    var allImages = getAllImages();
    if (allImages.length === 0) return;
    lightboxImage.src = allImages[currentIndex].src;
    lightboxImage.style.transform = "scale(" + currentScale + ")";
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
    currentScale = 1;
  }

  function showPrevious() {
    var allImages = getAllImages();
    if (allImages.length === 0) return;
    currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    currentScale = 1;
    lightboxImage.src = allImages[currentIndex].src;
    lightboxImage.style.transform = "scale(" + currentScale + ")";
  }

  function showNext() {
    var allImages = getAllImages();
    if (allImages.length === 0) return;
    currentIndex = (currentIndex + 1) % allImages.length;
    currentScale = 1;
    lightboxImage.src = allImages[currentIndex].src;
    lightboxImage.style.transform = "scale(" + currentScale + ")";
  }

  function updateImageScale(newScale) {
    currentScale = Math.max(minScale, Math.min(maxScale, newScale));
    lightboxImage.style.transform = "scale(" + currentScale + ")";
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
