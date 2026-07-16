"""Check original price for test product."""
import sys; sys.path.insert(0, r'C:\Users\dchav\.openclaw\workspace\runners')
from shared import shopify_admin as sa

gql = '''
query {
  products(query: "handle:hunting-laser-rangefinder-1000-yard-6-5x-magnification", first: 1) {
    edges { node {
      title
      variants(first:5) { edges { node { id price title } } }
    } }
  }
}
'''
data = sa.graphql(gql)
for e in data['data']['products']['edges']:
    p = e['node']
    print('Title:', p['title'])
    for v in p['variants']['edges']:
        print('  Price:', v['node']['price'], '| VariantID:', v['node']['id'].split('/')[-1])
