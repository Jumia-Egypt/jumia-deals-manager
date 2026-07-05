import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../middleware/auth";

import * as authController from "../controllers/auth.controller";
import * as campaignsController from "../controllers/campaigns.controller";
import * as productsController from "../controllers/products.controller";
import * as submissionsController from "../controllers/submissions.controller";
import { bulkUploadSubmission } from "../controllers/bulkUpload.controller";

const router = Router();

// ── Memory storage for CSV uploads (max 10MB) ────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB ?? "10", 10)) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are accepted."));
    }
  },
});

// =============================================================================
// AUTH
// =============================================================================
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authenticate, authController.me);

// =============================================================================
// CAMPAIGNS
// GET — both roles (vendors browse active campaigns)
// POST/PUT/DELETE — Admin only
// =============================================================================
router.get("/campaigns", authenticate, campaignsController.listCampaigns);
router.get("/campaigns/:id", authenticate, campaignsController.getCampaign);
router.post("/campaigns", authenticate, authorize("ADMIN"), campaignsController.createCampaign);
router.put("/campaigns/:id", authenticate, authorize("ADMIN"), campaignsController.updateCampaign);
router.delete("/campaigns/:id", authenticate, authorize("ADMIN"), campaignsController.deleteCampaign);

// =============================================================================
// PRODUCTS / SKU CATALOG
// =============================================================================
router.get("/products/validate-sku", authenticate, productsController.validateSku);
router.get("/products", authenticate, productsController.listProducts);
router.get("/products/:sku", authenticate, productsController.getProduct);

// =============================================================================
// SUBMISSIONS
// =============================================================================

// Export must be before /:id to avoid route collision
router.get(
  "/submissions/export",
  authenticate,
  authorize("ADMIN"),
  submissionsController.exportApprovedItems
);

router.get("/submissions", authenticate, submissionsController.listSubmissions);
router.get("/submissions/:id", authenticate, submissionsController.getSubmission);

router.post(
  "/submissions",
  authenticate,
  authorize("VENDOR"),
  submissionsController.createSubmission
);

// Bulk CSV upload
router.post(
  "/submissions/bulk-upload",
  authenticate,
  authorize("VENDOR"),
  upload.single("file"),
  bulkUploadSubmission
);

// Admin: bulk approve / reject entire submission
router.put(
  "/submissions/:id/status",
  authenticate,
  authorize("ADMIN"),
  submissionsController.updateSubmissionStatus
);

// Admin: approve / reject individual SKU (triggers status recalculation)
router.put(
  "/submissions/:id/products/:sku/status",
  authenticate,
  authorize("ADMIN"),
  submissionsController.updateItemStatus
);

router.delete("/submissions/:id", authenticate, submissionsController.deleteSubmission);

export default router;
