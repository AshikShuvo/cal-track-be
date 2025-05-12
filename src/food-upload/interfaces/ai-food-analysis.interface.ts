/**
 * Interface for AI food analysis service
 */
export interface AiFoodAnalysisService {
  /**
   * Analyze a food image and return structured food data
   * @param imagePath Path to the image file
   */
  analyzeImage(imagePath: string): Promise<AiFoodAnalysisResult>;
}

export interface AiFoodAnalysisResult {
  mealName: string;
  ingredients: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
} 