export interface TimeEntry {
  id: string;
  timestamp: Date;
  type: "clock-in" | "clock-out";
  reason?: string; // Optional reason for clock-out entries
}

export interface DayState {
  isActive: boolean;
  entries: TimeEntry[];
  startTime?: Date;
  endTime?: Date;
  dayDate?: Date; // Static date set when the day starts
}

export interface DiscountCalculation {
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  priceWithTax: number;
}
