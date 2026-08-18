const productDao = require("../dao/productDao");

const createProduct = async (userId, data) => {
  return await productDao.create({ ...data, userId });
};

const getProducts = async (userId, query) => {
  const { page = 1, limit = 20, search, expiryWithin, sort } = query;
  const skip = (page - 1) * limit;

  const filters = {};
  
  // Don't show expired products here (expired = today or before)
  const tomorrow = new Date();
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1); // Start of tomorrow
  filters.expiryDate = { $gte: tomorrow };

  if (search) {
    filters.$text = { $search: search };
  }

  if (expiryWithin) {
    // Start calculating from tomorrow (since today is considered expired)
    const futureDate = new Date(tomorrow);
    
    if (expiryWithin === "7d") futureDate.setUTCDate(tomorrow.getUTCDate() + 7 - 1); // 7 days from tomorrow includes tomorrow
    else if (expiryWithin === "1m") futureDate.setUTCMonth(tomorrow.getUTCMonth() + 1);
    else if (expiryWithin === "3m") futureDate.setUTCMonth(tomorrow.getUTCMonth() + 3);
    else if (expiryWithin === "6m") futureDate.setUTCMonth(tomorrow.getUTCMonth() + 6);
    
    // Set to end of the day for the future date to cover the entire day
    futureDate.setUTCHours(23, 59, 59, 999);
    
    filters.expiryDate = { $gte: tomorrow, $lte: futureDate };
  }

  let sortObj = { expiryDate: 1 };
  if (sort === "-expiryDate") {
    sortObj = { expiryDate: -1 };
  }

  const [products, total] = await Promise.all([
    productDao.findByUser(userId, filters, skip, Number(limit), sortObj),
    productDao.countByUser(userId, filters),
  ]);

  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

const getExpiredProducts = async (userId, query) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    productDao.findExpiredByUser(userId, skip, Number(limit)),
    productDao.countExpiredByUser(userId),
  ]);

  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

const getProductById = async (userId, productId) => {
  const product = await productDao.findById(productId, userId);
  if (!product) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }
  return product;
};

const updateProduct = async (userId, productId, data) => {
  const product = await productDao.updateById(productId, userId, data);
  if (!product) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }
  return product;
};

const deleteProduct = async (userId, productId) => {
  const product = await productDao.deleteById(productId, userId);
  if (!product) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }
  return product;
};

module.exports = {
  createProduct,
  getProducts,
  getExpiredProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
