import { chromium } from 'playwright';
import fs from 'node:fs';

const shotDir = 'C:/Users/veeru/AppData/Local/Temp/claude/c--Users-veeru-OneDrive-Desktop-Railways/3d965cb6-f1c7-4d0f-b0b6-f12e56b60282/scratchpad/shots2';
fs.mkdirSync(shotDir, { recursive: true });

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));

async function shot(name) {
  await page.screenshot({ path: `${shotDir}/${name}.png` });
}

// Dashboard - subtitle removed check
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Total Coach Alterations');
await page.waitForTimeout(700);
await shot('01-dashboard');
const sidebarText = await page.locator('aside').innerText();
console.log('SIDEBAR_HAS_RAM_TEXT:', sidebarText.includes('Railway Asset Management'));
console.log('SIDEBAR_HAS_NOMENCLATURE_ALTERATION:', sidebarText.includes('Nomenclature Alteration'));

// Alteration landing (direct nav — sidebar item is an expand/collapse toggle, not a link)
await page.goto('http://localhost:5173/alteration', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Open Register');
await shot('02-alteration-landing');

// Coach alteration table
await page.click('aside a:has-text("Coach")');
await page.waitForSelector('text=TL. No.');
await page.waitForTimeout(500);
await shot('03-coach-alteration');

// Add coach entry
await page.click('button:has-text("Add Coach Alteration")');
const coachDialog = page.locator('[role="dialog"]');
await coachDialog.waitFor();
await coachDialog.locator('input[type="date"]').fill('2026-08-10');
await coachDialog.locator('input[placeholder*="TL/CH"]').fill('TL/CH/2026/9999');
await coachDialog.locator('textarea').fill('Smoke test alteration description');
await shot('04-coach-form-filled');
await coachDialog.locator('button:has-text("Add Entry")').click();
await page.waitForSelector('text=Coach alteration added successfully');
await shot('05-coach-added-toast');
await page.waitForTimeout(500);

// Wagon alteration table
await page.click('aside a:has-text("Wagon")');
await page.waitForSelector('th:has-text("Status")');
await page.waitForTimeout(500);
await shot('06-wagon-alteration');

// Add wagon entry with status + remarks
await page.click('button:has-text("Add Wagon Alteration")');
const wagonDialog = page.locator('[role="dialog"]');
await wagonDialog.waitFor();
await wagonDialog.locator('input[type="date"]').fill('2026-08-11');
await wagonDialog.locator('input[placeholder*="TL/WG"]').fill('TL/WG/2026/9999');
await wagonDialog.locator('textarea').first().fill('Smoke test wagon alteration');
await wagonDialog.locator('select').selectOption('In Progress');
await wagonDialog.locator('textarea').nth(1).fill('Fitment ongoing - smoke test remark');
await shot('07-wagon-form-filled');
await wagonDialog.locator('button:has-text("Add Entry")').click();
await page.waitForSelector('text=Wagon alteration added successfully');
await page.waitForTimeout(600);
await shot('08-wagon-added');

// Edit the newly added wagon row to test attachment upload
await page.fill('input[placeholder*="Search TL"]', 'TL/WG/2026/9999');
await page.waitForTimeout(500);
await shot('09-wagon-search-new');
await page.click('button[aria-label="Edit"]');
const editDialog = page.locator('[role="dialog"]');
await editDialog.waitFor();
await shot('10-wagon-edit-drawer');

// Upload a small text-disguised-as-pdf won't pass validation; create a temp real file with .pdf ext
const testFilePath = `${shotDir}/test-upload.pdf`;
fs.writeFileSync(testFilePath, '%PDF-1.4 fake pdf content for smoke test');
const fileInput = editDialog.locator('input[type="file"]');
await fileInput.setInputFiles(testFilePath);
await page.waitForSelector('text=/uploaded successfully/', { timeout: 8000 });
await shot('11-wagon-attachment-uploaded');

await editDialog.locator('button:has-text("Cancel")').click();
await page.waitForTimeout(300);
await shot('12-wagon-table-with-attachment-badge');

// clear search
await page.fill('input[placeholder*="Search TL"]', '');
await page.waitForTimeout(300);

// Stocking application - check EAR, C/W, Unit+UOM
await page.click('aside a:has-text("Stocking Application")');
await page.waitForSelector('th:has-text("EAR")');
await page.waitForTimeout(500);
await shot('13-stocking-application');

await page.click('button:has-text("Add Stocking Entry")');
const stkDialog = page.locator('[role="dialog"]');
await stkDialog.waitFor();
await stkDialog.locator('input[type="date"]').fill('2026-08-10');
await stkDialog.locator('input[placeholder="e.g. YW-26A"]').fill('YW-26Z');
await stkDialog.locator('input[placeholder="e.g. Q-101"]').fill('Q-777');
await stkDialog.locator('input[placeholder="e.g. Air Brake Hose Coupling"]').fill('Smoke Test EAR Item');
await stkDialog.locator('input[placeholder="e.g. PL-2000"]').fill('PL-7777');
await stkDialog.locator('input[placeholder="e.g. 2"]').fill('3');
await stkDialog.locator('input[placeholder="e.g. 25"]').fill('10');
await stkDialog.locator('input[placeholder="e.g. 340"]').fill('50');
await shot('14-stocking-form-filled');
await stkDialog.locator('button:has-text("Add Entry")').click();
await page.waitForSelector('text=Stocking entry added successfully');
await page.waitForTimeout(600);
await shot('15-stocking-added');

await browser.close();
console.log('CONSOLE_ERRORS:', JSON.stringify(errors, null, 2));
