"use strict";

/* ==========================================
   RESPONSIVE NAVIGATION
   ========================================== */

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation-links");

if (menuButton && navigation) {
  document.documentElement.classList.add("js");

  // Matches the desktop navigation breakpoint in CSS.
  const desktopQuery = window.matchMedia("(min-width: 60rem)");

  function closeMenu({ restoreFocus = false } = {}) {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");

    if (restoreFocus) {
      menuButton.focus();
    }
  }

  // Open or close the mobile menu.
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  // Close the mobile menu after selecting a section.
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
            () => {
              target.removeAttribute("tabindex");
            },
            { once: true }
          );
        }
      }
    });
  });

  // Escape closes the menu and restores button focus.
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      navigation.classList.contains("is-open")
    ) {
      closeMenu({ restoreFocus: true });
    }
  });

  // Close the menu when clicking outside it.
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

  // Handle changes between mobile and desktop layouts.
  function handleLayoutChange(event) {
    const activeElement = document.activeElement;

    if (event.matches) {
      closeMenu();

      // The mobile button is hidden on desktop.
      if (activeElement === menuButton) {
        const firstLink = navigation.querySelector("a");

        if (firstLink) {
          firstLink.focus();
        }
      }
    } else {
      // Desktop links become hidden until the menu opens.
      const focusWasInNavigation =
        navigation.contains(activeElement);

      closeMenu({
        restoreFocus: focusWasInNavigation
      });
    }
  }

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener(
      "change",
      handleLayoutChange
    );
  } else {
    // Compatibility fallback for older browsers.
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

const projectImages = document.querySelectorAll(
  ".project-image img"
);

projectImages.forEach((image) => {
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

  // Handle images already available in the browser cache.
  if (image.complete) {
    if (image.naturalWidth > 0) {
      showImage();
    } else {
      showPlaceholder();
    }
  }
});