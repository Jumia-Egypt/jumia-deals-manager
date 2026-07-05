const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /app\.put\("\/api\/campaigns\/:id", \(req, res\) => \{[\s\S]*?\}\);/,
  `$&
  
  app.delete("/api/campaigns/:id", (req, res) => {
    campaigns = campaigns.filter(c => c.id === req.params.id ? false : true);
    res.json({ success: true });
  });`
);
fs.writeFileSync('server.ts', code);
