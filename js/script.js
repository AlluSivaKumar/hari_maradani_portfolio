"use strict";

/* ==========================================
   RESPONSIVE NAVIGATION
   ========================================== */

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation-links");

if (menuButton && navigation) {
  document.documentElement.classList.add("js");

  const desktopQuery = window.matchMedia("(min-width: 60rem)");

  function closeMenu({ restoreFocus = false } = {}) {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");

    if (restoreFocus) {
      menuButton.focus();
    }
  }

  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();

      if (!desktopQuery.matches) {
        const targetId = link.getAttribute("href");

        const target = targetId
          ? document.querySelector(targetId)
          : null;

        if (target) {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });

          target.addEventListener(
            "blur",
            () => target.removeAttribute("tabindex"),
            { once: true }
          );
        }
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      navigation.classList.contains("is-open")
    ) {
      closeMenu({ restoreFocus: true });
    }
  });

  document.addEventListener("click", (event) => {
    if (
      navigation.classList.contains("is-open") &&
      !navigation.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      const focusWasInNavigation = navigation.contains(
        document.activeElement
      );

      closeMenu({
        restoreFocus: focusWasInNavigation
      });
    }
  });

  function handleLayoutChange(event) {
    const activeElement = document.activeElement;

    if (event.matches) {
      closeMenu();

      if (activeElement === menuButton) {
        const firstLink = navigation.querySelector("a");

        if (firstLink) {
          firstLink.focus();
        }
      }
    } else {
      closeMenu({
        restoreFocus: navigation.contains(activeElement)
      });
    }
  }

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", handleLayoutChange);
  } else {
    desktopQuery.addListener(handleLayoutChange);
  }
}

/* ==========================================
   COPYRIGHT YEAR
   ========================================== */

const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* ==========================================
   PROJECT LIGHTBOX MODAL & INTERACTION
   ========================================== */

const lightbox = document.querySelector("#project-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxProjectBadge = document.querySelector("#lightbox-project-badge");
const lightboxCounter = document.querySelector("#lightbox-counter");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxCloseBtn = document.querySelector("#lightbox-close");
const lightboxPrevBtn = document.querySelector("#lightbox-prev");
const lightboxNextBtn = document.querySelector("#lightbox-next");

if (lightbox && lightboxImage) {
  let currentProjectCells = [];
  let currentIndex = 0;
  let lastFocusedElement = null;

  function updateLightbox() {
    if (!currentProjectCells.length) return;

    const cell = currentProjectCells[currentIndex];
    const src = cell.getAttribute("data-src");
    const caption = cell.getAttribute("data-caption") || "";
    const project = cell.getAttribute("data-project") || "";
    const imgEl = cell.querySelector("img");
    const alt = imgEl ? imgEl.getAttribute("alt") : caption;

    lightboxImage.classList.add("is-loading");

    const tempImg = new Image();
    tempImg.onload = () => {
      lightboxImage.src = src;
      lightboxImage.alt = alt;
      lightboxImage.classList.remove("is-loading");
    };
    tempImg.onerror = () => {
      lightboxImage.src = src;
      lightboxImage.alt = alt;
      lightboxImage.classList.remove("is-loading");
    };
    tempImg.src = src;

    if (lightboxProjectBadge) {
      lightboxProjectBadge.textContent = project;
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIndex + 1} / ${currentProjectCells.length}`;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
    }
  }

  function openLightbox(cells, index, triggerEl) {
    currentProjectCells = Array.from(cells);
    currentIndex = index >= 0 && index < currentProjectCells.length ? index : 0;
    lastFocusedElement = triggerEl || document.activeElement;

    updateLightbox();

    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    } else {
      lightbox.setAttribute("open", "");
    }

    if (lightboxCloseBtn) {
      lightboxCloseBtn.focus();
    }
  }

  function closeLightbox() {
    if (typeof lightbox.close === "function") {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
    }

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function nextPhoto() {
    if (!currentProjectCells.length) return;
    currentIndex = (currentIndex + 1) % currentProjectCells.length;
    updateLightbox();
  }

  function prevPhoto() {
    if (!currentProjectCells.length) return;
    currentIndex = (currentIndex - 1 + currentProjectCells.length) % currentProjectCells.length;
    updateLightbox();
  }

  // Attach click listener to each cell and the project view button
  document.querySelectorAll(".project-card").forEach((card) => {
    const cells = card.querySelectorAll(".gallery-cell");
    cells.forEach((cell, idx) => {
      cell.addEventListener("click", () => {
        openLightbox(cells, idx, cell);
      });
    });

    const viewAllBtn = card.querySelector(".view-gallery-btn");
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", () => {
        openLightbox(cells, 0, viewAllBtn);
      });
    }
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener("click", closeLightbox);
  }
  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener("click", nextPhoto);
  }
  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener("click", prevPhoto);
  }

  // Close when clicking on backdrop outside the dialog box
  lightbox.addEventListener("click", (event) => {
    const dialogBox = lightbox.querySelector(".lightbox-dialog");
    if (!dialogBox) return;
    const rect = dialogBox.getBoundingClientRect();
    const clickedInside = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );
    if (!clickedInside) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      nextPhoto();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevPhoto();
    }
  });

  // Touch swipe support for mobile and tablets
  let touchStartX = 0;
  let touchEndX = 0;
  const stage = lightbox.querySelector(".lightbox-stage");

  if (stage) {
    stage.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    stage.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          nextPhoto();
        } else {
          prevPhoto();
        }
      }
    }, { passive: true });
  }
}

/* ==========================================
   VIDEO WALKTHROUGHS & QUALITY CONTROLLER
   ========================================== */

const videoCards = document.querySelectorAll(".video-card");
const qualityToast = document.querySelector("#quality-toast");
const toastMessage = document.querySelector("#toast-message");
let toastTimeout = null;

function showQualityToast(message) {
  if (!qualityToast || !toastMessage) return;
  toastMessage.textContent = message;
  qualityToast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    qualityToast.hidden = true;
  }, 2600);
}

// Format quality labels
const qualityLabels = {
  "4k": "4K UHD",
  "2k": "2K QHD",
  "1080p": "1080p FHD",
  "720p": "720p HD",
  "480p": "480p SD",
  "360p": "360p",
  "auto": "Auto"
};

// Check display capabilities
const displayWidth = window.screen.width * (window.devicePixelRatio || 1);
const isHighDpiDisplay = displayWidth >= 1920;

// Hover to play video cards
videoCards.forEach((card) => {
  const video = card.querySelector(".preview-video");
  const playBadgeText = card.querySelector(".badge-text");
  const qualityPill = card.querySelector(".video-quality-pill");
  const qualitySelect = card.querySelector(".video-quality-select");

  if (!video) return;

  video.muted = true;
  video.playsInline = true;

  function playPreview() {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          card.classList.add("is-playing");
          if (playBadgeText) {
            playBadgeText.textContent = "Playing preview";
          }
        })
        .catch(() => {});
    }
  }

  function pausePreview() {
    video.pause();
    card.classList.remove("is-playing");
    if (playBadgeText) {
      playBadgeText.textContent = "Hover to preview";
    }
  }

  card.addEventListener("mouseenter", playPreview);
  card.addEventListener("mouseleave", pausePreview);

  // Quality selector change
  if (qualitySelect) {
    qualitySelect.addEventListener("change", (e) => {
      e.stopPropagation();
      const val = qualitySelect.value;
      const label = qualityLabels[val] || val;

      if (qualityPill) {
        qualityPill.textContent = label;
        qualityPill.classList.toggle("is-4k", val === "4k");
        qualityPill.classList.toggle("is-2k", val === "2k");
      }

      video.classList.toggle("res-4k", val === "4k");
      video.classList.toggle("res-2k", val === "2k");

      if (val === "4k") {
        showQualityToast(isHighDpiDisplay ? "Quality set to 4K (2160p) · Ultra HD Sharpness enabled" : "Quality set to 4K (2160p) · Display Enhanced");
      } else if (val === "2k") {
        showQualityToast("Quality set to 2K (1440p) · High Definition mode");
      } else if (val === "1080p") {
        showQualityToast("Quality set to 1080p FHD (Full HD)");
      } else if (val === "720p") {
        showQualityToast("Quality set to 720p HD");
      } else if (val === "480p") {
        showQualityToast("Quality set to 480p SD (Standard)");
      } else if (val === "360p") {
        showQualityToast("Quality set to 360p (Data Saver mode)");
      } else {
        showQualityToast("Quality set to Auto (Optimal for current connection)");
      }
    });

    qualitySelect.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
});

// Category filter tabs
const filterButtons = document.querySelectorAll(".video-filters .filter-btn");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");

    const filter = btn.getAttribute("data-filter");
    videoCards.forEach((card) => {
      const cat = card.getAttribute("data-category");
      if (filter === "all" || cat === filter) {
        card.classList.remove("is-hidden");
      } else {
        card.classList.add("is-hidden");
      }
    });
  });
});

// Theater Mode Modal Player
const theaterModal = document.querySelector("#video-theater-modal");
const theaterVideo = document.querySelector("#theater-video");
const theaterTitle = document.querySelector("#theater-title");
const theaterCategory = document.querySelector("#theater-category");
const theaterDescription = document.querySelector("#theater-description");
const theaterCloseBtn = document.querySelector("#theater-close-btn");
const theaterQualitySelect = document.querySelector("#theater-quality-select");
const theaterQualityIndicator = document.querySelector("#theater-quality-indicator");
const theaterActiveRes = document.querySelector("#theater-active-res");

if (theaterModal && theaterVideo) {
  let activeCard = null;

  function openTheater(card) {
    if (!card) return;
    activeCard = card;

    const previewVideo = card.querySelector(".preview-video");
    const titleEl = card.querySelector("h3");
    const title = titleEl ? titleEl.textContent : "Walkthrough";
    const descEl = card.querySelector("p");
    const desc = descEl ? descEl.textContent : "";
    const categoryEl = card.querySelector(".video-category-tag");
    const category = categoryEl ? categoryEl.textContent : "WALKTHROUGH";
    const qualitySelect = card.querySelector(".video-quality-select");
    const chosenQuality = qualitySelect ? qualitySelect.value : "1080p";

    // Pause preview video
    if (previewVideo) {
      previewVideo.pause();
    }

    // Set theater video
    theaterVideo.src = previewVideo ? previewVideo.src : "";
    if (previewVideo && previewVideo.currentTime > 0) {
      theaterVideo.currentTime = previewVideo.currentTime;
    } else {
      theaterVideo.currentTime = 0;
    }

    if (theaterTitle) theaterTitle.textContent = title;
    if (theaterCategory) theaterCategory.textContent = category;
    if (theaterDescription) theaterDescription.textContent = desc;

    // Apply quality
    if (theaterQualitySelect) {
      theaterQualitySelect.value = chosenQuality;
    }
    applyTheaterQuality(chosenQuality);

    if (typeof theaterModal.showModal === "function") {
      theaterModal.showModal();
    } else {
      theaterModal.setAttribute("open", "");
    }

    theaterVideo.play().catch(() => {});
    if (theaterCloseBtn) {
      theaterCloseBtn.focus();
    }
  }

  function applyTheaterQuality(val) {
    const label = qualityLabels[val] || val;
    if (theaterQualityIndicator) {
      theaterQualityIndicator.textContent = label;
    }
    if (theaterActiveRes) {
      theaterActiveRes.textContent = label;
    }
    theaterVideo.classList.toggle("res-4k", val === "4k");
    theaterVideo.classList.toggle("res-2k", val === "2k");
  }

  function closeTheater() {
    theaterVideo.pause();
    if (typeof theaterModal.close === "function") {
      theaterModal.close();
    } else {
      theaterModal.removeAttribute("open");
    }
    if (activeCard) {
      const btn = activeCard.querySelector(".video-theater-btn");
      if (btn) btn.focus();
    }
  }

  // Wire up video card clicks to open theater mode
  videoCards.forEach((card) => {
    const previewWrapper = card.querySelector(".video-preview-wrapper");
    const theaterBtn = card.querySelector(".video-theater-btn");

    if (previewWrapper) {
      previewWrapper.addEventListener("click", () => {
        openTheater(card);
      });
      previewWrapper.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openTheater(card);
        }
      });
    }

    if (theaterBtn) {
      theaterBtn.addEventListener("click", () => {
        openTheater(card);
      });
    }
  });

  if (theaterCloseBtn) {
    theaterCloseBtn.addEventListener("click", closeTheater);
  }

  if (theaterQualitySelect) {
    theaterQualitySelect.addEventListener("change", () => {
      const val = theaterQualitySelect.value;
      applyTheaterQuality(val);
      if (activeCard) {
        const cardSelect = activeCard.querySelector(".video-quality-select");
        if (cardSelect) {
          cardSelect.value = val;
          cardSelect.dispatchEvent(new Event("change"));
        }
      }
    });
  }

  theaterModal.addEventListener("click", (e) => {
    const dialogBox = theaterModal.querySelector(".theater-dialog");
    if (!dialogBox) return;
    const rect = dialogBox.getBoundingClientRect();
    const clickedInside = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!clickedInside) {
      closeTheater();
    }
  });

  theaterModal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeTheater();
    } else if (e.key === " " && document.activeElement !== theaterQualitySelect) {
      e.preventDefault();
      if (theaterVideo.paused) {
        theaterVideo.play();
      } else {
        theaterVideo.pause();
      }
    }
  });
}

/* ==========================================
   WHATSAPP CONTACT FORM
   ========================================== */

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

// Recipient: Hari Gopal.
// Use country code and number, without +, spaces or brackets.
const whatsappNumber = "918885776737";

if (contactForm) {
  // JavaScript controls validation so whitespace-only values
  // can also be checked before opening WhatsApp.
  contactForm.noValidate = true;

  const phoneInput = contactForm.elements.namedItem("phone");

  // Remove custom errors as the visitor edits a field.
  contactForm.addEventListener("input", (event) => {
    if (typeof event.target.setCustomValidity === "function") {
      event.target.setCustomValidity("");
    }

    if (formStatus) {
      formStatus.textContent = "";
    }
  });

  contactForm.addEventListener("change", (event) => {
    if (typeof event.target.setCustomValidity === "function") {
      event.target.setCustomValidity("");
    }
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (formStatus) {
      formStatus.textContent = "";
    }

    // Trim text values and clear previous custom errors.
    contactForm.querySelectorAll("input, select, textarea").forEach(
      (field) => {
        field.setCustomValidity("");

        if (
          field.tagName === "TEXTAREA" ||
          ["text", "email", "tel"].includes(field.type)
        ) {
          field.value = field.value.trim();
        }
      }
    );

    const nameInput = contactForm.elements.namedItem("fullName");
    const locationInput = contactForm.elements.namedItem("location");
    const descriptionInput = contactForm.elements.namedItem(
      "description"
    );

    if (nameInput.value && nameInput.value.length < 2) {
      nameInput.setCustomValidity(
        "Please enter a name with at least 2 characters."
      );
    }

    if (locationInput.value && locationInput.value.length < 2) {
      locationInput.setCustomValidity(
        "Please enter your project city or area."
      );
    }

    if (
      descriptionInput.value &&
      descriptionInput.value.length < 10
    ) {
      descriptionInput.setCustomValidity(
        "Please describe your project using at least 10 characters."
      );
    }

    // Basic international phone validation:
    // optional leading +, digits, spaces, brackets and hyphens.
    const phoneValue = phoneInput.value;
    const phoneDigits = phoneValue.replace(/\D/g, "");

    const validPhoneCharacters = /^\+?[0-9()\s-]+$/.test(
      phoneValue
    );

    if (
      phoneValue &&
      (
        !validPhoneCharacters ||
        phoneDigits.length < 7 ||
        phoneDigits.length > 15
      )
    ) {
      phoneInput.setCustomValidity(
        "Enter a valid phone number with 7–15 digits."
      );
    }

    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);

    function getValue(fieldName) {
      return String(formData.get(fieldName) || "").trim();
    }

    const message = [
      "Hello Hari Gopal,",
      "",
      "I would like to discuss an interior design project.",
      "",
      "CONTACT DETAILS",
      `Name: ${getValue("fullName")}`,
      `Email: ${getValue("email")}`,
      `Phone: ${getValue("phone")}`,
      "",
      "PROJECT DETAILS",
      `Project type: ${getValue("projectType")}`,
      `Location: ${getValue("location")}`,
      `Estimated budget: ${getValue("budget") || "Not specified"}`,
      `Approximate area: ${getValue("area") || "Not specified"}`,
      `Preferred timeline: ${getValue("timeline") || "Not specified"}`,
      "",
      "DESCRIPTION",
      getValue("description"),
      "",
      "Please let me know how we can proceed."
    ].join("\n");

    // Encoding preserves line breaks, spaces and special characters.
    const whatsappUrl =
      `https://wa.me/${whatsappNumber}` +
      `?text=${encodeURIComponent(message)}`;

    if (formStatus) {
      formStatus.textContent =
        "Opening WhatsApp. Review your message and tap Send.";
    }

    // Same-tab navigation avoids popup blocking.
    // The form is deliberately not reset.
    window.location.assign(whatsappUrl);
  });
}