/**
 * Utility to look up product details by UPC/EAN barcode using Open Food Facts API.
 * @param {string} barcode 
 * @returns {Promise<{title: string, category: string, imageUrl: string} | null>}
 */
const lookupUpc = async (barcode) => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    const product = data.product;

    return {
      title: product.product_name || product.product_name_en || null,
      category: product.categories ? product.categories.split(',')[0].trim() : null,
      imageUrl: product.image_url || null,
    };
  } catch (error) {
    console.error(`[UPC Lookup Error] Failed to fetch barcode ${barcode}:`, error.message);
    return null;
  }
};

module.exports = { lookupUpc };
