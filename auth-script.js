document.addEventListener("DOMContentLoaded", () => {
    
    // Get all the elements we need
    const loginBox = document.getElementById("login-box");
    const signupBox = document.getElementById("signup-box");
    
    const showSignupBtn = document.getElementById("show-signup");
    const showLoginBtn = document.getElementById("show-login");
    
    const signupForm = document.getElementById("signup-form");
    const signupNameInput = document.getElementById("signup-name");

    // --- 1. Toggle Forms ---
    
    // When "Sign Up" is clicked, hide login and show signup
    showSignupBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Stop the '#' link from jumping
        loginBox.style.display = "none";
        signupBox.style.display = "block";
    });

    // When "Login" is clicked, hide signup and show login
    showLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        signupBox.style.display = "none";
        loginBox.style.display = "block";
    });

    // --- 2. Handle Signup & Save Name ---
    
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Stop the form from submitting normally
        
        // Get the name from the input
        const userName = signupNameInput.value.trim();
        
        if (userName) {
            // Save the name to localStorage!
            localStorage.setItem('userName', userName);
            
            // Now, redirect to the dashboard
            window.location.href = 'index.html';
        }
    });

});