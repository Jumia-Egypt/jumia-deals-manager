import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { randomUUID } from "crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Mock Data ---
  
  // Campaigns
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  let campaigns: any[] = [];
  let submissions: any[] = [];

  // Products
  const products: Record<string, any> = {
    "123456EG": {
      sku: "123456EG",
      name: "Samsung Galaxy S24 Ultra 256GB - Titanium Black",
      brand: "Samsung",
      category: "Electronics",
      sellerSku: "SAM-S24U-256",
      image: "https://images.unsplash.com/photo-1707227155609-0820bb291a26?w=400&q=80",
      livePrice: 45000,
      bestPrice: 41500,
      priceBeforeDiscount: 48000,
      currentDiscount: 6.25,
      stock: 120,
      minMargin: 40000 // Internal threshold
    },
    "789012EG": {
      sku: "789012EG",
      name: "Apple AirPods Pro (2nd generation)",
      brand: "Apple",
      category: "Electronics",
      sellerSku: "APP-AIR-PRO2",
      image: "https://images.unsplash.com/photo-1606220588913-b3aecb4b277c?w=400&q=80",
      livePrice: 12000,
      bestPrice: 10900,
      priceBeforeDiscount: 14000,
      currentDiscount: 14.28,
      stock: 45,
      minMargin: 10500
    },
    "456789EG": {
      sku: "456789EG",
      name: "Nike Air Max 270 - Men's Sneaker",
      brand: "Nike",
      category: "Fashion",
      sellerSku: "NK-AM270-M-42",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      livePrice: 5500,
      bestPrice: 4800,
      priceBeforeDiscount: 7000,
      currentDiscount: 21.4,
      stock: 200,
      minMargin: 4500
    }
  };

  // --- API Routes ---

  
  app.post("/api/campaigns", (req, res) => {
    const newCampaign = { ...req.body, id: "c" + (campaigns.length + 1) };
    campaigns.push(newCampaign);
    res.json(newCampaign);
  });

  app.put("/api/campaigns/:id", (req, res) => {
    const index = campaigns.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      campaigns[index] = { ...campaigns[index], ...req.body };
      res.json(campaigns[index]);
    } else {
      res.status(404).json({ error: "Campaign not found" });
    }
  });

  app.delete("/api/campaigns/:id", (req, res) => {
    campaigns = campaigns.filter(c => c.id !== req.params.id);
    res.json({ success: true });
  });

  app.get("/api/campaigns", (req, res) => {
    res.json(campaigns);
  });

  app.get("/api/campaigns/:id", (req, res) => {
    const campaign = campaigns.find(c => c.id === req.params.id);
    if (campaign) {
      res.json(campaign);
    } else {
      res.status(404).json({ error: "Campaign not found" });
    }
  });

  app.get("/api/products/:sku", (req, res) => {
    const product = products[req.params.sku];
    if (product) {
      res.json(product);
    } else {
      res.json({
        sku: req.params.sku,
        name: "Mobile Phone",
        brand: "Generic",
        category: "Phones",
        sellerSku: "GEN-MOB-PHN",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
        livePrice: 10000,
        bestPrice: 8900,
        priceBeforeDiscount: 12000,
        currentDiscount: 16.67,
        stock: 100,
        minMargin: 5000
      });
    }
  });

  app.post("/api/validate-price", (req, res) => {
    const { sku, newPrice, newStock, campaignId } = req.body;
    
    if (!sku || !newPrice || !newStock || !campaignId) {
      return res.status(400).json({ valid: false, error: "Missing required fields" });
    }

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return res.status(404).json({ valid: false, error: "Campaign not found" });

    // Try finding predefined product, or build fallback Mobile Phone
    let product = products[sku];
    if (!product) {
      const targetDiscount = campaign ? Math.min(80, Math.max(10, (campaign.rules.minDiscount + campaign.rules.maxDiscount) / 2)) : 20;
      const priceBefore = Math.round(10000 / (1 - targetDiscount / 100));
      product = {
        sku: sku,
        name: "Mobile Phone",
        brand: "Generic",
        category: campaign.rules.eligibleCategories[0] || "Phones",
        sellerSku: "GEN-MOB-PHN",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
        livePrice: 10000,
        priceBeforeDiscount: priceBefore,
        currentDiscount: targetDiscount,
        stock: 100,
        minMargin: 5000
      };
    }

    const price = parseFloat(newPrice);
    const stock = parseInt(newStock);
    const errors: string[] = [];

    // 1. Price Validation
    if (isNaN(price)) {
      errors.push("Invalid price format");
    } else if (price >= product.livePrice) {
      errors.push("Promo price must be lower than current live price");
    } else {
      const livePriceDiscountPercent = ((product.livePrice - price) / product.livePrice) * 100;
      if (livePriceDiscountPercent <= 2) {
        errors.push(`Promo price must be at least 3% lower than current price (discount is only ${livePriceDiscountPercent.toFixed(1)}%)`);
      }
      
      const discountPercent = ((product.priceBeforeDiscount - price) / product.priceBeforeDiscount) * 100;
      if (discountPercent < campaign.rules.minDiscount) {
        errors.push(`Discount is ${discountPercent.toFixed(1)}%. Must be at least ${campaign.rules.minDiscount}%`);
      } else if (discountPercent > campaign.rules.maxDiscount) {
        errors.push(`Discount is ${discountPercent.toFixed(1)}%. Cannot exceed ${campaign.rules.maxDiscount}%`);
      }

      if (price < product.minMargin) {
        errors.push("Price is below minimum allowed margin");
      }
    }

    // 2. Stock Validation
    if (isNaN(stock) || stock <= 0) {
      errors.push("Promo stock must be greater than 0");
    } else {
      if (stock < 5) {
        errors.push("Promo stock must be at least 5 units");
      }
      if (stock > product.stock) {
        errors.push(`Promo stock cannot exceed warehouse stock (${product.stock})`);
      }
    }

    // 3. Category Validation
    if (!campaign.rules.eligibleCategories.includes(product.category)) {
      errors.push(`Category '${product.category}' is not eligible for this campaign`);
    }

    if (errors.length > 0) {
      return res.json({ 
        valid: false, 
        error: errors.join(" AND "),
        errors: errors
      });
    }

    const finalDiscountPercent = ((product.priceBeforeDiscount - price) / product.priceBeforeDiscount) * 100;

    res.json({ 
      valid: true, 
      discountPercent: finalDiscountPercent.toFixed(2),
      savings: (product.priceBeforeDiscount - price).toFixed(2),
      message: "Valid campaign price. Ready for submission."
    });
  });

  app.post("/api/submissions", (req, res) => {
    const { campaignId, products: submissionProductsList, vendorId, vendorName } = req.body;
    
    if (!campaignId || !submissionProductsList || submissionProductsList.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid submission data" });
    }

    const campaign = campaigns.find(c => c.id === campaignId);
    const campaignName = campaign ? campaign.name : "Active Campaign";

    const submissionId = `SUB-${randomUUID().slice(0,8).toUpperCase()}`;

    // Resolve products
    const resolvedProducts = submissionProductsList.map((p: any) => {
      let prod = products[p.sku];
      if (!prod) {
        prod = {
          sku: p.sku,
          name: "Mobile Phone",
          brand: "Generic",
          category: campaign ? campaign.rules.eligibleCategories[0] || "Phones" : "Phones",
          livePrice: 10000,
          bestPrice: 8900,
          stock: 100
        };
      }
      return {
        sku: p.sku,
        name: prod.name,
        category: prod.category,
        brand: prod.brand || "Generic",
        livePrice: prod.livePrice,
        bestPrice: prod.bestPrice || Math.round(prod.livePrice * 0.9),
        promoPrice: parseFloat(p.price),
        promoStock: parseInt(p.stock),
        status: "Pending"
      };
    });

    const newSubmission = {
      id: submissionId,
      campaignId,
      campaignName,
      vendorId: vendorId || "884920",
      vendorName: vendorName || "Tech Store Egypt",
      timestamp: new Date().toISOString(),
      status: "Pending",
      products: resolvedProducts
    };

    submissions.push(newSubmission);

    res.json({
      success: true,
      submissionId,
      timestamp: newSubmission.timestamp,
      message: "Prices submitted successfully!"
    });
  });

  app.get("/api/submissions", (req, res) => {
    const { vendorId } = req.query;
    let filtered = submissions;
    if (vendorId) {
      filtered = filtered.filter(s => s.vendorId === vendorId);
    }
    // Refresh campaign names just in case they were updated
    const enriched = filtered.map(s => {
      const camp = campaigns.find(c => c.id === s.campaignId);
      return {
        ...s,
        campaignName: camp ? camp.name : s.campaignName
      };
    });
    res.json(enriched);
  });

  app.put("/api/submissions/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = submissions.findIndex(s => s.id === id);
    if (index !== -1) {
      submissions[index].status = status;
      // Propagate the status to all products in this submission
      submissions[index].products.forEach((p: any) => {
        p.status = status;
      });
      res.json({ success: true, submission: submissions[index] });
    } else {
      res.status(404).json({ error: "Submission not found" });
    }
  });

  app.put("/api/submissions/:id/products/:sku/status", (req, res) => {
    const { id, sku } = req.params;
    const { status } = req.body; // 'Approved' | 'Rejected' | 'Pending'
    const index = submissions.findIndex(s => s.id === id);
    if (index !== -1) {
      const pIndex = submissions[index].products.findIndex((p: any) => p.sku === sku);
      if (pIndex !== -1) {
        submissions[index].products[pIndex].status = status;
        
        // Recalculate overall submission status based on individual product statuses
        const prods = submissions[index].products;
        const total = prods.length;
        const approved = prods.filter((p: any) => p.status === 'Approved').length;
        const rejected = prods.filter((p: any) => p.status === 'Rejected').length;
        const pending = prods.filter((p: any) => p.status === 'Pending').length;
        
        if (pending > 0) {
          submissions[index].status = 'Pending';
        } else if (approved === total) {
          submissions[index].status = 'Approved';
        } else if (rejected === total) {
          submissions[index].status = 'Rejected';
        } else {
          // Mixed approved and rejected
          submissions[index].status = 'Partially Approved';
        }
        
        res.json({ success: true, submission: submissions[index] });
      } else {
        res.status(404).json({ error: "Product SKU not found in this submission" });
      }
    } else {
      res.status(404).json({ error: "Submission not found" });
    }
  });

  app.delete("/api/submissions/:id", (req, res) => {
    const { id } = req.params;
    submissions = submissions.filter(s => s.id !== id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
