export interface TimeEntry {
  id: string;
  timestamp: Date;
  type: "clock-in" | "clock-out";
}

export interface DayState {
  isActive: boolean;
  entries: TimeEntry[];
  startTime?: Date;
  endTime?: Date;
}

export interface DiscountCalculation {
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  priceWithTax: number;
}
