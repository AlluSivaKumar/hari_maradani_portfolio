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
   PROJECT IMAGE FALLBACKS
   ========================================== */

document.querySelectorAll(".project-image img").forEach((image) => {
  const placeholder = image.parentElement.querySelector(
    ".image-placeholder"
  );

  function showImage() {
    if (image.naturalWidth === 0) {
      return;
    }

    image.hidden = false;

    if (placeholder) {
      placeholder.hidden = true;
    }
  }

  function showPlaceholder() {
    image.hidden = true;

    if (placeholder) {
      placeholder.hidden = false;
    }
  }

  image.addEventListener("load", showImage);
  image.addEventListener("error", showPlaceholder);

  if (image.complete) {
    if (image.naturalWidth > 0) {
      showImage();
    } else {
      showPlaceholder();
    }
  }
});

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