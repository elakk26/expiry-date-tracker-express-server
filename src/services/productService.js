const productDao = require("../dao/productDao");

const createProduct = async (userId, data) => {
  return await productDao.create({ ...data, userId });
};

const getProducts = async (userId, query) => {
  const { page = 1, limit = 20, search, expiryWithin, sort } = query;
  const skip = (page - 1) * limit;

  const filters = {};
  
  // Don't show expired products here
  filters.expiryDate = { $gte: new Date() };

  if (search) {
    filters.$text = { $search: search };
  }

  if (expiryWithin) {
    const now = new Date();
    const futureDate = new Date();
    
    if (expiryWithin === "7d") futureDate.setDate(now.getDate() + 7);
    else if (expiryWithin === "1m") futureDate.setMonth(now.getMonth() + 1);
    else if (expiryWithin === "3m") futureDate.setMonth(now.getMonth() + 3);
    else if (expiryWithin === "6m") futureDate.setMonth(now.getMonth() + 6);
    
    filters.expiryDate = { $gte: now, $lte: futureDate };
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
