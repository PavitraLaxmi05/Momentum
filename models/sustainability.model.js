const mongoose = require('mongoose');

/**
 * Sustainability Schema
 * Stores various types of sustainability data including influencers, projects, and user stories
 */
const sustainabilitySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['influencers', 'projects', 'user_story', 'emissions_data'],
        index: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    // For user stories specifically
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return this.type === 'user_story';
        }
    },
    // Metadata
    metadata: {
        source: {
            type: String,
            default: 'static' // 'static', 'api', 'user_submission'
        },
        lastFetched: {
            type: Date,
            default: Date.now
        },
        version: {
            type: String,
            default: '1.0'
        }
    },
    // Caching and performance
    cacheExpiry: {
        type: Date,
        default: function() {
            // Set different expiry times based on type
            const now = new Date();
            switch (this.type) {
                case 'influencers':
                    return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
                case 'projects':
                    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
                case 'user_story':
                    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
                default:
                    return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
            }
        }
    }
}, {
    timestamps: true,
    collection: 'sustainability'
});

// Indexes for better performance
sustainabilitySchema.index({ type: 1, createdAt: -1 });
sustainabilitySchema.index({ type: 1, 'data.status': 1 });
sustainabilitySchema.index({ type: 1, 'data.category': 1 });
sustainabilitySchema.index({ author: 1, type: 1 });
sustainabilitySchema.index({ cacheExpiry: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if data is expired
sustainabilitySchema.virtual('isExpired').get(function() {
    return this.cacheExpiry && this.cacheExpiry < new Date();
});

// Method to check if data needs refresh
sustainabilitySchema.methods.needsRefresh = function() {
    const now = new Date();
    const timeDiff = now - this.updatedAt;
    
    switch (this.type) {
        case 'influencers':
            return timeDiff > 24 * 60 * 60 * 1000; // 24 hours
        case 'projects':
            return timeDiff > 7 * 24 * 60 * 60 * 1000; // 7 days
        case 'user_story':
            return false; // User stories don't auto-refresh
        default:
            return timeDiff > 24 * 60 * 60 * 1000; // 24 hours
    }
};

// Static method to get fresh data or return cached
sustainabilitySchema.statics.getFreshData = async function(type, forceRefresh = false) {
    const cached = await this.findOne({ 
        type,
        cacheExpiry: { $gt: new Date() }
    });

    if (cached && !forceRefresh) {
        return {
            data: cached.data,
            cached: true,
            lastUpdated: cached.updatedAt
        };
    }

    return null; // Indicates data needs to be fetched
};

// Static method to cache data
sustainabilitySchema.statics.cacheData = async function(type, data, metadata = {}) {
    const existing = await this.findOne({ type });
    
    if (existing) {
        existing.data = data;
        existing.metadata = { ...existing.metadata, ...metadata };
        existing.cacheExpiry = new Date(Date.now() + this.getCacheDuration(type));
        return await existing.save();
    } else {
        return await this.create({
            type,
            data,
            metadata,
            cacheExpiry: new Date(Date.now() + this.getCacheDuration(type))
        });
    }
};

// Static method to get cache duration based on type
sustainabilitySchema.statics.getCacheDuration = function(type) {
    switch (type) {
        case 'influencers':
            return 24 * 60 * 60 * 1000; // 24 hours
        case 'projects':
            return 7 * 24 * 60 * 60 * 1000; // 7 days
        case 'user_story':
            return 30 * 24 * 60 * 60 * 1000; // 30 days
        default:
            return 24 * 60 * 60 * 1000; // 24 hours
    }
};

// Pre-save middleware to update cache expiry
sustainabilitySchema.pre('save', function(next) {
    if (this.isModified('type') || this.isNew) {
        this.cacheExpiry = new Date(Date.now() + Sustainability.getCacheDuration(this.type));
    }
    next();
});

// Method to get user stories with pagination
sustainabilitySchema.statics.getUserStories = async function(options = {}) {
    const {
        page = 1,
        limit = 10,
        category,
        status = 'approved',
        sortBy = 'createdAt',
        sortOrder = -1
    } = options;

    const query = { 
        type: 'user_story',
        'data.status': status
    };

    if (category) {
        query['data.category'] = category;
    }

    const skip = (page - 1) * limit;
    const sort = { [`data.${sortBy}`]: sortOrder };

    const [stories, total] = await Promise.all([
        this.find(query)
            .populate('author', 'username firstName lastName profilePicture')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        stories: stories.map(story => ({
            id: story._id,
            ...story.data,
            author: story.author
        })),
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalStories: total,
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    };
};

// Method to get analytics data
sustainabilitySchema.statics.getAnalytics = async function() {
    const [
        totalStories,
        approvedStories,
        pendingStories,
        totalLikes,
        totalComments,
        categoryStats
    ] = await Promise.all([
        this.countDocuments({ type: 'user_story' }),
        this.countDocuments({ type: 'user_story', 'data.status': 'approved' }),
        this.countDocuments({ type: 'user_story', 'data.status': 'pending' }),
        this.aggregate([
            { $match: { type: 'user_story' } },
            { $group: { _id: null, total: { $sum: '$data.likes' } } }
        ]),
        this.aggregate([
            { $match: { type: 'user_story' } },
            { $group: { _id: null, total: { $sum: '$data.commentCount' } } }
        ]),
        this.aggregate([
            { $match: { type: 'user_story', 'data.status': 'approved' } },
            { $group: { _id: '$data.category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])
    ]);

    return {
        stories: {
            total: totalStories,
            approved: approvedStories,
            pending: pendingStories
        },
        engagement: {
            totalLikes: totalLikes[0]?.total || 0,
            totalComments: totalComments[0]?.total || 0
        },
        categories: categoryStats
    };
};

module.exports = mongoose.model('Sustainability', sustainabilitySchema);
