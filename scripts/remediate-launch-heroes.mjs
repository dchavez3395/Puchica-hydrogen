import {readFile} from 'node:fs/promises';

async function adminGraphQL(query, variables) {
  const tokenData = JSON.parse(await readFile('.shopify-admin-token', 'utf8'));
  if (!tokenData.access_token || tokenData.expires_at * 1000 <= Date.now()) {
    throw new Error('The cached Shopify Admin token is missing or expired.');
  }
  const domain = process.env.PUBLIC_STORE_DOMAIN || 'ug91ve-sz.myshopify.com';
  const response = await fetch(`https://${domain}/admin/api/2026-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': tokenData.access_token,
    },
    body: JSON.stringify({query, variables}),
  });
  if (!response.ok) throw new Error(`Shopify Admin HTTP ${response.status}`);
  return response.json();
}

const HERO_TAG = 'puchica-hero';
const heroes = [
  {id:'gid://shopify/Product/9326920433914',title:'Travel Pet Water Bottle',descriptionHtml:'<p>Bring a simple water option for your pet on walks, road trips, and days outdoors.</p><ul><li>Portable format for everyday outings</li><li>Choose from three colours</li><li>Rinse before first use and clean after each outing</li></ul><p>Always supervise your pet while drinking and carry enough water for the length and conditions of your trip.</p>'},
  {id:'gid://shopify/Product/9326918271226',title:'Car Sun Visor Organizer',descriptionHtml:'<p>Keep small, frequently used items together with a compact organizer that clips onto a car sun visor.</p><ul><li>Easy-to-reach storage for lightweight essentials</li><li>Three neutral colour options</li><li>Compact profile for everyday driving</li></ul><p>Confirm the fit before use. Install it where it will not block the driver’s view, controls, mirrors, or airbag operation.</p>'},
  {id:'gid://shopify/Product/9326917419258',title:'Long-Handle Bottle Brush',descriptionHtml:'<p>Reach deeper into bottles, cups, and reusable drinkware with a long-handle cleaning brush.</p><ul><li>Designed for everyday hand-cleaning tasks</li><li>Long handle helps reach narrow containers</li><li>Two colour options</li></ul><p>Rinse thoroughly after use and allow the brush to dry completely. Check that the brush is suitable for the surface before scrubbing.</p>'},
  {id:'gid://shopify/Product/9326917452026',title:'Multi-Use Organizer Hooks',descriptionHtml:'<p>Add two adjustable hooks to a stroller, shopping cart, or everyday carry setup to keep lightweight items within reach.</p><ul><li>Two hooks per set</li><li>Adjustable attachment straps</li><li>Multiple colour options</li></ul><p>Do not overload the hooks. Keep straps and hanging items away from children, moving parts, and areas where they could affect balance or safe operation.</p>'},
  {id:'gid://shopify/Product/9326919418106',title:'Everyday Carabiner Clip Set',descriptionHtml:'<p>Keep keys and small everyday items grouped with a four-piece metal carabiner clip set.</p><ul><li>Four clips for organizing daily carry items</li><li>Useful for keys, tags, and lightweight accessories</li><li>Compact enough for bags and storage loops</li></ul><p>For organization only. These clips are not rated for climbing, fall protection, towing, or supporting people or heavy loads.</p>'},
];
const findTaggedProducts=`query FindLaunchHeroes($query:String!){products(first:100,query:$query){nodes{id title tags}}}`;
const removeTags=`mutation RemoveHeroTag($id:ID!,$tags:[String!]!){tagsRemove(id:$id,tags:$tags){node{id} userErrors{field message}}}`;
const updateProduct=`mutation UpdateLaunchHero($input:ProductInput!){productUpdate(input:$input){product{id title handle descriptionHtml tags} userErrors{field message}}}`;
const addTags=`mutation AddHeroTag($id:ID!,$tags:[String!]!){tagsAdd(id:$id,tags:$tags){node{id ... on Product{title handle tags}} userErrors{field message}}}`;
function assertResponse(response,field){if(response?.errors?.length)throw new Error(JSON.stringify(response.errors));const errors=response?.data?.[field]?.userErrors??[];if(errors.length)throw new Error(JSON.stringify(errors));return response.data[field];}
async function main(){const dryRun=!process.argv.includes('--apply');const currentResponse=await adminGraphQL(findTaggedProducts,{query:`tag:${HERO_TAG}`});if(currentResponse?.errors?.length)throw new Error(JSON.stringify(currentResponse.errors));const current=currentResponse?.data?.products?.nodes??[];const targetIds=new Set(heroes.map((hero)=>hero.id));const stale=current.filter((product)=>!targetIds.has(product.id));console.log(`${dryRun?'DRY RUN':'APPLY'}: ${heroes.length} launch heroes`);console.log(`Existing tagged products: ${current.length}; stale tags: ${stale.length}`);for(const product of stale){console.log(`Remove ${HERO_TAG}: ${product.title}`);if(!dryRun){const response=await adminGraphQL(removeTags,{id:product.id,tags:[HERO_TAG]});assertResponse(response,'tagsRemove');}}for(const hero of heroes){console.log(`Update hero: ${hero.title}`);if(!dryRun){const response=await adminGraphQL(updateProduct,{input:{id:hero.id,descriptionHtml:hero.descriptionHtml}});assertResponse(response,'productUpdate');const tagResponse=await adminGraphQL(addTags,{id:hero.id,tags:[HERO_TAG]});const result=assertResponse(tagResponse,'tagsAdd');console.log(`  ${result.node.handle}: ${result.node.tags.join(', ')}`);}}}
main().catch((error)=>{console.error(error);process.exitCode=1;});
