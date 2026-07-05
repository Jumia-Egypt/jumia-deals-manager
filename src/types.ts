export interface CampaignRule {
  minDiscount: number;
  maxDiscount: number;
  eligibleCategories: string[];
  submissionDeadline: string;
  notes?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  description?: string;
  rules: CampaignRule;
}

export interface ProductInfo {
  sku: string;
  name: string;
  brand: string;
  category: string;
  sellerSku: string;
  image: string;
  livePrice: number;
  bestPrice: number;
  priceBeforeDiscount: number;
  currentDiscount: number;
  stock: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
  discountPercent?: string;
  savings?: string;
}
