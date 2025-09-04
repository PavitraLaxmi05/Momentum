/**
 * Re-Gen (Sustainability Spotlight) Page JavaScript
 * Handles dynamic content loading, carousels, and user interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeReGen();
    
    // Load all dynamic content
    loadInfluencers();
    loadSustainableProjects();
    loadUserStories();
    initializeEmissionsChart();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Initialize the Re-Gen page
 */
function initializeReGen() {
    console.log('Initializing Re-Gen page...');
    
    // Add animation classes to elements as they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    // Observe all sections for animations
    document.querySelectorAll('section, .card-hover').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Load sustainability influencers data
 */
function loadInfluencers() {
    const influencers = [
        {
            id: 1,
            name: "Greta Thunberg",
            handle: "@gretathunberg",
            bio: "Climate activist and environmental advocate",
            followers: "5.2M",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            latestPost: "The climate crisis is not just about the environment. It's about justice, equality, and our future.",
            impact: "Climate Action",
            verified: true
        },
        {
            id: 2,
            name: "David Attenborough",
            handle: "@davidattenborough",
            bio: "Naturalist, broadcaster, and environmental campaigner",
            followers: "4.8M",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            latestPost: "We must act now to protect our planet for future generations.",
            impact: "Wildlife Conservation",
            verified: true
        },
        {
            id: 3,
            name: "Isatou Ceesay",
            handle: "@isatou_ceesay",
            bio: "Environmental activist and waste management pioneer",
            followers: "125K",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            latestPost: "Transforming waste into wealth - one plastic bag at a time.",
            impact: "Waste Reduction",
            verified: false
        },
        {
            id: 4,
            name: "Boyan Slat",
            handle: "@boyanslat",
            bio: "Founder of The Ocean Cleanup, tackling plastic pollution",
            followers: "890K",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            latestPost: "Our latest cleanup system is removing tons of plastic from the Great Pacific Garbage Patch.",
            impact: "Ocean Cleanup",
            verified: true
        },
        {
            id: 5,
            name: "Vandana Shiva",
            handle: "@drvandanashiva",
            bio: "Environmental activist and seed sovereignty advocate",
            followers: "2.1M",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            latestPost: "Seed freedom is food freedom. We must protect our agricultural heritage.",
            impact: "Food Sovereignty",
            verified: true
        },
        {
            id: 6,
            name: "Wangari Maathai",
            handle: "@wangari_maathai_foundation",
            bio: "Nobel Peace Prize winner and tree planting advocate",
            followers: "340K",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            latestPost: "Planting trees is planting hope for our planet's future.",
            impact: "Reforestation",
            verified: true
        }
    ];

    renderInfluencerCarousel(influencers);
}

/**
 * Render influencer carousel
 */
function renderInfluencerCarousel(influencers) {
    const carousel = document.getElementById('influencer-carousel');
    if (!carousel) return;

    carousel.innerHTML = '';
    let currentIndex = 0;

    influencers.forEach((influencer, index) => {
        const card = document.createElement('div');
        card.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        card.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg card-hover mx-4">
                <div class="flex items-center mb-6">
                    <img src="${influencer.avatar}" alt="${influencer.name}" class="w-16 h-16 rounded-full object-cover mr-4">
                    <div>
                        <div class="flex items-center">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">${influencer.name}</h3>
                            ${influencer.verified ? '<svg class="w-5 h-5 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' : ''}
                        </div>
                        <p class="text-gray-600 dark:text-gray-400">${influencer.handle}</p>
                        <p class="text-sm text-green-600 dark:text-green-400 font-medium">${influencer.followers} followers</p>
                    </div>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-4">${influencer.bio}</p>
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <p class="text-sm text-gray-600 dark:text-gray-400 italic">"${influencer.latestPost}"</p>
                </div>
                <div class="flex items-center justify-between">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                        ${influencer.impact}
                    </span>
                    <a href="https://twitter.com/${influencer.handle.replace('@', '')}" target="_blank" class="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200">
                        Follow for Tips
                    </a>
                </div>
            </div>
        `;
        carousel.appendChild(card);
    });

    // Set up carousel navigation
    setupCarouselNavigation(influencers.length);
}

/**
 * Set up carousel navigation
 */
function setupCarouselNavigation(totalItems) {
    const carousel = document.getElementById('influencer-carousel');
    const prevBtn = document.getElementById('prev-influencer');
    const nextBtn = document.getElementById('next-influencer');
    let currentIndex = 0;

    function updateCarousel() {
        const translateX = -currentIndex * 100;
        carousel.style.transform = `translateX(${translateX}%)`;
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        updateCarousel();
    });

    // Auto-advance carousel every 5 seconds
    setInterval(() => {
        currentIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        updateCarousel();
    }, 5000);
}

/**
 * Load sustainable projects data
 */
function loadSustainableProjects() {
    const projects = [
        {
            id: 1,
            name: "Bosco Verticale",
            location: "Milan, Italy",
            image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            description: "Vertical forest with 900 trees, 5,000 shrubs, and 11,000 plants that absorb CO₂ and produce oxygen.",
            co2Savings: "30 tons/year",
            materials: "Reinforced concrete, steel, glass",
            year: "2014",
            architect: "Stefano Boeri",
            features: ["Vertical Forest", "Energy Efficient", "Air Purification"]
        },
        {
            id: 2,
            name: "One Central Park",
            location: "Sydney, Australia",
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            description: "Mixed-use development with extensive green walls and sustainable design features.",
            co2Savings: "25 tons/year",
            materials: "Steel, glass, concrete, vegetation",
            year: "2013",
            architect: "Ateliers Jean Nouvel",
            features: ["Green Walls", "Solar Panels", "Water Recycling"]
        },
        {
            id: 3,
            name: "Iberdrola Tower",
            location: "Bilbao, Spain",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            description: "LEED Platinum certified office tower with advanced energy efficiency systems.",
            co2Savings: "40 tons/year",
            materials: "Steel, glass, aluminum",
            year: "2011",
            architect: "César Pelli",
            features: ["LEED Platinum", "Smart Building", "Renewable Energy"]
        },
        {
            id: 4,
            name: "The Edge",
            location: "Amsterdam, Netherlands",
            image: "https://images.unsplash.com/photo-1494522358652-f8ecc0b5a4e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            description: "World's most sustainable office building with BREEAM Outstanding certification.",
            co2Savings: "50 tons/year",
            materials: "Steel, glass, concrete, solar panels",
            year: "2015",
            architect: "PLP Architecture",
            features: ["BREEAM Outstanding", "Smart Technology", "Net Zero Energy"]
        },
        {
            id: 5,
            name: "Bullitt Center",
            location: "Seattle, USA",
            image: "https://images.unsplash.com/photo-1503387762-94deb8381f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            description: "Living Building Challenge certified office building with net-zero energy and water.",
            co2Savings: "35 tons/year",
            materials: "FSC-certified wood, steel, glass",
            year: "2013",
            architect: "Miller Hull Partnership",
            features: ["Living Building", "Net Zero Energy", "Water Neutral"]
        },
        {
            id: 6,
            name: "Pearl River Tower",
            location: "Guangzhou, China",
            image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            description: "Super-tall skyscraper designed to be energy-efficient with integrated wind turbines.",
            co2Savings: "45 tons/year",
            materials: "Steel, glass, concrete, wind turbines",
            year: "2013",
            architect: "SOM",
            features: ["Wind Turbines", "Solar Panels", "Energy Efficient"]
        }
    ];

    renderProjectsGrid(projects);
}

/**
 * Render projects grid
 */
function renderProjectsGrid(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = '';

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg card-hover';
        card.innerHTML = `
            <div class="relative">
                <img src="${project.image}" alt="${project.name}" class="w-full h-48 object-cover">
                <div class="absolute top-4 right-4">
                    <span class="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ${project.year}
                    </span>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${project.name}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">${project.location}</p>
                <p class="text-gray-700 dark:text-gray-300 mb-4">${project.description}</p>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                        <p class="text-sm text-green-600 dark:text-green-400 font-medium">CO₂ Savings</p>
                        <p class="text-lg font-bold text-green-800 dark:text-green-200">${project.co2Savings}</p>
                    </div>
                    <div class="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                        <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">Architect</p>
                        <p class="text-sm font-bold text-blue-800 dark:text-blue-200">${project.architect}</p>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    ${project.features.map(feature => `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            ${feature}
                        </span>
                    `).join('')}
                </div>
                
                <button class="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200">
                    Learn More
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * Load user stories data
 */
function loadUserStories() {
    const stories = [
        {
            id: 1,
            title: "Zero-Waste Kitchen Transformation",
            author: "Sarah M.",
            date: "2 days ago",
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            description: "Completely transformed my kitchen to eliminate single-use plastics and reduce food waste by 80%.",
            impact: "Reduced waste by 80%, saved 200kg CO₂",
            likes: 42,
            comments: 8
        },
        {
            id: 2,
            title: "Community Solar Garden",
            author: "Mike R.",
            date: "1 week ago",
            image: "https://images.unsplash.com/photo-1509391366360-2e959b1e4c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            description: "Started a community solar project that now powers 50 homes in our neighborhood.",
            impact: "Generated 500kW clean energy, saved 300 tons CO₂",
            likes: 89,
            comments: 15
        },
        {
            id: 3,
            title: "Urban Rooftop Garden",
            author: "Emma L.",
            date: "2 weeks ago",
            image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            description: "Converted my apartment rooftop into a thriving vegetable garden, growing 80% of my produce.",
            impact: "Grew 200kg vegetables, reduced food miles by 90%",
            likes: 67,
            comments: 12
        }
    ];

    renderUserStoriesGrid(stories);
}

/**
 * Render user stories grid
 */
function renderUserStoriesGrid(stories) {
    const grid = document.getElementById('user-stories-grid');
    if (!grid) return;

    grid.innerHTML = '';

    stories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg card-hover';
        card.innerHTML = `
            <div class="relative">
                <img src="${story.image}" alt="${story.title}" class="w-full h-48 object-cover">
                <div class="absolute top-4 left-4">
                    <span class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ${story.date}
                    </span>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${story.title}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">by ${story.author}</p>
                <p class="text-gray-700 dark:text-gray-300 mb-4">${story.description}</p>
                
                <div class="bg-green-50 dark:bg-green-900 p-3 rounded-lg mb-4">
                    <p class="text-sm text-green-600 dark:text-green-400 font-medium">Impact</p>
                    <p class="text-sm font-bold text-green-800 dark:text-green-200">${story.impact}</p>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <button class="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors duration-200">
                            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            ${story.likes}
                        </button>
                        <button class="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors duration-200">
                            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            ${story.comments}
                        </button>
                    </div>
                    <button class="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200">
                        Read More
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * Initialize emissions chart
 */
function initializeEmissionsChart() {
    const ctx = document.getElementById('emissions-chart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Energy Efficiency', 'Renewable Energy', 'Waste Reduction', 'Water Conservation', 'Green Materials'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    '#10b981',
                    '#059669',
                    '#047857',
                    '#065f46',
                    '#064e3b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Story submission form
    const form = document.getElementById('story-submission-form');
    if (form) {
        form.addEventListener('submit', handleStorySubmission);
    }

    // Hero section buttons
    const exploreBtn = document.querySelector('button:contains("Explore Projects")');
    const shareBtn = document.querySelector('button:contains("Share Your Story")');
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            document.getElementById('projects-grid').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            document.getElementById('story-submission-form').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

/**
 * Handle story submission
 */
function handleStorySubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const storyData = {
        title: formData.get('title'),
        description: formData.get('description'),
        impact: formData.get('impact'),
        image: formData.get('image')
    };

    // Validate form
    if (!storyData.title || !storyData.description || !storyData.impact) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Simulate API call
    showNotification('Submitting your story...', 'info');
    
    setTimeout(() => {
        // Add to user stories grid
        addUserStory({
            id: Date.now(),
            title: storyData.title,
            author: "You",
            date: "Just now",
            image: storyData.image ? URL.createObjectURL(storyData.image) : "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            description: storyData.description,
            impact: storyData.impact,
            likes: 0,
            comments: 0
        });
        
        showNotification('Your story has been submitted successfully!', 'success');
        e.target.reset();
    }, 2000);
}

/**
 * Add user story to grid
 */
function addUserStory(story) {
    const grid = document.getElementById('user-stories-grid');
    if (!grid) return;

    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg card-hover scale-in';
    card.innerHTML = `
        <div class="relative">
            <img src="${story.image}" alt="${story.title}" class="w-full h-48 object-cover">
            <div class="absolute top-4 left-4">
                <span class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ${story.date}
                </span>
            </div>
        </div>
        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${story.title}</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">by ${story.author}</p>
            <p class="text-gray-700 dark:text-gray-300 mb-4">${story.description}</p>
            
            <div class="bg-green-50 dark:bg-green-900 p-3 rounded-lg mb-4">
                <p class="text-sm text-green-600 dark:text-green-400 font-medium">Impact</p>
                <p class="text-sm font-bold text-green-800 dark:text-green-200">${story.impact}</p>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button class="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors duration-200">
                        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        ${story.likes}
                    </button>
                    <button class="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors duration-200">
                        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        ${story.comments}
                    </button>
                </div>
                <button class="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200">
                    Read More
                </button>
            </div>
        </div>
    `;
    
    grid.insertBefore(card, grid.firstChild);
}

/**
 * Show notification
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
