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