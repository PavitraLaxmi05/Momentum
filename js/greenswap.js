/**
 * GreenSwap Network JavaScript (Corrected Version)
 * Handles trade creation, points calculation, leaderboard, and badges
 */


document.addEventListener('DOMContentLoaded', function() {
    loadUserProfileAndBadges();
    
    // Clear static HTML content and load dynamic data
    loadTradesFromLocalStorage();
    updateLeaderboard();

    // Attach event listeners
    document.getElementById('create-trade-button')?.addEventListener('click', toggleCreateTradeForm);
    document.getElementById('trade-category')?.addEventListener('change', updateCategoryPoints);
    document.getElementById('add-offering-btn')?.addEventListener('click', addOfferingField);
    document.getElementById('add-seeking-btn')?.addEventListener('click', addSeekingField);
    
    const tradeForm = document.getElementById('create-trade-form');
    if (tradeForm) {
        tradeForm.addEventListener('submit', handleTradeFormSubmit);
        const cancelBtn = tradeForm.querySelector('button[type="button"]');
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCreateTradeForm();
        });
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
        // Clear dynamic fields and add one of each
        document.getElementById('offerings-container').innerHTML = '';
        document.getElementById('seeking-container').innerHTML = '';
        addOfferingField();
        addSeekingField();
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
 * Updates the category points display when the user selects a category.
 */
function updateCategoryPoints() {
    const categorySelect = document.getElementById('trade-category');
    const categoryPointsDisplay = document.getElementById('category-points');
    
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
    
    const points = categoryPoints[categorySelect.value] || 0;
    categoryPointsDisplay.textContent = `+${points} points`;
    document.getElementById('category-points-value').value = points;
}

/**
 * Adds a new field for offering an item.
 */
function addOfferingField() {
    const container = document.getElementById('offerings-container');
    if (container.children.length >= 5) return;

    const newItem = document.createElement('div');
    newItem.className = 'offering-item mt-3 flex items-center';
    newItem.innerHTML = `
        <input type="text" name="offering[]" class="flex-1 shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" placeholder="Item description" required>
        <input type="number" name="offering-points[]" class="ml-2 w-20 shadow-sm block sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" placeholder="CKC" min="0" value="0">
        <button type="button" class="remove-btn ml-2 p-1 text-white bg-red-600 hover:bg-red-700 rounded-full">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" /></svg>
        </button>
    `;
    container.appendChild(newItem);
    newItem.querySelector('.remove-btn').addEventListener('click', () => newItem.remove());
}

/**
 * Adds a new field for seeking an item.
 */
function addSeekingField() {
    const container = document.getElementById('seeking-container');
    if (container.children.length >= 5) return;

    const newItem = document.createElement('div');
    newItem.className = 'seeking-item mt-3 flex items-center';
    newItem.innerHTML = `
        <input type="text" name="seeking[]" class="flex-1 shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" placeholder="Item description" required>
        <input type="number" name="seeking-points[]" class="ml-2 w-20 shadow-sm block sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" placeholder="CKC" min="0" value="0">
        <button type="button" class="remove-btn ml-2 p-1 text-white bg-red-600 hover:bg-red-700 rounded-full">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" /></svg>
        </button>
    `;
    container.appendChild(newItem);
    newItem.querySelector('.remove-btn').addEventListener('click', () => newItem.remove());
}

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
    const offerings = Array.from(document.querySelectorAll('input[name="offering[]"]')).map(input => input.value);
    const offeringPoints = Array.from(document.querySelectorAll('input[name="offering-points[]"]')).map(input => parseInt(input.value) || 0);
    const seeking = Array.from(document.querySelectorAll('input[name="seeking[]"]')).map(input => input.value);
    const categoryPointsValue = parseInt(document.getElementById('category-points-value').value) || 0;
    const totalPoints = categoryPointsValue + offeringPoints.reduce((sum, points) => sum + points, 0);

    const trade = {
        id: `trade_${Date.now()}`,
        username: user.username,
        profilePicture: user.profilePicture,
        category,
        offerings: offerings.map((item, i) => ({ item, points: offeringPoints[i] })),
        seeking: seeking.map((item, i) => ({ item, points: 0 })), // Assuming seeking points are just for show
        totalPoints,
        timestamp: new Date().toISOString()
    };

    // Save and update UI
    addTradeToLocalStorage(trade);
    addTradeToTable(trade);
    updateUserPoints(totalPoints, category);
    toggleCreateTradeForm();
    showTradeConfirmation(totalPoints);
}

/**
 * Adds a new trade to local storage.
 */
function addTradeToLocalStorage(trade) {
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    trades.push(trade);
    localStorage.setItem('trades', JSON.stringify(trades));
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
                <div class="h-10 w-10 flex-shrink-0">
                    <img class="h-10 w-10 rounded-full" src="${trade.profilePicture || '../public/images/default-avatar.png'}" alt="User Avatar">
                </div>
                <div class="ml-4">
                    <div class="font-medium text-gray-900 dark:text-white">${trade.username}</div>
                </div>
            </div>
        </td>
        <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">${trade.offerings.map(o => o.item).join(', ')}</td>
        <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">${trade.seeking.map(s => s.item).join(', ')}</td>
        <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">${getCategoryLabel(trade.category)}</td>
        <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                +${trade.totalPoints} CKC
            </span>
        </td>
        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
            <a href="#" class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Contact</a>
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
}

/**
 * Updates the leaderboard with the current user's score and resorts it.
 */
function updateLeaderboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const leaderboardBody = document.querySelector('.leaderboard table tbody');
    if (!leaderboardBody) return;

    let userRow = Array.from(leaderboardBody.querySelectorAll('tr')).find(row => 
        row.querySelector('.font-medium')?.textContent.trim() === user.username
    );

    if (userRow) {
        userRow.querySelector('td:nth-child(3)').textContent = user.sustainabilityScore;
    }

    sortLeaderboard();
}

/**
 * Sorts the leaderboard table by points in descending order.
 */
function sortLeaderboard() {
    const leaderboardBody = document.querySelector('.leaderboard table tbody');
    if (!leaderboardBody) return;

    const rows = Array.from(leaderboardBody.querySelectorAll('tr'));
    rows.sort((a, b) => {
        const pointsA = parseInt(a.cells[2].textContent) || 0;
        const pointsB = parseInt(b.cells[2].textContent) || 0;
        return pointsB - pointsA;
    });

    // Re-append sorted rows and update ranks
    leaderboardBody.innerHTML = '';
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
        leaderboardBody.appendChild(row);
    });
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