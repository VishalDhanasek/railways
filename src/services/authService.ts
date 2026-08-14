import type { AuthUser, UserCredential } from '@/types';

// ---------------------------------------------------------------------------
// SECURITY NOTE
// -----------------------------------------------------------------------
// This app is a static frontend with no backend server, so "checking Excel
// on login" means fetching public/credentials.xlsx into the browser and
// parsing it client-side. That file (including plaintext passwords) is
// downloadable by anyone who can reach the deployed app — this is an
// access gate for a trusted/internal tool, NOT real authentication.
// For an internet-facing deployment with real security requirements,
// replace this module with calls to a real backend /login endpoint that
// keeps the credentials store server-side.
// ---------------------------------------------------------------------------

const CREDENTIALS_URL = '/credentials.xlsx';

async function loadCredentials(): Promise<UserCredential[]> {
  const res = await fetch(CREDENTIALS_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('Unable to load the credentials workbook.');
  const buffer = await res.arrayBuffer();

  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('Credentials workbook has no sheets.');

  const rows: UserCredential[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header row
    // ExcelJS row.values is 1-indexed with a leading empty slot at [0].
    const values = row.values as unknown[];
    const username = String(values[1] ?? '').trim();
    const password = String(values[2] ?? '').trim();
    const name = String(values[3] ?? '').trim();
    const role = String(values[4] ?? '').trim();
    if (username && password) rows.push({ username, password, name: name || username, role: role || 'User' });
  });
  return rows;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const trimmedUsername = username.trim();
  if (!trimmedUsername || !password) {
    throw new Error('Please enter both username and password.');
  }

  let credentials: UserCredential[];
  try {
    credentials = await loadCredentials();
  } catch {
    throw new Error('Unable to verify credentials right now. Please contact your administrator.');
  }

  const match = credentials.find(
    (c) => c.username.toLowerCase() === trimmedUsername.toLowerCase() && c.password === password,
  );
  if (!match) {
    throw new Error('Invalid username or password.');
  }

  return { username: match.username, name: match.name, role: match.role };
}
