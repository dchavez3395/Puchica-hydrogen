import fs from 'node:fs/promises';
import {SpreadsheetFile, Workbook} from '@oai/artifact-tool';

const outputDir = 'C:/Users/dchav/Desktop/Puchica-hydrogen/outputs/dsers-evidence-2026-08-01';
await fs.mkdir(outputDir, {recursive: true});

const workbook = Workbook.create();
const summary = workbook.worksheets.add('Launch Summary');
const economics = workbook.worksheets.add('Unit Economics');
const evidence = workbook.worksheets.add('Quote Evidence');
const sources = workbook.worksheets.add('Sources');
workbook.comments.setSelf({displayName: 'dchavez3395'});

for (const sheet of [summary, economics, evidence, sources]) {
  sheet.showGridLines = false;
}

summary.getRange('A1:F1').merge();
summary.getRange('A1').values = [['Puchica · Packing Cubes Launch Gate']];
summary.getRange('A2:F2').merge();
summary.getRange('A2').values = [['Exact offer: Red 5-Piece Compression Packing Cube Set · 5PCS Set Red']];
summary.getRange('A4:B9').values = [
  ['Decision', 'NO-GO — ZIP evidence incomplete'],
  ['Storefront price', 53],
  ['Country-level landed supply cost', null],
  ['Pre-ad contribution', null],
  ['Break-even CPA', null],
  ['Target test CPA (70% of break-even)', null],
];
summary.getRange('B6').formulas = [["='Unit Economics'!B8"]];
summary.getRange('B7').formulas = [["='Unit Economics'!B14"]];
summary.getRange('B8').formulas = [["='Unit Economics'!B16"]];
summary.getRange('B9').formulas = [["='Unit Economics'!B19"]];
summary.getRange('A11:F11').values = [['Gate', 'Status', 'Evidence', 'Risk', 'Required action', 'Owner']];
summary.getRange('A12:F15').values = [
  ['Exact variant cost', 'PASS', 'US$20.39 DSers API cost', 'Cost can change', 'Recheck before each ad test', 'Puchica'],
  ['U.S. shipping method', 'PARTIAL', 'US$1.99 · AliExpress Selection Standard · 6 days', 'Country-level only', 'Capture ZIP 10001 and ZIP 90001 quotes', 'Puchica'],
  ['Controlled sample order', 'PENDING', 'No completed U.S. sample', 'Quality and timing unknown', 'Order exact red five-piece set to a U.S. recipient', 'Puchica'],
  ['Paid traffic', 'BLOCKED', 'Launch checker fails closed', 'Unverified fulfillment', 'Unlock only after both ZIP quotes and sample pass', 'Puchica'],
];
summary.getRange('A17:F17').merge();
summary.getRange('A18:F18').merge();
summary.getRange('A19:F19').merge();
summary.getRange('A17').values = [['Interpretation']];
summary.getRange('A18').values = [['The country-level economics are promising, but they are not sufficient evidence for paid traffic. DSers did not expose destination-ZIP pricing in the supplier optimizer, so both ZIP gates remain pending.']];
summary.getRange('A19').values = [['No order was placed and no supplier mapping was changed during this review.']];

economics.getRange('A1:D1').merge();
economics.getRange('A1').values = [['Country-Level Unit Economics · USD']];
economics.getRange('A3:D3').values = [['Input / metric', 'Value', 'Type', 'Notes']];
economics.getRange('A4:D16').values = [
  ['Storefront merchandise price', 53, 'Observed input', 'Verified production campaign, PDP, and cart price on 2026-08-01'],
  ['DSers stable API item cost', 20.39, 'Observed input', 'Exact 5PCS Set Red variant'],
  ['Supplier shipping', 1.99, 'Observed input', 'AliExpress Selection Standard; U.S. country level'],
  ['Other landed charges', 0, 'Assumption', 'Duty, brokerage, tax, handling not yet evidenced'],
  ['Landed supply cost', null, 'Formula', 'Item + supplier shipping + other landed charges'],
  ['Payment percentage', 0.029, 'Assumption', 'Replace with actual Shopify Payments rate'],
  ['Payment fixed fee', 0.30, 'Assumption', 'Replace with actual Shopify Payments fee'],
  ['Payment fee', null, 'Formula', 'Price × percentage + fixed fee'],
  ['Return/refund reserve', 0.05, 'Assumption', 'Conservative placeholder until real return data exists'],
  ['Return/refund reserve amount', null, 'Formula', 'Price × reserve rate'],
  ['Pre-ad contribution', null, 'Formula', 'Price − landed cost − payment fee − reserve'],
  ['Pre-ad contribution margin', null, 'Formula', 'Contribution ÷ price'],
  ['Break-even CPA', null, 'Formula', 'Maximum acquisition cost before contribution reaches zero'],
];
economics.getRange('B8').formulas = [['=SUM(B5:B7)']];
economics.getRange('B11').formulas = [['=B4*B9+B10']];
economics.getRange('B13').formulas = [['=B4*B12']];
economics.getRange('B14').formulas = [['=B4-B8-B11-B13']];
economics.getRange('B15').formulas = [['=B14/B4']];
economics.getRange('B16').formulas = [['=B14']];
economics.getRange('A18:B19').values = [
  ['Target test CPA factor', 0.70],
  ['Target test CPA', null],
];
economics.getRange('B19').formulas = [['=B16*B18']];

evidence.getRange('A1:J1').merge();
evidence.getRange('A1').values = [['DSers / AliExpress Quote Evidence']];
evidence.getRange('A3:J3').values = [['Scope', 'Destination', 'Item cost', 'Shipping', 'Landed cost', 'Service', 'Delivery', 'Tracking', 'Gate status', 'Notes']];
evidence.getRange('A4:J6').values = [
  ['Observed country quote', 'United States', 20.39, 1.99, null, 'AliExpress Selection Standard', '6 days shown by DSers optimizer', 'Not evidenced', 'PARTIAL', 'Exact 5PCS Set Red; stable DSers API cost'],
  ['Required ZIP quote', '10001', null, null, null, null, null, null, 'PENDING', 'DSers optimizer did not expose ZIP-specific pricing'],
  ['Required ZIP quote', '90001', null, null, null, null, null, null, 'PENDING', 'DSers optimizer did not expose ZIP-specific pricing'],
];
evidence.getRange('E4').formulas = [['=C4+D4']];

sources.getRange('A1:D1').merge();
sources.getRange('A1').values = [['Evidence Sources']];
sources.getRange('A3:D3').values = [['Source', 'URL / identifier', 'Observed', 'Use']];
sources.getRange('A4:D6').values = [
  ['DSers My Products', 'https://www.dsers.com/application/my_products', '2026-08-01', 'Mapped product, price range, stock'],
  ['DSers Supplier Optimizer', 'https://www.dsers.com/application/supplier_optimizer', '2026-08-01', 'Current supplier, service, U.S. country shipping and ratings'],
  ['AliExpress exact supplier product', 'https://www.aliexpress.us/item/3256808381735696.html', '2026-08-01', 'Exact 5PCS Set Red API cost and shipping confirmation'],
];
workbook.comments.addThread({cell: economics.getRange('B5')}, 'Source: DSers/AliExpress exact mapped product, 5PCS Set Red, observed 2026-08-01.');
workbook.comments.addThread({cell: economics.getRange('B6')}, 'Source: DSers Supplier Optimizer and AliExpress DSers API price panel, observed 2026-08-01.');

const titleStyle = {fill: '#111B2E', font: {bold: true, color: '#FFFFFF', size: 18}, verticalAlignment: 'center'};
const headerStyle = {fill: '#6548FF', font: {bold: true, color: '#FFFFFF'}, verticalAlignment: 'center', wrapText: true};
const inputStyle = {fill: '#FFF4CC'};
const formulaStyle = {fill: '#E5F5EE'};
for (const sheet of [summary, economics, evidence, sources]) {
  sheet.getRange('A1').format = titleStyle;
  sheet.getRange('A1').format.rowHeight = 34;
  sheet.freezePanes.freezeRows(3);
}
summary.getRange('A11:F11').format = headerStyle;
economics.getRange('A3:D3').format = headerStyle;
evidence.getRange('A3:J3').format = headerStyle;
sources.getRange('A3:D3').format = headerStyle;
summary.getRange('B4').format = {fill: '#FDE8E7', font: {bold: true, color: '#B42318'}};
summary.getRange('B5:B9').format.numberFormat = '$0.00';
summary.getRange('B6:B9').format = formulaStyle;
economics.getRange('B4:B7').format = inputStyle;
economics.getRange('B9:B10').format = inputStyle;
economics.getRange('B12').format = inputStyle;
economics.getRange('B18').format = inputStyle;
economics.getRange('B8').format = formulaStyle;
economics.getRange('B11').format = formulaStyle;
economics.getRange('B13:B16').format = formulaStyle;
economics.getRange('B19').format = formulaStyle;
economics.getRange('B4:B8').format.numberFormat = '$0.00';
economics.getRange('B9').format.numberFormat = '0.0%';
economics.getRange('B10:B11').format.numberFormat = '$0.00';
economics.getRange('B12').format.numberFormat = '0.0%';
economics.getRange('B13:B14').format.numberFormat = '$0.00';
economics.getRange('B15').format.numberFormat = '0.0%';
economics.getRange('B16').format.numberFormat = '$0.00';
economics.getRange('B18').format.numberFormat = '0%';
economics.getRange('B19').format.numberFormat = '$0.00';
evidence.getRange('C4:E6').format.numberFormat = '$0.00';
for (const sheet of [summary, economics, evidence, sources]) {
  const used = sheet.getUsedRange();
  used.format.wrapText = true;
  used.format.verticalAlignment = 'top';
  used.format.autofitColumns();
  used.format.autofitRows();
}
summary.getRange('A1:A19').format.columnWidth = 32;
summary.getRange('B1:B19').format.columnWidth = 31;
summary.getRange('C1:E19').format.columnWidth = 28;
economics.getRange('A1:A19').format.columnWidth = 34;
economics.getRange('B1:B19').format.columnWidth = 16;
economics.getRange('C1:C19').format.columnWidth = 18;
economics.getRange('D1:D19').format.columnWidth = 48;
evidence.getRange('A1:J6').format.columnWidth = 20;
evidence.getRange('J1:J6').format.columnWidth = 42;
sources.getRange('A1:A6').format.columnWidth = 28;
sources.getRange('B1:B6').format.columnWidth = 62;
sources.getRange('C1:C6').format.columnWidth = 24;
sources.getRange('D1:D6').format.columnWidth = 42;
for (const sheet of [summary, economics, evidence, sources]) {
  sheet.getUsedRange().format.autofitRows();
}

const inspection = await workbook.inspect({kind: 'table', sheetId: 'Unit Economics', range: 'A3:D19', include: 'values,formulas', tableMaxRows: 20, tableMaxCols: 6, maxChars: 6000});
console.log(inspection.ndjson);
const errors = await workbook.inspect({kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A', options: {useRegex: true, maxResults: 100}, summary: 'final formula error scan'});
console.log(errors.ndjson);

for (const sheetName of ['Launch Summary', 'Unit Economics', 'Quote Evidence', 'Sources']) {
  const preview = await workbook.render({sheetName, autoCrop: 'all', scale: 1, format: 'png'});
  await fs.writeFile(`${outputDir}/${sheetName.replaceAll(' ', '-').toLowerCase()}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/puchica-packing-cubes-dsers-evidence.xlsx`);
