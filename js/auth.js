// UI Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Initialize particles.js if on auth page
    if (document.getElementById('particles-js')) {
        initParticles();
    }

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Signup Form
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitButton = signupForm.querySelector('button[type="submit"]');
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            // Basic validation
            if (!username || !email || !password) {
                showErrorAnimation(signupForm);
                showErrorMessage("Please fill in all fields");
                return;
            }

            showLoadingAnimation(submitButton);
            
            try {
                const result = await firebaseSignUp(email, password, username);
                if (result.success) {
                    console.log('Signup successful in UI');
                    showSuccessAnimation(submitButton, "Account Created!");
                    // Wait for animation to complete before redirect
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    window.location.href = '/app/chat.html';
                } else {
                    resetButtonState(submitButton, "Create Account");
                    showErrorAnimation(signupForm);
                    showErrorMessage(result.error);
                }
            } catch (error) {
                console.error('UI Signup error:', error);
                resetButtonState(submitButton, "Create Account");
                showErrorAnimation(signupForm);
                showErrorMessage("An unexpected error occurred. Please try again.");
            }
        });
    }

    // Login Form
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            // Basic validation
            if (!email || !password) {
                showErrorAnimation(loginForm);
                showErrorMessage("Please fill in all fields");
                return;
            }

            showLoadingAnimation(submitButton);
            
            try {
                const result = await firebaseLogin(email, password);
                if (result.success) {
                    console.log('Login successful in UI');
                    showSuccessAnimation(submitButton, "Logged In!");
                    // Wait for animation to complete before redirect
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    window.location.href = '/app/chat.html';
                } else {
                    resetButtonState(submitButton, "Login");
                    showErrorAnimation(loginForm);
                    showErrorMessage(result.error);
                }
            } catch (error) {
                console.error('UI Login error:', error);
                resetButtonState(submitButton, "Login");
                showErrorAnimation(loginForm);
                showErrorMessage("An unexpected error occurred. Please try again.");
            }
        });
    }

    // Forgot Password Modal Handling
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const forgotPasswordModal = document.getElementById("forgot-password-modal");
    const forgotPasswordForm = document.getElementById("forgot-password-form");
    const backToLogin = document.getElementById("back-to-login");
    const closeModalButtons = document.querySelectorAll(".close-modal");

    const toggleModal = (modal, show) => {
        if (show) {
            modal.classList.add("active");
            document.body.style.overflow = 'hidden';
        } else {
            modal.classList.remove("active");
            document.body.style.overflow = '';
        }
    };

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (e) => {
            e.preventDefault();
            toggleModal(forgotPasswordModal, true);
        });
    }

    if (backToLogin) {
        backToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            toggleModal(forgotPasswordModal, false);
        });
    }

    closeModalButtons.forEach(button => {
        button.addEventListener("click", () => {
            toggleModal(forgotPasswordModal, false);
        });
    });

    document.addEventListener("click", (e) => {
        if (e.target === forgotPasswordModal) {
            toggleModal(forgotPasswordModal, false);
        }
    });

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
            const email = document.getElementById("reset-email").value.trim();
            
            // Validate email format
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showErrorAnimation(forgotPasswordForm);
                showErrorMessage("Please enter a valid email address");
                return;
            }
            
            showLoadingAnimation(submitButton);
            
            try {
                const result = await firebaseSendPasswordReset(email);
                if (result.success) {
                    showSuccessAnimation(submitButton, "Email Sent!");
                    showSuccessMessage(result.message);
                    setTimeout(() => {
                        toggleModal(forgotPasswordModal, false);
                        resetButtonState(submitButton, "Send Reset Link");
                        forgotPasswordForm.reset();
                    }, 1500);
                } else {
                    resetButtonState(submitButton, "Send Reset Link");
                    showErrorAnimation(forgotPasswordForm);
                    showErrorMessage(result.error);
                }
            } catch (error) {
                console.error('UI Password reset error:', error);
                resetButtonState(submitButton, "Send Reset Link");
                showErrorAnimation(forgotPasswordForm);
                showErrorMessage("An unexpected error occurred. Please try again.");
            }
        });
    }
});

// Animation functions
function showLoadingAnimation(button) {
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;
}

function showSuccessAnimation(button, message) {
    button.innerHTML = `<i class="fas fa-check"></i> ${message}`;
    button.style.backgroundColor = '#4BB543';
    button.disabled = true;
}

function resetButtonState(button, text) {
    button.innerHTML = text;
    button.style.backgroundColor = '';
    button.disabled = false;
}

function showErrorAnimation(form) {
    form.classList.add('shake');
    setTimeout(() => {
        form.classList.remove('shake');
    }, 500);
}

function showErrorMessage(message) {
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#ff3333';
    errorElement.style.marginTop = '15px';
    errorElement.style.textAlign = 'center';
    errorElement.style.animation = 'fadeIn 0.3s ease-out';

    const form = document.querySelector('form');
    form.appendChild(errorElement);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorElement.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            errorElement.remove();
        }, 300);
    }, 5000);
}

function showSuccessMessage(message) {
    // Remove any existing success messages
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }

    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    successElement.style.color = '#4BB543';
    successElement.style.marginTop = '15px';
    successElement.style.textAlign = 'center';
    successElement.style.animation = 'fadeIn 0.3s ease-out';

    const form = document.querySelector('form');
    form.appendChild(successElement);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        successElement.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            successElement.remove();
        }, 300);
    }, 5000);
}

// Particles.js initialization
function initParticles() {
    particlesJS('particles-js', {
        "particles": {
            "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#6C63FF" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.3, "random": true },
            "size": { "value": 3, "random": true },
            "line_linked": { "enable": true, "distance": 150, "color": "#6C63FF", "opacity": 0.2, "width": 1 },
            "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": { "enable": true, "mode": "repulse" },
                "onclick": { "enable": true, "mode": "push" },
                "resize": true
            },
            "modes": {
                "repulse": { "distance": 100, "duration": 0.4 },
                "push": { "particles_nb": 4 }
            }
        },
        "retina_detect": true
    });
}