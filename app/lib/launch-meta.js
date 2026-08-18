const COPY = {
  en: {
    homeTitle: 'Puchica — Travel organizers for easier packing',
    homeCa:
      'A focused travel-organization edit for clothing, toiletries, and small jewelry, with shipping shown at checkout.',
    homeUs:
      'A focused travel organizer with clear product details and shipping shown at checkout.',
    shopTitle: 'Shop Travel Organizers — Puchica',
    shopCa:
      'Shop Puchica’s focused Canadian travel edit for clothing, toiletries, and small jewelry.',
    shopUs:
      'Shop the travel organizers currently supported for the United States.',
  },
  fr: {
    homeTitle: 'Puchica — Des organisateurs de voyage pour mieux préparer vos bagages',
    homeCa:
      'Une sélection ciblée pour organiser vêtements, articles de toilette et petits bijoux, avec la livraison affichée au paiement.',
    homeUs:
      'Un organisateur de voyage pratique avec des détails clairs et la livraison affichée au paiement.',
    shopTitle: 'Magasiner les organisateurs de voyage — Puchica',
    shopCa:
      'Découvrez la sélection canadienne de Puchica pour organiser vêtements, articles de toilette et petits bijoux.',
    shopUs:
      'Magasinez les organisateurs de voyage actuellement offerts aux États-Unis.',
  },
  es: {
    homeTitle: 'Puchica — Organizadores de viaje para empacar mejor',
    homeCa:
      'Una selección de viaje enfocada en ropa, artículos de aseo y joyas pequeñas, con el envío visible al pagar.',
    homeUs:
      'Un organizador de viaje práctico con detalles claros y el envío visible al pagar.',
    shopTitle: 'Compra organizadores de viaje — Puchica',
    shopCa:
      'Compra la selección canadiense de Puchica para ropa, artículos de aseo y joyas pequeñas.',
    shopUs:
      'Compra los organizadores de viaje disponibles actualmente en Estados Unidos.',
  },
  'pt-br': {
    homeTitle: 'Puchica — Organizadores de viagem para arrumar melhor a mala',
    homeCa:
      'Uma seleção de viagem focada em roupas, itens de higiene e pequenas joias, com o frete exibido no checkout.',
    homeUs:
      'Um organizador de viagem prático com detalhes claros e o frete exibido no checkout.',
    shopTitle: 'Compre organizadores de viagem — Puchica',
    shopCa:
      'Compre a seleção canadense da Puchica para roupas, itens de higiene e pequenas joias.',
    shopUs:
      'Compre os organizadores de viagem disponíveis atualmente nos Estados Unidos.',
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
