// App Logic for Daksh - CS Student Opportunities Hub

// App State
let opportunities = [];
let currentCategory = "all";
let currentSearch = "";
let currentLocation = "all";
let currentSort = "deadline";

// Load from JSON file (refreshed by Python script) and merge with localStorage user-submitted entries
async function loadDatabase() {
  const grid = document.getElementById("opportunity-grid");
  
  try {
    const response = await fetch('./events_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const remoteData = await response.json();
    
    // Retrieve user-submitted custom opportunities
    const localData = localStorage.getItem("daksh_custom_opportunities");
    let customOpps = [];
    if (localData) {
      try {
        customOpps = JSON.parse(localData);
      } catch (err) {
        customOpps = [];
      }
    }
    
    // Combine custom opportunities first, then remote ones
    opportunities = [...customOpps, ...remoteData];
  } catch (e) {
    console.error("Error loading JSON database:", e);
    // Fallback error message in UI
    grid.innerHTML = `
      <div class="loader">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: var(--accent-orange);"></i>
        <p>Could not load the events database file. Make sure you ran <code>refresh_events.py</code> first to generate the events file, or check your server configuration.</p>
      </div>
    `;
  }
  
  // Update UI components
  updateStats();
  renderOpportunities();
}

// Save user-submitted opportunity locally
function saveCustomOpportunity(newOpp) {
  const localData = localStorage.getItem("daksh_custom_opportunities");
  let customOpps = [];
  if (localData) {
    try {
      customOpps = JSON.parse(localData);
    } catch (err) {
      customOpps = [];
    }
  }
  customOpps.unshift(newOpp);
  localStorage.setItem("daksh_custom_opportunities", JSON.stringify(customOpps));
  
  // Reload database view
  opportunities.unshift(newOpp);
  updateStats();
  renderOpportunities();
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadDatabase();
  initEventListeners();
  
  // Start countdown clock timer interval
  setInterval(() => {
    updateCountdownClocks();
  }, 1000);
});

// Setup event listeners
function initEventListeners() {
  // Category tabs
  const tabContainer = document.getElementById("category-tabs");
  tabContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    
    // Toggle active classes
    tabContainer.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    currentCategory = btn.dataset.category;
    renderOpportunities();
  });

  // Search input
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase().trim();
    renderOpportunities();
  });

  // Location selector
  const locationSelect = document.getElementById("location-select");
  locationSelect.addEventListener("change", (e) => {
    currentLocation = e.target.value;
    renderOpportunities();
  });

  // Sort selector
  const sortSelect = document.getElementById("sort-select");
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderOpportunities();
  });

  // Modal setup
  const suggestModal = document.getElementById("suggest-modal");
  const openModalBtn = document.getElementById("open-modal-btn");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const cancelModalBtn = document.getElementById("cancel-modal-btn");
  const suggestForm = document.getElementById("suggest-form");

  const openModal = () => suggestModal.classList.add("open");
  const closeModal = () => {
    suggestModal.classList.remove("open");
    suggestForm.reset();
  };

  openModalBtn.addEventListener("click", openModal);
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);
  suggestModal.addEventListener("click", (e) => {
    if (e.target === suggestModal) closeModal();
  });

  // Form submission
  suggestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Retrieve values
    const title = document.getElementById("opp-title").value.trim();
    const organizer = document.getElementById("opp-organizer").value.trim();
    const category = document.getElementById("opp-category").value;
    const location = document.getElementById("opp-location-type").value;
    const deadline = document.getElementById("opp-deadline").value;
    const link = document.getElementById("opp-link").value.trim();
    const tagsInput = document.getElementById("opp-tags").value;
    const desc = document.getElementById("opp-desc").value.trim();

    // Map location display tag
    let locationLabel = "Online / Remote";
    if (location === "bangalore") locationLabel = "Bengaluru, Karnataka";
    else if (location === "hyderabad") locationLabel = "Hyderabad, Telangana";
    else if (location === "pune") locationLabel = "Pune, Maharashtra";
    else if (location === "mumbai") locationLabel = "Mumbai, Maharashtra";
    else if (location === "noida-gurgaon") locationLabel = "Delhi NCR (Noida/Gurgaon)";
    else if (location === "other-india") locationLabel = "In-Person (India)";
    else if (location === "international") locationLabel = "International Opportunity";

    // Split tags
    const tags = tagsInput
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newOpportunity = {
      id: "custom-" + Date.now(),
      title,
      organizer,
      category,
      location,
      locationLabel,
      deadline,
      link,
      tags: tags.length > 0 ? tags : ["Tech"],
      desc
    };

    // Save locally
    saveCustomOpportunity(newOpportunity);
    closeModal();
  });
}

// Header metrics updater
function updateStats() {
  const activeEventsEl = document.getElementById("stat-active-events");
  const activeInternshipsEl = document.getElementById("stat-active-internships");
  const urgentDeadlineEl = document.getElementById("stat-urgent-deadline");

  const now = new Date();
  
  // Active/Upcoming events (deadline is in future)
  const activeOpps = opportunities.filter(opp => new Date(opp.deadline) > now);
  const activeInterns = activeOpps.filter(opp => opp.category === "internships");

  activeEventsEl.textContent = activeOpps.length;
  activeInternshipsEl.textContent = activeInterns.length;

  // Find closest deadline
  if (activeOpps.length > 0) {
    // Sort ascending
    const sorted = [...activeOpps].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const closest = sorted[0];
    const diffMs = new Date(closest.deadline) - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 2) {
      urgentDeadlineEl.textContent = `${closest.organizer}: ${diffDays} day${diffDays > 1 ? 's' : ''} left!`;
      urgentDeadlineEl.parentElement.classList.add("urgent");
    } else {
      urgentDeadlineEl.textContent = `Next closes: ${closest.title.slice(0, 15)}...`;
      urgentDeadlineEl.parentElement.classList.remove("urgent");
    }
  } else {
    urgentDeadlineEl.textContent = "No upcoming deadlines";
    urgentDeadlineEl.parentElement.classList.remove("urgent");
  }
}

// Generate chip UI for active filters
function updateActiveChips() {
  const chipsContainer = document.getElementById("active-chips-container");
  chipsContainer.innerHTML = "";

  const addChip = (label, onRemove) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `
      <span>${label}</span>
      <span class="chip-close"><i class="fa-solid fa-xmark"></i></span>
    `;
    chip.querySelector(".chip-close").addEventListener("click", onRemove);
    chipsContainer.appendChild(chip);
  };

  if (currentCategory !== "all") {
    addChip(`Category: ${currentCategory.toUpperCase()}`, () => {
      currentCategory = "all";
      document.querySelectorAll("#category-tabs .tab-btn").forEach(b => {
        if (b.dataset.category === "all") b.classList.add("active");
        else b.classList.remove("active");
      });
      renderOpportunities();
    });
  }

  if (currentLocation !== "all") {
    const locNames = {
      online: "Online / Remote",
      bangalore: "Bengaluru",
      hyderabad: "Hyderabad",
      pune: "Pune",
      mumbai: "Mumbai",
      "noida-gurgaon": "Noida / Gurgaon",
      "other-india": "Other India"
    };
    addChip(`Location: ${locNames[currentLocation] || currentLocation}`, () => {
      currentLocation = "all";
      document.getElementById("location-select").value = "all";
      renderOpportunities();
    });
  }

  if (currentSearch !== "") {
    addChip(`Search: "${currentSearch}"`, () => {
      currentSearch = "";
      document.getElementById("search-input").value = "";
      renderOpportunities();
    });
  }
}

// Helper: Calculate countdown string
function getCountdownText(deadlineStr) {
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return { text: "Registration Closed", urgent: false };
  }

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  const hours = diffHrs % 24;
  const minutes = diffMins % 60;

  if (diffDays > 0) {
    return { 
      text: `${diffDays}d ${hours}h left`, 
      urgent: diffDays <= 3 
    };
  } else if (hours > 0) {
    return { 
      text: `${hours}h ${minutes}m left`, 
      urgent: true 
    };
  } else {
    return { 
      text: `${minutes}m remaining`, 
      urgent: true 
    };
  }
}

// Live update countdown tickers
function updateCountdownClocks() {
  document.querySelectorAll("[data-deadline]").forEach(el => {
    const deadlineStr = el.dataset.deadline;
    const { text, urgent } = getCountdownText(deadlineStr);
    
    el.textContent = text;
    if (urgent) {
      el.classList.add("urgent");
    } else {
      el.classList.remove("urgent");
    }
  });
}

// Main Render Loop
function renderOpportunities() {
  const grid = document.getElementById("opportunity-grid");
  const now = new Date();

  // Filter Database
  let filtered = opportunities.filter(opp => {
    // 1. Filter by category tab
    if (currentCategory !== "all" && opp.category !== currentCategory) {
      return false;
    }

    // 2. Filter by Location
    if (currentLocation !== "all") {
      if (currentLocation === "online" && opp.location !== "online") return false;
      if (currentLocation !== "online" && opp.location !== currentLocation) return false;
    }

    // 3. Filter by Search Query
    if (currentSearch !== "") {
      const titleMatch = opp.title.toLowerCase().includes(currentSearch);
      const organizerMatch = opp.organizer.toLowerCase().includes(currentSearch);
      const descMatch = opp.desc.toLowerCase().includes(currentSearch);
      const tagMatch = opp.tags.some(tag => tag.toLowerCase().includes(currentSearch));
      
      if (!titleMatch && !organizerMatch && !descMatch && !tagMatch) {
        return false;
      }
    }

    return true;
  });

  // Sort Database
  filtered.sort((a, b) => {
    const dateA = new Date(a.deadline);
    const dateB = new Date(b.deadline);
    
    // Sort closed/expired elements at the very bottom
    const isClosedA = dateA < now;
    const isClosedB = dateB < now;
    if (isClosedA && !isClosedB) return 1;
    if (!isClosedA && isClosedB) return -1;

    if (currentSort === "deadline") {
      // Urgent/upcoming first, then distant future
      return dateA - dateB;
    } else {
      // Newest (custom submissions or recently updated)
      const idA = a.id.startsWith("custom-") ? parseInt(a.id.split("-")[1]) : 0;
      const idB = b.id.startsWith("custom-") ? parseInt(b.id.split("-")[1]) : 0;
      return idB - idA;
    }
  });

  // Update Filters Visual Chips
  updateActiveChips();

  // Empty Grid
  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="loader">
        <i class="fa-solid fa-face-frown" style="font-size: 2.5rem; color: var(--accent-pink);"></i>
        <p>No matching opportunities found. Try adjusting your filters!</p>
      </div>
    `;
    return;
  }

  // Create cards
  filtered.forEach(opp => {
    const isClosed = new Date(opp.deadline) < now;
    const countdownInfo = getCountdownText(opp.deadline);
    
    // Assign custom styling classes for categories
    let categoryText = opp.category;
    if (opp.category === 'ctf') categoryText = 'CTF & Ideathon';
    else if (opp.category === 'contests') categoryText = 'Contest';
    else if (opp.category === 'international') categoryText = 'International';
    else if (opp.category === 'hackathons') categoryText = 'Hackathon';
    else if (opp.category === 'internships') categoryText = 'Internship';
    
    const categoryBadgeClass = `badge-${opp.category}`;

    const card = document.createElement("div");
    card.className = "glass-card";
    
    card.innerHTML = `
      <div>
        <div class="card-header">
          <div class="card-title-group">
            <h4>${opp.title}</h4>
            <span class="organizer">${opp.organizer}</span>
          </div>
          <span class="category-badge ${categoryBadgeClass}">${categoryText}</span>
        </div>
        
        <div class="card-body">
          <p class="description-text">${opp.desc}</p>
          <div class="tags-list">
            ${opp.tags.map(tag => `<span class="tag-item">#${tag}</span>`).join("")}
          </div>
        </div>
      </div>

      <div class="card-meta">
        <div class="meta-row">
          <i class="fa-solid fa-location-dot"></i>
          <span>${opp.locationLabel}</span>
        </div>
        
        <div class="countdown-box">
          <span class="countdown-label">Registration:</span>
          <span class="countdown-timer ${countdownInfo.urgent ? 'urgent' : ''}" data-deadline="${opp.deadline}">
            ${countdownInfo.text}
          </span>
        </div>

        <a href="${opp.link}" target="_blank" class="btn ${isClosed ? 'btn-secondary' : 'btn-primary'} btn-block" style="justify-content: center; width: 100%; margin-top: 0.5rem;">
          ${isClosed ? 'View Details' : 'Register / Apply'} <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    `;

    grid.appendChild(card);
  });
}
