const fs = require('fs');

const makeSafe = (file) => {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('safeFormat')) {
    code = code.replace(
      "import { format",
      "import { isValid, format"
    );
    
    const safeFormatCode = `
const safeFormat = (date, formatStr) => {
  try {
    const d = new Date(date);
    if (isValid(d)) {
      return format(d, formatStr);
    }
    return 'Invalid Date';
  } catch {
    return 'Invalid Date';
  }
};
`;
    // Insert after imports
    const lastImportIndex = code.lastIndexOf("import ");
    const endOfImports = code.indexOf("\n", lastImportIndex) + 1;
    code = code.slice(0, endOfImports) + safeFormatCode + code.slice(endOfImports);
    
    // replace format(new Date(...)) with safeFormat(...)
    code = code.replace(/format\(new Date\((.*?)\), (.*?)\)/g, 'safeFormat($1, $2)');
    // replace format(currentMonth) etc just in case
    // actually, let's just replace the specific ones that use new Date()
    
    fs.writeFileSync(file, code);
  }
}

makeSafe('src/components/CalendarDashboard.tsx');
makeSafe('src/components/CampaignDetails.tsx');
