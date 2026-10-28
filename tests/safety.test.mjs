import test from 'node:test';
import assert from 'node:assert/strict';
import { runFirstCall, payTo, usdc } from '../skills/saferoute-base-swap/scripts/inspect.mjs';
import { inspectQuote } from '../examples/inspect-quote.mjs';
import { createSafeRouteTools } from '../examples/tool-adapter.mjs';
const requirement = {scheme:'exact', network:'eip155:8453', asset:usdc, payTo, amount:'1000'};
const challenge = (changes = {}) => new Response('{}', {status:402, headers:{'payment-required':Buffer.from(JSON.stringify({accepts:[{...requirement,...changes}]})).toString('base64')}});
test('inspection makes one unsigned request and does not invent attribution', async () => {
 let calls=0;
 const r=await runFirstCall({fetchImpl:async (_,options)=>{calls++;assert.equal(options.headers['X-SafeRoute-Source'],undefined);assert.equal(options.redirect,'error');return challenge();}});
 assert.equal(calls,1); assert.equal(r.paid,false);
});
for(const changes of [{payTo:'0x'+'1'.repeat(40)},{amount:'10000'},{network:'eip155:1'},{asset:'0x'+'1'.repeat(40)}]) test('unapproved payment challenge stops before payment: '+JSON.stringify(changes),async()=>{
 let calls=0;await assert.rejects(runFirstCall({fetchImpl:async()=>challenge(changes),paidFetch:async()=>{calls++;}}));assert.equal(calls,0);
});
test('missing authorization or denied operator permission never pays',async()=>{
 let calls=0;
 const options={fetchImpl:async()=>challenge(),paidFetch:async()=>{calls++;}};
 await assert.rejects(createSafeRouteTools(options)[1].execute(),/authorization/);
 await assert.rejects(createSafeRouteTools({...options,authorizeSafetyPayment:async()=>false})[1].execute(),/denied/);
 assert.equal(calls,0);
});
test('uncertain paid attempt is not automatically retried',async()=>{
 let calls=0;const tool=createSafeRouteTools({fetchImpl:async()=>challenge(),authorizeSafetyPayment:async()=>true,paidFetch:async()=>{calls++;throw new Error('timeout');}})[1];
 await assert.rejects(tool.execute(),/timeout/);assert.equal(calls,1);
});
test('tool rejects unknown inputs before contacting a service',async()=>{
 let calls=0;const tool=createSafeRouteTools({fetchImpl:async()=>{calls++;}})[0];
 await assert.rejects(tool.execute({wallet:'secret'})); assert.equal(calls,0);
});
test('quote inspection validates 0.01 price and stops without paying',async()=>{
 const r=await inspectQuote({wallet:'0x'+'1'.repeat(40),fetchImpl:async()=>challenge({amount:'10000'})}); assert.equal(r.paid,false);
 await assert.rejects(inspectQuote({wallet:'0x'+'1'.repeat(40),fetchImpl:async()=>challenge()}),/Unexpected/);
});
test('invalid quote address is rejected without a request',async()=>{
 let calls=0;await assert.rejects(inspectQuote({wallet:'private-key',fetchImpl:async()=>{calls++;}}));assert.equal(calls,0);
});
