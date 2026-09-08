const COPY = {
  en: {
    homeTitle: 'Puchica — Travel organizers for easier packing',
    homeCa:
      'Puchica currently ships to the United States. The watch roll cases in this edit are not available for delivery in Canada.',
    homeUs:
      'PU leather watch roll travel cases in three, four and six slots, with cushioned compartments and shipping shown at checkout.',
    shopTitle: 'Shop Watch Roll Travel Cases — Puchica',
    shopCa:
      'These watch roll travel cases are not currently available for delivery in Canada.',
    shopUs:
      'Shop the PU leather watch roll travel cases currently supported for the United States.',
  },
  fr: {
    homeTitle: 'Puchica — Des organisateurs de voyage pour mieux préparer vos bagages',
    homeCa:
      'Puchica livre actuellement aux États-Unis. Les étuis à montres de cette sélection ne sont pas encore livrables au Canada.',
    homeUs:
      'Des étuis à montres en cuir PU à trois, quatre et six compartiments rembourrés, avec la livraison affichée au paiement.',
    shopTitle: 'Magasiner les étuis à montres — Puchica',
    shopCa:
      'Ces étuis à montres de voyage ne sont pas encore livrables au Canada.',
    shopUs:
      'Magasinez les étuis à montres en cuir PU actuellement offerts aux États-Unis.',
  },
  es: {
    homeTitle: 'Puchica — Organizadores de viaje para empacar mejor',
    homeCa:
      'Puchica envía actualmente a Estados Unidos. Los estuches para relojes de esta selección todavía no se entregan en Canadá.',
    homeUs:
      'Estuches de viaje para relojes en cuero PU de tres, cuatro y seis compartimentos acolchados, con el envío visible al pagar.',
    shopTitle: 'Compra estuches de viaje para relojes — Puchica',
    shopCa:
      'Estos estuches de viaje para relojes todavía no se entregan en Canadá.',
    shopUs:
      'Compra los estuches de viaje para relojes en cuero PU disponibles actualmente en Estados Unidos.',
  },
  'pt-br': {
    homeTitle: 'Puchica — Organizadores de viagem para arrumar melhor a mala',
    homeCa:
      'A Puchica envia atualmente para os Estados Unidos. Os estojos para relógios desta seleção ainda não são entregues no Canadá.',
    homeUs:
      'Estojos de viagem para relógios em couro PU de três, quatro e seis compartimentos acolchoados, com o frete exibido no checkout.',
    shopTitle: 'Compre estojos de viagem para relógios — Puchica',
    shopCa:
      'Estes estojos de viagem para relógios ainda não são entregues no Canadá.',
    shopUs:
      'Compre os estojos de viagem para relógios em couro PU disponíveis atualmente nos Estados Unidos.',
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
