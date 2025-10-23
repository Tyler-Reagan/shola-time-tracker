import React, { useState } from "react";
import { DiscountCalculation } from "../types";

const SAN_DIEGO_SALES_TAX_RATE = 0.0775; // 7.75% for San Diego, CA
const DISCOUNT_INCREMENTS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
];

export const DiscountCalculator: React.FC = () => {
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [chipPrices, setChipPrices] = useState<number[]>([]);
  const [showTable, setShowTable] = useState(false);

  const calculateDiscountedPrice = (
    price: number,
    discountPercent: number
  ): DiscountCalculation => {
    const discountFactor = 1 - discountPercent / 100;
    const discountedPrice = price * discountFactor;
    const priceWithTax = discountedPrice * (1 + SAN_DIEGO_SALES_TAX_RATE);
    return {
      originalPrice: price,
      discountPercent,
      discountedPrice,
      priceWithTax,
    };
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (originalPrice <= 0) {
      alert("Please enter a valid positive number for the original price.");
      return;
    }

    setChipPrices((prev) => [...prev, originalPrice]);
    setShowTable(true);
    setOriginalPrice(0);
  };

  const removeChip = (index: number) => {
    setChipPrices((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllChips = () => {
    setChipPrices([]);
    setShowTable(false);
  };

  const generateTableForSum = () => {
    const sum = chipPrices.reduce((acc, price) => acc + price, 0);
    setOriginalPrice(sum);
    setShowTable(true);
  };

  const sumChips = chipPrices.reduce((acc, price) => acc + price, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Discount Calculator
        </h1>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="originalPrice"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Original Price ($):
            </label>
            <input
              type="number"
              id="originalPrice"
              value={originalPrice || ""}
              onChange={(e) =>
                setOriginalPrice(parseFloat(e.target.value) || 0)
              }
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Generate Discount Table
          </button>
        </form>

        {/* Chips UI */}
        {chipPrices.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {chipPrices.map((price, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  ${price.toFixed(2)}
                  <button
                    onClick={() => removeChip(index)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearAllChips}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Clear Prices
              </button>
              <button
                onClick={generateTableForSum}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Generate From Sum (${sumChips.toFixed(2)})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discount Table */}
      {showTable && originalPrice > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Discount Table for ${originalPrice.toFixed(2)}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price After Discount ($)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price with Tax ($)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {DISCOUNT_INCREMENTS.map((discountPercent) => {
                  const { discountedPrice, priceWithTax } =
                    calculateDiscountedPrice(originalPrice, discountPercent);
                  return (
                    <tr key={discountPercent} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {discountPercent}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${discountedPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${priceWithTax.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
