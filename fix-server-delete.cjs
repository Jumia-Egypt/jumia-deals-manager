const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /app\.put\("\/api\/campaigns\/:id", \(req, res\) => \{[\s\S]*?\}\);/g,
  `app.put("/api/campaigns/:id", (req, res) => {
    const index = campaigns.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      campaigns[index] = { ...campaigns[index], ...req.body };
      res.json(campaigns[index]);
    } else {
      res.status(404).json({ error: "Campaign not found" });
    }
  });`
);

code = code.replace(
  /app\.get\("\/api\/campaigns", \(req, res\) => \{/,
  `app.delete("/api/campaigns/:id", (req, res) => {
    campaigns = campaigns.filter(c => c.id !== req.params.id);
    res.json({ success: true });
  });

  app.get("/api/campaigns", (req, res) => {`
);

fs.writeFileSync('server.ts', code);
