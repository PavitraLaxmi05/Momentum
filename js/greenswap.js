/**
 * GreenSwap Network JavaScript (Corrected Version)
 * Handles trade creation, points calculation, leaderboard, and badges
 */


document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data if not present
    if (!localStorage.getItem('user')) {
        const defaultUser = {
            username: 'EcoUser',
            firstName: 'Eco',
            lastName: 'User',
            email: 'eco.user@example.com',
            location: 'Green City',
            profilePicture: '../public/images/default-avatar.png',
            sustainabilityScore: 100,
            badges: ['New Member'],
            categoryPoints: {}
        };
        localStorage.setItem('user', JSON.stringify(defaultUser));
    }
    
    loadUserProfileAndBadges();
    
    // Clear static HTML content and load dynamic data
    loadTradesFromLocalStorage();
    updateLeaderboard();

    // Attach event listeners
    const createTradeButton = document.getElementById('create-trade-button');
    if (createTradeButton) {
        createTradeButton.addEventListener('click', toggleCreateTradeForm);
    }
    
    const tradeCategory = document.getElementById('trade-category');
    if (tradeCategory) {
        tradeCategory.addEventListener('change', updateCategoryPoints);
    }
    
    const tradeForm = document.getElementById('create-trade-form');
    if (tradeForm) {
        tradeForm.addEventListener('submit', handleTradeFormSubmit);
        const cancelBtn = tradeForm.querySelector('button[type="button"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCreateTradeForm();
            });
        }
    }
});

/**
 * Loads the user profile, updates the card, and displays badges.
 */
function loadUserProfileAndBadges() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    updateProfileCard(user);
    updateBadgesDisplay(user.badges || []);
}

/**
 * Updates the user profile card with the latest data.
 */
function updateProfileCard(user) {
    const card = document.querySelector('.lg\\:col-span-1');
    if (!card) return;

    card.querySelector('img').src = user.profilePicture || '../public/images/default-avatar.png';
    card.querySelector('h2').textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    card.querySelector('.text-3xl').textContent = user.sustainabilityScore || '0';

    const progressBar = card.querySelector('.bg-green-500');
    const percentage = Math.min((user.sustainabilityScore || 0) / 2000 * 100, 100);
    progressBar.style.width = `${percentage}%`;

    if (user.createdAt) {
        const joinDate = new Date(user.createdAt);
        card.querySelector('p.text-sm').textContent = `Member since ${joinDate.toLocaleString('default', { month: 'long' })} ${joinDate.getFullYear()}`;
    }
}

/**
 * Toggles the visibility of the create trade form.
 */
function toggleCreateTradeForm() {
    const form = document.getElementById('create-trade-form');
    const isHidden = form.classList.contains('hidden');

    if (isHidden) {
        form.reset();
        populateUserProfileData();
        updateCategoryPoints();
        // Clear form fields
        document.getElementById('trade-offering').value = '';
        document.getElementById('trade-seeking').value = '';
    }
    
    form.classList.toggle('hidden');
}

/**
 * Populates the read-only user fields in the trade form.
 */
function populateUserProfileData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    document.getElementById('trade-username').value = user.username || '';
    document.getElementById('trade-fullname').value = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    document.getElementById('trade-points').value = user.sustainabilityScore || '0';
    document.getElementById('trade-location').value = user.location || 'Not set';
    document.getElementById('trade-contact').value = user.email || 'Not set';
}

/**
 * The updateCategoryPoints function has been removed as it's no longer needed with the fixed +10 points system
 */
function updateCategoryPoints() {
    const categoryPointsDisplay = document.getElementById('category-points');
    const points = 10; // Fixed +10 points for all trades
    
    categoryPointsDisplay.textContent = `+${points} points`;
    document.getElementById('category-points-value').value = points;
}

// The addOfferingField and addSeekingField functions have been removed as they are no longer needed with the simplified form

/**
 * Handles the submission of the trade form.
 */
function handleTradeFormSubmit(event) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("You must be logged in to create a trade.");
        return;
    }

    // Collect data from form
    const category = document.getElementById('trade-category').value;
    const offering = document.getElementById('trade-offering').value;
    const seeking = document.getElementById('trade-seeking').value;
    
    // Always award +10 CKC points for each new trade
    const totalPoints = 10;

    const trade = {
        id: `trade_${Date.now()}`,
        username: user.username,
        profilePicture: user.profilePicture,
        category,
        offering: offering,
        seeking: seeking,
        totalPoints,
        timestamp: new Date().toISOString()
    };

    // Save and update UI
    addTradeToLocalStorage(trade);
    addTradeToTable(trade);
    updateUserPoints(totalPoints, category);
    toggleCreateTradeForm();
    showTradeConfirmation(totalPoints);
    
    console.log('Trade created successfully:', trade);
}

/**
 * Adds a new trade to local storage.
 */
function addTradeToLocalStorage(trade) {
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    trades.push(trade);
    localStorage.setItem('trades', JSON.stringify(trades));
    console.log('Trade added to local storage:', trade);
}

/**
 * Adds a trade to the visible table.
 */
function addTradeToTable(trade) {
    const tableBody = document.getElementById('trades-table-body');
    if (!tableBody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
            <div class="flex items-center">
                <div class="h-8 w-8 flex-shrink-0">
                    <img class="h-8 w-8 rounded-full" src="${trade.profilePicture || '../public/images/default-avatar.png'}" alt="User Avatar">
                </div>
                <div class="ml-4">
                    <div class="font-medium text-gray-900 dark:text-white">${trade.username}</div>
                </div>
            </div>
        </td>
        <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">${trade.offering}</td>
        <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">${trade.seeking}</td>
        <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">${getCategoryLabel(trade.category)}</td>
        <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                +${trade.totalPoints} CKC
            </span>
        </td>
        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
            <a href="#" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Contact</a>
        </td>
    `;
    tableBody.prepend(row);
}

/**
 * Loads all trades from local storage and displays them.
 */
function loadTradesFromLocalStorage() {
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    const tableBody = document.getElementById('trades-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = ''; // Clear existing static rows
    trades.reverse().forEach(trade => addTradeToTable(trade)); // Show newest first
    console.log('Trades loaded from local storage:', trades);
}

/**
 * Updates the user's points and checks for new badges.
 */
function updateUserPoints(points, category) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    user.sustainabilityScore = (user.sustainabilityScore || 0) + points;
    
    if (!user.categoryPoints) user.categoryPoints = {};
    user.categoryPoints[category] = (user.categoryPoints[category] || 0) + points;
    
    localStorage.setItem('user', JSON.stringify(user));

    updateProfileCard(user);
    updateLeaderboard();
    checkForBadgeAwards(); // Check for badges after points update
    
    console.log(`User points updated: +${points} points for ${category}. New total: ${user.sustainabilityScore}`);
}

/**
 * Updates the leaderboard with the current user's score and resorts it.
 */
function updateLeaderboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const leaderboardBody = document.getElementById('leaderboard-table-body');
    if (!leaderboardBody) return;

    // Clear existing leaderboard
    leaderboardBody.innerHTML = '';
    
    // Add current user to leaderboard
    const userRow = document.createElement('tr');
    userRow.innerHTML = `
        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">1</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm">
            <div class="flex items-center">
                <div class="h-8 w-8 flex-shrink-0">
                    <img class="h-8 w-8 rounded-full" src="${user.profilePicture || '../public/images/default-avatar.png'}" alt="">
                </div>
                <div class="ml-4">
                    <div class="font-medium text-gray-900 dark:text-white">${user.username}</div>
                </div>
            </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">${user.sustainabilityScore || 0}</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                ${user.badges && user.badges.length > 0 ? user.badges[0] : 'New Member'}
            </span>
        </td>
    `;
    leaderboardBody.appendChild(userRow);
    
    // Add some sample users for demonstration
    const sampleUsers = [
        { username: 'EcoFriend', score: Math.floor(user.sustainabilityScore * 0.9) || 800, badge: 'Water Conservationist' },
        { username: 'GreenThumb', score: Math.floor(user.sustainabilityScore * 0.8) || 700, badge: 'Energy Innovator' },
        { username: 'EarthSaver', score: Math.floor(user.sustainabilityScore * 0.7) || 600, badge: 'Solar Adopter' },
        { username: 'RecycleHero', score: Math.floor(user.sustainabilityScore * 0.6) || 500, badge: 'Waste Reducer' }
    ];
    
    sampleUsers.forEach((sampleUser, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">${index + 2}</td>
            <td class="whitespace-nowrap px-3 py-4 text-sm">
                <div class="flex items-center">
                    <div class="h-8 w-8 flex-shrink-0">
                        <img class="h-8 w-8 rounded-full" src="../public/images/default-avatar.png" alt="">
                    </div>
                    <div class="ml-4">
                        <div class="font-medium text-gray-900 dark:text-white">${sampleUser.username}</div>
                    </div>
                </div>
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">${sampleUser.score}</td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getBadgeColor(index)} dark:bg-${getBadgeColor(index)}-900 text-${getBadgeColor(index)}-800 dark:text-${getBadgeColor(index)}-200">
                    ${sampleUser.badge}
                </span>
            </td>
        `;
        leaderboardBody.appendChild(row);
    });
}

/**
 * Helper function to get badge color based on index
 */
function getBadgeColor(index) {
    const colors = ['blue', 'yellow', 'green', 'pink'];
    return colors[index % colors.length];
}

/**
 * Sorts the leaderboard table by points in descending order.
 * Note: This function is no longer needed since we rebuild the leaderboard in updateLeaderboard()
 */
function sortLeaderboard() {
    // This functionality is now handled in updateLeaderboard
    return;
}

/**
 * Checks if the user has earned any new badges.
 */
function checkForBadgeAwards() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.categoryPoints) return;

    const badgeThresholds = {
        'saving-water': { points: 200, badge: 'Save Water Badge' },
        'reusing-materials': { points: 200, badge: 'Reuse Champion' },
        'solar-energy': { points: 200, badge: 'Solar Adopter' },
        'organic-waste': { points: 200, badge: 'Composting Master' },
        'homemade-products': { points: 200, badge: 'Craft Artisan' },
        'vegetables': { points: 200, badge: 'Veggie Master' },
        'fruits': { points: 200, badge: 'Fruit Champion' }
    };

    let newBadgeAwarded = false;
    if (!user.badges) user.badges = [];

    for (const [category, data] of Object.entries(badgeThresholds)) {
        const hasBadge = user.badges.includes(data.badge);
        if (!hasBadge && (user.categoryPoints[category] || 0) >= data.points) {
            user.badges.push(data.badge);
            showBadgeNotification(data.badge);
            newBadgeAwarded = true;
        }
    }

    if (newBadgeAwarded) {
        localStorage.setItem('user', JSON.stringify(user));
        updateBadgesDisplay(user.badges);
    }
}

/**
 * Updates the badges section in the user profile card.
 */
function updateBadgesDisplay(badges) {
    const container = document.getElementById('user-badges-container');
    if (!container) return;

    // Clear the static, hardcoded badges from the HTML
    container.innerHTML = '';

    if (!badges || badges.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 col-span-3">No badges earned yet. Start trading to earn some!</p>';
        return;
    }

    // Display the badges the user has actually earned
    badges.forEach(badgeName => {
        const badgeElement = document.createElement('div');
        badgeElement.className = 'flex flex-col items-center';
        // A simple icon for all badges for now
        badgeElement.innerHTML = `
            <div class="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg class="h-8 w-8 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <span class="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">${badgeName}</span>
        `;
        container.appendChild(badgeElement);
    });
}

/**
 * Helper function to get a category's display name.
 */
function getCategoryLabel(categoryKey) {
    const labels = {
        'vegetables': 'Vegetables', 'fruits': 'Fruits', 'organic-waste': 'Organic Waste',
        'solar-energy': 'Solar Energy', 'homemade-products': 'Homemade Products',
        'reusing-materials': 'Reusing Materials', 'saving-water': 'Saving Water', 'other': 'Other'
    };
    return labels[categoryKey] || 'Other';
}

/**
 * Shows a confirmation toast for a successful trade.
 */
function showTradeConfirmation(points) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 rounded shadow-lg transition-transform duration-300 translate-y-full';
    notification.innerHTML = `<strong>Trade Created!</strong> You earned +${points} CKC points.`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.remove('translate-y-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-y-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Shows a notification toast for a new badge earned.
 */
function showBadgeNotification(badgeName) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded shadow-lg transition-transform duration-300 -translate-y-full';
    notification.innerHTML = `<strong>New Badge Earned!</strong> Congratulations, you've earned the ${badgeName}.`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.remove('-translate-y-full'), 100);
    setTimeout(() => {
        notification.classList.add('-translate-y-full');
        setTimeout(() => notification.remove(), 300);
    }, 7000);
}