(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var scrollBar = document.getElementById("scrollBar");
  var mobileCta = document.getElementById("mobileCta");
  var seatPanel = document.getElementById("seatPanel");
  var year = document.getElementById("year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* Mobile menu
     ========================================================= */

  var menuOpen = false;
  var lastFocused = null;

  function setMenu(open, restoreFocus) {
    if (!header || !menuToggle || !mobileMenu) return;
    menuOpen = open;
    header.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-lock", open);

    if (open) {
      lastFocused = document.activeElement;
      var firstLink = mobileMenu.querySelector("a");
      if (firstLink) {
        window.setTimeout(function () {
          if (menuOpen) firstLink.focus({ preventScroll: true });
        }, 140);
      }
    } else if (
      restoreFocus &&
      lastFocused &&
      typeof lastFocused.focus === "function"
    ) {
      lastFocused.focus({ preventScroll: true });
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!menuOpen, false);
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false, false);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menuOpen) {
      setMenu(false, true);
    }
  });

  document.addEventListener("click", function (event) {
    if (menuOpen && header && !header.contains(event.target)) {
      setMenu(false, true);
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1080 && menuOpen) {
      setMenu(false, false);
    }
  });

  /* Header state, progress and mobile action bar
     ========================================================= */

  var scrollQueued = false;

  function updateScrollState() {
    scrollQueued = false;
    var y = window.scrollY || window.pageYOffset || 0;

    if (header) {
      header.classList.toggle("scrolled", y > 8);
    }

    if (scrollBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      scrollBar.style.width = (progress * 100).toFixed(2) + "%";
    }

    if (mobileCta) {
      mobileCta.classList.toggle("is-visible", y > 360);
    }
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!scrollQueued) {
        scrollQueued = true;
        window.requestAnimationFrame(updateScrollState);
      }
    },
    { passive: true },
  );

  updateScrollState();

  /* Scroll reveal
     ========================================================= */

  var revealItems = document.querySelectorAll(".reveal, .stagger");

  function showAllReveals() {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  if ("IntersectionObserver" in window && revealItems.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 20% 0px" },
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });

    window.addEventListener(
      "scroll",
      function () {
        revealItems.forEach(function (item) {
          if (item.classList.contains("is-visible")) return;
          var rect = item.getBoundingClientRect();
          if (rect.top < window.innerHeight + 240) {
            item.classList.add("is-visible");
          }
        });
      },
      { passive: true },
    );

    window.setTimeout(function () {
      revealItems.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.15 && rect.bottom > -60) {
          item.classList.add("is-visible");
        }
      });
    }, 1800);
  } else {
    showAllReveals();
  }

  /* Seat bars
     ========================================================= */

  if (seatPanel) {
    if ("IntersectionObserver" in window) {
      var seatObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("bars-in");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 },
      );
      seatObserver.observe(seatPanel);
    } else {
      seatPanel.classList.add("bars-in");
    }
  }

  /* FAQ accordion
     ========================================================= */

  document.querySelectorAll(".faq-item").forEach(function (item) {
    var button = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if (!button || !panel) return;

    button.addEventListener("click", function () {
      var isOpen = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
      panel.setAttribute("aria-hidden", String(!isOpen));
    });
  });

  /* Fee link
     ========================================================= */

  var feeClass = document.getElementById("feeClass");
  var feeLink = document.getElementById("feeLink");

  function updateFeeLink() {
    if (!feeClass || !feeLink) return;
    var chosenClass = feeClass.value;
    var waitNote =
      chosenClass === "10th"
        ? " I understand Class 10 is on the waitlist."
        : "";
    var message =
      "Hi IIH, please share the fee for Class " +
      chosenClass +
      " (online classes)." +
      waitNote;
    feeLink.href =
      "https://wa.me/918468888593?text=" + encodeURIComponent(message);
  }

  if (feeClass) feeClass.addEventListener("change", updateFeeLink);
  updateFeeLink();

  /* Active desktop navigation
     ========================================================= */

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.desktop-nav a[href^="#"]'),
  );
  var navSections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.length > 1 ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  var heroSection = document.getElementById("top");

  if ("IntersectionObserver" in window && navSections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          if (entry.target === heroSection) {
            navLinks.forEach(function (link) {
              link.classList.remove("active");
            });
            return;
          }

          navLinks.forEach(function (link) {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id,
            );
          });
        });
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: 0 },
    );

    navSections.forEach(function (section) {
      navObserver.observe(section);
    });

    if (heroSection) {
      navObserver.observe(heroSection);
    }
  }

  /* Parent reel player
     ========================================================= */

  var reelScreen = document.getElementById("reelScreen");
  var reelPlay = document.getElementById("reelPlay");
  var reelClose = document.getElementById("reelClose");

  if (reelScreen && reelPlay) {
    var reelFrame = null;

    function closeReel() {
      if (reelFrame && reelFrame.parentNode) {
        reelFrame.parentNode.removeChild(reelFrame);
      }
      reelFrame = null;
      reelScreen.classList.remove("is-playing");
      if (reelClose) reelClose.hidden = true;
      reelPlay.hidden = false;
      reelPlay.focus({ preventScroll: true });
    }

    function openReel() {
      if (reelFrame) return;
      reelFrame = document.createElement("iframe");
      reelFrame.src = "parents/";
      reelFrame.title = "IIH short video for parents";
      reelFrame.setAttribute("allow", "autoplay; fullscreen");
      reelFrame.setAttribute("allowfullscreen", "");
      reelScreen.appendChild(reelFrame);
      reelScreen.classList.add("is-playing");
      reelPlay.hidden = true;
      if (reelClose) {
        reelClose.hidden = false;
        reelClose.focus({ preventScroll: true });
      }
    }

    reelPlay.addEventListener("click", openReel);
    if (reelClose) reelClose.addEventListener("click", closeReel);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && reelFrame) closeReel();
    });
  }
})();
