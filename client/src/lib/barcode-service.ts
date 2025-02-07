const OPEN_FOOD_FACTS_API = "https://world.openfoodfacts.org/api/v0/product/";

export interface ProductInfo {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
}

export async function lookupBarcode(barcode: string): Promise<ProductInfo | null> {
  try {
    const response = await fetch(`${OPEN_FOOD_FACTS_API}${barcode}.json`);
    const data = await response.json();

    if (!data.status_verbose === "product found" || !data.product) {
      return null;
    }

    const product = data.product;
    const nutriments = product.nutriments;

    return {
      name: product.product_name || "Unknown Product",
      calories: nutriments["energy-kcal_100g"] || 0,
      protein: nutriments.proteins_100g || 0,
      carbs: nutriments.carbohydrates_100g || 0,
      fat: nutriments.fat_100g || 0,
      imageUrl: product.image_url
    };
  } catch (error) {
    console.error("Error looking up barcode:", error);
    return null;
  }
}
