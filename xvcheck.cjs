const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch({args:['--enable-webgl','--use-gl=swiftshader']});
  const p = await b.newPage();
  const errs=[];
  p.on('console',m=>{ if(m.type()==='error') errs.push('CON: '+m.text()); });
  p.on('pageerror',e=>errs.push('ERR: '+e.message));
  await p.goto('http://localhost:5173');
  await p.waitForTimeout(10000);
  await p.screenshot({path:'/tmp/xv-debug.png'});
  console.log(errs.length ? errs.join('\n') : 'NO_ERRORS');
  await b.close();
})();
