import ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Credentials');

sheet.columns = [
  { header: 'Username', key: 'username', width: 20 },
  { header: 'Password', key: 'password', width: 20 },
  { header: 'Name', key: 'name', width: 24 },
  { header: 'Role', key: 'role', width: 22 },
];

const headerRow = sheet.getRow(1);
headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
headerRow.eachCell((cell) => {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
});

// Seed admin login so the app is usable out of the box.
// CHANGE THIS PASSWORD and add real users as additional rows.
sheet.addRow({ username: 'admin', password: 'Admin@123', name: 'Administrator', role: 'Administrator' });

await workbook.xlsx.writeFile('c:\\Users\\veeru\\OneDrive\\Desktop\\Railways\\public\\credentials.xlsx');
console.log('credentials.xlsx written');
