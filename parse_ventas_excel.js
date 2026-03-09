import fs from 'fs';
import xlsx from 'xlsx';

try {
  const workbook = xlsx.readFile('./src/data/layers/ventas/lotes_2026-03-06_130026.xlsx');
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  fs.writeFileSync('./src/data/details/ventas_details.json', JSON.stringify(data, null, 2));
  console.log('Successfully wrote ' + data.length + ' rows to ventas_details.json');
} catch (e) {
  console.error('Error parsing excel:', e);
}
