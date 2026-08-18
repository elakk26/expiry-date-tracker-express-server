const Product = require("../models/productModel");

const create = (data) => Product.create(data);

const findByUser = (userId, filters = {}, skip = 0, limit = 20, sort = { expiryDate: 1 }) => {
  return Product.find({ userId, ...filters })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

const countByUser = (userId, filters = {}) => {
  return Product.countDocuments({ userId, ...filters });
};

const findExpiredByUser = (userId, skip = 0, limit = 20) => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return Product.find({ userId, expiryDate: { $lte: now } })
    .sort({ expiryDate: -1 })
    .skip(skip)
    .limit(limit);
};

const countExpiredByUser = (userId) => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return Product.countDocuments({ userId, expiryDate: { $lte: now } });
};

const findById = (productId, userId) => {
  return Product.findOne({ _id: productId, userId });
};

const updateById = (productId, userId, data) => {
  return Product.findOneAndUpdate({ _id: productId, userId }, data, {
    new: true,
    runValidators: true,
  });
};

const deleteById = (productId, userId) => {
  return Product.findOneAndDelete({ _id: productId, userId });
};

const findByUpc = (userId, upcCode) => {
  return Product.findOne({ userId, upcCode });
};

const findDueForNotification = (reminderLevel, dateLimit) => {
  const now = new Date();
  const query = {
    expiryDate: { $lte: dateLimit, $gt: now },
  };
  query[`notifiedAt.${reminderLevel}`] = null;
  return Product.find(query);
};

module.exports = {
  create,
  findByUser,
  countByUser,
  findExpiredByUser,
  countExpiredByUser,
  findById,
  updateById,
  deleteById,
  findByUpc,
  findDueForNotification,
};
