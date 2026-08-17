const productService = require("../services/productService");
const { lookupUpc: fetchUpcData } = require("../utils/upcLookup");

const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.user.id, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getExpiredProducts = async (req, res, next) => {
  try {
    const result = await productService.getExpiredProducts(req.user.id, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.user.id, req.params.id);
    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, message: "Product updated successfully", product });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const lookupUpc = async (req, res, next) => {
  try {
    const data = await fetchUpcData(req.params.code);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found for this barcode" });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getExpiredProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  lookupUpc,
};
