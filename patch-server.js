const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace const campaigns with let campaigns
code = code.replace('const campaigns = [', 'let campaigns = [');

const newRoutes = `
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
`;

code = code.replace('app.get("/api/campaigns",', newRoutes + '\n  app.get("/api/campaigns",');
fs.writeFileSync('server.ts', code);
