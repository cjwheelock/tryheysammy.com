import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const config=JSON.parse(readFileSync(new URL('../referrals.json',import.meta.url)));
const runtime=readFileSync(new URL('../scripts/referral-runtime.js',import.meta.url),'utf8');
function run(fetch,hostname='tryheysammy.com',nav={},referrer='') {
 const redirects=[],timers=[];
 vm.runInNewContext(runtime,{window:{referralConfig:{code:config.codes[0],...config},location:{hostname,replace:url=>redirects.push(url)}},navigator:{userAgent:'Mozilla/5.0 (iPhone) Mobile Safari/604.1 TikTok',...nav},document:{referrer},URL,URLSearchParams,crypto:{randomUUID:()=> 'test-click'},setTimeout:fn=>timers.push(fn),fetch});
 return {redirects,timers};
}
test('all 35 routes contain the right code, destination, and fallback',()=>{
 assert.equal(new Set(config.codes).size,35);
 for(const code of config.codes){
 assert.match(code,/^[1-9][0-9]{5}$/);
 const html=readFileSync(new URL(`../${code}/index.html`,import.meta.url),'utf8');
 assert.ok(html.includes(`"code":"${code}"`));
 assert.ok(html.includes(`content="2;url=${config.destination}"`));
 assert.ok(html.includes(runtime));
 }
});
test('successful capture records the code and redirects exactly once',async()=>{
 let payload;
 const result=run((url,options)=>{payload=JSON.parse(options.body);assert.equal(options.keepalive,true);return Promise.resolve({ok:true});});
 await new Promise(setImmediate);
 assert.equal(payload.properties.referral_code,config.codes[0]);
 assert.equal(payload.event,'creator_referral_clicked');
 assert.equal(payload.properties.$process_person_profile,false);
 result.timers[0]();
 assert.deepEqual(result.redirects,[config.destination]);
});
for(const [name,fetch] of [['rejected',()=>Promise.reject(Error())],['throws',()=>{throw Error();}],['stalls',()=>new Promise(()=>{})]]){
 test(`${name} analytics cannot block redirect`,async()=>{
 const result=run(fetch);await new Promise(setImmediate);result.timers[0]();assert.deepEqual(result.redirects,[config.destination]);
 });
}
test('local checks never capture production events',()=>{
 const result=run(()=>{assert.fail('unexpected capture');},'localhost');assert.deepEqual(result.redirects,[config.destination]);
});

test('broad context is captured without raw identifiers or location',async()=>{
 let payload;run((url,options)=>{payload=JSON.parse(options.body);return Promise.resolve({ok:true});},'tryheysammy.com',{},'https://www.tiktok.com/@private-name?secret=abc');
 await new Promise(setImmediate);
 assert.equal(payload.properties.os_family,'iOS');
 assert.equal(payload.properties.device_type,'Mobile');
 assert.equal(payload.properties.is_tiktok_browser,true);
 assert.equal(payload.properties.referring_source,'tiktok.com');
 assert.equal(payload.properties.$geoip_disable,true);
 assert.equal(payload.properties.$ip,null);
 assert.ok(!JSON.stringify(payload).includes('private-name'));
 assert.ok(!JSON.stringify(payload).includes('Mozilla'));
});
for(const nav of [{globalPrivacyControl:true},{doNotTrack:'1'}]) {
 test('privacy signal skips analytics but preserves redirect '+JSON.stringify(nav),()=>{
 const result=run(()=>assert.fail('unexpected capture'),'tryheysammy.com',nav);
 assert.deepEqual(result.redirects,[config.destination]);
 });
}

test('all 35 word aliases preserve their numeric route tracking and fallback',()=>{
 const aliases=Object.entries(config.aliases);
 assert.equal(aliases.length,35);
 assert.equal(new Set(aliases.map(([,code])=>code)).size,35);
 for(const [slug,code] of aliases){
  assert.match(slug,/^[a-z]+(?:-[a-z]+)*$/);
  assert.ok(config.codes.includes(code));
  assert.equal(readFileSync(new URL(`../${slug}/index.html`,import.meta.url),'utf8'),
    readFileSync(new URL(`../${code}/index.html`,import.meta.url),'utf8'));
 }
});
