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
  // MARKET COPY, rewritten 2026-09-13 when the store moved to Canada. The CA
  // and US halves swapped roles: Canada now describes an open shop and the
  // United States describes a closed one.
  //
  // Two things were corrected rather than swapped. The old US copy named "a
  // plug-in bamboo swing-arm sconce" - that fixture has been on COST_HOLD and
  // DRAFT throughout, so the shop description has been naming a product nobody
  // could buy. And the closed-market copy now says the market is closed rather
  // than that we are "restocking", because nothing is being restocked and a
  // shared link previewing a false reason is worse than one previewing none.
  //
  // "Two fixtures" is the live ACTIVE count: the saucer and the dome. The
  // lantern sits in FULFILMENT_HOLD_CATALOG_OFFERS (DRAFT, no DSers mapping),
  // so it is deliberately not counted here. Update this number when it goes
  // live.
  en: {
    homeTitle: 'Puchica — Woven bamboo lighting',
    homeCa:
      'Woven bamboo pendant lighting, shipped across Canada. Two fixtures listed today. Questions? hello@puchica.ca',
    homeUs:
      'We are not shipping to the United States at the moment, so nothing is listed for sale there. Questions? hello@puchica.ca',
    shopTitle: 'Shop Woven Bamboo Lighting — Puchica',
    shopCa:
      'Woven bamboo pendant lights, hand-knitted over wooden ceiling bases. Bulbs not included; delivery estimates shown at checkout.',
    shopUs:
      'Not currently available in the United States. Email hello@puchica.ca if you would like to know when that changes.',
  },
  fr: {
    homeTitle: 'Puchica — Luminaires en bambou tressé',
    homeCa:
      'Suspensions en bambou tressé, livrées partout au Canada. Deux luminaires en ligne aujourd’hui. Questions : hello@puchica.ca',
    homeUs:
      'Nous ne livrons pas aux États-Unis pour le moment ; rien n’y est donc en vente. Questions : hello@puchica.ca',
    shopTitle: 'Magasiner les luminaires en bambou tressé — Puchica',
    shopCa:
      'Des suspensions en bambou tressé, tricotées à la main sur des bases de plafond en bois. Ampoules non fournies ; estimations de livraison affichées au paiement.',
    shopUs:
      'Non disponible aux États-Unis pour le moment. Écrivez à hello@puchica.ca pour savoir quand cela changera.',
  },
  es: {
    homeTitle: 'Puchica — Iluminación en bambú tejido',
    homeCa:
      'Lámparas colgantes de bambú tejido, con envío a todo Canadá. Hoy hay dos luminarias publicadas. ¿Preguntas? hello@puchica.ca',
    homeUs:
      'Por ahora no enviamos a Estados Unidos, así que no hay nada a la venta allí. ¿Preguntas? hello@puchica.ca',
    shopTitle: 'Compra iluminación en bambú tejido — Puchica',
    shopCa:
      'Lámparas colgantes de bambú tejido, tejidas a mano sobre bases de techo de madera. Bombillas no incluidas; estimaciones de entrega al pagar.',
    shopUs:
      'No disponible en Estados Unidos por ahora. Escríbenos a hello@puchica.ca si quieres saber cuándo cambie.',
  },
  'pt-br': {
    homeTitle: 'Puchica — Iluminação em bambu tecido',
    homeCa:
      'Pendentes de bambu tecido, com envio para todo o Canadá. Hoje há duas luminárias publicadas. Dúvidas? hello@puchica.ca',
    homeUs:
      'No momento não enviamos para os Estados Unidos, portanto não há nada à venda lá. Dúvidas? hello@puchica.ca',
    shopTitle: 'Compre iluminação em bambu tecido — Puchica',
    shopCa:
      'Pendentes de bambu tecido, tecidos à mão sobre bases de teto em madeira. Lâmpadas não inclusas; estimativas de entrega no pagamento.',
    shopUs:
      'Indisponível nos Estados Unidos no momento. Escreva para hello@puchica.ca para saber quando isso mudar.',
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
