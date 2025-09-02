/**
 * Common JavaScript functions for Momentum platform
 * This file handles shared functionality across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load user profile data if user is logged in
    loadUserProfileHeader();
});

/**
 * Load user profile data for header and sidebar elements
 */
function loadUserProfileHeader() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // If no token or user data, don't attempt to load profile
    if (!token || !user) return;
    
    // Update all user avatar images
    updateUserAvatars(user);
    
    // Update all username displays
    updateUsernames(user);
}

/**
 * Update all user avatar images across the page
 */
function updateUserAvatars(user) {
    // Get all user avatar images (sidebar, mobile menu, header)
    const avatarImages = document.querySelectorAll('.h-8.w-8.rounded-full, .h-10.w-10.rounded-full');
    
    // Set the correct avatar source
    const avatarSrc = user.profilePicture ? 
        `${user.profilePicture}` : 
        '../public/images/default-avatar.png';
    
    // Update all avatar images
    avatarImages.forEach(img => {
        img.src = avatarSrc;
    });
}

/**
 * Update all username displays across the page
 */
function updateUsernames(user) {
    // Update sidebar username if it exists
    const sidebarUsername = document.getElementById('sidebar-username');
    if (sidebarUsername) {
        sidebarUsername.textContent = user.username || 'User';
    }
    
    // Update mobile sidebar username if it exists
    const mobileSidebarUsername = document.getElementById('mobile-sidebar-username');
    if (mobileSidebarUsername) {
        mobileSidebarUsername.textContent = user.username || 'User';
    }
    
    // Update any other username elements with class 'username-display'
    const usernameElements = document.querySelectorAll('.username-display');
    usernameElements.forEach(element => {
        element.textContent = user.username || 'User';
    });
}