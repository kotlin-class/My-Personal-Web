document.querySelectorAll('.carousel-container').forEach(container => {
  const leftBtn = container.querySelector('.scroll-btn.left');
  const rightBtn = container.querySelector('.scroll-btn.right');
  const carousel = container.querySelector('.favourites-carousel');

  leftBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -300, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: 300, behavior: 'smooth' });
  });
});

// Hide topbar when not at top
window.addEventListener("scroll", () => {
  const topbar = document.querySelector(".topbar");
  if (window.scrollY > 0) {
    topbar.classList.add("hidden");
  } else {
    topbar.classList.remove("hidden");
  }
});

// Hide footer when not near bottom
window.addEventListener("scroll", () => {
  const footer = document.querySelector(".site-footer");
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = window.scrollY;

  // Show footer only when close to bottom
  if (scrolled >= scrollable - 50) {
    footer.classList.remove("hidden");
  } else {
    footer.classList.add("hidden");
  }
});

// Burger menu toggle with animation
document.getElementById("burger-btn").addEventListener("click", () => {
  const dropdown = document.getElementById("burger-dropdown");
  dropdown.classList.toggle("show");
});

// Auto-close dropdown when clicking a link
document.querySelectorAll("#burger-dropdown a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("burger-dropdown").classList.remove("show");
  });
});

function updateBurgerVisibility() {
  const burger = document.querySelector(".burger-menu");
  const sidebar = document.querySelector(".sidebar");

  // Check if window is in fullscreen
  const isFullscreen =
    window.innerWidth === screen.width && window.innerHeight === screen.height;

  if (isFullscreen) {
    // Fullscreen -> hide burger, show sidebar
    burger.style.display = "none";
    sidebar.style.display = "flex";
  } else {
    // Windowed -> show burger, hide sidebar
    burger.style.display = "block";
    sidebar.style.display = "none";
  }
}

// Run on load + resize
window.addEventListener("load", updateBurgerVisibility);
window.addEventListener("resize", updateBurgerVisibility);

// Animate skills when in view
const skillBars = document.querySelectorAll("#skills .progress-bar div");

function animateSkills() {
  const section = document.getElementById("skills");
  const rect = section.getBoundingClientRect();
  if (rect.top < window.innerHeight - 100 && rect.bottom > 0) {
    skillBars.forEach(bar => {
      const targetWidth = bar.getAttribute("data-width");
      if (!bar.style.width || bar.style.width === "0px") {
        bar.style.width = targetWidth;
      }
    });
    window.removeEventListener("scroll", animateSkills);
  }
}

// Add target widths via JS
skillBars.forEach(bar => {
  bar.setAttribute("data-width", bar.style.width || "0");
  bar.style.width = "0"; // reset initial width
});

window.addEventListener("scroll", animateSkills);

// Toggle Projects dropdown with animation
function toggleProjects() {
  const content = document.getElementById("projects-content");
  content.classList.toggle("active");
}

// Toggle Gallery Dropdown
function toggleGallery() {
  const gallery = document.getElementById("gallery-content");
  gallery.classList.toggle("active");
}

// Toggle Gallery Subsections
function toggleSubsection(id) {
  const section = document.getElementById(id);
  section.classList.toggle("active");
}

// Expand/collapse video cards with direction-aware expansion
function expandVideo(card) {
  const allCards = document.querySelectorAll(".video-card");
  const grid = document.getElementById("videos-grid");
  const cardsArray = Array.from(allCards);
  const index = cardsArray.indexOf(card);

  // Reset all cards and pause videos
allCards.forEach(c => {
  c.classList.remove("expanded", "expand-left", "expand-right", "expand-center");

  // Pause YouTube iframe by resetting src
  const iframe = c.querySelector("iframe");
  if (iframe) {
    const src = iframe.src;
    iframe.src = "";       // clear src to stop video
    iframe.src = src;      // restore original so it's ready next time
  }
});

  // Toggle selected card
  if (!card.classList.contains("expanded")) {
    card.classList.add("expanded");

    // Decide direction based on position in grid
    const total = cardsArray.length;
    if (index < total / 3) {
      card.classList.add("expand-left");
    } else if (index > (2 * total) / 3) {
      card.classList.add("expand-right");
    } else {
      card.classList.add("expand-center");
    }
  }
}

// Scroll controls for carousel
function scrollLeft(id) {
  document.getElementById(id).scrollBy({ left: -250, behavior: 'smooth' });
}
function scrollRight(id) {
  document.getElementById(id).scrollBy({ left: 250, behavior: 'smooth' });
}

// Pre-select first video card
window.addEventListener("DOMContentLoaded", () => {
  const firstCard = document.querySelector(".video-card");
  if (firstCard) {
    expandVideo(firstCard);
  }
});

function pauseYouTubeVideos() {
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com/embed/"]');
  youtubeIframes.forEach(iframe => {
    const originalSrc = iframe.src;
    // Stop the video by setting the src to an empty string
    iframe.src = '';
    // Restore the original src after a short delay
    setTimeout(() => {
      iframe.src = originalSrc;
    }, 1);
  });
}

// Floating music player functions
const musicOverlay = document.getElementById("music-overlay-player");
const musicTitle = document.getElementById("music-title");

function toggleMusicPlayer() {
  const player = document.getElementById("music-player");
  player.classList.toggle("collapsed");
  document.getElementById("music-toggle").textContent =
    player.classList.contains("collapsed") ? "⯈" : "⯆";
}

// Do NOT auto-play first card anymore
window.addEventListener("DOMContentLoaded", () => {
  musicOverlay.src = "";
  musicTitle.textContent = "";
});

// Add click events to music cards
document.querySelectorAll("#music-category .music-card").forEach(card => {
  card.addEventListener("click", () => {
    playMusicCard(card);
  });
});

// Play a music card in overlay
function playMusicCard(card) {
  document.querySelectorAll("#music-category .music-card").forEach(c => {
    c.classList.remove("active");
  });

  card.classList.add("active");

  const audioSrc = card.querySelector("audio").src;
  const title = card.getAttribute("data-title");

  musicOverlay.src = audioSrc;
  musicOverlay.play();
  musicTitle.textContent = `🎵 ${title}`;

  const player = document.getElementById("music-player");
  if (player.classList.contains("collapsed")) toggleMusicPlayer();
}

// --- Tooltip setup ---
document.addEventListener("DOMContentLoaded", () => {
  const tooltipEl = document.getElementById("tooltip");
  if (!tooltipEl) return;

  // Attach listeners to current project cards
  attachProjectCardTooltips();

  // If your projects dropdown toggles visibility dynamically, reattach on open:
  const projectsBtn = document.querySelector(".projects-btn");
  if (projectsBtn) {
    projectsBtn.addEventListener("click", () => {
      // give the DOM a tick in case content just appeared
      setTimeout(attachProjectCardTooltips, 0);
    });
  }

  function attachProjectCardTooltips() {
    const cards = document.querySelectorAll(".project-card");
    cards.forEach(card => {
      // Optional: native title as fallback
      const text = card.getAttribute("data-tooltip") || "";
      if (text && !card.getAttribute("title")) card.setAttribute("title", text);

      // Avoid double-binding if this runs more than once
      if (card.__tooltipBound) return;
      card.__tooltipBound = true;

      card.addEventListener("pointerenter", (e) => {
        updateTooltip(e, card);
        tooltipEl.style.opacity = 1;
      });

      card.addEventListener("pointermove", (e) => {
        updateTooltip(e, card);
      });

      card.addEventListener("pointerleave", () => {
        tooltipEl.style.opacity = 0;
      });
    });
  }

  function updateTooltip(e, card) {
    const text = card.getAttribute("data-tooltip") || "";
    tooltipEl.textContent = text;

    const offset = 14;
    // Use viewport coords for fixed positioning
    let x = e.clientX + offset;
    let y = e.clientY + offset;

    // Keep tooltip inside viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = tooltipEl.getBoundingClientRect();
    if (x + rect.width > vw - 6) x = vw - rect.width - 6;
    if (y + rect.height > vh - 6) y = vh - rect.height - 6;

    tooltipEl.style.left = x + "px";
    tooltipEl.style.top = y + "px";
  }
});

// ---------- Lightbox / Preview JS ----------

let galleryItems = [];      // NodeList -> array of all items in gallery
let currentIndex = -1;
let lightboxOpen = false;

// Helper: find gallery items inside gallery-content
function buildGalleryItems() {
  // include images and videos inside #gallery-content
  galleryItems = Array.from(document.querySelectorAll("#gallery-content img, #gallery-content video"));
}

// Open preview: call as openPreview(element)
function openPreview(element) {
  buildGalleryItems();
  currentIndex = galleryItems.indexOf(element);
  if (currentIndex < 0) currentIndex = 0;

  showItem(currentIndex);
  document.getElementById("lightbox").classList.add("active");
  document.body.style.overflow = "hidden"; // prevent background scroll
  lightboxOpen = true;

  // attach keyboard handler
  document.addEventListener("keydown", handleLightboxKeys);
}

// Show item by index
function showItem(index) {
  const content = document.getElementById("lightbox-content");
  if (!galleryItems.length) {
    content.innerHTML = "";
    return;
  }

  // normalize index
  currentIndex = (index + galleryItems.length) % galleryItems.length;

  // Clear previous (and pause any previous video)
  const prevVideo = content.querySelector("video");
  if (prevVideo) {
    try { prevVideo.pause(); } catch (e) {}
  }
  content.innerHTML = "";

  const item = galleryItems[currentIndex];
  if (!item) return;

  if (item.tagName === "IMG") {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || "";
    content.appendChild(img);
  } else if (item.tagName === "VIDEO") {
    const src = item.querySelector("source")?.src || item.src || "";
    const vid = document.createElement("video");
    vid.src = src;
    vid.controls = true;
    vid.autoplay = true;
    vid.playsInline = true;
    vid.style.maxWidth = "100%";
    vid.style.maxHeight = "100%";
    content.appendChild(vid);

    // ensure video stops on close - handled in closeLightbox
  }
}

// Next / Prev
function changeItem(step) {
  if (!galleryItems.length) return;
  showItem(currentIndex + step);
}

// Close
function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const content = document.getElementById("lightbox-content");

  // Pause any playing video
  const video = content.querySelector("video");
  if (video) {
    try { video.pause(); } catch (e) {}
  }

  lightbox.classList.remove("active");
  content.innerHTML = "";
  document.body.style.overflow = ""; // restore scroll
  lightboxOpen = false;

  // remove keyboard handler
  document.removeEventListener("keydown", handleLightboxKeys);
}

// Keyboard handler
function handleLightboxKeys(e) {
  if (!lightboxOpen) return;
  if (e.key === "Escape") {
    closeLightbox();
    return;
  }
  if (e.key === "ArrowLeft") {
    changeItem(-1);
    return;
  }
  if (e.key === "ArrowRight") {
    changeItem(1);
    return;
  }
}

// Click outside content to close
document.getElementById("lightbox").addEventListener("click", function(e) {
  const content = document.getElementById("lightbox-content");
  // if click target is the backdrop (lightbox) and not inside content or controls, close
  if (e.target === this) closeLightbox();
});

// Wire up controls
document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
document.getElementById("lightbox-prev").addEventListener("click", function(e){ e.stopPropagation(); changeItem(-1); });
document.getElementById("lightbox-next").addEventListener("click", function(e){ e.stopPropagation(); changeItem(1); });

// Make gallery thumbnails call openPreview(this) when clicked
// (If your thumbnails already have onclick attributes, this is optional.)
document.querySelectorAll("#gallery-content img, #gallery-content video").forEach(item => {
  // ensure videos do not play in-grid: remove controls (if present)
  if (item.tagName === "VIDEO") {
    item.removeAttribute("controls");
    item.addEventListener("click", function(e){
      e.preventDefault();
      openPreview(this);
    });
  } else {
    item.addEventListener("click", function(e){
      openPreview(this);
    });
  }
});

// Scroll spy for sidebar
const sections = document.querySelectorAll("section, .favourites-subsection");
const sidebarIcons = document.querySelectorAll(".sidebar a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();

    // For all but last section
    if (rect.top <= 150 && rect.bottom >= 150) {
      current = section.getAttribute("id");
    }

    // Special case: last section (#contact)
    if (index === sections.length - 1 && window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
      current = section.getAttribute("id");
    }
  });

  sidebarIcons.forEach(icon => {
    icon.classList.remove("active");
    if (icon.getAttribute("href") === `#${current}`) {
      icon.classList.add("active");
    }
  });
});

const content = document.querySelectorAll('content');
const body = document.body;

function getCurrentSection() {
  let current = 'home';
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if(rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2){
      current = section.id;
    }
  });
  return current;
}

function updateBackground() {
  const section = getCurrentSection();
  let imageUrl = 'icons/Screenshot (8484).png'; // default

  switch(section){
    case 'about':
      imageUrl = 'icons/Screenshot (8484).png';
      break;
    case 'skills':
      imageUrl = 'icons/screenshot (8484).png';
      break;
    case 'projects':
      imageUrl = 'icons/Screenshot (8484).png';
      break;
    case 'schedule':
      imageUrl = 'icons/Screenshot (8484).png';
      break;
    case 'gallery':
      imageUrl = 'icons/Screenshot (8484).png';
      break;
    case 'favourites':
      imageUrl = 'icons/Screenshot (8487).png';
      break;
    case 'map':
      imageUrl = 'icons/Screenshot (8474).png';
    case 'contact':
      imageUrl = 'icons/Screenshot (8484).png';
      break;
  }

  body.style.backgroundImage = `url('${imageUrl}')`;
}

// Trigger on load and scroll
window.addEventListener('scroll', updateBackground);
window.addEventListener('load', updateBackground);

