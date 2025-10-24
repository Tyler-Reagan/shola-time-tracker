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
  Button,
  Chip,
  Stack,
} from "@mui/material";

const SAN_DIEGO_SALES_TAX_RATE = 0.0775; // 7.75% for San Diego, CA
const DISCOUNT_INCREMENTS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
];

export const DiscountCalculator: React.FC = () => {
  const [price, setPrice] = useState<number>(0);
  const [priceChips, setPriceChips] = useState<number[]>([]);

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
    setPriceChips((prev) => [...prev, price]);
    setPrice(0);
  };

  const handleSubmitSum = () => {
    const sum = priceChips.reduce((total, chipPrice) => total + chipPrice, 0);
    setPrice(sum);
    setPriceChips([]);
  };

  const removeChip = (index: number) => {
    setPriceChips((prev) => prev.filter((_, i) => i !== index));
  };

  const chipSum = priceChips.reduce((total, chipPrice) => total + chipPrice, 0);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}
    >
      <Card>
        <CardHeader
          sx={{ pb: 0 }}
          title={
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Discount Calculator
            </Typography>
          }
        />
        <CardContent>
          <Typography
            variant="body1"
            component="p"
            sx={{
              fontSize: { xs: "0.875rem", sm: "0.875rem" },
              mb: 1,
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            Enter the original price of the item you want to calculate the
            discount for.
          </Typography>
          <TextField
            type="number"
            value={price || ""}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            slotProps={{ input: { inputProps: { min: 0, step: 0.01 } } }}
            required
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: { xs: "center", sm: "flex-start" },
                alignItems: { xs: "stretch", sm: "flex-start" },
              }}
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  minWidth: { xs: "100%", sm: 120 },
                  minHeight: { xs: 44, sm: 36 },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Submit Price
              </Button>
              {priceChips.length > 0 && (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitSum}
                  sx={{
                    minWidth: { xs: "100%", sm: 120 },
                    minHeight: { xs: 44, sm: 36 },
                  }}
                >
                  Submit Sum
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Price Chips */}
      {priceChips.length > 0 && (
        <Card>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}
            >
              {priceChips.map((chipPrice, index) => (
                <Chip
                  key={index}
                  label={`$${chipPrice.toFixed(2)}`}
                  onDelete={() => removeChip(index)}
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    height: { xs: 32, sm: 28 },
                  }}
                />
              ))}
              <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />
              <Chip
                label={`Sum: $${chipSum.toFixed(2)}`}
                color="secondary"
                variant="filled"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  height: { xs: 32, sm: 28 },
                  width: { xs: "100%", sm: "auto" },
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Discount Table */}
      {price > 0 && (
        <Card>
          <CardHeader
            title={
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                Discount Table for ${price.toFixed(2)}
              </Typography>
            }
          />
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                overflowX: "auto",
                "&::-webkit-scrollbar": {
                  height: 8,
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 4,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: 4,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.5)",
                  },
                },
              }}
            >
              <Table sx={{ minWidth: 300 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontWeight: 600,
                        minWidth: { xs: 80, sm: 100 },
                      }}
                    >
                      Discount %
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontWeight: 600,
                        minWidth: { xs: 100, sm: 140 },
                      }}
                    >
                      Price After Discount ($)
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontWeight: 600,
                        minWidth: { xs: 100, sm: 120 },
                      }}
                    >
                      Price with Tax ($)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DISCOUNT_INCREMENTS.map((discountPercent) => {
                    const { discountedPrice, priceWithTax } =
                      calculateDiscountedPrice(price, discountPercent);
                    return (
                      <TableRow key={discountPercent} hover>
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            fontWeight: "medium",
                          }}
                        >
                          {discountPercent}%
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          ${discountedPrice.toFixed(2)}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          ${priceWithTax.toFixed(2)}
                        </TableCell>
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
