const express = require("express");
const { body, query, param } = require("express-validator");
const {
  getProducts,
  getExpiredProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  lookupUpc,
} = require("../controllers/productController");
const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

// ─── Validation Rules ─────────────────────────────────────────────────────────

const productValidation = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 1, max: 200 }).withMessage("Title must be between 1 and 200 characters"),
  body("upcCode")
    .optional()
    .trim()
    .isString().withMessage("UPC code must be a string"),
  body("quantity")
    .optional()
    .isInt({ min: 1 }).withMessage("Quantity must be an integer greater than 0")
    .toInt(),
  body("expiryDate")
    .notEmpty().withMessage("Expiry date is required")
    .isISO8601().toDate().withMessage("Must be a valid ISO8601 date")
    .custom((value) => {
      if (value < new Date()) {
        throw new Error("Expiry date must be in the future");
      }
      return true;
    }),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
  body("category")
    .optional()
    .trim()
    .isString().withMessage("Category must be a string"),
];

const updateProductValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 1, max: 200 }).withMessage("Title must be between 1 and 200 characters"),
  body("upcCode")
    .optional()
    .trim()
    .isString().withMessage("UPC code must be a string"),
  body("quantity")
    .optional()
    .isInt({ min: 1 }).withMessage("Quantity must be an integer greater than 0")
    .toInt(),
  body("expiryDate")
    .optional()
    .isISO8601().toDate().withMessage("Must be a valid ISO8601 date"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
  body("category")
    .optional()
    .trim()
    .isString().withMessage("Category must be a string"),
];

const paginationValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
  query("search").optional().trim().isString(),
  query("expiryWithin").optional().isIn(["7d", "1m", "3m", "6m"]),
  query("sort").optional().isIn(["expiryDate", "-expiryDate"]),
];

const idValidation = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
];

const upcValidation = [
  param("code").trim().notEmpty().withMessage("Barcode is required").isString(),
];

// ─── Swagger Tags ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all non-expired products (paginated)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or UPC
 *       - in: query
 *         name: expiryWithin
 *         schema:
 *           type: string
 *           enum: [7d, 1m, 3m, 6m]
 *         description: Filter by expiry date window
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [expiryDate, -expiryDate]
 *           default: expiryDate
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of products
 *       401:
 *         description: Unauthorized
 */
router.get("/", paginationValidation, validate, getProducts);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - expiryDate
 *             properties:
 *               title:
 *                 type: string
 *               upcCode:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", productValidation, validate, createProduct);

/**
 * @swagger
 * /products/expired:
 *   get:
 *     summary: Get all expired products (paginated)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of expired products
 *       401:
 *         description: Unauthorized
 */
router.get("/expired", paginationValidation, validate, getExpiredProducts);

/**
 * @swagger
 * /products/upc/{code}:
 *   get:
 *     summary: Lookup product details by UPC barcode
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found for this barcode
 */
router.get("/upc/:code", upcValidation, validate, lookupUpc);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.get("/:id", idValidation, validate, getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               upcCode:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.put("/:id", idValidation, updateProductValidation, validate, updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.delete("/:id", idValidation, validate, deleteProduct);

module.exports = router;
