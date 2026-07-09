const url = 'https://replicate.delivery/xezq/YIMwLITPrcbHIdfP2vOaTPVnfQm4Uf4jwbQEEmpjEOzvJlrtA/tmpjteb6x6s.png';

async function main() {
  const res = await fetch(url);
  console.log('Content-Type header:', res.headers.get('content-type'));
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  console.log('File size:', buf.length, 'bytes');
  console.log('First 12 bytes (hex):', buf.subarray(0, 12).toString('hex'));
  console.log('First 12 bytes (ASCII):', buf.subarray(0, 12).toString('ascii'));
}

main().catch(console.error);
