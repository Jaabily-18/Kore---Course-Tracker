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
        const sidebarPromise = fetch("./_sidebar.html") // MODIFIED: Added ./
            .then(response => response.ok ? response.text() : Promise.reject('Sidebar not found'))
            .then(data => {
                const container = document.getElementById("sidebar-container");
                if (container) container.innerHTML = data;
                setActiveSidebarLink(); // Set active link after sidebar HTML is present
                loadAndDisplayUserData(); // Update name/icon after load
            })
            .catch(error => console.error("Error loading sidebar:", error));

        const headerPromise = fetch("./_header.html") // MODIFIED: Added ./
            .then(response => response.ok ? response.text() : Promise.reject('Header not found'))
            .then(data => {
                const container = document.getElementById("header-container");
                if (container) container.innerHTML = data;
                loadAndDisplayUserData(); // Update name/icon after load
            })
            .catch(error => console.error("Error loading header:", error));

        // Wait for both fetch calls to complete before adding listeners
        // that depend on the fetched content
        Promise.all([sidebarPromise, headerPromise])
            .then(() => {
                console.log("Header and Sidebar loaded, adding listeners.");
                addHeaderSpecificListeners(); // Add listeners dependent on header
                addGlobalClickListeners(); // Add listeners for menus
                addSettingsListeners(); // Add settings listeners (including theme)
                addModalListeners(); // Add modal listeners
                addChatListeners(); // Add chat listeners
            })
            .catch(error => {
                console.error("Error loading partials, listeners might not be added correctly:", error);
            });
    }


    /**
     * Sets the active link in the sidebar based on current page
     */
    function setActiveSidebarLink() {
        try {
            const currentPage = window.location.pathname.split("/").pop() || "index.html";
            // Make sure sidebar container exists before query
            const sidebarContainer = document.getElementById("sidebar-container");
            if (!sidebarContainer) return;

            const sidebarLinks = sidebarContainer.querySelectorAll(".sidebar-nav a");

            sidebarLinks.forEach(link => {
                const linkPage = link.getAttribute("href");
                // Adjust comparison for dashboard.html being the 'home' page
                const onDashboard = (currentPage === "dashboard.html");

                link.classList.remove("active"); // Remove active from all first
                if ((linkPage === "dashboard.html" && onDashboard) || (linkPage === currentPage && !onDashboard && currentPage !== "index.html")) {
                     link.classList.add("active");
                }
                 // Special case for index.html (landing page) if needed, but sidebar shouldn't be there.
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
     * Adds event listeners that don't depend on fetched content immediately
     * (Listeners dependent on fetched content are added later)
     */
    function addGlobalListeners() {
        // Mobile Menu Toggle Logic - Listens on document, safe to add early
        document.addEventListener('change', (event) => {
            if (event.target && event.target.id === 'nav-toggle') { /* CSS handles appearance */ }
        });

        // Other listeners (modal, chat, settings) are added *after* fetch completes
        // in the Promise.all().then() block within loadSidebarAndHeader.
    }


    /**
     * Adds listeners for elements INSIDE the fetched header
     */
    function addHeaderSpecificListeners() {
        console.log("Attempting to add header specific listeners...");
        // --- Search Bar & Quote Logic ---
        const searchForm = document.getElementById("search-form");
        const quoteElement = document.getElementById("header-quote");
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        const searchPages = ["dashboard.html", "courses.html"]; // Updated to dashboard.html
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
            } else {
                searchForm.style.display = "none";
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                quoteElement.innerText = randomQuote;
                quoteElement.style.display = "block";
            }
        } else {
            console.log("Search form or quote element not found yet.");
        }
        if (searchForm) {
            const searchInput = document.getElementById("search-input");
             searchForm.addEventListener("submit", (event) => { event.preventDefault(); const query = searchInput.value.trim(); if (query) { const youtubeURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`; window.open(youtubeURL, "_blank"); searchInput.value = ""; }});
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
            console.log("Profile icon or menu not found yet for listener.");
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
            console.log("Notification icon or menu not found yet for listener.");
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
             console.log("Logout button not found yet for listener.");
        }
    }

    /**
    * Adds global click listeners (like closing menus) after elements exist
    */
    function addGlobalClickListeners() {
        // --- Generic Click Outside to Close Menus ---
        window.addEventListener("click", (event) => {
            // Need to find elements again as they might not exist when listener is added initially
            const profileIcon = document.getElementById("header-profile-icon");
            const profileMenu = document.getElementById("profile-dropdown-menu");
            const notificationIcon = document.getElementById("notification-icon");
            const notificationMenu = document.getElementById("notification-dropdown-menu");

            closeMenuIfOpen(profileMenu, profileIcon, event.target);
            closeMenuIfOpen(notificationMenu, notificationIcon, event.target);
        });
        console.log("Global click listener for closing menus added.");
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
            if (clickedOutside || !target) {
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

            // Use event delegation on the document for dynamically added content if needed,
            // but direct binding is fine if the trigger elements exist on initial load.
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

    // Helper function specific to chat (make sure it's accessible or defined within addChatListeners)
    function addChatMessage(text, className = "", messagesContainer) {
        if(!messagesContainer) return;
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
    ```
