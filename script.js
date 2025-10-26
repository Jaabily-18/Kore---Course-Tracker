// Run on initial load to apply theme *before* content loads if possible
applySavedTheme();

// Main function after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    loadAndDisplayUserData();
    loadSidebarAndHeader();
    addGlobalListeners();
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

    // Update Sidebar
    const sidebarName = document.getElementById("sidebar-user-name");
    if (sidebarName) sidebarName.innerText = savedName;
    const sidebarIcon = document.getElementById("sidebar-profile-img");
    if (sidebarIcon) sidebarIcon.src = `https://placehold.co/100x100/d9e2f3/1f497d?text=${userInitial}`; // Using default colors for placeholder

    // Update Header
    const headerIcon = document.getElementById("header-profile-icon");
    if (headerIcon) headerIcon.src = `https://placehold.co/100x100/d9e2f3/1f497d?text=${userInitial}`; // Using default colors for placeholder

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
 */
function loadSidebarAndHeader() {
    let sidebarLoaded = false;
    let headerLoaded = false;

    const checkAndAddListeners = () => {
        if (sidebarLoaded && headerLoaded) {
            addHeaderSpecificListeners(); // Add listeners dependent on header
            addGlobalClickListeners(); // Add listeners for menus
            addSettingsListeners(); // Add settings listeners (including theme)
            addModalListeners(); // Add modal listeners
            addChatListeners(); // Add chat listeners
            setActiveSidebarLink(); // Ensure sidebar link is set after HTML is in place
        }
    };

    // Load Sidebar
    fetch("_sidebar.html")
        .then(response => response.ok ? response.text() : Promise.reject('Sidebar not found'))
        .then(data => {
            const container = document.getElementById("sidebar-container");
            if (container) container.innerHTML = data;
            loadAndDisplayUserData(); // Update name/icon after load
            sidebarLoaded = true;
            checkAndAddListeners();
        })
        .catch(error => console.error("Error loading sidebar:", error));

    // Load Header
    fetch("_header.html")
        .then(response => response.ok ? response.text() : Promise.reject('Header not found'))
        .then(data => {
            const container = document.getElementById("header-container");
            if (container) container.innerHTML = data;
            loadAndDisplayUserData(); // Update name/icon after load
            headerLoaded = true;
            checkAndAddListeners();
        })
        .catch(error => console.error("Error loading header:", error));
}


/**
 * Sets the active link in the sidebar based on current page
 */
function setActiveSidebarLink() {
    try {
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        const sidebarLinks = document.querySelectorAll("#sidebar-container .sidebar-nav a");

        sidebarLinks.forEach(link => {
            const linkPage = link.getAttribute("href");
            const onIndex = (currentPage === "index.html");

            link.classList.remove("active"); // Remove active from all first
            if ((linkPage === "index.html" && onIndex) || (linkPage === currentPage && !onIndex)) {
                link.classList.add("active");
            }
        });
    } catch (error) {
        console.warn("Could not set active sidebar link:", error);
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
 * Adds event listeners that need the header to be loaded.
 */
function addHeaderSpecificListeners() {
    // --- Search Bar & Quote Logic ---
    const searchForm = document.getElementById("search-form");
    const quoteElement = document.getElementById("header-quote");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const searchPages = ["index.html", "courses.html"];
    const quotes = [ /* Your quotes list */
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
        } else {
            searchForm.style.display = "none";
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            quoteElement.innerText = randomQuote;
            quoteElement.style.display = "block";
        }
    }
    if (searchForm) {
        const searchInput = document.getElementById("search-input");
        searchForm.addEventListener("submit", (event) => { /* ... search logic ... */ event.preventDefault(); const query = searchInput.value.trim(); if (query) { const youtubeURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`; window.open(youtubeURL, "_blank"); searchInput.value = ""; }});
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
    }

    // --- Log Out Logic ---
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem('userName');
            localStorage.removeItem('theme'); // Also clear theme on logout
            window.location.href = 'landing.html';
        });
    }
}

/**
 * Adds global click listeners (like closing menus)
 */
function addGlobalClickListeners() {
    // --- Generic Click Outside to Close Menus ---
    window.addEventListener("click", (event) => {
        // Need to find elements again as they might not exist when listener is added
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
    if (menuElement && menuElement.classList.contains("show")) {
        let clickedOutside = true;
        if (triggerElement && target && (triggerElement.contains(target) || menuElement.contains(target))) {
            clickedOutside = false;
        }
        if (clickedOutside || !target) { // If target is null, close unconditionally
            menuElement.classList.remove("show");
        }
    }
}

/**
 * Adds listeners related to the settings page form and theme toggle
 */
function addSettingsListeners() {
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
    }
}

/**
 * Adds listeners related to the submission modal
 */
function addModalListeners() {
    const modal = document.getElementById("submission-modal");
    if (modal) {
        const closeModalBtn = modal.querySelector(".modal-close-btn");
        const submissionForm = document.getElementById("submission-form");

        function openModal(event) { event.preventDefault(); modal.style.display = "grid"; setTimeout(() => modal.classList.add("show"), 10); }
        function closeModal() { modal.classList.remove("show"); setTimeout(() => (modal.style.display = "none"), 300); }

        document.addEventListener("click", (event) => {
            if (event.target.classList.contains("js-open-modal")) openModal(event);
        });
        if(closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
        if(submissionForm) submissionForm.addEventListener("submit", (event) => { event.preventDefault(); const fileInput = document.getElementById("file-upload"); if (fileInput.value) { closeModal(); showToast("File Submitted! ✅"); fileInput.value = ""; } else { alert("Please choose a file to submit."); }});
    }
}

/**
 * Adds listeners related to the chat popup
 */
function addChatListeners() {
    const chatToggleBtn = document.getElementById("chat-toggle-btn");
    const chatPopup = document.getElementById("chat-popup");
    if (chatToggleBtn && chatPopup) {
        const chatForm = document.getElementById("chat-input-form");
        const chatInput = document.getElementById("chat-input");
        const chatMessages = document.getElementById("chat-messages");

        chatToggleBtn.addEventListener("click", () => chatPopup.classList.toggle("show"));
        if(chatForm && chatInput && chatMessages) {
             chatForm.addEventListener("submit", (event) => { event.preventDefault(); const userMessage = chatInput.value.trim(); if (userMessage) { addChatMessage(userMessage, "user-message", chatMessages); chatInput.value = ""; setTimeout(() => sendBotResponse(chatMessages), 1200); }});
        }
    }
}

// Helper function specific to chat (could be inside addChatListeners if preferred)
function addChatMessage(text, className = "", messagesContainer) {
     if(!messagesContainer) return;
    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble");
    if (className) bubble.classList.add(className);
    bubble.innerText = text;
    messagesContainer.appendChild(bubble);
    // Ensure scroll happens after message is added
    requestAnimationFrame(() => {
         messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}
// Helper function specific to chat
function sendBotResponse(messagesContainer) {
    addChatMessage("Sorry, I am just a demo bot! I can't provide real responses just yet.", "", messagesContainer);
}