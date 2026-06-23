/**
 * UI string dictionary for the storefront chrome (buttons, footer, nav).
 *
 * Shopify's @inContext handles PRODUCT / COLLECTION / BLOG content. These are
 * the hard-coded interface strings that Shopify can't translate for a headless
 * app, so we keep them here.
 *
 * Machine-translated first pass - review/refine the FR/ES/PT columns.
 * Keys are stable; English is the source of truth and the fallback.
 */
export const DICTIONARIES = {
  en: {
    // ── Announcement bar ──────────────────────────────────────────
    announce_offer: '15% off your first order - code FIRST15',
    announce_freeship: 'Free shipping across Canada',
    announce_cta: 'Shop now',
    offer_first15: 'New here? Take 15% off your first order with code FIRST15.',
    announce_region_aria: 'Site announcements',

    // ── Footer ────────────────────────────────────────────────────
    footer_tagline: '3,700+ handpicked products. Ships from Canada. The good stuff. All in one place.',
    footer_accepted_payments: 'Accepted payments',
    footer_secure: 'Secure checkout by Shopify - encrypted, PCI-compliant',
    footer_shop: 'Shop',
    footer_care: 'Customer Care',
    footer_contact: 'Contact Us',
    footer_search: 'Search',
    footer_policies: 'Policies',
    footer_refund_policy: 'Refund Policy',
    footer_terms: 'Terms of Service',
    footer_newsletter_title: 'Join our newsletter',
    footer_newsletter_copy: 'Exclusive offers and new arrivals, straight to your inbox.',
    footer_email_placeholder: 'Enter your email',
    footer_newsletter_email_aria: 'Email address',
    footer_newsletter_subscribe_aria: 'Subscribe',
    footer_newsletter_submitting: '...',
    footer_newsletter_ok: "Thanks - you're on the list.",
    footer_rights: 'All rights reserved.',
    footer_privacy: 'Privacy Policy',
    news_eyebrow: 'Join the club',
    news_title: 'Get the good stuff first.',
    news_sub:
      "New arrivals, exclusive deals, and picks you won't find anywhere else — straight to your inbox. No spam, unsubscribe anytime.",
    news_cta: 'Subscribe',
    news_submitting: 'Joining…',
    news_done: "You're in! Check your inbox.",
    news_email_label: 'Email address',
    news_email_placeholder: 'your@email.com',
    news_aria: 'Newsletter signup',
  },

  // ════════════════════════════════════════════════════════════════
  fr: {
    announce_offer: '15 % de rabais sur votre première commande - code FIRST15',
    announce_freeship: 'Livraison gratuite au Canada',
    announce_cta: 'Magasiner',
    offer_first15: 'Nouveau ici ? 15 % de rabais sur votre première commande avec le code FIRST15.',
    announce_region_aria: 'Annonces du site',

    footer_tagline: 'Plus de 6 000 produits sélectionnés. Livraison rapide. Le meilleur, tout au même endroit.',
    footer_accepted_payments: 'Paiements acceptés',
    footer_secure: 'Paiement sécurisé par Shopify - chiffré et conforme PCI',
    footer_shop: 'Boutique',
    footer_care: 'Service client',
    footer_contact: 'Contactez-nous',
    footer_search: 'Recherche',
    footer_policies: 'Politiques',
    footer_refund_policy: 'Politique de remboursement',
    footer_terms: "Conditions d'utilisation",
    footer_newsletter_title: 'Abonnez-vous à notre infolettre',
    footer_newsletter_copy: 'Offres exclusives et nouveautés, directement dans votre boîte de réception.',
    footer_email_placeholder: 'Entrez votre courriel',
    footer_newsletter_email_aria: 'Adresse courriel',
    footer_newsletter_subscribe_aria: 'S\'abonner',
    footer_newsletter_submitting: '...',

    footer_newsletter_ok: 'Merci - vous êtes inscrit.',
    footer_rights: 'Tous droits réservés.',
    footer_privacy: 'Politique de confidentialité',
    news_eyebrow: 'Rejoignez le club',
    news_title: 'Découvrez les bons coups en premier.',
    news_sub:
      'Nouveautés, offres exclusives et trouvailles introuvables ailleurs — directement dans votre boîte. Pas de pourriel, désabonnement en un clic.',
    news_cta: "S'abonner",
    news_submitting: 'Inscription…',
    news_done: 'Vous êtes inscrit ! Vérifiez votre boîte de réception.',
    news_email_label: 'Adresse courriel',
    news_email_placeholder: 'vous@courriel.com',
    news_aria: 'Inscription à l\'infolettre',
  },

  // ════════════════════════════════════════════════════════════════
  es: {
    announce_offer: '15 % de descuento en tu primer pedido - código FIRST15',
    announce_freeship: 'Devoluciones en 30 días, sin complicaciones',
    announce_cta: 'Comprar ahora',
    offer_first15: '¿Primera compra? 15 % de descuento en tu primer pedido con el código FIRST15.',
    announce_region_aria: 'Anuncios del sitio',

    footer_tagline: 'Más de 6.000 productos seleccionados. Envío rápido. Lo mejor, todo en un solo lugar.',
    footer_accepted_payments: 'Pagos aceptados',
    footer_secure: 'Pago seguro con Shopify - cifrado y conforme con PCI',
    footer_shop: 'Tienda',
    footer_care: 'Atención al cliente',
    footer_contact: 'Contáctanos',
    footer_search: 'Buscar',
    footer_policies: 'Políticas',
    footer_refund_policy: 'Política de reembolso',
    footer_terms: 'Términos del servicio',
    footer_newsletter_title: 'Unéte a nuestro boletín',
    footer_newsletter_copy: 'Ofertas exclusivas y novedades, directamente en tu correo.',
    footer_email_placeholder: 'Ingresa tu correo',
    footer_newsletter_email_aria: 'Correo electrónico',
    footer_newsletter_subscribe_aria: 'Suscribirse',
    footer_newsletter_submitting: '...',

    footer_newsletter_ok: '¡Gracias! Ya estás en la lista.',
    footer_rights: 'Todos los derechos reservados.',
    footer_privacy: 'Política de privacidad',
    news_eyebrow: 'Únete al club',
    news_title: 'Descubre lo bueno antes que nadie.',
    news_sub:
      'Novedades, ofertas exclusivas y hallazgos que no encontrarás en ningún otro lugar — directo en tu correo. Sin spam, cancela cuando quieras.',
    news_cta: 'Suscribirse',
    news_submitting: 'Uniéndote…',
    news_done: '¡Listo! Revisa tu bandeja de entrada.',
    news_email_label: 'Correo electrónico',
    news_email_placeholder: 'tu@correo.com',
    news_aria: 'Suscripción al boletín',
  },

  // ════════════════════════════════════════════════════════════════
  'pt-br': {
    announce_offer: '15% de desconto no primeiro pedido - código FIRST15',
    announce_freeship: 'Devoluções em 30 dias, sem complicações',
    announce_cta: 'Comprar agora',
    offer_first15: 'Primeira compra? 15% de desconto no primeiro pedido com o código FIRST15.',
    announce_region_aria: 'Avisos do site',

    footer_tagline: 'Mais de 6.000 produtos selecionados. Entrega rápida. O melhor, tudo em um só lugar.',
    footer_accepted_payments: 'Pagamentos aceitos',
    footer_secure: 'Checkout seguro pela Shopify - criptografado e em conformidade com PCI',
    footer_shop: 'Loja',
    footer_care: 'Atendimento ao cliente',
    footer_contact: 'Fale conosco',
    footer_search: 'Buscar',
    footer_policies: 'Políticas',
    footer_refund_policy: 'Política de reembolso',
    footer_terms: 'Termos de serviço',
    footer_newsletter_title: 'Assine nossa newsletter',
    footer_newsletter_copy: 'Ofertas exclusivas e novidades, direto no seu e-mail.',
    footer_email_placeholder: 'Digite seu e-mail',
    footer_newsletter_email_aria: 'Endereço de e-mail',
    footer_newsletter_subscribe_aria: 'Inscrever-se',
    footer_newsletter_submitting: '...',

    footer_newsletter_ok: 'Obrigado - você está na lista.',
    footer_rights: 'Todos os direitos reservados.',
    footer_privacy: 'Política de privacidade',
    news_eyebrow: 'Entre para o clube',
    news_title: 'Veja o melhor primeiro.',
    news_sub:
      'Novidades, ofertas exclusivas e achados que você não encontra em nenhum outro lugar — direto no seu e-mail. Sem spam, cancele quando quiser.',
    news_cta: 'Assinar',
    news_submitting: 'Entrando…',
    news_done: 'Pronto! Confira sua caixa de entrada.',
    news_email_label: 'Endereço de e-mail',
    news_email_placeholder: 'seu@email.com',
    news_aria: 'Inscrição na newsletter',
  },
};
