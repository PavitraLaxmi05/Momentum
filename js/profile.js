document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuth();
    
    // Initialize UI components
    initializeUI();
    
    // Load user profile data
    loadUserProfile();
    
    // Load user ideas/contributions
    loadUserIdeas();
});

/**
 * Check if user is authenticated, redirect to login if not
 */
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
}

/**
 * Initialize UI components and event listeners
 */
function initializeUI() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    }
    
    if (mobileMenuOverlay && mobileMenu) {
        mobileMenuOverlay.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    }
    
    // User menu toggle
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', () => {
            userMenu.classList.toggle('hidden');
        });
        
        // Close the menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!userMenuButton.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }
    
    // Edit profile button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const profileViewMode = document.getElementById('profile-view-mode');
    const profileEditMode = document.getElementById('profile-edit-mode');
    
    if (editProfileBtn && profileViewMode && profileEditMode) {
        editProfileBtn.addEventListener('click', () => {
            profileViewMode.classList.add('hidden');
            profileEditMode.classList.remove('hidden');
            populateEditForm();
        });
    }
    
    if (cancelEditBtn && profileViewMode && profileEditMode) {
        cancelEditBtn.addEventListener('click', () => {
            profileViewMode.classList.remove('hidden');
            profileEditMode.classList.add('hidden');
        });
    }
    
    // Profile picture preview
    const profilePictureUpload = document.getElementById('profile-picture-upload');
    const profilePicturePreview = document.getElementById('profile-picture-preview');
    
    if (profilePictureUpload && profilePicturePreview) {
        profilePictureUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePicturePreview.src = e.target.result;
                    profilePicturePreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Profile edit form submission
    const profileEditForm = document.getElementById('profile-edit-form');
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // Password change form submission
    const passwordChangeForm = document.getElementById('password-change-form');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updatePassword();
        });
    }
    
    // Sign out button
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signOut();
        });
    }
}

/**
 * Load user profile data from the API
 */
function loadUserProfile() {
    const token = localStorage.getItem('token');
    
    fetch('/api/auth/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        return response.json();
    })
    .then(data => {
        displayUserProfile(data);
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
        showNotification('Failed to load profile data. Please try again later.', 'error');
    });
}

/**
 * Display user profile data in the UI
 */
function displayUserProfile(user) {
    try {
        // Update sidebar username
        const sidebarUsername = document.getElementById('sidebar-username');
        const mobileSidebarUsername = document.getElementById('mobile-sidebar-username');
        
        if (sidebarUsername) {
            sidebarUsername.textContent = user.username || 'User';
        }
        
        if (mobileSidebarUsername) {
            mobileSidebarUsername.textContent = user.username || 'User';
        }
        
        // Update profile view fields
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            profileName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Not set';
        }
        
        const profileUsername = document.getElementById('profile-username');
        if (profileUsername) {
            profileUsername.textContent = user.username || 'Not set';
        }
        
        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) {
            profileEmail.textContent = user.email || 'Not set';
        }
        
        // Update profile picture
        const profilePicture = document.getElementById('profile-picture');
        if (profilePicture) {
            profilePicture.src = user.profilePicture ? 
                `/uploads/${user.profilePicture}` : 
                '../public/images/default-avatar.png';
        }
        
        // Format and display creation date
        const profileCreated = document.getElementById('profile-created');
        if (profileCreated) {
            const createdDate = user.createdAt ? new Date(user.createdAt) : new Date();
            profileCreated.textContent = createdDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Display sustainability score with progress bar
        const sustainabilityScore = user.sustainabilityScore || 0;
        const scoreElement = document.getElementById('profile-sustainability-score');
        if (scoreElement) {
            scoreElement.textContent = sustainabilityScore;
        }
        
        const sustainabilityBar = document.getElementById('profile-sustainability-bar');
        if (sustainabilityBar) {
            // Calculate percentage (assuming max score is 100)
            const percentage = Math.min(Math.max(sustainabilityScore, 0), 100);
            sustainabilityBar.style.width = `${percentage}%`;
            
            // Add color based on score
            if (percentage >= 70) {
                sustainabilityBar.classList.add('bg-green-500');
                sustainabilityBar.classList.remove('bg-yellow-500', 'bg-red-500');
            } else if (percentage >= 40) {
                sustainabilityBar.classList.add('bg-yellow-500');
                sustainabilityBar.classList.remove('bg-green-500', 'bg-red-500');
            } else {
                sustainabilityBar.classList.add('bg-red-500');
                sustainabilityBar.classList.remove('bg-green-500', 'bg-yellow-500');
            }
        }
        
        // Display carbon footprint
        const footprintElement = document.getElementById('profile-carbon-footprint');
        if (footprintElement) {
            footprintElement.textContent = user.carbonFootprint ? `${user.carbonFootprint} kg CO₂e` : 'Not calculated yet';
        }
    } catch (error) {
        console.error('Error displaying user profile:', error);
        showNotification('Error displaying profile information', 'error');
    }
}

/**
 * Populate the edit form with current user data
 */
function populateEditForm() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    document.getElementById('first-name').value = user.firstName || '';
    document.getElementById('last-name').value = user.lastName || '';
    document.getElementById('username').value = user.username || '';
    document.getElementById('email').value = user.email || '';
    
    // Update profile picture preview
    const profilePicturePreview = document.getElementById('profile-picture-preview');
    if (profilePicturePreview) {
        profilePicturePreview.src = user.profilePicture ? 
            `/uploads/${user.profilePicture}` : 
            '../images/default-avatar.png';
        profilePicturePreview.classList.remove('hidden');
    }
}

/**
 * Update user profile with form data
 */
function updateProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication required. Please log in again.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const username = document.getElementById('username').value;
        
        // Enhanced validation
        if (!username.trim()) {
            showNotification('Username cannot be empty', 'error');
            document.getElementById('username').focus();
            return;
        }
        
        // Show loading state
        const saveButton = document.querySelector('#profile-edit-mode button[type="submit"]');
        if (saveButton) {
            const originalText = saveButton.textContent;
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
            
            // Restore button state after request completes
            const restoreButton = () => {
                saveButton.disabled = false;
                saveButton.textContent = originalText;
            };
        }
        
        // Check if there's a profile picture to upload
        const profilePictureInput = document.getElementById('profile-picture-upload');
        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('username', username);
        
        if (profilePictureInput && profilePictureInput.files && profilePictureInput.files[0]) {
            formData.append('profilePicture', profilePictureInput.files[0]);
        }
        
        fetch('/api/auth/updateprofile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type when using FormData, browser will set it with boundary
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication expired. Please log in again.');
                } else if (response.status === 400) {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Username may already be taken');
                    });
                } else {
                    throw new Error('Failed to update profile');
                }
            }
            return response.json();
        })
        .then(data => {
            // Update local storage with new user data
            const currentUser = JSON.parse(localStorage.getItem('user')) || {};
            const updatedUser = { ...currentUser, ...data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Switch back to view mode and refresh display
            const viewMode = document.getElementById('profile-view-mode');
            const editMode = document.getElementById('profile-edit-mode');
            
            if (viewMode && editMode) {
                viewMode.classList.remove('hidden');
                editMode.classList.add('hidden');
            }
            
            displayUserProfile(updatedUser);
            
            // Update user profile information across all pages
            loadUserProfileHeader();
            
            showNotification('Profile updated successfully', 'success');
            
            // Restore button if it exists
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.innerHTML = 'Save';
            }
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            showNotification(error.message || 'Failed to update profile. Please try again.', 'error');
            
            // Restore button if it exists
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.innerHTML = 'Save';
            }
            
            // If authentication error, redirect to login
            if (error.message.includes('Authentication')) {
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        });
    } catch (error) {
        console.error('Error in updateProfile function:', error);
        showNotification('An unexpected error occurred. Please try again.', 'error');
    }
}

/**
 * Update user password
 */
function updatePassword() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication required. Please log in again.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Enhanced validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('All password fields are required', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            document.getElementById('confirm-password').focus();
            return;
        }
        
        if (newPassword.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            document.getElementById('new-password').focus();
            return;
        }
        
        // Password strength check
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        
        if (!(hasUpperCase && hasLowerCase && hasNumbers) && newPassword.length < 8) {
            showNotification('Password should be stronger. Consider using uppercase, lowercase, numbers, and special characters.', 'warning');
            // Continue anyway - this is just a warning
        }
        
        // Show loading state
        const updateButton = document.querySelector('#password-change-form button[type="submit"]');
        if (updateButton) {
            const originalText = updateButton.textContent;
            updateButton.disabled = true;
            updateButton.textContent = 'Updating...';
            
            // Restore button state after request completes
            const restoreButton = () => {
                updateButton.disabled = false;
                updateButton.textContent = originalText;
            };
        }
        
        fetch('/api/auth/updatepassword', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    return response.json().then(data => {
                        if (data.message && data.message.includes('incorrect')) {
                            throw new Error('Current password is incorrect');
                        } else {
                            throw new Error('Authentication expired. Please log in again.');
                        }
                    });
                } else {
                    throw new Error('Failed to update password');
                }
            }
            return response.json();
        })
        .then(data => {
            // Update token if a new one was provided
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            // Clear password fields
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            
            showNotification('Password updated successfully', 'success');
            
            // Restore button if it exists
            if (updateButton) restoreButton();
        })
        .catch(error => {
            console.error('Error updating password:', error);
            showNotification(error.message || 'Failed to update password. Please check your current password and try again.', 'error');
            
            // Restore button if it exists
            if (updateButton) restoreButton();
            
            // If authentication expired, redirect to login
            if (error.message.includes('Authentication expired')) {
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        });
    } catch (error) {
        console.error('Error in updatePassword function:', error);
        showNotification('An unexpected error occurred. Please try again.', 'error');
    }
}

/**
 * Load user ideas/contributions
 */
function loadUserIdeas() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication required. Please log in again.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        const ideasContainer = document.getElementById('user-ideas-container');
        const loadingElement = document.getElementById('loading-ideas');
        
        if (!ideasContainer) {
            console.error('User ideas container not found');
            return;
        }
        
        // Add loading animation if it exists
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading your ideas...</p>
                </div>
            `;
        }
        
        fetch('/api/ideas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication expired');
                } else {
                    throw new Error('Failed to fetch ideas');
                }
            }
            return response.json();
        })
        .then(data => {
            // Remove loading message
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Check if data is in the expected format
            const ideas = data.data || data;
            
            if (!Array.isArray(ideas)) {
                throw new Error('Invalid data format received');
            }
            
            if (ideas.length === 0) {
                ideasContainer.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-gray-500 dark:text-gray-400">You haven't submitted any ideas yet.</p>
                        <p class="text-gray-500 dark:text-gray-400">Share your sustainability ideas and get feedback!</p>
                        <a href="idea-evaluator.html" class="btn btn-primary mt-3">Submit New Idea</a>
                    </div>
                `;
                return;
            }
            
            // Sort ideas by creation date (newest first)
            ideas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            // Display ideas
            ideasContainer.innerHTML = '';
            ideas.forEach(idea => {
                try {
                    const ideaElement = createIdeaElement(idea);
                    ideasContainer.appendChild(ideaElement);
                } catch (err) {
                    console.error('Error creating idea element:', err, idea);
                    // Continue with other ideas
                }
            });
            
            // Add a "Submit New Idea" button at the end
            const submitButtonContainer = document.createElement('div');
            submitButtonContainer.className = 'text-center mt-4';
            submitButtonContainer.innerHTML = `
                <a href="idea-evaluator.html" class="btn btn-primary">Submit New Idea</a>
            `;
            ideasContainer.appendChild(submitButtonContainer);
        })
        .catch(error => {
            console.error('Error fetching ideas:', error);
            
            if (error.message === 'Authentication expired') {
                showNotification('Your session has expired. Please log in again.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            if (loadingElement) {
                loadingElement.innerHTML = `
                    <div class="error-message">
                        <p class="text-red-500">Failed to load ideas. Please try again later.</p>
                        <button id="retry-load-ideas" class="btn btn-secondary mt-3">Retry</button>
                    </div>
                `;
                
                // Add retry button functionality
                const retryButton = document.getElementById('retry-load-ideas');
                if (retryButton) {
                    retryButton.addEventListener('click', () => {
                        loadingElement.innerHTML = `
                            <div class="loading-spinner">
                                <div class="spinner"></div>
                                <p>Loading your ideas...</p>
                            </div>
                        `;
                        setTimeout(loadUserIdeas, 500); // Slight delay for better UX
                    });
                }
            }
        });
    } catch (error) {
        console.error('Unexpected error in loadUserIdeas:', error);
        showNotification('An unexpected error occurred. Please refresh the page.', 'error');
    }
}


/**
 * Create an HTML element for an idea with enhanced display and error handling
 */
function createIdeaElement(idea) {
    if (!idea) {
        console.error('Invalid idea object provided to createIdeaElement');
        const errorElement = document.createElement('div');
        errorElement.className = 'bg-white dark:bg-gray-700 shadow overflow-hidden sm:rounded-lg border-l-4 border-red-500';
        errorElement.innerHTML = `<p class="text-red-500 p-4">Error loading idea data</p>`;
        return errorElement;
    }
    
    const ideaDiv = document.createElement('div');
    ideaDiv.className = 'bg-white dark:bg-gray-700 shadow overflow-hidden sm:rounded-lg transition-all hover:shadow-lg';
    ideaDiv.setAttribute('data-idea-id', idea._id || 'unknown');
    
    try {
        // Format date with error handling
        let createdDate = 'Unknown date';
        try {
            if (idea.createdAt) {
                createdDate = new Date(idea.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        } catch (dateError) {
            console.error('Error formatting date:', dateError);
        }
        
        // Calculate average score if available with better error handling
        let averageScore = 'Not evaluated';
        let scoreClass = 'text-gray-500 dark:text-gray-400';
        let scoreIcon = '';
        
        if (idea.potentialImpact && idea.feasibilityScore && idea.innovationScore) {
            try {
                const score = (Number(idea.potentialImpact) + Number(idea.feasibilityScore) + Number(idea.innovationScore)) / 3;
                averageScore = score.toFixed(1) + '/10';
                
                // Color based on score with visual indicators
                if (score >= 7) {
                    scoreClass = 'text-green-600 dark:text-green-400 font-medium';
                    scoreIcon = '🌟 ';
                } else if (score >= 4) {
                    scoreClass = 'text-yellow-600 dark:text-yellow-400 font-medium';
                    scoreIcon = '⭐ ';
                } else {
                    scoreClass = 'text-red-600 dark:text-red-400 font-medium';
                    scoreIcon = '⚠️ ';
                }
            } catch (scoreError) {
                console.error('Error calculating score:', scoreError);
            }
        }
        
        // Determine status styling
        const statusMap = {
            'approved': { class: 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200', icon: '✅ ' },
            'rejected': { class: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200', icon: '❌ ' },
            'pending': { class: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200', icon: '⏳ ' },
            'in_review': { class: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200', icon: '🔍 ' }
        };
        
        const status = (idea.status || 'pending').toLowerCase();
        const statusStyle = statusMap[status] || statusMap.pending;
        const formattedStatus = (idea.status ? idea.status.charAt(0).toUpperCase() + idea.status.slice(1) : 'Pending')
            .replace('_', ' ');
        
        ideaDiv.innerHTML = `
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                    <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">${idea.title || 'Untitled Idea'}</h3>
                    <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">${createdDate} · ${idea.category || 'Uncategorized'}</p>
                </div>
                <div class="${scoreClass} text-xl font-bold">${scoreIcon}${averageScore}</div>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-600 px-4 py-5 sm:px-6">
                <p class="text-sm text-gray-700 dark:text-gray-300">${idea.description || 'No description provided'}</p>
                
                ${idea.feedback ? `
                    <div class="mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <h4 class="text-sm font-medium text-gray-900 dark:text-white">Feedback:</h4>
                        <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">${idea.feedback}</p>
                    </div>
                ` : ''}
                
                <div class="mt-4 flex flex-wrap gap-2">
                    ${idea.potentialImpact ? `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                            Impact: ${idea.potentialImpact}/10
                        </span>
                    ` : ''}
                    
                    ${idea.feasibilityScore ? `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                            Feasibility: ${idea.feasibilityScore}/10
                        </span>
                    ` : ''}
                    
                    ${idea.innovationScore ? `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                            Innovation: ${idea.innovationScore}/10
                        </span>
                    ` : ''}
                    
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${statusStyle.class}">
                        ${statusStyle.icon}${formattedStatus}
                    </span>
                </div>
            </div>
        `;
        
        // Add click event to show more details if available
        if (idea._id) {
            ideaDiv.style.cursor = 'pointer';
            ideaDiv.addEventListener('click', () => {
                // Visual feedback on click
                ideaDiv.classList.add('ring-2', 'ring-blue-500');
                setTimeout(() => {
                    ideaDiv.classList.remove('ring-2', 'ring-blue-500');
                }, 300);
            });
        }
    } catch (error) {
        console.error('Error creating idea element:', error, idea);
        ideaDiv.innerHTML = `
            <div class="p-4 border-l-4 border-red-500">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${idea.title || 'Untitled Idea'}</h3>
                <p class="text-red-500">Error displaying complete idea details</p>
            </div>
        `;
    }
    
    return ideaDiv;
}

/**
 * Sign out the user with enhanced security and user experience
 */
function signOut() {
    try {
        // Show loading state
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.disabled = true;
            const originalText = signOutBtn.textContent;
            signOutBtn.textContent = 'Signing out...';
            
            // Add a small spinner if needed
            signOutBtn.classList.add('opacity-75');
        }
        
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear any other sensitive data that might be stored
        sessionStorage.clear(); // Clear any session storage data
        
        // Optional: Make a logout request to the server to invalidate the token
        // This is a good security practice if your backend supports it
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).catch(error => {
                console.log('Logout request failed, but continuing with client-side logout');
            });
        }
        
        // Show a brief message before redirecting
        showNotification('Successfully signed out', 'success');
        
        // Delay redirect slightly for better UX
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } catch (error) {
        console.error('Error during sign out:', error);
        // Even if there's an error, still try to redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Check if notification container exists, create if not
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'fixed top-4 right-4 z-50';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `mb-3 p-4 rounded-md shadow-lg transform transition-all duration-300 ease-in-out translate-x-0 opacity-100 max-w-sm`;
    
    // Set color based on type
    switch (type) {
        case 'success':
            notification.className += ' bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100';
            break;
        case 'error':
            notification.className += ' bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100';
            break;
        case 'warning':
            notification.className += ' bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
            break;
        default:
            notification.className += ' bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
    }
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
                <button class="notification-close inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none">
                    <span class="sr-only">Close</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Add close event
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.replace('translate-x-0', 'translate-x-full');
        notification.classList.replace('opacity-100', 'opacity-0');
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.replace('translate-x-0', 'translate-x-full');
            notification.classList.replace('opacity-100', 'opacity-0');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}