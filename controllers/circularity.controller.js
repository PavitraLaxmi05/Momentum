const FarmerResource = require('../models/farmerResource.model');
const CommunityNeed = require('../models/communityNeed.model');
const { ErrorResponse } = require('../middleware/error.middleware');

exports.createFarmerResource = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user && req.user.id) payload.user = req.user.id;
    const created = await FarmerResource.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

exports.createCommunityNeed = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user && req.user.id) payload.user = req.user.id;
    const created = await CommunityNeed.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

exports.listFarmerResources = async (req, res, next) => {
  try {
    const { resource, region } = req.query;
    const filter = {};
    if (resource) filter.resource = resource;
    if (region) filter.location = new RegExp(region, 'i');
    const items = await FarmerResource.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
};

exports.listCommunityNeeds = async (req, res, next) => {
  try {
    const { need, region } = req.query;
    const filter = {};
    if (need) filter.need = need;
    if (region) filter.location = new RegExp(region, 'i');
    const items = await CommunityNeed.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
};


