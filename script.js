// Run on initial load to apply theme *before* content loads if possible
applySavedTheme();

// Main function after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    loadAndDisplayUserData(); // Load saved name immediately (updates placeholders if they exist)
    loadSidebarAndHeader(); // Start loading partials
    // Global listeners are added *after* partials are likely loaded inside loadSidebarAndHeader's .then() chain now
});

/**
 * Checks localStorage for theme and applies 'dark-mode' class to body
 */
function applySavedTheme() {
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

/**
 * Reads name from localStorage and updates UI elements
 */
function loadAndDisplayUserData() {
    const savedName = localStorage.getItem('userName') || "User Name";
    const userInitial = savedName ? savedName.charAt(0).toUpperCase() : "U";

    // Update Sidebar (Check if elements exist before updating)
    const sidebarName = document.getElementById("sidebar-user-name");
    if (sidebarName) sidebarName.innerText = savedName;
    const sidebarIcon = document.getElementById("sidebar-profile-img");
    if (sidebarIcon) sidebarIcon.src = `https://placehold.co/100x100/d9e2f3/1f497d?text=${userInitial}`;

    // Update Header (Check if elements exist before updating)
    const headerIcon = document.getElementById("header-profile-icon");
    if (headerIcon) headerIcon.src = `https://placehold.co/100x100/d9e2f3/1f497d?text=${userInitial}`;

    // Update Home Page Welcome
    const welcomeMessage = document.getElementById("welcome-message");
    if (welcomeMessage) welcomeMessage.innerText = `Welcome back, ${savedName}!`;

    // Update Leaderboard
    const leaderboardName = document.getElementById("leaderboard-user-name");
    if (leaderboardName) leaderboardName.innerText = `${savedName} (You)`;

    // Update Settings Page Form
    const settingsNameInput = document.getElementById("full-name");
    if (settingsNameInput) settingsNameInput.value = savedName;
}

/**
 * Loads the sidebar and header partials via fetch
 * IMPORTANT: Now adds listeners *after* content is loaded.
 */
function loadSidebarAndHeader() {
    const sidebarPromise = fetch("./_sidebar.html") // Ensure ./ is present
        .then(response => {
             if (!response.ok) throw new Error(`Sidebar fetch failed: ${response.status} ${response.statusText}`);
             return response.text();
         })
        .then(data => {
            const container = document.getElementById("sidebar-container");
            if (container) container.innerHTML = data;
            setActiveSidebarLink(); // Set active link after sidebar HTML is present
            loadAndDisplayUserData(); // Update name/icon after load
        })
        .catch(error => console.error("Error loading sidebar:", error)); // Log detailed fetch error

    const headerPromise = fetch("./_header.html") // Ensure ./ is present
         .then(response => {
             if (!response.ok) throw new Error(`Header fetch failed: ${response.status} ${response.statusText}`);
             return response.text();
         })
        .then(data => {
            const container = document.getElementById("header-container");
            if (container) container.innerHTML = data;
            loadAndDisplayUserData(); // Update name/icon after load
        })
        .catch(error => console.error("Error loading header:", error)); // Log detailed fetch error

    // Wait for both fetch calls to attempt completion before adding listeners
    Promise.allSettled([sidebarPromise, headerPromise]) // Use allSettled to proceed even if one fails
        .then((results) => {
            console.log("Header and Sidebar fetch attempts completed.");
            // Log results for debugging
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Promise ${index === 0 ? 'Sidebar' : 'Header'} failed:`, result.reason);
                }
            });
            // Try adding listeners even if one failed, maybe some elements exist
            addHeaderSpecificListeners(); // Add listeners dependent on header
            addGlobalClickListeners(); // Add listeners for menus
            addSettingsListeners(); // Add settings listeners (including theme)
            addModalListeners(); // Add modal listeners
            addChatListeners(); // Add chat listeners
        });
        // Removed original .catch as allSettled handles errors differently
}


/**
 * Sets the active link in the sidebar based on current page
 */
function setActiveSidebarLink() {
    try {
        // Default to dashboard.html if root path accessed in subdirectory deployment
        let currentPage = window.location.pathname.split("/").pop() || "index.html";
        if (currentPage === "" && window.location.pathname.includes('/')) { // Check if it's the root of the repo path
             currentPage = "index.html"; // Treat repo root as landing page
        } else if (currentPage === "index.html") {
            // It actually is the landing page
        } else if (currentPage === "") {
             currentPage = "index.html"; // Fallback if split somehow returns empty on non-root
        }


        const sidebarContainer = document.getElementById("sidebar-container");
        if (!sidebarContainer) {
            console.warn("Sidebar container not found for setActiveSidebarLink");
            return;
        }

        const sidebarLinks = sidebarContainer.querySelectorAll(".sidebar-nav a");
        if(sidebarLinks.length === 0) {
             console.warn("No sidebar links found to set active state.");
             return;
        }

        sidebarLinks.forEach(link => {
            const linkPage = link.getAttribute("href");
            // Check if link target matches current page filename
             const isMatch = (linkPage === currentPage);
             // Special check for the dashboard link
             const isDashboardLink = (linkPage === "dashboard.html");
             const onDashboardPage = (currentPage === "dashboard.html");


            link.classList.remove("active"); // Remove active from all first

            if (isDashboardLink && onDashboardPage) {
                link.classList.add("active"); // Activate dashboard link specifically
            } else if (!isDashboardLink && isMatch && currentPage !== "index.html") {
                 link.classList.add("active"); // Activate other links if they match
            }
        });
    } catch (error) {
        console.error("Error in setActiveSidebarLink:", error); // Log errors
    }
}


/**
 * Utility function for showing toast notifications
 */
function showToast(message, type = "success") {
    const toast = document.getElementById("toast-notification");
    if (!toast) {
        console.error("Toast element not found!");
        return;
    }
    toast.innerText = message;
    toast.className = "toast-notification show"; // Reset classes and show
    setTimeout(() => toast.classList.remove("show"), 3000);
}

/**
 * Adds event listeners that don't depend on fetched content immediately
 */
function addGlobalListeners() {
    // Mobile Menu Toggle Logic
    document.addEventListener('change', (event) => {
        if (event.target && event.target.id === 'nav-toggle') { /* CSS handles appearance */ }
    });
    // Other specific listeners are added *after* fetch completes
}


/**
 * Adds listeners for elements INSIDE the fetched header
 */
function addHeaderSpecificListeners() {
    console.log("Attempting to add header specific listeners...");
    try { // Wrap in try...catch to prevent script halting
        // --- Search Bar & Quote Logic ---
        const searchForm = document.getElementById("search-form");
        const quoteElement = document.getElementById("header-quote");
        let currentPage = window.location.pathname.split("/").pop() || "index.html";
         if (currentPage === "") currentPage = "index.html"; // Handle root path

        const searchPages = ["dashboard.html", "courses.html"]; // Pages with search
        const quotes = [
            '“Romanticizing my study grind because success looks good on me.”',
            '“Coffee and ambition running in my veins.”',
            '"Believe you can and you\'re halfway there."',
            '“In my ‘ace this test and break hearts’ era.”',
            '"Push yourself, because no one else is going to do it for you."'
        ];

        if (searchForm && quoteElement) {
            if (searchPages.includes(currentPage)) {
                searchForm.style.display = "flex";
                quoteElement.style.display = "none";
            } else if (currentPage !== "index.html" && currentPage !== "auth.html") { // Hide search/show quote only on dashboard pages
                searchForm.style.display = "none";
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                quoteElement.innerText = randomQuote;
                quoteElement.style.display = "block";
            } else { // On index.html or auth.html, hide both
                 searchForm.style.display = "none";
                 quoteElement.style.display = "none";
            }
        } else {
            console.warn("Search form or quote element not found during listener setup.");
        }
        if (searchForm) {
            const searchInput = document.getElementById("search-input");
            if (searchInput) {
                 searchForm.addEventListener("submit", (event) => { event.preventDefault(); const query = searchInput.value.trim(); if (query) { const youtubeURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`; window.open(youtubeURL, "_blank"); searchInput.value = ""; }});
            } else {
                 console.warn("Search input not found.");
            }
        }

        // --- Profile Dropdown Logic ---
        const profileIcon = document.getElementById("header-profile-icon");
        const profileMenu = document.getElementById("profile-dropdown-menu");
        if (profileIcon && profileMenu) {
            profileIcon.addEventListener("click", (event) => {
                event.stopPropagation();
                closeMenuIfOpen(document.getElementById("notification-dropdown-menu"));
                profileMenu.classList.toggle("show");
            });
            console.log("Profile dropdown listener added.");
        } else {
            console.warn("Profile icon or menu not found for listener setup.");
        }

        // --- Notification Dropdown Logic ---
        const notificationIcon = document.getElementById("notification-icon");
        const notificationMenu = document.getElementById("notification-dropdown-menu");
        if (notificationIcon && notificationMenu) {
            notificationIcon.addEventListener("click", (event) => {
                event.stopPropagation();
                closeMenuIfOpen(profileMenu);
                notificationMenu.classList.toggle("show");
            });
            console.log("Notification dropdown listener added.");
        } else {
            console.warn("Notification icon or menu not found for listener setup.");
        }


        // --- Log Out Logic ---
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (event) => {
                event.preventDefault();
                localStorage.removeItem('userName');
                localStorage.removeItem('theme'); // Also clear theme on logout
                window.location.href = 'index.html'; // Go back to landing (index.html)
            });
            console.log("Logout listener added.");
        } else {
            console.warn("Logout button not found for listener setup.");
        }
    } catch (error) {
        console.error("Error adding header specific listeners:", error);
    }
}

/**
* Adds global click listeners (like closing menus) after elements exist
*/
function addGlobalClickListeners() {
     console.log("Adding global click listener for menus.");
    // --- Generic Click Outside to Close Menus ---
    window.addEventListener("click", (event) => {
        // Find elements *inside* the listener to ensure they exist
        const profileIcon = document.getElementById("header-profile-icon");
        const profileMenu = document.getElementById("profile-dropdown-menu");
        const notificationIcon = document.getElementById("notification-icon");
        const notificationMenu = document.getElementById("notification-dropdown-menu");

        closeMenuIfOpen(profileMenu, profileIcon, event.target);
        closeMenuIfOpen(notificationMenu, notificationIcon, event.target);
    });
}


/**
 * Helper function to close a menu if it's open and click was outside
 */
function closeMenuIfOpen(menuElement, triggerElement = null, target = null) {
    // Only proceed if the menu element exists and is shown
    if (menuElement && menuElement.classList.contains("show")) {
        let clickedOutside = true;
        // If trigger and target exist, check if click was on/inside them
        if (triggerElement && target && (triggerElement.contains(target) || menuElement.contains(target))) {
            clickedOutside = false;
        }
        // If click was outside, or if called without target (e.g., from other menu click)
        if (clickedOutside || !target) {
            menuElement.classList.remove("show");
        }
    }
}

/**
 * Adds listeners related to the settings page form and theme toggle
 */
function addSettingsListeners() {
     console.log("Attempting to add settings listeners...");
    // --- Settings Save Logic ---
    const settingsForm = document.getElementById("settings-form");
    if (settingsForm) {
        settingsForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const newName = document.getElementById("full-name").value.trim();
            if (newName) {
                localStorage.setItem('userName', newName);
                loadAndDisplayUserData();
                showToast("Changes saved successfully! ✅");
            } else {
                alert("Name cannot be empty.");
            }
        });
        console.log("Settings form listener added.");
    }

    // --- Dark Mode Toggle Logic ---
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        // Set initial state based on applied theme
        themeSwitch.checked = document.body.classList.contains('dark-mode');

        themeSwitch.addEventListener('change', function(event) {
            if (event.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark'); // Save preference
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light'); // Save preference
            }
        });
        console.log("Theme switch listener added.");
    }
}

/**
 * Adds listeners related to the submission modal
 */
function addModalListeners() {
     console.log("Attempting to add modal listeners...");
    const modal = document.getElementById("submission-modal");
    if (modal) {
        const closeModalBtn = modal.querySelector(".modal-close-btn");
        const submissionForm = document.getElementById("submission-form");

        function openModal(event) { event.preventDefault(); modal.style.display = "grid"; setTimeout(() => modal.classList.add("show"), 10); }
        function closeModal() { modal.classList.remove("show"); setTimeout(() => (modal.style.display = "none"), 300); }

        // Use event delegation on document for potentially dynamic triggers
        document.addEventListener("click", (event) => {
            if (event.target.matches(".js-open-modal")) { // Use matches for reliability
                 openModal(event);
            }
        });

        if(closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
        if(submissionForm) submissionForm.addEventListener("submit", (event) => { event.preventDefault(); const fileInput = document.getElementById("file-upload"); if (fileInput.value) { closeModal(); showToast("File Submitted! ✅"); fileInput.value = ""; } else { alert("Please choose a file to submit."); }});
        console.log("Modal listeners added.");
    } else {
         console.warn("Submission modal element not found.");
    }
}

/**
 * Adds listeners related to the chat popup
 */
function addChatListeners() {
     console.log("Attempting to add chat listeners...");
    const chatToggleBtn = document.getElementById("chat-toggle-btn");
    const chatPopup = document.getElementById("chat-popup");
    if (chatToggleBtn && chatPopup) {
        const chatForm = document.getElementById("chat-input-form");
        const chatInput = document.getElementById("chat-input");
        const chatMessages = document.getElementById("chat-messages");

        chatToggleBtn.addEventListener("click", () => chatPopup.classList.toggle("show"));
        if(chatForm && chatInput && chatMessages) {
            chatForm.addEventListener("submit", (event) => { event.preventDefault(); const userMessage = chatInput.value.trim(); if (userMessage) { addChatMessage(userMessage, "user-message", chatMessages); chatInput.value = ""; setTimeout(() => sendBotResponse(chatMessages), 1200); }});
            console.log("Chat form listener added.");
        } else {
            console.warn("Chat form, input, or messages element not found.");
        }
    } else {
        console.warn("Chat toggle button or popup element not found.");
    }
}

// Helper function specific to chat
function addChatMessage(text, className = "", messagesContainer) {
    if(!messagesContainer) {
         console.error("Chat messages container not provided for addChatMessage.");
         return;
     }
    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble");
    if (className) bubble.classList.add(className);
    bubble.innerText = text;
    messagesContainer.appendChild(bubble);
    requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}
// Helper function specific to chat
function sendBotResponse(messagesContainer) {
    addChatMessage("Sorry, I am just a demo bot! I can't provide real responses just yet.", "", messagesContainer);
}

