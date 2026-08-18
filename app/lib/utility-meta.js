const COPY = {
  en: {
    cart: ['Cart — Puchica', 'Your Puchica shopping cart. Shipping options and payment details appear before payment at Shopify checkout.'],
    notFound: ['Page not found — Puchica', 'This page does not exist. Return to Puchica or contact us for help.'],
    contact: ['Contact us — Puchica', 'Contact Puchica for help with products, orders, shipping, or returns.'],
    account: ['Profile — Puchica', 'Orders — Puchica', 'Addresses — Puchica'],
    search: ['Search — Puchica', 'Search: {term} — Puchica', 'Search practical organizers for packing, travel jewelry, and toiletries.', 'Search results for “{term}” in the Puchica catalog.'],
    shipping: ['Shipping & Delivery — Puchica', 'See shipping availability, options, and cost for your items and destination at checkout before you pay.'],
    faq: ['Frequently Asked Questions — Puchica', 'Answers about Puchica products, orders, shipping, returns, and accounts.'],
  },
  fr: {
    cart: ['Panier — Puchica', 'Votre panier Puchica. Les options de livraison et les détails de paiement apparaissent avant le paiement sécurisé Shopify.'],
    notFound: ['Page introuvable — Puchica', 'Cette page n’existe pas. Retournez à Puchica ou contactez-nous pour obtenir de l’aide.'],
    contact: ['Nous contacter — Puchica', 'Contactez Puchica pour obtenir de l’aide avec un produit, une commande, la livraison ou un retour.'],
    account: ['Profil — Puchica', 'Commandes — Puchica', 'Adresses — Puchica'],
    search: ['Recherche — Puchica', 'Recherche : {term} — Puchica', 'Recherchez des organisateurs pratiques pour les bagages, les bijoux et les articles de toilette.', 'Résultats de recherche pour « {term} » dans le catalogue Puchica.'],
    shipping: ['Expédition et livraison — Puchica', 'Consultez les options, la disponibilité et le coût de livraison pour vos articles et votre destination avant de payer.'],
    faq: ['Foire aux questions — Puchica', 'Réponses sur les produits, commandes, livraisons, retours et comptes Puchica.'],
  },
  es: {
    cart: ['Carrito — Puchica', 'Tu carrito de Puchica. Las opciones de envío y los detalles de pago aparecen antes de pagar en Shopify.'],
    notFound: ['Página no encontrada — Puchica', 'Esta página no existe. Vuelve a Puchica o contáctanos para recibir ayuda.'],
    contact: ['Contáctanos — Puchica', 'Contacta a Puchica para recibir ayuda con productos, pedidos, envíos o devoluciones.'],
    account: ['Perfil — Puchica', 'Pedidos — Puchica', 'Direcciones — Puchica'],
    search: ['Buscar — Puchica', 'Buscar: {term} — Puchica', 'Busca organizadores prácticos para equipaje, joyas de viaje y artículos de aseo.', 'Resultados de búsqueda de «{term}» en el catálogo de Puchica.'],
    shipping: ['Envío y entrega — Puchica', 'Consulta la disponibilidad, las opciones y el costo de envío para tus artículos y destino antes de pagar.'],
    faq: ['Preguntas frecuentes — Puchica', 'Respuestas sobre productos, pedidos, envíos, devoluciones y cuentas de Puchica.'],
  },
  'pt-br': {
    cart: ['Carrinho — Puchica', 'Seu carrinho da Puchica. As opções de entrega e os detalhes de pagamento aparecem antes do pagamento no Shopify.'],
    notFound: ['Página não encontrada — Puchica', 'Esta página não existe. Volte à Puchica ou entre em contato para receber ajuda.'],
    contact: ['Fale conosco — Puchica', 'Entre em contato com a Puchica para obter ajuda com produtos, pedidos, entrega ou devoluções.'],
    account: ['Perfil — Puchica', 'Pedidos — Puchica', 'Endereços — Puchica'],
    search: ['Busca — Puchica', 'Busca: {term} — Puchica', 'Busque organizadores práticos para bagagem, joias de viagem e itens de higiene.', 'Resultados da busca por “{term}” no catálogo da Puchica.'],
    shipping: ['Envio e entrega — Puchica', 'Veja a disponibilidade, as opções e o custo de entrega para seus itens e destino antes de pagar.'],
    faq: ['Perguntas frequentes — Puchica', 'Respostas sobre produtos, pedidos, entregas, devoluções e contas da Puchica.'],
  },
};

export function utilityMetaCopy(locale = 'en') {
  const key = locale.toLowerCase().replace(/_/g, '-');
  const copy = COPY[key] || COPY.en;
  return {
    cart: {title: copy.cart[0], description: copy.cart[1]},
    notFound: {title: copy.notFound[0], description: copy.notFound[1]},
    contact: {title: copy.contact[0], description: copy.contact[1]},
    account: {
      profileTitle: copy.account[0],
      ordersTitle: copy.account[1],
      addressesTitle: copy.account[2],
    },
    search: {
      title: copy.search[0],
      termTitle: copy.search[1],
      description: copy.search[2],
      termDescription: copy.search[3],
    },
    shipping: {title: copy.shipping[0], description: copy.shipping[1]},
    faq: {title: copy.faq[0], description: copy.faq[1]},
  };
}
