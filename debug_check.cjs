const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch();
  const page = await b.newPage();
  const errs=[], logs=[];
  page.on('console', m => { if(['error','warn'].includes(m.type())) logs.push(m.type()+': '+m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(4000);
  const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0,300) || 'EMPTY');
  console.log('ROOT:', rootHTML);
  console.log('ERRORS:', JSON.stringify(errs.slice(0,5)));
  console.log('LOGS:', JSON.stringify(logs.slice(0,10)));
  await b.close();
})();
