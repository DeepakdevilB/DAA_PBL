// API URL - Change this to match your backend URL
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const homeSection = document.getElementById('homeSection');
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const dashboardSection = document.getElementById('dashboardSection');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const homeLink = document.getElementById('homeLink');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const dashboardLink = document.getElementById('dashboardLink');
const logoutLink = document.getElementById('logoutLink');

// Additional links
const showRegisterLink = document.getElementById('showRegisterLink');
const showLoginLink = document.getElementById('showLoginLink');

// Quick Links
const examScheduleLink = document.getElementById('examScheduleLink');
const academicCalendarLink = document.getElementById('academicCalendarLink');

// Navigation Functions
function showSection(section) {
    [homeSection, loginSection, registerSection, dashboardSection].forEach(s => {
        s.classList.add('d-none');
    });
    section.classList.remove('d-none');
}

// Event Listeners for Navigation
homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(homeSection);
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(loginSection);
});

registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(registerSection);
});

dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(dashboardSection);
});

// Additional navigation event listeners
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(registerSection);
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(loginSection);
});

// Event listener for exam schedule link
examScheduleLink.addEventListener('click', (e) => {
    e.preventDefault();
    const examModal = new bootstrap.Modal(document.getElementById('examScheduleModal'));
    examModal.show();
});

// Event listener for academic calendar link
academicCalendarLink.addEventListener('click', (e) => {
    e.preventDefault();
    const calendarModal = new bootstrap.Modal(document.getElementById('academicCalendarModal'));
    calendarModal.show();
});

// Authentication Functions
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        updateUIForLoggedInUser(data.user);
        showSection(dashboardSection);
    } catch (error) {
        showError(loginForm, error.message);
    }
}

async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        showSuccess(registerForm, 'Registration successful! Please login.');
        setTimeout(() => {
            showSection(loginSection);
            registerForm.reset();
        }, 2000);
    } catch (error) {
        showError(registerForm, error.message);
    }
}

// Form Submissions
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    await login(email, password);
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        studentId: document.getElementById('studentId').value,
        course: document.getElementById('course').value
    };
    await register(userData);
});

// Logout Handler
logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIForLoggedOutUser();
    showSection(homeSection);
});

// UI Update Functions
function updateUIForLoggedInUser(user) {
    loginLink.classList.add('d-none');
    registerLink.classList.add('d-none');
    dashboardLink.classList.remove('d-none');
    logoutLink.classList.remove('d-none');

    document.getElementById('studentName').textContent = user.name;
    document.getElementById('studentEmail').textContent = user.email;
    document.getElementById('studentIdDisplay').textContent = user.studentId;
    document.getElementById('courseDisplay').textContent = user.course;

    // Show Issue Notice card only for admin
    const issueNoticeCard = document.getElementById('issueNoticeCard');
    if (user.role === 'admin') {
        issueNoticeCard.style.display = '';
    } else {
        issueNoticeCard.style.display = 'none';
    }

    // Show Issue Event card only for admin
    const issueEventCard = document.getElementById('issueEventCard');
    if (user.role === 'admin') {
        issueEventCard.style.display = '';
    } else {
        issueEventCard.style.display = 'none';
    }
}

function updateUIForLoggedOutUser() {
    loginLink.classList.remove('d-none');
    registerLink.classList.remove('d-none');
    dashboardLink.classList.add('d-none');
    logoutLink.classList.add('d-none');
}

// Helper Functions
function showError(form, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing error messages
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    form.appendChild(errorDiv);
}

function showSuccess(form, message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Remove any existing messages
    const existingMessage = form.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    form.appendChild(successDiv);
}

// Handle Issue Notice form submission (admin only)
const issueNoticeForm = document.getElementById('issueNoticeForm');
if (issueNoticeForm) {
    issueNoticeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('noticeTitle').value;
        const description = document.getElementById('noticeDescription').value;
        const date = document.getElementById('noticeDate').value;
        const priority = document.getElementById('noticePriority').value;
        const noticeFormMsg = document.getElementById('noticeFormMsg');
        noticeFormMsg.textContent = '';
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    title,
                    description,
                    date,
                    type: 'notice',
                    priority
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'Failed to issue notice');
            }
            noticeFormMsg.textContent = 'Notice issued successfully!';
            noticeFormMsg.style.color = 'green';
            issueNoticeForm.reset();
        } catch (err) {
            noticeFormMsg.textContent = err.message;
            noticeFormMsg.style.color = 'red';
        }
    });
}

// Handle Issue Event form submission (admin only)
const issueEventForm = document.getElementById('issueEventForm');
if (issueEventForm) {
    issueEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('eventTitle').value;
        const description = document.getElementById('eventDescription').value;
        const date = document.getElementById('eventDate').value;
        const eventType = document.getElementById('eventType').value;
        const eventFormMsg = document.getElementById('eventFormMsg');
        eventFormMsg.textContent = '';
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    title,
                    description,
                    date,
                    type: 'event',
                    eventType
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'Failed to issue event');
            }
            eventFormMsg.textContent = 'Event issued successfully!';
            eventFormMsg.style.color = 'green';
            issueEventForm.reset();
        } catch (err) {
            eventFormMsg.textContent = err.message;
            eventFormMsg.style.color = 'red';
        }
    });
}

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
        updateUIForLoggedInUser(user);
        showSection(dashboardSection);
    } else {
        updateUIForLoggedOutUser();
        showSection(homeSection);
    }
}); 