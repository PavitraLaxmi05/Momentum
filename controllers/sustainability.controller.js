const Sustainability = require('../models/sustainability.model');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

/**
 * Sustainability Controller
 * Handles all sustainability-related operations including influencers, projects, and user stories
 */

/**
 * Get sustainability influencers data
 * @route GET /api/sustainability/influencers
 * @access Private
 */
const getInfluencers = async (req, res) => {
    try {
        // Check if we have cached data that's less than 24 hours old
        const cachedData = await Sustainability.findOne({ 
            type: 'influencers',
            updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (cachedData) {
            return res.json({
                success: true,
                data: cachedData.data,
                cached: true,
                lastUpdated: cachedData.updatedAt
            });
        }

        // If no cached data or data is stale, return static data for now
        // In production, this would fetch from X API
        const staticInfluencers = [
            {
                id: 1,
                name: "Greta Thunberg",
                handle: "@gretathunberg",
                bio: "Climate activist and environmental advocate",
                followers: "5.2M",
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                latestPost: "The climate crisis is not just about the environment. It's about justice, equality, and our future.",
                impact: "Climate Action",
                verified: true,
                xProfile: "https://twitter.com/gretathunberg"
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
                verified: true,
                xProfile: "https://twitter.com/davidattenborough"
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
                verified: false,
                xProfile: "https://twitter.com/isatou_ceesay"
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
                verified: true,
                xProfile: "https://twitter.com/boyanslat"
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
                verified: true,
                xProfile: "https://twitter.com/drvandanashiva"
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
                verified: true,
                xProfile: "https://twitter.com/wangari_maathai_foundation"
            }
        ];

        // Cache the data
        await Sustainability.findOneAndUpdate(
            { type: 'influencers' },
            { 
                type: 'influencers',
                data: staticInfluencers,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            data: staticInfluencers,
            cached: false,
            lastUpdated: new Date()
        });

    } catch (error) {
        console.error('Error fetching influencers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch influencers data',
            error: error.message
        });
    }
};

/**
 * Get sustainable building projects data
 * @route GET /api/sustainability/projects
 * @access Private
 */
const getProjects = async (req, res) => {
    try {
        // Check if we have cached data that's less than 7 days old
        const cachedData = await Sustainability.findOne({ 
            type: 'projects',
            updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        if (cachedData) {
            return res.json({
                success: true,
                data: cachedData.data,
                cached: true,
                lastUpdated: cachedData.updatedAt
            });
        }

        // Static data for now - in production, this would fetch from web APIs
        const staticProjects = [
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
                features: ["Vertical Forest", "Energy Efficient", "Air Purification"],
                emissionsBreakdown: {
                    energyEfficiency: 35,
                    renewableEnergy: 25,
                    wasteReduction: 20,
                    waterConservation: 12,
                    greenMaterials: 8
                }
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
                features: ["Green Walls", "Solar Panels", "Water Recycling"],
                emissionsBreakdown: {
                    energyEfficiency: 30,
                    renewableEnergy: 30,
                    wasteReduction: 15,
                    waterConservation: 15,
                    greenMaterials: 10
                }
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
                features: ["LEED Platinum", "Smart Building", "Renewable Energy"],
                emissionsBreakdown: {
                    energyEfficiency: 40,
                    renewableEnergy: 35,
                    wasteReduction: 10,
                    waterConservation: 10,
                    greenMaterials: 5
                }
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
                features: ["BREEAM Outstanding", "Smart Technology", "Net Zero Energy"],
                emissionsBreakdown: {
                    energyEfficiency: 45,
                    renewableEnergy: 40,
                    wasteReduction: 8,
                    waterConservation: 5,
                    greenMaterials: 2
                }
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
                features: ["Living Building", "Net Zero Energy", "Water Neutral"],
                emissionsBreakdown: {
                    energyEfficiency: 50,
                    renewableEnergy: 30,
                    wasteReduction: 10,
                    waterConservation: 8,
                    greenMaterials: 2
                }
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
                features: ["Wind Turbines", "Solar Panels", "Energy Efficient"],
                emissionsBreakdown: {
                    energyEfficiency: 35,
                    renewableEnergy: 40,
                    wasteReduction: 15,
                    waterConservation: 7,
                    greenMaterials: 3
                }
            }
        ];

        // Cache the data
        await Sustainability.findOneAndUpdate(
            { type: 'projects' },
            { 
                type: 'projects',
                data: staticProjects,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            data: staticProjects,
            cached: false,
            lastUpdated: new Date()
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects data',
            error: error.message
        });
    }
};

/**
 * Submit user sustainability story
 * @route POST /api/sustainability/submit
 * @access Private
 */
const submitStory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { title, description, impact, category, tags } = req.body;
        const userId = req.user.id;

        // Handle file upload if present
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const storyData = {
            title,
            description,
            impact,
            category: category || 'General',
            tags: tags || [],
            image: imageUrl,
            author: userId,
            likes: 0,
            comments: [],
            status: 'pending', // For moderation
            createdAt: new Date()
        };

        const story = new Sustainability({
            type: 'user_story',
            data: storyData
        });

        await story.save();

        res.status(201).json({
            success: true,
            message: 'Story submitted successfully',
            data: {
                id: story._id,
                ...storyData
            }
        });

    } catch (error) {
        console.error('Error submitting story:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit story',
            error: error.message
        });
    }
};

/**
 * Get user-generated sustainability stories
 * @route GET /api/sustainability/stories
 * @access Private
 */
const getStories = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, status = 'approved' } = req.query;
        const skip = (page - 1) * limit;

        const query = { 
            type: 'user_story',
            'data.status': status
        };

        if (category) {
            query['data.category'] = category;
        }

        const stories = await Sustainability.find(query)
            .populate('data.author', 'username firstName lastName')
            .sort({ 'data.createdAt': -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Sustainability.countDocuments(query);

        res.json({
            success: true,
            data: stories.map(story => ({
                id: story._id,
                ...story.data,
                author: story.data.author
            })),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalStories: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stories',
            error: error.message
        });
    }
};

/**
 * Like a sustainability story
 * @route POST /api/sustainability/stories/:id/like
 * @access Private
 */
const likeStory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const story = await Sustainability.findById(id);
        if (!story || story.type !== 'user_story') {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Check if user already liked this story
        const likedBy = story.data.likedBy || [];
        const isLiked = likedBy.includes(userId);

        if (isLiked) {
            // Unlike
            story.data.likedBy = likedBy.filter(id => id.toString() !== userId);
            story.data.likes = Math.max(0, story.data.likes - 1);
        } else {
            // Like
            story.data.likedBy = [...likedBy, userId];
            story.data.likes = (story.data.likes || 0) + 1;
        }

        await story.save();

        res.json({
            success: true,
            message: isLiked ? 'Story unliked' : 'Story liked',
            data: {
                likes: story.data.likes,
                isLiked: !isLiked
            }
        });

    } catch (error) {
        console.error('Error liking story:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like story',
            error: error.message
        });
    }
};

/**
 * Add comment to sustainability story
 * @route POST /api/sustainability/stories/:id/comment
 * @access Private
 */
const commentStory = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const userId = req.user.id;

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot be empty'
            });
        }

        const story = await Sustainability.findById(id);
        if (!story || story.type !== 'user_story') {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        const newComment = {
            id: new Date().getTime().toString(),
            author: userId,
            comment: comment.trim(),
            createdAt: new Date()
        };

        story.data.comments = story.data.comments || [];
        story.data.comments.push(newComment);
        story.data.commentCount = (story.data.commentCount || 0) + 1;

        await story.save();

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: {
                comment: newComment,
                totalComments: story.data.commentCount
            }
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message
        });
    }
};

/**
 * Manually refresh influencer and project data
 * @route POST /api/sustainability/refresh
 * @access Private (Admin only)
 */
const refreshData = async (req, res) => {
    try {
        // Check if user is admin (you can implement admin check here)
        // For now, we'll just clear the cache and let the next request fetch fresh data
        
        await Sustainability.deleteMany({ 
            type: { $in: ['influencers', 'projects'] }
        });

        res.json({
            success: true,
            message: 'Data refresh initiated. Fresh data will be loaded on next request.'
        });

    } catch (error) {
        console.error('Error refreshing data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh data',
            error: error.message
        });
    }
};

module.exports = {
    getInfluencers,
    getProjects,
    submitStory,
    getStories,
    likeStory,
    commentStory,
    refreshData
};
