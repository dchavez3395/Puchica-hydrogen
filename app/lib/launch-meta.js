/**
 * Metadata for the two launch surfaces: the home page and /collections/all.
 *
 * 2026-09-08. The watch-roll cohort was retired and both markets suspended,
 * which left this file describing products the store no longer sells. The
 * rendered pages were already honest - the home page shows the containment
 * hero ("Shopping is temporarily paused") and /collections/all shows the
 * restocking empty state - but the title and description are what Google
 * indexes and what a shared link previews as, and those still read
 * "Shop Watch Roll Travel Cases" and "PU leather watch roll travel cases in
 * three, four and six slots".
 *
 * What changed and what deliberately did not:
 *
 *   TITLES are back to their pre-2026-09-03 wording, which names the category
 *   and no product. Whether a paused storefront should instead say so in the
 *   title is a positioning call, not a correctness one, and it is not made
 *   here.
 *
 *   DESCRIPTIONS are rewritten. These are the strings that made concrete
 *   inventory claims - slot counts, materials - and there is no inventory.
 *   They now say what the page says.
 *
 * `homeCa`/`homeUs` and `shopCa`/`shopUs` are kept even though each pair now
 * holds the same string. Both markets are closed, so there is nothing to
 * distinguish; the keys stay so reopening one market is an edit to a string
 * rather than a change of shape. tests/launch-meta.test.js fails the moment a
 * market reopens, which is what stops this holding copy from outliving the
 * containment.
 */
const COPY = {
  en: {
    homeTitle: 'Puchica — Travel organizers for easier packing',
    homeCa:
      'Shopping is paused while we verify product and checkout details. Nothing is listed for sale right now. Questions? hello@puchica.ca',
    homeUs:
      'Shopping is paused while we verify product and checkout details. Nothing is listed for sale right now. Questions? hello@puchica.ca',
    shopTitle: 'Shop Travel Organizers — Puchica',
    shopCa:
      'We are restocking. Nothing is listed right now — check back shortly, or email hello@puchica.ca.',
    shopUs:
      'We are restocking. Nothing is listed right now — check back shortly, or email hello@puchica.ca.',
  },
  fr: {
    homeTitle: 'Puchica — Des organisateurs de voyage pour mieux préparer vos bagages',
    homeCa:
      'Les achats sont en pause pendant que nous vérifions les détails des produits et du paiement. Rien n’est en vente pour le moment. Questions : hello@puchica.ca',
    homeUs:
      'Les achats sont en pause pendant que nous vérifions les détails des produits et du paiement. Rien n’est en vente pour le moment. Questions : hello@puchica.ca',
    shopTitle: 'Magasiner les organisateurs de voyage — Puchica',
    shopCa:
      'Nous réapprovisionnons. Rien n’est en ligne pour le moment — revenez bientôt ou écrivez à hello@puchica.ca.',
    shopUs:
      'Nous réapprovisionnons. Rien n’est en ligne pour le moment — revenez bientôt ou écrivez à hello@puchica.ca.',
  },
  es: {
    homeTitle: 'Puchica — Organizadores de viaje para empacar mejor',
    homeCa:
      'Las compras están en pausa mientras verificamos los detalles de los productos y del pago. Ahora mismo no hay nada a la venta. ¿Preguntas? hello@puchica.ca',
    homeUs:
      'Las compras están en pausa mientras verificamos los detalles de los productos y del pago. Ahora mismo no hay nada a la venta. ¿Preguntas? hello@puchica.ca',
    shopTitle: 'Compra organizadores de viaje — Puchica',
    shopCa:
      'Estamos reabasteciendo. Ahora mismo no hay nada publicado: vuelve pronto o escríbenos a hello@puchica.ca.',
    shopUs:
      'Estamos reabasteciendo. Ahora mismo no hay nada publicado: vuelve pronto o escríbenos a hello@puchica.ca.',
  },
  'pt-br': {
    homeTitle: 'Puchica — Organizadores de viagem para arrumar melhor a mala',
    homeCa:
      'As compras estão pausadas enquanto verificamos os detalhes dos produtos e do checkout. No momento não há nada à venda. Dúvidas? hello@puchica.ca',
    homeUs:
      'As compras estão pausadas enquanto verificamos os detalhes dos produtos e do checkout. No momento não há nada à venda. Dúvidas? hello@puchica.ca',
    shopTitle: 'Compre organizadores de viagem — Puchica',
    shopCa:
      'Estamos reabastecendo. No momento não há nada publicado — volte em breve ou escreva para hello@puchica.ca.',
    shopUs:
      'Estamos reabastecendo. No momento não há nada publicado — volte em breve ou escreva para hello@puchica.ca.',
  },
};

export function launchMetaCopy(locale = 'en', country = 'CA') {
  const key = locale.toLowerCase().replace(/_/g, '-');
  const copy = COPY[key] || COPY.en;
  const market = country === 'US' ? 'Us' : 'Ca';

  return {
    home: {title: copy.homeTitle, description: copy[`home${market}`]},
    shop: {title: copy.shopTitle, description: copy[`shop${market}`]},
  };
}
