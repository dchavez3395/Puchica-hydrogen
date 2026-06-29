# Category & Collection Audit

Generated against 6155 products, 19 collections.

## Top-level summary

- Distinct productTypes: **15**
- Collections: **19**
- Untyped products (empty productType): **0**
- Placeholder-typed products: **0**
- Products in mismatched collections: **0**
- productTypes with NO matching collection: **0**
- Empty collections: **0**
- Sparse collections (<5 products): **0**
- Bloated collections (>500 products): **4**

## productType distribution (top 30)

| productType | count | has collection? | placeholder? |
| --- | --- | --- | --- |
| `Phone Case` | 2038 | ✓ |  |
| `Home & Kitchen` | 1302 | ✓ |  |
| `Electronics & Accessories` | 694 | ✓ |  |
| `Apparel & Accessories` | 528 | ✓ |  |
| `Health & Wellness` | 475 | ✓ |  |
| `Sports & Outdoors` | 200 | ✓ |  |
| `Pet Supplies` | 195 | ✓ |  |
| `Automotive` | 119 | ✓ |  |
| `Tools & Home Improvement` | 110 | ✓ |  |
| `Beauty & Grooming` | 108 | ✓ |  |
| `Toys & Games` | 97 | ✓ |  |
| `Home Decor` | 86 | ✓ |  |
| `Office & School Supplies` | 73 | ✓ |  |
| `Baby & Nursery` | 70 | ✓ |  |
| `Garden & Outdoor` | 60 | ✓ |  |

## productTypes without a matching collection

These productTypes are in use but no collection title contains the type name.
Recommendation: create a new collection, OR rename an existing collection to include the type, OR recategorize the products.

_All productTypes have a matching collection._

## Untyped products (empty productType)

**0** products have no productType set. These won't appear in any smart-collection filtered by productType, and they're likely orphans in the storefront nav.


## Placeholder / low-quality productTypes

_No placeholder productTypes in use._

## Collection sizes

### Bloated collections (>500 products)

| collection | products |
| --- | --- |
| `phone-case` **Phone Case** | 2038 |
| `home-essentials` **Home & Kitchen** | 1302 |
| `tech-gadgets` **Electronics & Accessories** | 694 |
| `apparel-accessories` **Apparel & Accessories** | 528 |

**Recommendation:** Bloated collections overwhelm customers. Consider splitting by sub-type (e.g. Phone Case → iPhone Cases, Samsung Cases, Pixel Cases) or adding filters within the collection.

## Products in collections that don't match their type

**0** product/collection mismatches found. (Excludes broad collections: frontpage, all, trending-finds, best-sellers, new, gifts-under-25.)

_All product/collection associations are within their matching types._

## Recommendations

1. **Create new collections for orphaned productTypes.** The list above shows what to add. Pick the top 5-10 by product count.
2. **Recategorize the untyped products.** Either assign a productType or delete the product.
3. **Clean up placeholder types.** Especially the `Puchica` literal leak if any remain.
4. **Fix the mismatched products.** Either change productType, remove from collection, or change the collection filter rule.
5. **Decide on bloated collections.** Split them or accept that they're catch-alls.
6. **Decide on sparse/empty collections.** Delete or populate.