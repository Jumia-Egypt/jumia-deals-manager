const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarDashboard.tsx', 'utf8');

code = code.replace(
  /const isEnding = isSameDay\(day, new Date\(c\.endDate\)\);/g,
  `const isEnding = (() => { try { const d = new Date(c.endDate); return isValid(d) ? isSameDay(day, d) : false; } catch { return false; } })();`
);

code = code.replace(
  /return isSameDay\(day, start\);/g,
  `return (() => { try { return isValid(start) ? isSameDay(day, start) : false; } catch { return false; } })();`
);

code = code.replace(
  /isWithinInterval\(day, \{ start, end \}\)/g,
  `(() => { try { return isValid(start) && isValid(end) ? isWithinInterval(day, { start, end }) : false; } catch { return false; } })()`
);

fs.writeFileSync('src/components/CalendarDashboard.tsx', code);
