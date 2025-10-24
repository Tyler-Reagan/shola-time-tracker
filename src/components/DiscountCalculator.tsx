import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const SAN_DIEGO_SALES_TAX_RATE = 0.0775; // 7.75% for San Diego, CA
const DISCOUNT_INCREMENTS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
];

export const DiscountCalculator: React.FC = () => {
  const [price, setPrice] = useState<number>(0);

  const calculateDiscountedPrice = (
    originalPrice: number,
    discountPercent: number
  ) => {
    const discountFactor = 1 - discountPercent / 100;
    const discountedPrice = originalPrice * discountFactor;
    const priceWithTax = discountedPrice * (1 + SAN_DIEGO_SALES_TAX_RATE);
    return { discountedPrice, priceWithTax };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (price <= 0) {
      alert("Please enter a valid positive number for the original price.");
      return;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card>
        <CardHeader
          title={
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
              Discount Calculator
            </Typography>
          }
        />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Original Price ($)"
              type="number"
              value={price || ""}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              slotProps={{ input: { inputProps: { min: 0, step: 0.01 } } }}
              required
              fullWidth
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Discount Table */}
      {price > 0 && (
        <Card>
          <CardHeader
            title={
              <Typography variant="h6" component="h2">
                Discount Table for ${price.toFixed(2)}
              </Typography>
            }
          />
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Discount %</TableCell>
                    <TableCell>Price After Discount ($)</TableCell>
                    <TableCell>Price with Tax ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DISCOUNT_INCREMENTS.map((discountPercent) => {
                    const { discountedPrice, priceWithTax } =
                      calculateDiscountedPrice(price, discountPercent);
                    return (
                      <TableRow key={discountPercent} hover>
                        <TableCell component="th" scope="row">
                          {discountPercent}%
                        </TableCell>
                        <TableCell>${discountedPrice.toFixed(2)}</TableCell>
                        <TableCell>${priceWithTax.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
