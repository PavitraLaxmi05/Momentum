/**
 * GreenSwap Network JavaScript
 * Handles trade creation, points calculation, and profile updates
 */

// Constants for category points
const CATEGORY_POINTS = {
    'Vegetables': 10,
    'Fruits': 10,
    'Organic Waste': 12,
    'Solar Energy': 15,
    'Homemade Products': 20,
    'Other': 5
};

// Badge thresholds
const BADGE_THRESHOLDS = {
    'Vegetables': 200,
    'Fruits': 200,
    'Organic Waste': 200,
    'Solar Energy': 200,
    'Homemade Products': 200,
    'Other': 200
};

// Badge names
const BADGE_NAMES = {
    'Vegetables': 'Veggie Master',
    'Fruits': 'Fruit Champion',
    'Organic Waste': 'Compost King',
    'Solar Energy': 'Energy Innovator',
    'Homemade Products': 'Craft Artisan',
    'Other': 'Eco Explorer'
};

document.addEventListener('DOMContentLoaded', function() {
    // Load user profile data
    loadUserProfile();
    
    // Initialize the create trade form
    initCreateTradeForm();
    
    // Load existing trades from local storage
    loadTrades();
    
    // Add event listeners
    document.getElementById('create-trade-button').addEventListener('click', toggleCreateTradeForm);
    
    const tradeForm = document.getElementById('trade-form');
    if (tradeForm) {
        tradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitTradeForm();
        });
    }
    
    // Add event listeners for adding multiple offerings/seeking items
    const addOfferingBtn = document.getElementById('add-offering');
    if (addOfferingBtn) {
        addOfferingBtn.addEventListener('click', addOfferingField);
    }
    
    const addSeekingBtn = document.getElementById('add-seeking');
    if (addSeekingBtn) {
        addSeekingBtn.addEventListener('click', addSeekingField);
    }
    
    // Add event listener for category selection to update points
    const categorySelect = document.getElementById('trade-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', updateCategoryPoints);
    }
    
    // Add event listener for trade form submission
    const tradeFormSubmit = document.getElementById('trade-form-submit');
    if (tradeFormSubmit) {
        tradeFormSubmit.addEventListener('click', handleTradeFormSubmit);
    }
    
    // Initialize leaderboard
    updateLeaderboard();
    
    // Check for badge awards on load
    checkForBadgeAwards();
    
    // Add event listener for cancel button
    const cancelBtn = document.getElementById('cancel-trade-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCreateTradeForm();
        });
    }
});

/**
 * Load user profile data for the trade form
 */
function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // Update profile card with user data
    updateProfileCard(user);
    
    // Auto-populate trade form with user profile details
    const tradeUsername = document.getElementById('trade-username');
    const tradeFullname = document.getElementById('trade-fullname');
    const tradeLocation = document.getElementById('trade-location');
    const tradePoints = document.getElementById('trade-points');
    const tradeContact = document.getElementById('trade-contact');
    
    if (tradeUsername) tradeUsername.value = user.username || '';
    if (tradeFullname) tradeFullname.value = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (tradeLocation) tradeLocation.value = user.location || '';
    if (tradePoints) tradePoints.value = user.sustainabilityScore || 0;
    if (tradeContact) tradeContact.value = user.email || '';
}

/**
 * Update the profile card with user data
 */
function updateProfileCard(user) {
    // Update profile picture
    const profilePic = document.querySelector('.user-profile-card .h-20.w-20 img');
    if (profilePic) {
        profilePic.src = user.profilePicture || '../public/images/default-avatar.png';
    }
    
    // Update username
    const username = document.querySelector('.user-profile-card h2');
    if (username) {
        username.textContent = `${user.firstName || ''} ${user.lastName || ''}`;
        if (!user.firstName && !user.lastName) {
            username.textContent = user.username || 'User';
        }
    }
    
    // Update CKC score
    const ckcScore = document.querySelector('.user-profile-card .text-3xl.font-bold');
    if (ckcScore) {
        ckcScore.textContent = user.sustainabilityScore || '0';
    }
    
    // Update progress bar
    const progressBar = document.querySelector('.user-profile-card .bg-green-500');
    if (progressBar) {
        const score = user.sustainabilityScore || 0;
        const percentage = Math.min(score / 2000 * 100, 100);
        progressBar.style.width = `${percentage}%`;
    }
    
    // Update member since date
    const memberSince = document.querySelector('.user-profile-card p.text-sm.text-gray-500');
    if (memberSince && user.createdAt) {
        const date = new Date(user.createdAt);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        memberSince.textContent = `Member since ${month} ${year}`;
    }
}

/**
 * Toggle the create trade form visibility
 */
function toggleCreateTradeForm() {
    const formContainer = document.getElementById('create-trade-form-container');
    if (!formContainer) return;
    
    const isHidden = formContainer.style.display === 'none' || !formContainer.style.display;
    
    if (isHidden) {
        // Show form
        formContainer.style.display = 'block';
        // Reset form and load user profile data
        const tradeForm = document.getElementById('trade-form');
        if (tradeForm) {
            tradeForm.reset();
            loadUserProfile();
        }
    } else {
        // Hide form
        formContainer.style.display = 'none';
    }
}

/**
 * Initialize the create trade form
 */
function initCreateTradeForm() {
    const tradeForm = document.getElementById('trade-form');
    if (!tradeForm) return;
    
    // Add initial offering and seeking fields
    addOfferingField();
    addSeekingField();
    
    // Update category points
    updateCategoryPoints();
}

/**
 * Update category points when category is selected
 */
function updateCategoryPoints() {
    const category = document.getElementById('trade-category').value;
    const pointsElement = document.getElementById('category-points');
    
    if (category && CATEGORY_POINTS[category]) {
        pointsElement.textContent = `+${CATEGORY_POINTS[category]} points`;
    } else {
        pointsElement.textContent = '+0 points';
    }
}

/**
 * Add a new offering field
 */
function addOfferingField() {
    const offeringContainer = document.getElementById('offering-container');
    if (!offeringContainer) return;
    
    const offeringCount = offeringContainer.querySelectorAll('.offering-item').length;
    
    if (offeringCount < 5) { // Limit to 5 offerings
        const newOffering = document.createElement('div');
        newOffering.className = 'offering-item mt-3';
        newOffering.innerHTML = `
            <div class="flex space-x-3">
                <div class="flex-1">
                    <input type="text" name="offering-item[]" class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white" placeholder="Item description">
                </div>
                <div class="w-24">
                    <input type="number" name="offering-points[]" class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white" placeholder="Points" min="0">
                </div>
            </div>
        `;
        offeringContainer.appendChild(newOffering);
    }
}

/**
 * Add a new seeking field
 */
function addSeekingField() {
    const seekingContainer = document.getElementById('seeking-container');
    if (!seekingContainer) return;
    
    const seekingCount = seekingContainer.querySelectorAll('.seeking-item').length;
    
    if (seekingCount < 5) { // Limit to 5 seeking items
        const newSeeking = document.createElement('div');
        newSeeking.className = 'seeking-item mt-3';
        newSeeking.innerHTML = `
            <div class="flex space-x-3">
                <div class="flex-1">
                    <input type="text" name="seeking-item[]" class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white" placeholder="Item description">
                </div>
                <div class="w-24">
                    <input type="number" name="seeking-points[]" class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white" placeholder="Points" min="0">
                </div>
            </div>
        `;
        seekingContainer.appendChild(newSeeking);
    }
}

/**
 * Submit the trade form
 */
function submitTradeForm() {
    // Get form data
    const username = document.getElementById('trade-username').value;
    const fullName = document.getElementById('trade-fullname').value;
    const category = document.getElementById('trade-category').value;
    
    // Get offerings
    const offeringItems = [];
    const offeringInputs = document.querySelectorAll('input[name="offering-item[]"]');
    const offeringPointsInputs = document.querySelectorAll('input[name="offering-points[]"]');
    
    for (let i = 0; i < offeringInputs.length; i++) {
        if (offeringInputs[i].value.trim() !== '') {
            offeringItems.push({
                description: offeringInputs[i].value,
                points: parseInt(offeringPointsInputs[i].value || 0)
            });
        }
    }
    
    // Get seeking items
    const seekingItems = [];
    const seekingInputs = document.querySelectorAll('input[name="seeking-item[]"]');
    const seekingPointsInputs = document.querySelectorAll('input[name="seeking-points[]"]');
    
    for (let i = 0; i < seekingInputs.length; i++) {
        if (seekingInputs[i].value.trim() !== '') {
            seekingItems.push({
                description: seekingInputs[i].value,
                points: parseInt(seekingPointsInputs[i].value || 0)
            });
        }
    }
    
    // Calculate total points
    const categoryPoints = CATEGORY_POINTS[category] || 0;
    let totalPoints = categoryPoints;
    
    // Add points from offerings and seeking items
    offeringItems.forEach(item => totalPoints += item.points);
    seekingItems.forEach(item => totalPoints += item.points);
    
    // Create trade object
    const trade = {
        id: Date.now().toString(),
        username,
        fullName,
        category,
        offerings: offeringItems,
        seeking: seekingItems,
        totalPoints,
        timestamp: new Date().toISOString()
    };
    
    // Save trade to local storage
    saveTrade(trade);
    
    // Update user points
    updateUserPoints(totalPoints);
    
    // Update leaderboard
    updateLeaderboard();
    
    // Add trade to table
    addTradeToTable(trade);
    
    // Check for badge awards
    checkForBadges(category, totalPoints);
    
    // Show confirmation message
    showConfirmation(`Trade created successfully! You earned +${totalPoints} CKC points.`);
    
    // Hide the form
    toggleCreateTradeForm();
}

/**
 * Save trade to local storage
 */
function saveTrade(trade) {
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    trades.push(trade);
    localStorage.setItem('trades', JSON.stringify(trades));
}

/**
 * Load trades from local storage
 */
function loadTrades() {
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    
    // Add trades to table
    trades.forEach(trade => addTradeToTable(trade));
}

/**
 * Add trade to table
 */
function addTradeToTable(trade) {
    const tableBody = document.getElementById('trades-table-body');
    if (!tableBody) return;
    
    const row = document.createElement('tr');
    row.className = 'bg-white dark:bg-gray-800';
    row.dataset.tradeId = trade.id;
    
    // Format offerings and seeking items
    const offeringText = trade.offerings.map(item => item.description).join(', ');
    const seekingText = trade.seeking.map(item => item.description).join(', ');
    
    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
            ${trade.username}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
            ${offeringText}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
            ${seekingText}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
            ${trade.category}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100">
                +${trade.totalPoints}
            </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <a href="#" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 contact-btn" data-username="${trade.username}">Contact</a>
        </td>
    `;
    
    // Add contact button event listener
    const contactBtn = row.querySelector('.contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const username = this.dataset.username;
            showConfirmation(`Contact request sent to ${username}!`);
        });
    }
    
    // Add to table
    tableBody.prepend(row); // Add newest trades at the top
}

/**
 * Update user points
 */
function updateUserPoints(points) {
    // Get current user
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    // Update points
    user.ckc_points = (user.ckc_points || 0) + points;
    
    // Save updated user
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update profile card
    updateProfileCard(user);
}

/**
 * Update leaderboard
 */
function updateLeaderboard() {
    // In a real application, this would fetch data from the server
    // For now, we'll just update the current user's position
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    // Find the user's row in the leaderboard
    const leaderboardRows = document.querySelectorAll('#leaderboard-table tbody tr');
    leaderboardRows.forEach(row => {
        const usernameCell = row.querySelector('td:nth-child(2)');
        if (usernameCell && usernameCell.textContent.trim() === user.username) {
            // Update points
            const pointsCell = row.querySelector('td:nth-child(3)');
            if (pointsCell) {
                pointsCell.textContent = user.ckc_points || 0;
            }
        }
    });
}

/**
 * Check for badge awards
 */
function checkForBadges(category, points) {
    // Get current user
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    // Initialize badges if not exists
    user.badges = user.badges || [];
    
    // Check for category-specific badges
    if (category === 'Organic Waste' && !user.badges.includes('Composter')) {
        user.badges.push('Composter');
        showConfirmation('New Badge Earned: Composter! 🌱');
    } else if (category === 'Solar Energy' && !user.badges.includes('Solar Pioneer')) {
        user.badges.push('Solar Pioneer');
        showConfirmation('New Badge Earned: Solar Pioneer! ☀️');
    } else if (category === 'Homemade Products' && !user.badges.includes('Artisan')) {
        user.badges.push('Artisan');
        showConfirmation('New Badge Earned: Artisan! 🧵');
    }
    
    // Check for points-based badges
    const totalPoints = user.ckc_points || 0;
    
    if (totalPoints >= BADGE_THRESHOLDS.SUSTAINABILITY_MASTER && !user.badges.includes(BADGE_NAMES.SUSTAINABILITY_MASTER)) {
        user.badges.push(BADGE_NAMES.SUSTAINABILITY_MASTER);
        showConfirmation(`New Badge Earned: ${BADGE_NAMES.SUSTAINABILITY_MASTER}! 🏆`);
    } else if (totalPoints >= BADGE_THRESHOLDS.SUSTAINABILITY_PRO && !user.badges.includes(BADGE_NAMES.SUSTAINABILITY_PRO)) {
        user.badges.push(BADGE_NAMES.SUSTAINABILITY_PRO);
        showConfirmation(`New Badge Earned: ${BADGE_NAMES.SUSTAINABILITY_PRO}! 🥈`);
    } else if (totalPoints >= BADGE_THRESHOLDS.SUSTAINABILITY_ENTHUSIAST && !user.badges.includes(BADGE_NAMES.SUSTAINABILITY_ENTHUSIAST)) {
        user.badges.push(BADGE_NAMES.SUSTAINABILITY_ENTHUSIAST);
        showConfirmation(`New Badge Earned: ${BADGE_NAMES.SUSTAINABILITY_ENTHUSIAST}! 🥉`);
    }
    
    // Save updated user
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update badges display
    updateBadgesDisplay(user.badges);
}

/**
 * Update badges display
 */
function updateBadgesDisplay(badges) {
    const badgesContainer = document.getElementById('user-badges');
    if (!badgesContainer || !badges || !badges.length) return;
    
    // Clear existing badges
    badgesContainer.innerHTML = '';
    
    // Add badges
    badges.forEach(badge => {
        const badgeElement = document.createElement('span');
        badgeElement.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100 mr-2 mb-2';
        
        // Add emoji based on badge name
        let emoji = '🌟';
        if (badge === 'Composter') emoji = '🌱';
        if (badge === 'Solar Pioneer') emoji = '☀️';
        if (badge === 'Artisan') emoji = '🧵';
        if (badge === BADGE_NAMES.SUSTAINABILITY_ENTHUSIAST) emoji = '🥉';
        if (badge === BADGE_NAMES.SUSTAINABILITY_PRO) emoji = '🥈';
        if (badge === BADGE_NAMES.SUSTAINABILITY_MASTER) emoji = '🏆';
        
        badgeElement.textContent = `${emoji} ${badge}`;
        badgesContainer.appendChild(badgeElement);
    });
}

/**
 * Show confirmation message
 */
function showConfirmation(message) {
    const confirmationElement = document.createElement('div');
    confirmationElement.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-fade-in-up';
    confirmationElement.textContent = message;
    
    document.body.appendChild(confirmationElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
        confirmationElement.classList.add('animate-fade-out');
        setTimeout(() => {
            document.body.removeChild(confirmationElement);
        }, 500);
    }, 3000);
}

/**
 * Check for badge awards on load
 */
function checkForBadgeAwards() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    if (user.badges && user.badges.length > 0) {
        updateBadgesDisplay(user.badges);
    }
}
    const addOfferingBtn = document.getElementById('add-offering-btn');
    if (addOfferingBtn) {
        addOfferingBtn.addEventListener('click', addOfferingField);
    }
    
    // Add event listener for adding multiple seeking items
    const addSeekingBtn = document.getElementById('add-seeking-btn');
    if (addSeekingBtn) {
        addSeekingBtn.addEventListener('click', addSeekingField);
    }
    
    // Populate user profile data in the form
    populateUserProfileData();


/**
 * Populate user profile data in the trade form
 */
function populateUserProfileData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // Set user profile fields
    document.getElementById('trade-username').value = user.username || '';
    document.getElementById('trade-fullname').value = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    document.getElementById('trade-points').value = user.sustainabilityScore || '0';
    
    // If user has location data
    if (user.location) {
        document.getElementById('trade-location').value = user.location;
    }
    
    // If user has contact info
    if (user.email) {
        document.getElementById('trade-contact').value = user.email;
    }
}

/**
 * Update category points based on selection
 */
function updateCategoryPoints() {
    const categorySelect = document.getElementById('trade-category');
    const categoryPointsDisplay = document.getElementById('category-points');
    
    if (!categorySelect || !categoryPointsDisplay) return;
    
    const categoryPoints = {
        'vegetables': 10,
        'fruits': 10,
        'organic-waste': 12,
        'solar-energy': 15,
        'homemade-products': 8,
        'reusing-materials': 20,
        'saving-water': 10,
        'other': 5
    };
    
    const selectedCategory = categorySelect.value;
    const points = categoryPoints[selectedCategory] || 0;
    
    categoryPointsDisplay.textContent = `+${points} points`;
    document.getElementById('category-points-value').value = points;
}

/**
 * Add a new offering field
 */
function addOfferingField() {
    const offeringContainer = document.getElementById('offerings-container');
    const offeringCount = offeringContainer.querySelectorAll('.offering-item').length;
    
    if (offeringCount >= 5) {
        alert('Maximum 5 offerings allowed');
        return;
    }
    
    const newOffering = document.createElement('div');
    newOffering.className = 'offering-item mt-3';
    newOffering.innerHTML = `
        <div class="flex items-center">
            <input type="text" name="offering[]" class="flex-1 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" placeholder="What are you offering?">
            <input type="number" name="offering-points[]" class="ml-2 w-20 shadow-sm focus:ring-green-500 focus:border-green-500 block sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" placeholder="CKC" min="0">
            <button type="button" class="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 remove-offering-btn">
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    `;
    
    offeringContainer.appendChild(newOffering);
    
    // Add event listener to remove button
    const removeBtn = newOffering.querySelector('.remove-offering-btn');
    removeBtn.addEventListener('click', function() {
        offeringContainer.removeChild(newOffering);
    });
}

/**
 * Add a new seeking field
 */
function addSeekingField() {
    const seekingContainer = document.getElementById('seeking-container');
    const seekingCount = seekingContainer.querySelectorAll('.seeking-item').length;
    
    if (seekingCount >= 5) {
        alert('Maximum 5 seeking items allowed');
        return;
    }
    
    const newSeeking = document.createElement('div');
    newSeeking.className = 'seeking-item mt-3';
    newSeeking.innerHTML = `
        <div class="flex items-center">
            <input type="text" name="seeking[]" class="flex-1 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" placeholder="What are you seeking?">
            <input type="number" name="seeking-points[]" class="ml-2 w-20 shadow-sm focus:ring-green-500 focus:border-green-500 block sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" placeholder="CKC" min="0">
            <button type="button" class="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 remove-seeking-btn">
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    `;
    
    seekingContainer.appendChild(newSeeking);
    
    // Add event listener to remove button
    const removeBtn = newSeeking.querySelector('.remove-seeking-btn');
    removeBtn.addEventListener('click', function() {
        seekingContainer.removeChild(newSeeking);
    });
}

/**
 * Handle trade form submission
 */
function handleTradeFormSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const category = document.getElementById('trade-category').value;
    const offerings = Array.from(document.querySelectorAll('input[name="offering[]"]')).map(input => input.value);
    const offeringPoints = Array.from(document.querySelectorAll('input[name="offering-points[]"]')).map(input => parseInt(input.value) || 0);
    const seeking = Array.from(document.querySelectorAll('input[name="seeking[]"]')).map(input => input.value);
    const seekingPoints = Array.from(document.querySelectorAll('input[name="seeking-points[]"]')).map(input => parseInt(input.value) || 0);
    const categoryPointsValue = parseInt(document.getElementById('category-points-value').value) || 0;
    
    // Calculate total points
    const totalPoints = categoryPointsValue + offeringPoints.reduce((sum, points) => sum + points, 0);
    
    // Create trade object
    const trade = {
        category,
        offerings: offerings.map((item, index) => ({ item, points: offeringPoints[index] })),
        seeking: seeking.map((item, index) => ({ item, points: seekingPoints[index] })),
        categoryPoints: categoryPointsValue,
        totalPoints,
        timestamp: new Date().toISOString()
    };
    
    // Add trade to local storage
    addTradeToLocalStorage(trade);
    
    // Update user points
    updateUserPoints(totalPoints);
    
    // Add trade to the table
    addTradeToTable(trade);
    
    // Show confirmation message
    showTradeConfirmation(totalPoints);
    
    // Reset form and hide it
    document.getElementById('create-trade-form').reset();
    toggleCreateTradeForm();
    
    // Check for badge awards
    checkForBadgeAwards();
}

/**
 * Add trade to local storage
 */
function addTradeToLocalStorage(trade) {
    // Get existing trades or initialize empty array
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    
    // Add user info to the trade
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        trade.userId = user.id;
        trade.username = user.username;
        trade.profilePicture = user.profilePicture;
    }
    
    // Add the new trade
    trades.push(trade);
    
    // Save back to local storage
    localStorage.setItem('trades', JSON.stringify(trades));
}

/**
 * Update user points in local storage
 */
function updateUserPoints(points) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // Update sustainability score
    user.sustainabilityScore = (parseInt(user.sustainabilityScore) || 0) + points;
    
    // Update category-specific points
    const category = document.getElementById('trade-category').value;
    if (!user.categoryPoints) user.categoryPoints = {};
    user.categoryPoints[category] = (user.categoryPoints[category] || 0) + points;
    
    // Save updated user data
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update UI
    updateProfileCard(user);
    updateLeaderboard(user);
}

/**
 * Add trade to the trades table
 */
function addTradeToTable(trade) {
    const tableBody = document.querySelector('.trading-platform table tbody');
    if (!tableBody) return;
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const row = document.createElement('tr');
    
    // Format offerings and seeking items
    const offeringText = trade.offerings.map(o => o.item).join(', ');
    const seekingText = trade.seeking.map(s => s.item).join(', ');
    
    row.innerHTML = `
        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
            <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                    <img class="h-10 w-10 rounded-full" src="${user.profilePicture || '../public/images/default-avatar.png'}" alt="">
                </div>
                <div class="ml-4">
                    <div class="font-medium text-gray-900 dark:text-white">${user.username || 'User'}</div>
                    <div class="text-gray-500 dark:text-gray-400">${user.sustainabilityScore || '0'} CKC</div>
                </div>
            </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
            <div class="text-gray-900 dark:text-white">${offeringText}</div>
            <div class="text-gray-500 dark:text-gray-400">${getCategoryLabel(trade.category)}</div>
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
            <div class="text-gray-900 dark:text-white">${seekingText}</div>
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                +${trade.totalPoints} CKC
            </span>
        </td>
        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
            <a href="#" class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Contact</a>
        </td>
    `;
    
    // Add to the beginning of the table
    if (tableBody.firstChild) {
        tableBody.insertBefore(row, tableBody.firstChild);
    } else {
        tableBody.appendChild(row);
    }
}

/**
 * Get category label from value
 */
function getCategoryLabel(category) {
    const categories = {
        'vegetables': 'Vegetables',
        'fruits': 'Fruits',
        'organic-waste': 'Organic Waste',
        'solar-energy': 'Solar Energy',
        'homemade-products': 'Homemade Products',
        'reusing-materials': 'Reusing Materials',
        'saving-water': 'Saving Water',
        'other': 'Other'
    };
    
    return categories[category] || 'Other';
}

/**
 * Update the leaderboard with user data
 */
function updateLeaderboard(currentUser) {
    const leaderboardBody = document.querySelector('.leaderboard table tbody');
    if (!leaderboardBody) return;
    
    // Find the current user's row
    const userRow = Array.from(leaderboardBody.querySelectorAll('tr')).find(row => {
        const username = row.querySelector('.font-medium')?.textContent;
        return username === currentUser.username;
    });
    
    if (userRow) {
        // Update existing row
        const pointsCell = userRow.querySelector('td:nth-child(3)');
        if (pointsCell) {
            pointsCell.textContent = currentUser.sustainabilityScore || '0';
        }
        
        // Resort the leaderboard
        sortLeaderboard();
    }
}

/**
 * Sort the leaderboard by points
 */
function sortLeaderboard() {
    const leaderboardBody = document.querySelector('.leaderboard table tbody');
    if (!leaderboardBody) return;
    
    const rows = Array.from(leaderboardBody.querySelectorAll('tr'));
    
    // Sort rows by points (descending)
    rows.sort((a, b) => {
        const pointsA = parseInt(a.querySelector('td:nth-child(3)').textContent) || 0;
        const pointsB = parseInt(b.querySelector('td:nth-child(3)').textContent) || 0;
        return pointsB - pointsA;
    });
    
    // Update rank numbers
    rows.forEach((row, index) => {
        const rankCell = row.querySelector('td:first-child');
        if (rankCell) {
            rankCell.textContent = index + 1;
        }
    });
    
    // Clear and re-append rows in new order
    leaderboardBody.innerHTML = '';
    rows.forEach(row => leaderboardBody.appendChild(row));
}

/**
 * Show trade confirmation message
 */
function showTradeConfirmation(points) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 rounded shadow-md transition-opacity duration-500';
    notification.style.zIndex = '50';
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="py-1">
                <svg class="h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <p class="font-bold">Trade Created Successfully!</p>
                <p class="text-sm">You earned +${points} CKC points.</p>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

/**
 * Check for badge awards based on points thresholds
 */
function checkForBadgeAwards() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.categoryPoints) return;
    
    const badgeThresholds = {
        'saving-water': { points: 200, badge: 'Save Water Badge' },
        'reusing-materials': { points: 200, badge: 'Reuse Champion Badge' },
        'solar-energy': { points: 200, badge: 'Solar Adopter Badge' },
        'organic-waste': { points: 200, badge: 'Composting Master Badge' }
    };
    
    // Check each category for badge eligibility
    for (const [category, threshold] of Object.entries(badgeThresholds)) {
        const categoryPoints = user.categoryPoints[category] || 0;
        
        if (categoryPoints >= threshold.points) {
            // Check if badge already awarded
            if (!user.badges) user.badges = [];
            
            const badgeExists = user.badges.some(badge => badge.name === threshold.badge);
            
            if (!badgeExists) {
                // Award new badge
                user.badges.push({
                    name: threshold.badge,
                    category: category,
                    awardedAt: new Date().toISOString()
                });
                
                // Save updated user data
                localStorage.setItem('user', JSON.stringify(user));
                
                // Show badge notification
                showBadgeNotification(threshold.badge);
            }
        }
    }
}

/**
 * Show badge award notification
 */
function showBadgeNotification(badgeName) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded shadow-md transition-opacity duration-500';
    notification.style.zIndex = '50';
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="py-1">
                <svg class="h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            </div>
            <div>
                <p class="font-bold">New Badge Earned!</p>
                <p class="text-sm">Congratulations! You've earned the ${badgeName}.</p>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 7 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 7000);
}