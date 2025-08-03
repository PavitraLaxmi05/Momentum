// Main JavaScript file for Momentum platform

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    initThemeToggle();
    
    // Initialize any carousels on the page
    initCarousels();
    
    // Initialize form validation if forms exist
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', validateForm);
    });
});

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Change the icons inside the button based on previous settings
    if (localStorage.getItem('color-theme') === 'dark' || 
        (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        themeToggleLightIcon.classList.remove('hidden');
        document.documentElement.classList.add('dark');
    } else {
        themeToggleDarkIcon.classList.remove('hidden');
        document.documentElement.classList.remove('dark');
    }

    // Add event listener to toggle button
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            // Toggle icons
            themeToggleDarkIcon.classList.toggle('hidden');
            themeToggleLightIcon.classList.toggle('hidden');
            
            // If set via local storage previously
            if (localStorage.getItem('color-theme')) {
                if (localStorage.getItem('color-theme') === 'light') {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('color-theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('color-theme', 'light');
                }
            } else {
                // If not set via local storage previously
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('color-theme', 'light');
                } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('color-theme', 'dark');
                }
            }
        });
    }
}

/**
 * Initialize carousels on the page
 */
function initCarousels() {
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
        const items = carousel.querySelectorAll('.carousel-item');
        const nextBtn = carousel.querySelector('.carousel-next');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const indicators = carousel.querySelectorAll('.carousel-indicator');
        
        let currentIndex = 0;
        
        // Function to update carousel display
        const updateCarousel = () => {
            items.forEach((item, index) => {
                if (index === currentIndex) {
                    item.classList.remove('hidden');
                    item.classList.add('animate-fadeIn');
                } else {
                    item.classList.add('hidden');
                    item.classList.remove('animate-fadeIn');
                }
            });
            
            // Update indicators if they exist
            if (indicators.length > 0) {
                indicators.forEach((indicator, index) => {
                    if (index === currentIndex) {
                        indicator.classList.add('bg-green-500');
                        indicator.classList.remove('bg-gray-300');
                    } else {
                        indicator.classList.remove('bg-green-500');
                        indicator.classList.add('bg-gray-300');
                    }
                });
            }
        };
        
        // Initialize carousel
        updateCarousel();
        
        // Add event listeners to controls if they exist
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % items.length;
                updateCarousel();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                updateCarousel();
            });
        }
        
        // Add event listeners to indicators if they exist
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });
        
        // Auto-rotate carousel if it has the auto-rotate class
        if (carousel.classList.contains('auto-rotate')) {
            const interval = parseInt(carousel.dataset.interval) || 5000;
            
            setInterval(() => {
                currentIndex = (currentIndex + 1) % items.length;
                updateCarousel();
            }, interval);
        }
    });
}

/**
 * Validate form inputs before submission
 * @param {Event} event - The form submission event
 */
function validateForm(event) {
    const form = event.target;
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    // Remove any existing error messages
    const existingErrors = form.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    // Check each required field
    requiredFields.forEach(field => {
        field.classList.remove('border-red-500');
        
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('border-red-500');
            
            // Add error message
            const errorMessage = document.createElement('p');
            errorMessage.classList.add('text-red-500', 'text-sm', 'mt-1', 'error-message');
            errorMessage.textContent = 'This field is required';
            field.parentNode.appendChild(errorMessage);
        } else if (field.type === 'email' && !isValidEmail(field.value)) {
            isValid = false;
            field.classList.add('border-red-500');
            
            // Add error message
            const errorMessage = document.createElement('p');
            errorMessage.classList.add('text-red-500', 'text-sm', 'mt-1', 'error-message');
            errorMessage.textContent = 'Please enter a valid email address';
            field.parentNode.appendChild(errorMessage);
        } else if (field.type === 'password' && field.dataset.minLength && field.value.length < parseInt(field.dataset.minLength)) {
            isValid = false;
            field.classList.add('border-red-500');
            
            // Add error message
            const errorMessage = document.createElement('p');
            errorMessage.classList.add('text-red-500', 'text-sm', 'mt-1', 'error-message');
            errorMessage.textContent = `Password must be at least ${field.dataset.minLength} characters`;
            field.parentNode.appendChild(errorMessage);
        }
    });
    
    // Check password confirmation if it exists
    const password = form.querySelector('input[type="password"][name="password"]');
    const confirmPassword = form.querySelector('input[type="password"][name="confirm_password"]');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        isValid = false;
        confirmPassword.classList.add('border-red-500');
        
        // Add error message
        const errorMessage = document.createElement('p');
        errorMessage.classList.add('text-red-500', 'text-sm', 'mt-1', 'error-message');
        errorMessage.textContent = 'Passwords do not match';
        confirmPassword.parentNode.appendChild(errorMessage);
    }
    
    if (!isValid) {
        event.preventDefault();
    }
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Initialize the comic viewer functionality
 * @param {string} videoId - The ID of the video element
 */
function initComicViewer(videoId) {
    const video = document.getElementById(videoId);
    const playBtn = document.getElementById(`${videoId}-play`);
    const pauseBtn = document.getElementById(`${videoId}-pause`);
    const restartBtn = document.getElementById(`${videoId}-restart`);
    
    if (video && playBtn && pauseBtn && restartBtn) {
        playBtn.addEventListener('click', () => {
            video.play();
        });
        
        pauseBtn.addEventListener('click', () => {
            video.pause();
        });
        
        restartBtn.addEventListener('click', () => {
            video.currentTime = 0;
            video.play();
        });
        
        // Update button states based on video state
        video.addEventListener('play', () => {
            playBtn.disabled = true;
            pauseBtn.disabled = false;
        });
        
        video.addEventListener('pause', () => {
            playBtn.disabled = false;
            pauseBtn.disabled = true;
        });
        
        video.addEventListener('ended', () => {
            playBtn.disabled = false;
            pauseBtn.disabled = true;
        });
    }
}

/**
 * Initialize Chart.js charts
 * @param {string} chartId - The ID of the canvas element
 * @param {string} chartType - The type of chart to create
 * @param {Object} chartData - The data for the chart
 * @param {Object} chartOptions - The options for the chart
 */
function initChart(chartId, chartType, chartData, chartOptions = {}) {
    const ctx = document.getElementById(chartId);
    
    if (ctx) {
        new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: chartOptions
        });
    }
}

/**
 * Initialize search functionality using Fuse.js
 * @param {Array} items - The items to search through
 * @param {Array} keys - The keys to search in
 * @param {string} inputId - The ID of the search input element
 * @param {string} resultsId - The ID of the element to display results in
 */
function initSearch(items, keys, inputId, resultsId) {
    const searchInput = document.getElementById(inputId);
    const searchResults = document.getElementById(resultsId);
    
    if (searchInput && searchResults && items && keys) {
        const options = {
            keys: keys,
            threshold: 0.3
        };
        
        const fuse = new Fuse(items, options);
        
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value;
            
            if (value.length < 2) {
                searchResults.innerHTML = '';
                return;
            }
            
            const results = fuse.search(value);
            displaySearchResults(results, searchResults);
        });
    }
}

/**
 * Display search results in the specified element
 * @param {Array} results - The search results
 * @param {HTMLElement} container - The container to display results in
 */
function displaySearchResults(results, container) {
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 py-4">No results found</p>';
        return;
    }
    
    results.forEach(result => {
        const item = result.item;
        const div = document.createElement('div');
        div.classList.add('p-4', 'border-b', 'border-gray-200', 'dark:border-gray-700');
        
        // Create content based on item structure
        // This is a generic example, adjust based on your actual data structure
        div.innerHTML = `
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">${item.title || item.name}</h3>
            <p class="text-gray-500 dark:text-gray-400">${item.description || ''}</p>
        `;
        
        container.appendChild(div);
    });
}