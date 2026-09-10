/**
 * Metadata for the two launch surfaces: the home page and /collections/all.
 *
 * 2026-09-09. The United States reopened with a two-offer bamboo lighting
 * cohort; Canada stays suspended. That is the first time since 2026-08-21 that
 * the two markets have had different things to say, so `homeCa`/`homeUs` and
 * `shopCa`/`shopUs` finally hold different strings - which is the shape they
 * were kept in for exactly this moment.
 *
 *   UNITED STATES copy describes what is actually listed: a woven bamboo
 *   pendant and a plug-in bamboo wall sconce. Two products is not a range, and
 *   the copy does not pretend otherwise - it names them rather than implying a
 *   catalogue behind them.
 *
 *   CANADA copy is unchanged. The market is still suspended, the pages still
 *   render the containment hero and the restocking empty state, and the
 *   description still says so.
 *
 *   TITLES name the category, which is now lighting rather than travel
 *   organizers. They are shared across markets, so they must be true in a
 *   market that is open and in one that is paused; naming the category and no
 *   product is what keeps that true.
 *
 * The seven 220 V offers held in VOLTAGE_HOLD_CATALOG_OFFERS are deliberately
 * absent from this copy. Nothing here may describe a fixture the store is not
 * prepared to ship.
 */
const COPY = {
  en: {
    homeTitle: 'Puchica — Woven bamboo lighting',
    homeCa:
      'Shopping is paused while we verify product and checkout details. Nothing is listed for sale right now. Questions? hello@puchica.ca',
    homeUs:
      'Woven bamboo pendant and plug-in wall lighting, shipped to the United States. Two fixtures listed today. Questions? hello@puchica.ca',
    shopTitle: 'Shop Woven Bamboo Lighting — Puchica',
    shopCa:
      'We are restocking. Nothing is listed right now — check back shortly, or email hello@puchica.ca.',
    shopUs:
      'A woven bamboo pendant light and a plug-in bamboo swing-arm sconce. Bulbs not included; delivery estimates shown at checkout.',
  },
  fr: {
    homeTitle: 'Puchica — Luminaires en bambou tressé',
    homeCa:
      'Les achats sont en pause pendant que nous vérifions les détails des produits et du paiement. Rien n’est en vente pour le moment. Questions : hello@puchica.ca',
    homeUs:
      'Suspension en bambou tressé et applique à brancher, livrées aux États-Unis. Deux luminaires en ligne aujourd’hui. Questions : hello@puchica.ca',
    shopTitle: 'Magasiner les luminaires en bambou tressé — Puchica',
    shopCa:
      'Nous réapprovisionnons. Rien n’est en ligne pour le moment — revenez bientôt ou écrivez à hello@puchica.ca.',
    shopUs:
      'Une suspension en bambou tressé et une applique en bambou à bras articulé, à brancher. Ampoules non fournies ; estimations de livraison affichées au paiement.',
  },
  es: {
    homeTitle: 'Puchica — Iluminación en bambú tejido',
    homeCa:
      'Las compras están en pausa mientras verificamos los detalles de los productos y del pago. Ahora mismo no hay nada a la venta. ¿Preguntas? hello@puchica.ca',
    homeUs:
      'Lámpara colgante de bambú tejido y aplique enchufable, con envío a Estados Unidos. Hoy hay dos luminarias publicadas. ¿Preguntas? hello@puchica.ca',
    shopTitle: 'Compra iluminación en bambú tejido — Puchica',
    shopCa:
      'Estamos reabasteciendo. Ahora mismo no hay nada publicado: vuelve pronto o escríbenos a hello@puchica.ca.',
    shopUs:
      'Una lámpara colgante de bambú tejido y un aplique de bambú con brazo articulado, enchufable. Bombillas no incluidas; estimaciones de entrega al pagar.',
  },
  'pt-br': {
    homeTitle: 'Puchica — Iluminação em bambu tecido',
    homeCa:
      'As compras estão pausadas enquanto verificamos os detalhes dos produtos e do checkout. No momento não há nada à venda. Dúvidas? hello@puchica.ca',
    homeUs:
      'Pendente de bambu tecido e arandela de tomada, com envio para os Estados Unidos. Hoje há duas luminárias publicadas. Dúvidas? hello@puchica.ca',
    shopTitle: 'Compre iluminação em bambu tecido — Puchica',
    shopCa:
      'Estamos reabastecendo. No momento não há nada publicado — volte em breve ou escreva para hello@puchica.ca.',
    shopUs:
      'Um pendente de bambu tecido e uma arandela de bambu com braço articulado, de tomada. Lâmpadas não inclusas; estimativas de entrega no pagamento.',
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
