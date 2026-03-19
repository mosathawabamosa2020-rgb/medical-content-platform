const fs = require('fs');
const path = require('path');

async function main() {
  const file = process.argv[2] || path.join(process.cwd(),'data','incoming_pdfs','K180324.pdf');
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if(!apiKey){ console.error('Missing OCR_SPACE_API_KEY'); process.exit(2); }
  const buffer = fs.readFileSync(file);
  const params = new URLSearchParams();
  params.append('apikey', apiKey);
  params.append('language','eng');
  params.append('isOverlayRequired','false');
  params.append('base64Image','data:application/pdf;base64,'+buffer.toString('base64'));
  const resp = await fetch('https://api.ocr.space/parse/image', { method: 'POST', body: params });
  const j = await resp.json();
  console.log(JSON.stringify(j, null, 2).slice(0,4000));
}

main().catch(e=>{ console.error(e); process.exit(1); });
