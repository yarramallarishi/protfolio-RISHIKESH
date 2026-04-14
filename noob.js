// ================================
// FIREBASE CONFIGURATION
// ================================
// IMPORTANT: Update this with your Firebase project details
// Get these from Firebase Console: https://console.firebase.google.com
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// ================================
// EMAIL.JS CONFIGURATION
// ================================
// IMPORTANT: Set your Email.js service ID
// Sign up at: https://www.emailjs.com
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const YOUR_EMAIL = "your.email@example.com"; // Where to send feedback

// ================================
// CLOUDFLARE PAGES CONFIGURATION
// ================================
// Analytics tracking with Cloudflare Web Analytics
function initCloudflareAnalytics() {
    if (window.location.hostname !== 'localhost') {
        // Cloudflare Web Analytics will be automatically injected
        console.log('📊 Cloudflare Web Analytics enabled');
    }
}

// Initialize Firebase (if using Firebase)
// firebase.initializeApp(firebaseConfig);

// Initialize Email.js
// emailjs.init(EMAILJS_PUBLIC_KEY);

// ================================
// DOM ELEMENTS
// ================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const authBtn = document.getElementById('authBtn');
const loginModal = document.getElementById('loginModal');
const profileModal = document.getElementById('profileModal');
const feedbackForm = document.getElementById('feedbackForm');
const emailLoginForm = document.getElementById('emailLoginForm');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// ================================
// HAMBURGER MENU
// ================================
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.style.opacity = navMenu.classList.contains('active') ? '0.5' : '1';
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.style.opacity = '1';
    });
});

// ================================
// MODAL FUNCTIONALITY
// ================================
const closeButtons = document.querySelectorAll('.close');

closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.remove('show');
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// ================================
// AUTHENTICATION
// ================================
let currentUser = null;

// Check if user is logged in on page load
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
    initializeAnimations();
    initCloudflareAnalytics();
});

authBtn.addEventListener('click', () => {
    if (currentUser) {
        profileModal.classList.add('show');
        updateProfileDisplay();
    } else {
        loginModal.classList.add('show');
    }
});

// Email Login
emailLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple mock authentication
    // In production, this would connect to a real backend
    if (email && password && validateEmail(email)) {
        currentUser = {
            email: email,
            name: email.split('@')[0],
            provider: 'email',
            uid: 'user_' + Date.now()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        loginModal.classList.remove('show');
        emailLoginForm.reset();
        showNotification('Successfully signed in!', 'success');
    } else {
        showNotification('Invalid email or password', 'error');
    }
});

// Google Sign In
function signInWithGoogle() {
    // Mock Google authentication
    currentUser = {
        name: 'Google User',
        email: 'user@gmail.com',
        provider: 'google',
        uid: 'google_' + Date.now()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    loginModal.classList.remove('show');
    showNotification('Successfully signed in with Google!', 'success');
    
    // For production, uncomment and use real Firebase:
    /*
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(result => {
            currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();
            loginModal.classList.remove('show');
            showNotification('Successfully signed in!', 'success');
        })
        .catch(error => {
            showNotification('Sign in failed: ' + error.message, 'error');
        });
    */
}

// Sign Out
function signOut() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    profileModal.classList.remove('show');
    showNotification('Successfully signed out!', 'success');
}

// Update UI based on auth state
function updateAuthUI() {
    const authLink = document.querySelector('.auth-link');
    if (currentUser) {
        authLink.textContent = `Hello, ${currentUser.name}`;
        authLink.style.background = 'linear-gradient(135deg, #43e97b, #38f9d7)';
    } else {
        authLink.textContent = 'Sign In';
        authLink.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    }
}

// Update profile display in modal
function updateProfileDisplay() {
    const profileInfo = document.getElementById('userProfileInfo');
    if (currentUser) {
        profileInfo.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
                <p style="margin: 0.5rem 0;"><strong>Name:</strong> ${currentUser.name}</p>
                <p style="margin: 0.5rem 0;"><strong>Email:</strong> ${currentUser.email}</p>
                <p style="margin: 0.5rem 0;"><strong>Provider:</strong> ${currentUser.provider}</p>
            </div>
        `;
    }
}

// ================================
// FEEDBACK FORM
// ================================
feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const formStatus = document.getElementById('formStatus');
    
    // Validate inputs
    if (!name || !email || !subject || !message) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    try {
        // For production, uncomment to use Email.js:
        /*
        const templateParams = {
            to_email: YOUR_EMAIL,
            from_name: name,
            from_email: email,
            subject: subject,
            message: message,
            date: new Date().toLocaleDateString()
        };
        
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        */
        
        // Mock implementation for demo
        console.log('Feedback received:', { name, email, subject, message });
        
        formStatus.textContent = '✓ Thank you! Your feedback has been sent successfully!';
        formStatus.style.color = '#43e97b';
        feedbackForm.reset();
        
        setTimeout(() => {
            formStatus.textContent = '';
        }, 5000);
        
    } catch (error) {
        formStatus.textContent = '✗ Error sending feedback. Please try again.';
        formStatus.style.color = '#fa709a';
        console.error('Error:', error);
    }
});

// ================================
// TAB SWITCHING
// ================================
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Hide all tabs
        tabContents.forEach(content => content.classList.remove('active'));
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        button.classList.add('active');
    });
});

// ================================
// CANVAS BACKGROUND ANIMATION
// ================================
function initializeCanvasAnimation() {
    const canvas = document.getElementById('canvas-background');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = document.querySelector('.hero').offsetHeight;
    }
    resizeCanvas();
    
    // Particle system
    const particles = [];
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity += (Math.random() - 0.5) * 0.02;
            
            if (this.opacity > 1) this.opacity = 1;
            if (this.opacity < 0) this.opacity = 0;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Create initial particles
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
}

// ================================
// ANIMATIONS ON SCROLL
// ================================
function initializeAnimations() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: false,
            mirror: true,
            offset: 100
        });
    }
    initializeCanvasAnimation();
}

// ================================
// UTILITY FUNCTIONS
// ================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: rgba(67, 233, 123, 0.2); border: 1px solid #43e97b; color: #43e97b;' : 
          type === 'error' ? 'background: rgba(250, 112, 154, 0.2); border: 1px solid #fa709a; color: #fa709a;' :
          'background: rgba(102, 126, 234, 0.2); border: 1px solid #667eea; color: #667eea;'}
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ================================
// SMOOTH SCROLL LINKS
// ================================
document.querySelectorAll('.smoothly-scroll').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ================================
// THEME DETECTION & OSC SETUP
// ================================
// Detect system theme preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDark) {
    document.documentElement.style.colorScheme = 'dark';
}

// Add some nice scroll behavior
document.documentElement.scrollBehavior = 'smooth';

// Performance optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// ================================
// ADDITIONAL EVENT LISTENERS
// ================================
// Active nav link highlighting on scroll
window.addEventListener('scroll', () => {
    let current = '';
    
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add custom CSS for active nav link
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: var(--primary-color);
    }
    .nav-link.active::after {
        width: 100%;
    }
    @keyframes slideOut {
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ================================
// CONSOLE WELCOME MESSAGE
// ================================
console.log('%c🚀 Welcome to my Portfolio!', 'font-size: 20px; color: #667eea; font-weight: bold;');
console.log('%cMade with ❤️ using modern web technologies', 'color: #764ba2; font-size: 14px;');
console.log('%c📚 Check out the source code for implementation details', 'color: #43e97b; font-size: 12px;');
