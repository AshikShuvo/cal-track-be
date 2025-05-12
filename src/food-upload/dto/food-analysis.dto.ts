/**
 * DTO for the result of food image analysis
 */
export class FoodAnalysisDto {
  /**
   * Name of the detected meal or food
   */
  mealName: string;

  /**
   * List of detected ingredients or food items
   */
  ingredients: string[];

  /**
   * Nutrition information (per portion)
   */
  nutrition: NutritionDto;
}

/**
 * DTO for nutrition values
 */
export class NutritionDto {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
} 