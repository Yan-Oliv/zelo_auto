// Deterministic upstream failures only. No credentials or live provider calls.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { handleInstagramFeed } from '../../../functions/api/_instagram-feed.ts'
import { handleGoogleReviews } from '../../../functions/api/google-reviews.ts'
const nativeFetch=globalThis.fetch,results=[]
const ig={INSTAGRAM_API_MODE:'instagram-login',INSTAGRAM_GRAPH_USER_ID:'123',INSTAGRAM_ACCESS_TOKEN:'TEST_ONLY'}
const google={GOOGLE_BUSINESS_CLIENT_ID:'TEST_ONLY',GOOGLE_BUSINESS_CLIENT_SECRET:'TEST_ONLY',GOOGLE_BUSINESS_REFRESH_TOKEN:'TEST_ONLY',GOOGLE_BUSINESS_ACCOUNT_ID:'123',GOOGLE_BUSINESS_LOCATION_ID:'456'}
const request=()=>new Request('http://localhost/api/google-reviews')
async function check(provider,scenario,response,status){assert.equal(response.status,status);assert.match(response.headers.get('content-type'),/application\/json/);const body=await response.text();JSON.parse(body);assert.doesNotMatch(body,/<html|TEST_ONLY|SECRET_SENTINEL|C:\\/i);results.push({provider,scenario,status:response.status,type:'application/json',sanitized:true})}
try{
for(const status of [400,401,403,404,429,500,503]){
 globalThis.fetch=async()=>new Response(JSON.stringify({error:{message:'SECRET_SENTINEL'}}),{status});
 await check('Instagram',`upstream${status}`,await handleInstagramFeed(ig),status===429?429:502)
 await check('Google',`upstream${status}`,await handleGoogleReviews(google,request()),status===429?429:502)
}
for(const scenario of ['network','timeout','invalid JSON']){
 globalThis.fetch=async()=>{if(scenario==='invalid JSON')return new Response('{SECRET_SENTINEL');throw new DOMException('SECRET_SENTINEL',scenario==='timeout'?'TimeoutError':'NetworkError')}
 await check('Instagram',scenario,await handleInstagramFeed(ig),scenario==='timeout'?504:502)
 await check('Google',scenario,await handleGoogleReviews(google,request()),502)
}
globalThis.fetch=async()=>new Response('{"data":[]}');await check('Instagram','valid empty200',await handleInstagramFeed(ig),200)
await check('Instagram','missing configuration',await handleInstagramFeed({}),503)
await check('Google','missing configuration',await handleGoogleReviews({},request()),503)
fs.writeFileSync('.nox/evidence/ZE-11/qa-api-matrix.json',JSON.stringify({kind:'TEST FIXTURES; no live Google authorization established',results},null,2));console.log(`${results.length} API scenarios PASS`)
}finally{globalThis.fetch=nativeFetch}
