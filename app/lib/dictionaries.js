/**
 * UI string dictionary for the storefront chrome (buttons, footer, nav).
 *
 * Shopify's @inContext handles PRODUCT / COLLECTION / BLOG content. These are
 * the hard-coded interface strings that Shopify can't translate for a headless
 * app, so we keep them here.
 *
 * Machine-translated first pass, review/refine the FR/ES/PT columns.
 * Keys are stable; English is the source of truth and the fallback.
 */
export const DICTIONARIES = {
  en: {
    // ── Announcement bar ──────────────────────────────────────────
    announce_offer: 'Focused travel organizers for easier packing',
    announce_freeship: 'Shipping options shown at checkout',
    announce_cta: 'Shop travel organizers',
    offer_first15: 'Shipping options and delivery estimates appear at checkout.',
    announce_region_aria: 'Site announcements',

    // ── Footer ────────────────────────────────────────────────────
    footer_tagline:
      'Practical travel organizers with clear product details and shipping shown at checkout.',
    footer_accepted_payments: 'Accepted payments',
    footer_secure: 'Secure checkout by Shopify, encrypted, PCI-compliant',
    footer_shop: 'Shop',
    footer_care: 'Customer Care',
    footer_about: 'About Us',
    footer_faq: 'FAQ',
    footer_shipping_info: 'Shipping & Delivery',
    footer_contact: 'Contact Us',
    footer_search: 'Search',
    footer_policies: 'Policies',
    footer_shipping_policy: 'Shipping Policy',
    footer_refund_policy: 'Refund Policy',
    footer_privacy_policy: 'Privacy Policy',
    footer_terms_of_service: 'Terms of Service',
    footer_subscription_policy: 'Subscription Policy',
    footer_terms: 'Terms of Service',
    footer_newsletter_title: 'Join our newsletter',
    footer_newsletter_copy:
      'Exclusive offers and new arrivals, straight to your inbox.',
    footer_email_placeholder: 'Enter your email',
    footer_newsletter_email_aria: 'Email address',
    footer_newsletter_subscribe_aria: 'Subscribe',
    footer_newsletter_submitting: '…',
    footer_newsletter_ok: "Thanks, you're on the list.",
    footer_rights: 'All rights reserved.',
    footer_privacy: 'Privacy Policy',

    // ── Nav ───────────────────────────────────────────────────────
    nav_all_products: 'All Products',
    nav_best_sellers: 'Best Sellers',
    nav_trending: 'Trending',
    nav_gifts: 'Gifts Under $25',
    nav_shop: 'Shop',
    nav_new_arrivals: 'New Arrivals',
    nav_sale: 'Sale',
    nav_explore: 'Explore',
    nav_about: 'About',
    nav_contact: 'Contact',
    nav_faq: 'FAQ',
    nav_shipping: 'Shipping',

    // ── Header controls ───────────────────────────────────────────
    header_dismiss_aria: 'Dismiss announcement',
    header_menu_open: 'Open menu',
    header_menu_close: 'Close menu',
    header_search_open: 'Open search',
    header_search_close: 'Close search',
    header_account_aria: 'Account',
    header_cart_open: 'Open cart',
    header_cart_close: 'Close cart',
    // PageLayout asides (cart, search, mobile drawer) and search form
    aside_heading_cart: 'Cart',
    aside_heading_search: 'Search',
    aside_heading_menu: 'Menu',
    cart_loading: 'Loading cart …',
    search_placeholder: 'Search by category, problem, or use',
    search_aria_submit: 'Search',
    search_submit_label: 'Search',
    search_loading_for: 'Searching for “{term}”.',
    search_view_all: 'View all results for “{term}” →',
    // Mobile menu aside (PageLayout.jsx)
    mobile_account: 'Account',
    mobile_signin: 'Sign in / Create account',
    mobile_view_cart: 'View cart',
    mobile_language: 'Language',
    mobile_customer_care: 'Customer Care',
    mobile_contact_us: 'Contact us',
    mobile_all_policies: 'All policies',
    mobile_announce_foot: 'Shipping shown at checkout · 30-day returns',
    mobile_announce_foot_sep: ' · ',
    // Product page trust labels
    // Mega menu category taglines (translated FR/ES/PT as a follow-up pass)
    megamenu_tagline_phone_case: 'Cases, grips, protection.',
    megamenu_tagline_home_essentials: 'Audio, kitchen, decor, storage.',
    megamenu_tagline_home_kitchen: 'Cooking, storage, decor.',
    megamenu_tagline_electronics_accessories: 'Cables, chargers, mounts.',
    megamenu_tagline_apparel_accessories: 'Bags, hats, wearables.',
    megamenu_tagline_health_wellness: 'Skin, scent, grooming.',
    megamenu_tagline_sports_outdoors: 'Gear, fitness, fan shop.',
    megamenu_tagline_pet_finds: 'Toys, beds, things for them.',
    megamenu_tagline_pet_supplies: 'Toys, beds, things for them.',
    megamenu_tagline_automotive: 'Interior, tools, gadgets.',
    megamenu_tagline_tools_home_improvement: 'Repair, build, finish.',
    megamenu_tagline_beauty_personal_care: 'Makeup, nails, self-care.',
    megamenu_tagline_toys_games: 'Play, learn, collect.',
    megamenu_tagline_home_decor: 'Wall, light, accents.',
    megamenu_tagline_office_school_supplies: 'Desk, paper, must-haves.',
    megamenu_tagline_baby_nursery: 'Feeding, decor, comfort.',
    megamenu_tagline_outdoor_garden: 'Garden, patio, outdoor.',
    megamenu_tagline_best_sellers: 'Top picks everyone loves.',
    megamenu_tagline_trending_finds: 'What is hot right now.',
    megamenu_tagline_gifts_under_25: 'Great gifts, small budget.',

    // ── Hero ──────────────────────────────────────────────────────
    hero_eyebrow: 'Trending finds · Under C$200',
    hero_title: 'Make room for what matters.',
    hero_sub:
      'A focused edit of trending high-ticket finds customers keep re-ordering — verified suppliers, transparent pricing, shipping confirmed at checkout.',
    hero_cta_shop: 'Shop now →',
    hero_cta_browse: 'Browse all',
    hero_stat_products: 'Products',
    hero_stat_shipping: 'Clear shipping',
    hero_stat_returns: 'Easy returns',
    hero_pause_label: 'Pause background slideshow',
    hero_play_label: 'Play background slideshow',
    hero_featured_label: 'View featured background product: {title}',
    hero_featured_text: 'Featured: {title}',

    // ── Ticker / Marquee ──────────────────────────────────────────
    ticker_products: 'Small-space solutions',
    ticker_new_drops: 'Everyday fixes that earn their space',
    ticker_free_shipping: 'Shipping shown at checkout',
    ticker_returns: '30-day returns',
    ticker_ships: 'Order tracking available',
    ticker_handpicked: 'Practical, space-conscious picks',
    ticker_real_value: 'Focused launch collection',
    ticker_secure: 'Secure checkout',

    // ── Discover swiper ───────────────────────────────────────────
    swiper_eyebrow: 'Trending now',
    swiper_title: "This week's top picks",
    swiper_pause_label: 'Pause auto-play',
    swiper_resume_label: 'Resume auto-play',
    swiper_slides_aria: 'Curated drops slideshow',
    swiper_stats_aria: 'Store highlights',
    swiper_carousel_aria: 'Discover products carousel',
    swiper_carousel_nav_aria: 'Carousel navigation',
    swiper_prev_aria: 'Previous product',
    swiper_next_aria: 'Next product',
    swiper_dots_aria: 'Jump to product',
    match_section_aria: 'Product Swipe Matchmaker',
    match_deck_aria: 'Product swipe deck',
    match_pass_aria: 'Pass on product',
    match_super_aria: 'Super swipe – Add to Cart',
    match_like_aria: 'Like product',
    rack_section_aria: 'Premium picks',
    rack_scroll_aria: 'Scroll products',
    rack_scroll_left_aria: 'Scroll left',
    rack_scroll_right_aria: 'Scroll right',
    gift_section_aria: 'Find a gift by budget',
    gift_card_aria: 'Shop gifts {label}',
    arrivals_section_aria: 'New arrivals',
    arrivals_scroll_aria: 'Scroll arrivals',
    arrivals_badge_aria: 'New product',
    cat_section_aria: 'Shop by category',
    mood_section_aria: 'Shop by lifestyle',
    lifestyle_shop_eyebrow: 'Explore',
    lifestyle_shop_heading: 'Shop by lifestyle',
    lifestyle_shop_sub:
      'Start with the moment, then find the category that fits.',
    lifestyle_shop_home_title: 'Home upgrades worth it',
    lifestyle_shop_home_body:
      'Useful upgrades for the spaces and routines of every day.',
    lifestyle_shop_motion_title: 'Everyday motion',
    lifestyle_shop_motion_body:
      'Practical finds for getting out the door, staying active, and moving well.',
    lifestyle_shop_family_title: 'Play & family',
    lifestyle_shop_family_body:
      'Thoughtful picks for playtime, little routines, and shared moments.',
    lifestyle_shop_cta: 'Shop the edit →',
    review_section_aria: 'Customer reviews',
    fresh_section_aria: 'Fresh finds',
    fresh_scroll_aria: 'Scroll fresh finds',
    banner_section_aria: 'Best sellers',
    catalog_section_aria: 'Explore the full catalog',
    catalog_count_aria: 'Over 6,000 products',
    trust_section_aria: 'Why Puchica',
    newsletter_section_aria: 'Newsletter signup',

    // ── Shipping reach ────────────────────────────────────────────
    ship_eyebrow: 'Delivery details',
    ship_title: 'Delivery details before you pay.',
    ship_sub:
      'Availability, cost, and timing are confirmed at checkout for the items and destination in your cart.',
    ship_cta: 'View shipping details',
    ship_section_aria: 'Shipping destinations',
    ship_compact_title: 'Coverage by region',
    ship_cities_label: 'cities',
    ship_region_na: 'North America',
    ship_region_sa: 'South America',
    ship_region_uk: 'United Kingdom',
    ship_region_eu: 'Europe',
    ship_region_ap: 'Asia Pacific',
    ship_region_me: 'Middle East',
    ship_region_af: 'Africa',
    ship_region_oc: 'Oceania',
    ship_region_na_sub: 'Availability varies by destination',
    ship_region_sa_sub: 'Not currently promoted',
    ship_region_uk_sub: 'Availability varies by cart',
    ship_region_eu_sub: 'Not currently promoted',
    ship_region_ap_sub: 'Not currently promoted',
    ship_region_me_sub: 'Not currently promoted',
    ship_region_af_sub: 'Not currently promoted',
    ship_region_oc_sub: 'Not currently promoted',

    // ── Shipping page ─────────────────────────────────────────────
    ship_hero_eyebrow: 'Shipping & Delivery',
    ship_hero_title_main: 'Shipping &',
    ship_hero_title_em: 'Delivery.',
    ship_hero_sub:
      'Delivery availability, cost, and timing are confirmed at checkout for the items and destination in your cart.',
    ship_hero_cta: 'Shop the travel edit',
    ship_launch_hero_sub:
      'One North American storefront with market-specific pricing and delivery options confirmed at checkout.',
    ship_jump: 'See how delivery is confirmed',
    ship_launch_regions_eye: 'North American storefront',
    ship_launch_regions_title: 'Two markets. One focused shop.',
    ship_launch_regions_sub:
      'Choose Canada or the United States to view market pricing. Delivery still depends on the selected items and address.',
    ship_launch_rates_eye: 'Before you pay',
    ship_launch_rates_title: 'Check delivery before payment',
    ship_launch_rates_sub:
      'Checkout shows delivery availability for your selected items and destination before payment.',
    ship_launch_how_eye: 'How it works',
    ship_launch_how_title: 'Order with the details in view.',
    ship_launch_how_1_title: 'Choose your items',
    ship_launch_how_1_body:
      'Add the product and variant you want to your cart, then continue to secure checkout.',
    ship_launch_how_2_title: 'Review delivery at checkout',
    ship_launch_how_2_body:
      'Enter your destination to see whether a delivery option is available for your order before payment.',
    ship_launch_how_3_title: 'Receive order updates',
    ship_launch_how_3_body:
      'We send confirmation after checkout and provide available fulfillment updates as your order progresses.',
    ship_launch_track_eye: 'After your order',
    ship_launch_track_title: 'Support when you need it.',
    ship_launch_track_body_1:
      'Order confirmation is sent after checkout. Delivery updates and tracking depend on the service available for your order.',
    ship_launch_track_body_2:
      'If you need help with an order, contact support with your order number and we will review the available details with you.',
    footer_stat_delivery: 'Delivery options',
    ship_market_ca_name: 'Canada · CAD',
    ship_market_ca_detail:
      'CAD storefront pricing; checkout confirms whether the selected items can be delivered.',
    ship_market_us_name: 'United States · USD',
    ship_market_us_detail:
      'USD storefront pricing; checkout confirms whether the selected items can be delivered.',
    ship_market_next_name: 'Canada and other markets',
    ship_market_next_detail:
      'We’re still confirming reliable product coverage before promoting these destinations.',
    ship_check_destination_title: 'Check your destination',
    ship_check_destination_body:
      'Enter your delivery address at checkout to see the options available for your order.',
    ship_check_destination_eta: 'Availability shown before payment',
    ship_check_items_title: 'Check the items in your cart',
    ship_check_items_body:
      'Shipping options can differ by product, variant, and destination. The checkout result applies to your selected order.',
    ship_check_items_eta: 'No delivery promise until checkout confirms it',
    ship_check_tracking_title: 'Follow your order',
    ship_check_tracking_body:
      'When a tracked service is available, tracking details are sent after the order has shipped.',
    ship_check_tracking_eta: 'See the shipping policy for support details',
    ship_check_duties_title: 'Duties and import charges',
    ship_check_duties_body:
      'Customs duties, import taxes, brokerage, or carrier charges may be assessed by the destination. Puchica does not collect these charges; when applicable, they are the customer’s responsibility.',
    ship_check_duties_eta: 'Charged by customs or the carrier when applicable',
    ship_regions_eye: 'Where we ship',
    ship_regions_title: 'Coverage expands only after validation.',
    ship_regions_sub:
      'We only promote destinations after product-level delivery and supplier coverage are confirmed.',
    ship_rates_eye: 'Shipping rates',
    ship_rates_title: 'Clear shipping before payment.',
    ship_rates_sub:
      'Checkout confirms available services, cost, and timing for your selected items and destination.',
    ship_rates_canada_flag: 'CA',
    ship_rates_canada_title: 'Canada',
    ship_rates_canada_body:
      'Available shipping services and costs are shown at checkout for the selected order.',
    ship_rates_canada_eta: 'Delivery estimate shown at checkout',
    ship_rates_canada_badge: '',
    ship_rates_us_flag: 'US',
    ship_rates_us_title: 'United States',
    ship_rates_us_body:
      'Availability depends on the selected items, cart, and destination.',
    ship_rates_us_eta: 'Confirm at checkout',
    ship_rates_us_badge: '',
    ship_rates_intl_flag: 'INTL',
    ship_rates_intl_title: 'International',
    ship_rates_intl_body:
      'International delivery is not currently promoted. Confirm availability at checkout before ordering.',
    ship_rates_intl_eta: 'No general delivery promise',
    ship_rates_intl_badge: '',
    ship_how_eye: 'How it works',
    ship_how_title: 'Review the details before ordering.',
    ship_how_1_title: 'Place your order',
    ship_how_1_body:
      "Browse the catalog, add to cart, and check out securely. You'll get an order confirmation right away.",
    ship_how_2_title: 'Your order is processed',
    ship_how_2_body:
      'Processing and delivery timing depend on the selected product and service. Available updates are sent as fulfillment progresses.',
    ship_how_3_title: 'Delivered to your door',
    ship_how_3_body:
      'Use the delivery estimate shown at checkout for your selected items and address.',
    ship_track_eye: 'Tracking your order',
    ship_track_title: 'Follow available order updates.',
    ship_track_body_1:
      'When a tracked service is available, tracking details are sent after the order ships.',
    ship_track_body_2:
      'Use the link in your shipping email or contact support with your order number if you need help.',
    ship_track_cta: 'Contact support',
    ship_cta_title: 'Ready to order?',
    ship_cta_sub:
      'Shop the travel edit and confirm shipping for your address at checkout.',
    ship_cta_browse: 'Shop all travel organizers',

    // ── Matchmaker ────────────────────────────────────────────────
    match_eyebrow: 'Discovery Matchmaker',
    match_title: 'Puchica Match.',
    match_sub:
      'Swipe right on something you like. Swipe up to buy it on the spot. Swipe left to move on. Your cart\u2019s the only relationship here.',
    match_empty_title: 'No more items today!',
    match_empty_body:
      'That\u2019s the deck. You liked {count} things. Want another round?',
    match_reset: 'Swipe Again',
    match_browse: 'Browse All',
    match_stamp_like: 'LIKE',
    match_stamp_nope: 'NOPE',
    match_stamp_super: 'BUY NOW',

    // ── Product rack ──────────────────────────────────────────────
    rack_eyebrow: 'Home & Kitchen',
    rack_title: 'Small wins for the room you\u2019re in.',

    // ── Gift finder ───────────────────────────────────────────────
    gift_eyebrow: 'Gift ideas',
    gift_title: 'Pick a budget. We\u2019ll do the rest.',
    gift_sub:
      'Whether it\u2019s a stocking stuffer or the kind of present that ends up being talked about at dinner.',
    gift_under25_label: 'Under $25',
    gift_under25_sub: 'Stocking-stuffer energy.',
    gift_25_50_label: '$25 – $50',
    gift_25_50_sub: 'Most people start here.',
    gift_50_100_label: '$50 – $100',
    gift_50_100_sub: 'The \u201Cwow\u201D zone.',
    gift_100_label: '$100+',
    gift_100_sub: 'For when you actually mean it.',

    // ── New arrivals ──────────────────────────────────────────────
    arrivals_eyebrow: 'Outdoor & Garden',
    arrivals_title: 'Get outside.',
    arrivals_see_all: 'See all new',
    arrivals_badge: 'New',

    // ── For You ───────────────────────────────────────────────────
    foryou_eyebrow: 'Curated for you',
    foryou_title: 'Picture this.',
    foryou_sub: 'A hand-styled edit, every shot made just for these products.',
    foryou_cta: 'Shop the edit',
    foryou_section_aria: 'For You showcase',

    // ── Category bento ────────────────────────────────────────────
    cat_eyebrow: 'Shop by category',
    cat_title: 'Find your thing.',
    cat_home_tagline: 'Things that earn their spot in the room.',
    cat_beauty_tagline: 'Stuff that doesn\u2019t pretend to be clinical.',
    cat_tech_tagline: 'Gadgets and cables. Nothing weird.',
    cat_outdoor_tagline: 'Get out there.',
    cat_pet_tagline: 'They deserve the best too.',
    cat_fallback_tagline: 'Curated with care.',
    cat_shop_now: 'Shop now →',
    cat_cell_aria: 'Shop {title}',

    // ── Shop by mood ──────────────────────────────────────────────
    mood_eyebrow: 'Made for your life',
    mood_title: 'Trending. Verified. Delivered.',
    mood_home_label: 'Home & Living',
    mood_home_title: 'Your room, working harder.',
    mood_home_sub:
      'Trending finds and upgrades that make a real room feel better.',
    mood_home_cta: 'See what\u2019s in there →',
    mood_beauty_label: 'Beauty & Self-Care',
    mood_beauty_title: 'Keep daily essentials in order.',
    mood_beauty_sub:
      'Compact storage for personal-care routines at home or away.',
    mood_beauty_cta: 'See what\u2019s in there →',
    mood_tech_label: 'Tech & Gadgets',
    mood_tech_title: 'Stuff that makes existing tech less annoying.',
    mood_tech_sub:
      'Accessories, cables, the small things that fix daily frustrations.',
    mood_tech_cta: 'See what\u2019s in there →',

    // ── Reviews / testimonials ────────────────────────────────────
    review_eyebrow: 'How we choose',
    review_title: 'The standard for every product.',
    review_1_quote:
      'Ordered three times this month. Quality is consistently great and shipping is fast.',
    review_2_quote:
      'It should be simple to understand, size, and use in a daily routine.',
    review_3_quote:
      'Its supplier route and delivery details should be verified before promotion.',

    // ── Featured banner (best sellers) ───────────────────────────
    banner_eyebrow: 'Best Sellers',
    banner_title: 'Start with the focused collection.',
    banner_sub:
      'Trending high-ticket finds, hand-picked for the current launch.',
    banner_cta: 'See all',

    // ── Catalog statement ─────────────────────────────────────────
    catalog_body:
      'A focused catalog of trending high-ticket finds — verified suppliers, transparent pricing, shipping confirmed at checkout.',
    catalog_cta_browse: 'Browse everything →',
    catalog_cta_search: 'Search the catalog',

    // ── Trust / value props ───────────────────────────────────────
    trust_shipping_title: 'Clear shipping',
    trust_shipping_sub: 'Confirmed at checkout',
    trust_returns_title: '30-day returns',
    trust_returns_sub: 'See policy for eligibility',
    trust_secure_title: 'Secure checkout',
    trust_secure_sub: 'Encrypted & PCI-compliant',
    trust_handpicked_title: 'Focused collection',
    trust_handpicked_sub: 'Built around trending finds',

    // ── Newsletter band ───────────────────────────────────────────
    newsletter_pill: 'Join the club',
    newsletter_title: 'New stuff, before the site gets it.',
    newsletter_sub:
      'New arrivals, the picks that actually move, and the occasional discount code. About one email a week.',
    newsletter_done: "You're in! Check your inbox.",
    newsletter_email_label: 'Email address',
    newsletter_placeholder: 'your@email.com',
    newsletter_joining: 'Joining…',
    newsletter_subscribe: 'Subscribe',

    // ── Stats counter ─────────────────────────────────────────────
    counter_products: 'Products',
    counter_collections: 'Collections',
    counter_categories: 'Categories',
    counter_canadian: 'Curated',

    // ── Explore page ──────────────────────────────────────────────
    explore_home: 'Home',
    explore_breadcrumb: 'Explore Catalog',
    explore_eyebrow: 'Discover the Collection',
    explore_title: 'Explore the full catalog',
    explore_showing: 'Showing',
    explore_product_singular: 'product',
    explore_product_plural: 'products',
    explore_across: 'across',
    explore_count_active_cat_singular: 'active category',
    explore_count_active_cat_plural: 'active categories',
    explore_filter_title: 'Filter by Category',
    explore_filter_clear: 'Clear all',
    explore_empty_title: 'No products found',
    explore_empty_body:
      'Try adjusting your active category selections or clear the filters.',
    explore_empty_reset: 'Reset Filters',
    explore_view_details: 'View Details',
    explore_cat_home: 'Home & Kitchen',
    explore_cat_beauty: 'Beauty & Grooming',
    explore_cat_tech: 'Electronics & Tech',
    explore_cat_pet: 'Pet Supplies',
    explore_cat_outdoor: 'Garden & Outdoor',

    // ── Shared breadcrumbs ────────────────────────────────────────
    breadcrumb_aria: 'Breadcrumb',
    col_filters_aria: 'Filters',
    search_trending_label: 'Shop by need',
    search_recent_label: 'Recently viewed',
    search_trending_terms:
      'packing cubes, cable organizer, toiletry bag, travel organizer',
    col_density_aria: 'Grid density',
    col_density_3_aria: 'Show 3 per row',
    col_density_4_aria: 'Show 4 per row',
    explore_cat_filter_aria: 'Category filters',
    breadcrumb_home: 'Home',
    breadcrumb_collections: 'Collections',
    breadcrumb_shop: 'Shop',

    // ── Collection page ───────────────────────────────────────────
    col_eyebrow: 'Collection',
    col_empty_title: 'Nothing matches yet',
    col_empty_filtered: 'No products match these filters.',
    col_clear_filters: 'Clear filters',
    col_empty_restocking:
      'This collection is being restocked. Browse all trending finds or check back soon.',
    col_showing: 'Showing',
    col_showing_more: 'so far, load more below',
    col_product_singular: 'product',
    col_product_plural: 'products',
    col_sort_by: 'Sort by',
    col_sort_featured: 'Featured',
    col_sort_best: 'Sorted by sales',
    col_sort_newest: 'Newest',
    col_sort_price_asc: 'Price: low to high',
    col_sort_price_desc: 'Price: high to low',
    col_filter_cat_label: 'Category:',
    col_filter_price_label: 'Price:',
    col_filter_cat_heading: 'Category',
    col_filter_price_heading: 'Price',
    col_filter_no_types: 'No sub-categories in this collection.',
    col_price_under25: 'Under $25',
    col_price_25_50: '$25 – $50',
    col_price_50_100: '$50 – $100',
    col_price_100_plus: '$100 +',
    col_count_loading: 'Collection is loading',
    col_count_and_counting: 'and counting',
    col_count_of: 'of',
    col_brand_chip: 'Puchica',

    // ── Trending landing (homepage) ───────────────────────────────
    trending_eyebrow: 'Trending finds · Under $200',
    trending_title:
      'Trending finds under $200 — practical products with real reviews.',
    trending_sub:
      'A focused edit of high-ticket items customers keep re-ordering: audio, kitchen, fitness, home, and outdoor. Real product photos, shipping shown at checkout, no subscriptions.',
    trending_hero_cta: 'Shop the trending edit',
    trending_hero_secondary: 'Browse the full catalog',
    trending_proof_secure_h: 'Secure Shopify checkout',
    trending_proof_secure_s: 'Encrypted & PCI-compliant',
    trending_proof_shipping_h: 'Free Canadian shipping',
    trending_proof_shipping_s: 'On orders over $50',
    trending_proof_photos_h: 'Real product photos',
    trending_proof_photos_s: 'Ships from verified suppliers',
    trending_feature_spotlight_kicker: '#1 bestseller',
    trending_feature_secondary_kicker: '#2 bestselling',
    trending_feature_tertiary_kicker: '#3 bestselling',
    trending_feature_cta: 'Shop the #1 pick',
    trending_grid_eyebrow: 'Featured this launch',
    trending_grid_title: 'More trending finds worth a look',
    trending_grid_sub:
      'Hand-picked from the launch catalog — verified suppliers, shipping confirmed at checkout, returns within 30 days.',
    trending_grid_more_cta: 'Shop all trending finds',
    trending_card_cta: 'View product',
    trending_explore_eyebrow: 'More from the catalog',
    trending_explore_title: 'Discover the rest of the launch',
    trending_explore_sub:
      'Every product we route through checkout, all in one place. Scroll to browse the full launch.',

    // ── All products page ─────────────────────────────────────────
    all_breadcrumb: 'Travel organizers',
    all_eyebrow: 'The travel edit',
    all_title: 'Travel organization, kept simple',
    all_sub: 'Three practical organizers for clothing, cables, and toiletries.',
    all_empty_title: 'New finds are on the way',
    all_empty_body:
      'We’re adding products for home, cables, and travel. Check back soon.',
    all_count_loading: 'Catalog is loading',

    // ── Product page ──────────────────────────────────────────────
    product_trust_shipping: 'Shipping shown at checkout',
    product_trust_shipping_sub: 'for your destination',
    product_trust_returns: '30-day return window',
    product_trust_returns_sub: 'see policy for eligibility',
    product_trust_secure: 'Secure checkout',
    product_trust_secure_sub: 'encrypted & PCI-compliant',
    product_desc_eyebrow: 'How it helps',
    product_reco_see_all: 'See all',
    product_perks_aria: 'Shipping & service promises',
    product_highlights_eyebrow: 'Useful details',
    product_care_eyebrow: 'Before you order',
    product_care_h: 'What to know before you order',
    product_stock_low: 'Only {stock} left',
    product_badge_sold_out: 'Sold out',
    product_badge_save: 'Save {pct}%',
    product_reviews_stub:
      'Reviews from verified buyers will appear here as they are collected.',
    product_perk_packed: 'Delivery options confirmed at checkout',
    product_perk_return: 'Review the refund policy before ordering',
    product_perk_curated:
      'Choose your size, color, or set before adding to cart',
    product_tab_description: 'Description',
    product_story_title: 'Why it earns its space.',
    product_tab_specs: 'Specifications',
    product_tab_shipping: 'Shipping & Returns',
    product_desc_empty: 'No additional description for this product.',
    product_spec_vendor: 'Brand',
    product_spec_category: 'Category',
    product_spec_sku: 'Product code',
    product_specs_empty: 'No specifications available for this product.',
    product_shipping_h: 'Shipping',
    product_shipping_body:
      'Delivery availability, timing, and cost are confirmed at checkout for your selected items and destination. When a tracked service is available, tracking details are sent after the supplier ships your order.',
    product_returns_h: 'Returns',
    product_returns_body:
      'Review the refund policy before ordering. Return eligibility and instructions depend on the item and order; contact support with your order number if you need help.',
    product_help_h: 'Need help?',
    product_help_body:
      'Reach us through the contact page with your product or order question and the details we need to help.',
    product_help_contact_link: 'contact page',
    product_share_label: 'Share:',
    product_share_btn: 'Share',
    product_copy_link: 'Copy link',
    product_link_copied: 'Link copied',
    product_reco_title: 'You might also like',
    product_recently_viewed_title: 'Recently viewed',
    product_add_to_cart: 'Add to cart',
    product_price_from: 'From',
    product_sold_out: 'Sold out',
    product_notify_label: 'Notify me when back in stock',
    product_notify_placeholder: 'you@example.com',
    product_notify_btn: 'Notify me',
    product_notify_ok: "Thanks, we'll email you when this is back in stock.",
    product_notify_error: 'Something went wrong. Please try again.',

    // ── Add-to-cart button states ─────────────────────────────────
    atc_added: 'Added ✓',
    atc_out_of_stock: 'Out of stock',
    atc_adding: 'Adding…',

    // ── Search results ────────────────────────────────────────────
    search_articles: 'Articles',
    search_pages: 'Pages',
    search_products: 'Products',
    search_empty: 'No results found. Try a different search term.',
    search_articles_aria: 'Article results',
    search_pages_aria: 'Page results',
    search_products_aria: 'Product results',

    // ── Product card ──────────────────────────────────────────────
    card_view_details: 'View details',
    card_choose_options: 'Choose options',
    card_swatches_aria: 'Product options',
    card_quick_add_aria: 'Quick add',

    // ── Header / nav chrome ───────────────────────────────────────
    nav_shop_all: 'Shop All',
    nav_best_sellers_short: 'Best Sellers',
    nav_new_arrivals_short: 'New Arrivals',
    nav_gift_guide: 'Gift Guide',
    nav_about_short: 'About',
    nav_contact_short: 'Contact',
    megamenu_trigger: 'Shop',
    megamenu_panel_aria: 'Shop by category',
    megamenu_error_body: "We couldn't load the categories just now.",
    megamenu_error_cta: 'Browse everything →',
    megamenu_tile_cta: 'Shop →',
    megamenu_intent_heading: 'Shop by category',
    megamenu_intent_home_title: 'Best sellers',
    megamenu_intent_home_body:
      'Audio, kitchen, fitness, home, outdoor — the picks customers keep re-ordering.',
    megamenu_intent_cable_title: 'Top trending',
    megamenu_intent_cable_body: 'Keep cords and everyday tech easy to find.',
    megamenu_intent_travel_title: 'All categories',
    megamenu_intent_travel_body: 'Packing, luggage, and everyday carry.',
    megamenu_edit_eyebrow: 'Start here',
    megamenu_edit_title: 'Trending high-ticket finds under C$200.',
    megamenu_edit_body:
      'Shop solutions for under-sink storage, cables, packing, and everyday carry.',
    megamenu_trust_shipping: 'Shipping options shown at checkout',
    megamenu_trust_refund: 'Refund policy available',
    pillnav_aria: 'Page sections',
    pillnav_trending: 'Trending',
    pillnav_home_kitchen: 'Home & Kitchen',
    pillnav_outdoor: 'Outdoor',
    pillnav_categories: 'Categories',
    pillnav_best_sellers: 'Best Sellers',
    pillnav_about_us: 'About us',

    // ── Parallax banner (homepage brand band) ─────────────────────
    parallax_aria: 'Brand banner',
    parallax_title: "What's your thing? We have it.",
    parallax_sub: 'Dozens of collections. One Canadian store.',
    parallax_cta: 'Browse by category →',

    // ── Trending ticker ───────────────────────────────────────────
    ticker_section_aria: 'Trending products',
    ticker_label: 'Trending',

    // ── Collection showcase (homepage) ────────────────────────────
    showcase_section_aria: 'Collection showcase',
    showcase_heading: 'Explore by category',
    showcase_sub: '{count} collections. {pct}% of the catalog covered.',
    showcase_eyebrow: 'Collection {n}',
    showcase_desc:
      'Discover our {title} selection, with delivery details confirmed for your cart at checkout.',
    showcase_cta: 'Shop {title} →',

    // ── 404 / catch-all ───────────────────────────────────────────
    notfound_title: "We couldn't find that page",
    notfound_sub:
      'The link {path} doesn’t exist on Puchica. It may have been moved, renamed, or never existed. Try one of these instead:',
    notfound_popular: 'Popular collections',
    notfound_best: 'Best sellers →',
    notfound_new: 'New arrivals →',
    notfound_all_collections: 'All collections →',
    notfound_all_catalog: 'Full catalog →',
    notfound_breadcrumb_current: 'Page not found',
    notfound_breadcrumb_aria: 'Breadcrumb',
    notfound_breadcrumb_home: 'Home',
    notfound_eyebrow: '404',

    // ── Cart drawer / page ────────────────────────────────────────
    cart_section_aria: 'Cart drawer',
    cart_page_aria: 'Cart page',
    stats_aria: 'Store statistics',
    product_price_aria: 'Price',
    pdp_3d_fallback_product: 'Product',
    pdp_3d_viewer: '3D viewer',
    pdp_3d_hint: 'Drag to rotate · scroll to zoom',
    cart_heading_aria: 'Line items',
    cart_remove_region_aria: 'Remove from cart',
    cart_empty_title: 'Nothing in your cart yet.',
    cart_empty_body: 'Start with one practical organizer for your next trip.',
    cart_empty_cta_shop: 'Shop the travel edit',
    cart_empty_cta_best: 'View packing cubes',
    cart_empty_perks_aria: 'Why shop with us',
    cart_empty_perk_shipping: 'Shipping options shown at checkout',
    cart_empty_perk_returns: '30-day returns',
    cart_ghost_notice:
      "These items aren't available in your region right now. Remove them to clear your cart.",
    cart_freeship_progress_remaining: 'Shipping is confirmed at checkout',
    cart_freeship_progress_done: 'Shipping is confirmed at checkout',
    cart_freeship_threshold_label: 'Final shipping options appear at checkout',
    cart_summary_title: 'Order summary',
    cart_summary_subtotal: 'Subtotal',
    cart_summary_empty_btn: 'Add an item to continue',
    cart_summary_checkout_btn: 'Continue to Checkout',
    cart_checkout_unavailable:
      'Checkout is temporarily unavailable. Refresh your cart and try again.',
    cart_checkout_retry: 'Refresh cart',
    cart_summary_discounts_aria: 'Discounts',
    cart_summary_discounts_h: 'Discounts',
    cart_summary_remove_discount: 'Remove discount',
    cart_summary_remove: 'Remove',
    cart_summary_promo_label: 'Promo code',
    cart_summary_promo_placeholder: 'Enter code',
    cart_summary_promo_apply_aria: 'Apply discount code',
    cart_summary_promo_apply: 'Apply',
    cart_summary_gift_aria: 'Gift cards',
    cart_summary_gift_h: 'Applied Gift Card(s)',
    cart_summary_gift_label: 'Gift card',
    cart_summary_gift_placeholder: 'Enter gift card code',
    cart_summary_gift_apply_aria: 'Apply gift card code',
    cart_summary_gift_apply: 'Apply',
    cart_summary_remove_gift_aria: 'Remove gift card ending in {last}',
    cart_qty_aria: 'Quantity',
    cart_qty_dec_aria: 'Decrease quantity',
    cart_qty_inc_aria: 'Increase quantity',
    cart_qty_remove_aria: 'Remove from cart',
    cart_qty_remove: 'Remove',
    cart_line_items_aria: 'Line items with {title}',

    // ── Pagination (collections, search) ──────────────────────────
    pager_aria: 'Pagination',
    pager_prev: 'Previous page',
    pager_next: 'Load next 12',
    pager_loading: 'Loading more products…',
    pager_end: "You've reached the end",
    pager_showing_one: 'Showing {n} product',
    pager_showing_many: 'Showing {n} products',

    // ── PDP image gallery (3D toggle, zoom, etc.) ─────────────────
    pdp_img_alt_fallback: 'Product image',
    pdp_thumbs_aria: 'Product images',
    pdp_thumb_aria: 'View image {n} of {total}',
    pdp_3d_open_aria: 'View product in 3D',
    pdp_3d_open: 'View in 3D',
    pdp_3d_close_aria: 'Return to photo view',
    pdp_3d_close: '← Photos',
    pdp_zoom_hint: 'Hover to zoom',
    pdp_prev_aria: 'Previous image',
    pdp_next_aria: 'Next image',

    // ── Product form ──────────────────────────────────────────────
    product_qty_aria: 'Quantity',
    product_qty_dec_aria: 'Decrease quantity',
    product_qty_inc_aria: 'Increase quantity',
    product_save_aria: 'Save for later',
    product_unsave_aria: 'Remove from saved',
    product_stock_phrase: 'Only {stock} left',

    // ── Embla / carousels ─────────────────────────────────────────
    embla_prev_aria: 'Previous',
    embla_next_aria: 'Next',
    embla_view_all: 'View all →',
    embla_dots_aria: 'Slide indicators',
    embla_dot_aria: 'Go to slide {n}',

    // ── Aside / drawer chrome ─────────────────────────────────────
    aside_close_drawer: 'Close drawer',
    aside_close: 'Close',
    locale_change_aria: 'Change market or language',
    locale_switching: 'Switching…',
    locale_switching_status: 'Updating market and currency.',
    locale_market_label: 'Market',
    locale_market_ca: 'Canada',
    locale_market_us: 'United States',
    locale_market_unavailable: 'Unavailable',
    locale_language_label: 'Language',
    mobile_market_language: 'Market & language',
    skip_to_content: 'Skip to main content',

    // ── Root ErrorBoundary / 404 / search in error UI ────────────
    err_404_h: "We couldn't find that page",
    err_500_h: 'Something went wrong on our end',
    err_404_body:
      'That page may have moved while we prepare the new catalog. Return home or contact us for help.',
    err_500_body:
      'We couldn’t load this page. Try again, return home, or contact us for help.',
    err_search_aria: 'Search finds',
    err_search_placeholder: 'Search finds…',
    err_search_btn: 'Search',
    err_home: 'Back to home',
    err_browse: 'About Puchica',
    err_contact: 'Need help? Email {email}.',

    // ── Footer (rest of footer chrome; some already exist) ────────
    footer_social_aria: 'Social links',
    footer_payments_aria: 'Accepted payment methods',
    footer_payments_list_aria: 'Payment methods',
    footer_address: 'Puchica · Canada',
    footer_email: 'hello@puchica.ca',
    footer_stats_aria: 'Store highlights',
    footer_stat_products: 'Catalog',
    footer_stat_collections: 'Collections',
    footer_stat_shipping: 'Checkout shipping',
    footer_stat_returns: 'Day returns',
    footer_copyright: '© {year} Puchica.',
    footer_legal_aria: 'Legal',
    footer_newsletter_cta: '→',
    social_instagram: 'Instagram',
    social_facebook: 'Facebook',
    social_tiktok: 'TikTok',

    // ── Judgeme reviews ───────────────────────────────────────────
    reviews_section_aria: 'Customer reviews',
    reviews_heading: 'Customer reviews',
    reviews_aria: '{rating} out of 5 stars, {count} reviews',
    reviews_count_one: '({count} review)',
    reviews_count_many: '({count} reviews)',

    // ── Newsletter popup modal ────────────────────────────────────
    np_aria: 'Join the Puchica list',
    np_close_backdrop: 'Close',
    np_close_x: 'Close',
    np_success_h: "You're in!",
    np_success_body:
      "You're subscribed for product updates, restocks, and occasional offers.",
    np_copy_btn: 'Copied!',
    np_copy_hint: 'Tap to copy',
    np_success_cta: 'Start shopping →',
    np_form_h: 'Join the Puchica list',
    np_form_body:
      'Get product updates, restocks, and occasional offers. No spam; unsubscribe anytime.',
    np_email_placeholder: 'you@email.com',
    np_email_aria: 'Email address',
    np_joining: 'Joining…',
    np_submit: 'Subscribe',
    np_dismiss: 'No thanks',

    // ── ProductItem card (badges, placeholder) ────────────────────
    badge_new_arrival: 'New Arrival',
    badge_top_pick: 'Featured',
    badge_trending: 'Featured',
    badge_staff_pick: 'Puchica pick',
    badge_sale: 'Sale',
    badge_new: 'New',
    badge_best_seller: 'Featured',

    // ── Search route + predictive ────────────────────────────────
    search_results_h: 'Results for {term}',
    search_results_h_fallback: 'Search',
    search_input_placeholder: 'Search products…',
    search_submit: 'Search',
    search_zero_hint:
      'Search by keyword, or browse our most popular categories above.',
    pred_articles: 'Articles',
    pred_collections: 'Collections',
    pred_pages: 'Pages',
    pred_products: 'Finds',
    pred_empty_title: 'Start typing to search',
    pred_empty_body: 'Try packing cubes, cable organizer, or toiletry bag.',
    pred_pill_best: 'Featured',
    pred_pill_all: 'All categories',
    pred_pill_new: 'New arrivals',
    pred_no_results_h: 'No finds matched “{term}”.',
    pred_no_results_body:
      'Try packing cubes, cable organizer, or toiletry bag.',

    // ── Cart page h1 ──────────────────────────────────────────────
    cart_page_h: 'Cart',
    cart_page_eyebrow: 'Your cart',
    cart_trust_aria: 'Why shop with us',
    cart_trust_returns: '30-day returns',
    cart_trust_shipping: 'Delivery shown at checkout',
    cart_trust_secure: 'Secure checkout',

    // ── Collections index page ───────────────────────────────────
    col_index_breadcrumb_aria: 'Breadcrumb',
    col_index_breadcrumb_home: 'Home',
    col_index_breadcrumb_current: 'Collections',
    col_index_eyebrow: 'Browse',
    col_index_h: 'All collections',
    col_index_sub: 'Browse trending finds by category, problem, or use.',
    col_index_count: 'Puchica',
    col_index_empty_h: 'The next edit is being prepared',
    col_index_empty_body:
      'Collections return as soon as the next products pass our fulfilment checks.',
    col_index_card_cta: 'Shop the collection →',

    // ── Policies index ───────────────────────────────────────────
    policies_h: 'Policies',
    policies_sub:
      'Shipping, returns, privacy, and terms for orders at Puchica.',

    // ── Policy detail back-link ──────────────────────────────────
    policy_back: 'Back to Policies',
    refund_summary_title: 'Before you send a return',
    refund_summary_start:
      'Contact us within 30 days of delivery. Do not mail an item until we confirm eligibility and provide the return instructions and address.',
    refund_summary_shipping:
      'Return-shipping responsibility depends on the reason for the return and the full refund policy. If an item arrives damaged or incorrect, contact us promptly with the order details.',
    refund_summary_timing:
      'Approved refunds are issued to the original payment method after the returned item is received and reviewed. Bank processing time can vary.',
    refund_summary_control:
      'This summary does not replace the full Shopify policy below, which controls if there is any difference.',

    // ── Blogs index ──────────────────────────────────────────────
    blogs_h: 'Blogs',

    // ── Account area (layout, profile, orders, addresses) ───────
    account_welcome: 'Welcome, {firstName}',
    account_welcome_fallback: 'Welcome to your account.',
    account_welcome_anon: 'Account Details',
    account_nav_orders: 'Orders',
    account_nav_profile: 'Profile',
    account_nav_addresses: 'Addresses',
    account_signout: 'Sign out',
    account_profile_h: 'My profile',
    account_profile_fieldset: 'Personal information',
    account_first_name: 'First name',
    account_last_name: 'Last name',
    account_updating: 'Updating',
    account_update: 'Update',
    account_addresses_h: 'Addresses',
    account_addresses_create_legend: 'Create address',
    account_addresses_empty: 'You have no addresses saved.',
    account_addresses_creating: 'Creating',
    account_addresses_create: 'Create',
    account_addresses_existing: 'Existing addresses',
    account_addresses_saving: 'Saving',
    account_addresses_save: 'Save',
    account_addresses_deleting: 'Deleting',
    account_addresses_delete: 'Delete',
    account_address_first: 'First name',
    account_address_last: 'Last name',
    account_address_company: 'Company',
    account_address_line1: 'Address line 1',
    account_address_line2: 'Address line 2',
    account_address_city: 'City',
    account_address_state: 'State / Province',
    account_address_zip: 'Zip / Postal Code',
    account_address_country: 'Country',
    account_address_phone: 'Phone',
    account_address_phone_aria: 'Phone Number',
    account_address_phone_ph: '+16135551111',
    account_address_default_label: 'Set as default address',
    account_orders_h: 'Orders',
    account_orders_meta: 'Orders',
    account_orders_empty_filtered: 'No orders found matching your search.',
    account_orders_empty_filtered_cta: 'Clear filters →',
    account_orders_empty: "You haven't placed any orders yet.",
    account_orders_empty_cta: 'Start Shopping →',
    account_orders_search_aria: 'Search orders',
    account_orders_filter_legend: 'Filter Orders',
    account_orders_search_ph: 'Order #',
    account_orders_search_aria_named: 'Order number',
    account_orders_conf_ph: 'Confirmation #',
    account_orders_conf_aria: 'Confirmation number',
    account_orders_searching: 'Searching',
    account_orders_search: 'Search',
    account_orders_clear: 'Clear',
    account_orders_confirmation: 'Confirmation: {num}',
    account_orders_view: 'View Order →',
    account_order_h: 'Order {name}',
    account_order_meta: 'Order {name}',
    account_order_placed: 'Placed on {date}',
    account_order_confirmation: 'Confirmation: {num}',
    account_order_th_product: 'Product',
    account_order_th_price: 'Price',
    account_order_th_qty: 'Quantity',
    account_order_th_total: 'Total',
    account_order_discounts: 'Discounts',
    account_order_discount_line: '-{pct}% OFF',
    account_order_subtotal: 'Subtotal',
    account_order_tax: 'Tax',
    account_order_total: 'Total',
    account_order_shipping_h: 'Shipping Address',
    account_order_no_shipping: 'No shipping address defined',
    account_order_status_h: 'Status',
    account_order_status_na: 'N/A',
    account_order_status_link: 'View Order Status →',

    // ── About page ────────────────────────────────────────────────
    about_hero_eyebrow: 'About Puchica',
    about_hero_title_main: 'A smaller travel shop',
    about_hero_title_em: 'with clearer reasons to buy.',
    about_hero_sub:
      'Puchica is an independent Canadian shop starting with three practical travel organizers for clothing, cables, and toiletries. We keep the catalog small so the product details, options, and delivery information stay clear.',
    about_hero_cta: 'Shop the travel edit →',
    about_stats_aria: 'Puchica in numbers',
    about_stat_products_num: 'Active',
    about_stat_products_label: 'Handpicked products',
    about_stat_quality_num: '100%',
    about_stat_quality_label: 'Quality-checked',
    about_stat_shipping_num: '$0',
    about_stat_shipping_label: 'Shipping across Canada',
    about_stat_returns_num: '30 days',
    about_stat_returns_label: 'No-hassle returns',
    about_mission_eye: 'Why we started',
    about_mission_title:
      'The problem wasn’t finding more products. It was finding the right one.',
    about_mission_body_1:
      'Online shopping can turn a simple problem into hours of scrolling through near-identical products, vague descriptions, and options that are hard to compare.',
    about_mission_body_2:
      'Puchica takes the opposite approach. Our first edit focuses on one job: making a packed bag easier to use. Every product must have a clear purpose, understandable options, and delivery information shown before payment.',
    about_mission_card_text:
      'Useful first. Clear before checkout. Worth the space it takes.',
    about_how_eye: 'How we choose',
    about_how_title: 'A product needs a reason to be here.',
    about_how_1_title: 'Solves a specific problem',
    about_how_1_body:
      'We start with a clear job: separate clothing, contain small tech, or keep toiletries easier to find.',
    about_how_2_title: 'Fits the same travel system',
    about_how_2_body:
      'The three launch products work together in a suitcase, weekender, gym bag, or carry-on without creating another crowded catalog.',
    about_how_3_title: 'Easy to understand before buying',
    about_how_3_body:
      'We aim to show the purpose, available dimensions, materials, and options clearly. Delivery availability, cost, and timing are confirmed at checkout.',
    about_cats_eye: 'What we carry',
    about_cats_title: 'Useful finds. One store.',
    about_cats_sub:
      'Across every category that actually matters in your day-to-day.',
    about_cat_home_name: 'Home & Living',
    about_cat_home_sub: 'Audio, kitchen, decor, storage',
    about_cat_beauty_name: 'Beauty & Self-Care',
    about_cat_beauty_sub: 'Skincare, wellness, personal care',
    about_cat_tech_name: 'Tech & Gadgets',
    about_cat_tech_sub: 'Accessories, tools, smart home',
    about_cat_outdoor_name: 'Outdoor & Garden',
    about_cat_outdoor_sub: 'Patio, camping, gardening',
    about_cat_pet_name: 'Pet Finds',
    about_cat_pet_sub: 'Toys, gear, grooming',
    about_cat_gift_name: 'Gifts',
    about_cat_gift_sub: 'For everyone on your list',
    about_promise_quote:
      "Every Puchica product has been thoroughly tested by our team. Providing the most curated selection of products that we can find. If we wouldn't use it ourselves, it won't be Puchica.",
    about_promise_attr: 'The Puchica team, Canada',
    about_cta_title: 'Ready to make space for calmer days?',
    about_dept_title: 'Browse the store',
    about_cta_sub:
      'Start with a trending find, a problem you want solved, or a category that caught your eye.',
    about_cta_browse: 'Shop all trending finds →',
    about_cta_contact: 'Get in touch',

    // ── About page, new sections (story timeline, values, team, roots, departments) ──
    about_story_eye: 'Our story',
    about_story_title: 'How Puchica came to be.',
    about_story_sub: 'A few moments that got us here.',
    about_story_1_year: '2021',
    about_story_1_title: 'It started with a "puchica"',
    about_story_1_body:
      'A Canadian-owned shop built around a simple idea: sell fewer products that solve clear everyday problems.',
    about_story_2_year: '2022',
    about_story_2_title: 'Learning what focus requires',
    about_story_2_body:
      'A broad catalog made it hard to explain why each product belonged. We narrowed around trending high-ticket finds and built a supplier network that keeps stock reliable.',
    about_story_3_year: '2024',
    about_story_3_title: 'A focused shop for trending finds',
    about_story_3_body:
      'The catalog is now built around trending high-ticket finds — verified suppliers, transparent shipping at checkout, and a 30-day return policy on every order.',
    about_story_4_year: 'Today',
    about_story_4_title: 'Proof before expansion',
    about_story_4_body:
      'We are proving a focused assortment and verified supplier routes before expanding the catalog or promotion.',

    about_values_eye: 'What we stand for',
    about_values_title: 'Our values.',
    about_values_sub: 'The rules behind every pick we make.',
    about_values_1_title: 'Curated, not crowded',
    about_values_1_body:
      'We say no to far more than we say yes to. A smaller, better catalog beats a giant, mediocre one.',
    about_values_2_title: 'Fair prices always',
    about_values_2_body:
      'No fake markdowns, no mystery markups. The price you see is honest, and the value is real.',
    about_values_3_title: 'Soul over trends',
    about_values_3_body:
      'We pick things that last and matter, not whatever the algorithm is pushing this week.',
    about_values_4_title: 'Ships from trusted partners',
    about_values_4_body:
      'Products ship from supply partners. Delivery timing and available tracking are confirmed for the selected order.',

    about_team_eye: 'Who we are',
    about_team_title: 'Real people, real picks.',
    about_team_sub:
      'A small Canadian business behind every product that makes the cut.',
    about_team_1_name: 'Product curation',
    about_team_1_role: 'What earns a place',
    about_team_1_bio:
      'We pick products that solve a real problem, ship from verified suppliers, and earn their place in a focused collection.',
    about_team_2_name: 'Operations',
    about_team_2_role: 'Supplier and delivery checks',
    about_team_2_bio:
      'Focuses on supplier mapping, product availability, and the delivery information shown before purchase.',
    about_team_3_name: 'Customer care',
    about_team_3_role: 'Questions and order support',
    about_team_3_bio:
      'Contact us with the product or order details you need help with and we will review them with you.',

    about_roots_aria: 'Our Central American roots',
    about_roots_eyebrow: 'Where the name comes from',
    about_roots_heading: 'Puchica starts with a feeling of useful surprise.',
    about_roots_body:
      '“Puchica” is a familiar Central American expression of surprise—the kind of reaction an unexpectedly clever solution can earn. That spirit shapes the brand: practical finds that solve an everyday annoyance without adding more clutter.',
    about_roots_signature: 'Canadian owned. Starting small and staying useful.',
    about_hero_caption: 'Built around the things people reach for on the road.',
    about_hero_image_alt:
      'Clothing and everyday travel essentials laid out for packing',
    about_roots_image_alt:
      'Colorful woven textile and a painted ceramic vessel',
    about_standards_intro:
      'A smaller catalog only works when the reason for each product is easy to explain.',
    about_shop_eye: 'The travel edit',
    about_shop_title: 'Start with the part of packing that slows you down.',
    about_shop_home_title: 'Packing cubes',
    about_shop_cable_title: 'Cable organizer',
    about_shop_travel_title: 'Toiletry organizer',
    about_shop_home_body:
      'Separate clothing into Small, Medium, and Large zippered cubes.',
    about_shop_cable_body:
      'Keep chargers, adapters, earbuds, and memory cards together.',
    about_shop_travel_body:
      'Give bottles, grooming tools, and cosmetics a dedicated place.',
    about_shop_all: 'Shop the complete travel edit',
    about_now_eye: 'Delivery, made clearer',
    about_now_title: 'See your delivery options before you pay.',
    about_now_body:
      'Shipping origin and timing can vary by item and address. Checkout shows the options available for your order before payment.',
    about_now_email: 'Questions? Email hello@puchica.ca',
    about_delivery_panel_title: 'Checkout delivery preview',
    about_delivery_step_1_title: 'Choose an item',
    about_delivery_step_1_body: 'Add a find and enter your address.',
    about_delivery_step_2_title: 'See available options',
    about_delivery_step_2_body:
      'Checkout calculates the choices for that order.',
    about_delivery_step_3_title: 'Review before payment',
    about_delivery_step_3_body: 'Compare the available timing and cost.',
    about_delivery_note: 'Delivery details shown before payment',
    about_fact_based_label: 'Based in',
    about_fact_based_value: 'Canada',
    about_fact_market_label: 'Current focus',
    about_fact_market_value: 'U.S. customers',
    about_fact_delivery_label: 'Before payment',
    about_fact_delivery_value: 'Delivery options shown at checkout',

    about_depts_eye: 'Keep exploring',
    about_depts_title: 'Shop by department.',
    about_depts_sub:
      'Every category, curated with the same care. Pick where you want to start.',
    about_depts_shop_cta: 'Shop →',
    about_depts_home: 'Home & Living',
    about_depts_beauty: 'Beauty & Self-Care',
    about_depts_tech: 'Tech & Gadgets',
    about_depts_outdoor: 'Outdoor & Garden',
    about_depts_pet: 'Pet Finds',
    about_depts_gifts: 'Gifts',

    // ── Contact page ──────────────────────────────────────────────
    contact_hero_eyebrow: 'Get in touch',
    contact_hero_title: 'How can we help?',
    contact_hero_sub:
      'For order help, include your order number. For a product question, include the product name or link.',
    contact_channels_aria: 'Ways to reach us',
    contact_ig_title: 'DM on Instagram',
    contact_ig_body: 'Follow product demos and launch updates.',
    contact_ig_fallback: 'Instagram',
    contact_fb_title: 'Message on Facebook',
    contact_fb_body: 'Follow product updates and launch news.',
    contact_fb_fallback: 'Facebook',
    contact_tiktok_title: 'Find us on TikTok',
    contact_tiktok_body: 'Product demos and launch updates.',
    contact_tiktok_fallback: 'TikTok',
    contact_promises_aria: 'What to expect',
    contact_promises_eyebrow: 'What to expect',
    contact_promises_title: 'Help us find the answer faster',
    contact_promise_1_strong: 'Include the key details',
    contact_promise_1_body:
      'Include your order number, product link, and what you need help with.',
    contact_promise_2_strong: 'Allow two business days',
    contact_promise_2_body:
      'We aim to reply within two business days. Supplier or carrier checks can take longer.',
    contact_promise_3_strong: 'We confirm what is possible',
    contact_promise_3_body:
      'Changes, cancellations, and returns depend on order status and the applicable policy.',
    contact_faq_aria: 'Common questions',
    contact_faq_eyebrow: 'Common questions',
    contact_faq_title: 'The short version',
    contact_faq_1_q: 'Where is my order?',
    contact_faq_1_a:
      'When tracking is available, the link is included in your shipping confirmation. Email us with your order number if you need help.',
    contact_faq_2_q: 'Can I change or cancel my order?',
    contact_faq_2_a:
      'Contact us as soon as possible with your order number. We will confirm whether the supplier has started processing it and what options remain.',
    contact_faq_3_q: 'How do returns work?',
    contact_faq_3_a:
      'Contact us within 30 days of delivery. Do not mail an item until we confirm eligibility and provide instructions. Return-shipping responsibility depends on the reason and the refund policy.',
    contact_faq_4_q: 'Where do you ship?',
    contact_faq_4_a:
      'Canada and the United States are selectable storefront markets. Delivery still varies by product and address, so checkout must confirm the selected cart before payment.',
    contact_faq_5_q: 'Are the products in the photos exactly what I get?',
    contact_faq_5_a:
      'Review the photos, selected variant, dimensions, and description on the product page. Contact us before ordering if any detail is unclear.',
    contact_cta_title: 'Still have a question?',
    contact_cta_body:
      'Email is best for order-specific help. We aim to reply within two business days.',
    contact_cta_button: 'Email {email}',

    // ── FAQ page (dedicated /pages/faq route) ───────────────────
    faq_accordion_aria: 'Frequently asked questions',
    faq_hero_eyebrow: 'Help center',
    faq_hero_title: 'Frequently Asked Questions',
    faq_hero_sub: 'Answers about delivery, returns, products, and accounts.',
    faq_cat_orders: 'Orders & Shipping',
    faq_cat_returns: 'Returns & Refunds',
    faq_cat_products: 'Products',
    faq_cat_account: 'Account',
    faq_orders_1_q: 'How long does shipping take?',
    faq_orders_1_a:
      'Processing and delivery timing vary by product. Enter your address at checkout to review the available delivery estimate before payment.',
    faq_orders_2_q: 'Do you ship internationally?',
    faq_orders_2_a:
      'Canada and the United States are selectable storefront markets. A market selection does not guarantee every item can be delivered; checkout confirms the selected cart and address before payment.',
    faq_orders_3_q: 'How do I track my order?',
    faq_orders_3_a:
      'When a tracked service is available, the tracking link is included in your shipping confirmation. Contact us with your order number if you need help.',
    faq_orders_4_q: 'What are your shipping rates?',
    faq_orders_4_a:
      'Shipping services, cost, and delivery timing are confirmed at checkout for the selected items and destination.',
    faq_returns_1_q: 'What is your return policy?',
    faq_returns_1_a:
      'Contact us within 30 days of delivery. Eligibility depends on the item, its condition, and the refund policy. Contact us promptly if an item arrives damaged or incorrect.',
    faq_returns_2_q: 'How do I start a return?',
    faq_returns_2_a:
      'Contact us with your order number and reason for the return. Do not mail anything until we confirm eligibility and provide the return address. Return-shipping responsibility depends on the reason and the refund policy.',
    faq_returns_3_q: 'When will I get my refund?',
    faq_returns_3_a:
      'Approved refunds are issued to the original payment method after the returned item is received and reviewed. Bank processing time can vary.',
    faq_products_1_q: 'Where can I find product details?',
    faq_products_1_a:
      'Check the product page for available options, dimensions, materials, and what is included. Contact us if a detail is missing.',
    faq_products_2_q: 'Where do your products come from?',
    faq_products_2_a:
      'We work with third-party suppliers, and product origin can vary by item. Contact us if you need a specific origin detail before ordering.',
    faq_products_3_q: 'How do I choose the right option?',
    faq_products_3_a:
      'Check the selected size, color, quantity, and set before adding the item to your cart.',
    faq_account_1_q: 'How do I access my account?',
    faq_account_1_a:
      'Choose Account, enter your email, and follow the sign-in steps. From your account, you can view orders and manage saved details.',
    faq_account_2_q: 'I can’t sign in. What should I do?',
    faq_account_2_a:
      'Request a new sign-in code or link from the Account page, then check your spam folder. Contact us if it still doesn’t arrive.',
    faq_cta_eyebrow: 'Need more help?',
    faq_cta_title: 'Still have questions?',
    faq_cta_sub:
      'Send the product or order details with your question. We aim to reply within two business days.',
    faq_cta_button: 'Contact us',
    faq_contact_aria: 'Contact us',
    faq_contact_title: 'Contact us',
    faq_contact_body:
      'Can’t find what you’re looking for? Email us, we’re happy to help with orders, returns, products, or anything else.',

    // ── Homepage sections (Phase 1 redesign) ─────────────────
    hero_split_aria: 'Hero',
    hero_split_eyebrow: 'Trending finds · Under C$200',
    hero_split_heading: 'Make room for what matters.',
    hero_split_body:
      'Trending high-ticket finds under C$200 — verified suppliers, transparent shipping, 30-day returns.',
    hero_store_toolbar_heading: 'Shop Puchica',
    hero_split_cta_primary: 'Shop best sellers',
    hero_split_cta_secondary: 'Browse all',
    hero_split_trust: 'Shipping shown at checkout · 30-day returns',
    hero_trust_returns: '30-day returns',
    hero_trust_checkout: 'Secure Shopify checkout',
    hero_trust_canada: 'Focused launch catalog',
    hero_showcase_bar: 'Shop by department →',
    hero_popular_heading: 'Popular right now',

    today_deals_aria: 'Today deals',
    today_deals_eyebrow: 'Deals',
    today_deals_heading: "Today's sharpest prices",
    today_deals_see_all: 'Shop all deals',

    shop_by_category_aria: 'Shop by category',
    shop_by_category_eyebrow: 'Categories',
    shop_by_category_heading: 'Shop by department',
    shop_by_category_shop_cta: 'Shop',

    best_sellers_aria: 'Best sellers',
    best_sellers_eyebrow: 'Most loved',
    best_sellers_heading: 'Best sellers this week',
    best_sellers_see_all: 'See all',

    lifestyle_banner_aria: 'Lifestyle',
    lifestyle_banner_eyebrow: 'Small-space living',
    lifestyle_banner_heading: 'More function. Less clutter.',
    lifestyle_banner_body:
      'Trending finds and everyday problem-solvers that earn their place in a real home, kitchen, or travel bag.',
    lifestyle_banner_cta: 'Shop trending finds',

    new_arrivals_aria: 'New arrivals',
    new_arrivals_eyebrow: 'Just landed',
    new_arrivals_heading: 'New arrivals',
    new_arrivals_see_all: 'See all',
    new_arrivals_scroll_left: 'Scroll left',
    new_arrivals_scroll_right: 'Scroll right',

    sports_aria: 'Sports and outdoors',
    sports_eyebrow: 'Get active',
    sports_heading: 'Sports & outdoors',
    sports_see_all: 'Shop sports',

    world_cup_aria: 'Soccer jerseys and gear',
    world_cup_eyebrow: 'Rep your country',
    world_cup_heading: 'Jerseys from home, wherever home is.',
    world_cup_see_all: 'Shop all soccer gear',

    rail_scroll_left: 'Scroll left',
    rail_scroll_right: 'Scroll right',

    trust_bar_aria: 'Why shop with us',
    trust_bar_shipping_h: 'Clear shipping',
    trust_bar_shipping_sub: 'Options and costs shown at checkout',
    trust_bar_returns_h: '30-day returns',
    trust_bar_returns_sub: 'See the policy before you order',
    trust_bar_curated_h: 'Active catalog',
    trust_bar_curated_sub: 'Products ready to shop today',

    home_reviews_aria: 'Customer reviews',
    home_reviews_eyebrow: 'Our product standard',
    home_reviews_heading: 'Every pick should earn its space',
    home_reviews_verified: 'What we look for',
    home_reviews_quote_1_text:
      'The quality is consistent, shipping is fast, and returns are no-questions-asked. That is why I keep coming back.',
    home_reviews_quote_1_author: 'Practical',
    home_reviews_quote_2_text:
      'Fits compact counters, cabinets, drawers, or everyday routines.',
    home_reviews_quote_2_author: 'Space-conscious',
    home_reviews_quote_3_text:
      'Easy to understand, useful to demonstrate, and worth the price.',
    home_reviews_quote_3_author: 'Straightforward',

    home_newsletter_aria: 'Newsletter',
    home_newsletter_eyebrow: 'Join the list',
    home_newsletter_heading: 'Travel updates, without the clutter',
    home_newsletter_body:
      'New drops, restocks, and the occasional sale, straight to your inbox, never spam.',
    home_newsletter_placeholder: 'you@example.com',
    home_newsletter_submit: 'Subscribe',
    home_newsletter_promise: 'No spam. Unsubscribe anytime.',

    // ── Brand story (roots) ──────────────────────────────────────
    home_roots_aria: 'Our roots',
    home_roots_eyebrow: "Puchica's roots",
    home_roots_heading: 'From Central America to the world.',
    home_roots_body:
      "Puchica — that's what you say when something catches you off guard. A sunrise over Lake Atitlán. Coffee grown on volcanic slopes. Textiles woven the same way for three generations in the Guatemalan highlands. From Antigua to Honduras, we bring that feeling to customers around the globe.",
    home_roots_signature: 'Hecho con alma · Made with soul',

    // ── World map ─────────────────────────────────────────────────
    world_map_aria: 'Countries we serve',
    world_map_eyebrow: 'Market validation',
    world_map_heading: 'Verified routes before expansion.',
    world_map_sub:
      'Product availability varies by destination. Checkout confirms delivery for the selected cart.',

    // ── Shop by department ────────────────────────────────────────
    home_shop_dept_aria: 'Shop by department',
    home_shop_dept_eyebrow: 'Trending this week',
    home_shop_dept_heading: 'High-ticket finds, hand-picked.',
    home_shop_dept_body:
      'Trending finds across audio, kitchen, fitness, home, and outdoor — each product from a verified supplier.',
    home_dept_home: 'Home & Kitchen',
    home_dept_electronics: 'Electronics',
    home_dept_apparel: 'Apparel',
    home_dept_health: 'Health & Wellness',
    home_dept_pet: 'Pet Supplies',
    home_dept_sports: 'Sports & Outdoors',

    // ── Why Puchica ────────────────────────────────────────────────
    home_curate_aria: 'How we curate',
    home_curate_eyebrow: 'Why Puchica',
    home_curate_heading: 'Useful enough to earn its space.',
    home_curate_step1_h: 'We start with a real problem worth solving.',
    home_curate_step1_b:
      'Each promoted item should save space, reduce friction, or make a daily routine easier.',
    home_curate_step2_h: 'We price it fair.',
    home_curate_step2_b:
      'We compare the price with the delivered cost and only promote products that can support a sustainable offer.',
    home_curate_step3_h: 'We show delivery details before payment.',
    home_curate_step3_b:
      'Shipping availability, cost, and timing are confirmed at checkout for the selected items and destination.',

    // ── Hero stats ────────────────────────────────────────────────
    hero_store_stat_products: 'Catalog',
    hero_store_stat_departments: 'Departments',
    hero_store_stat_shipping: 'Shipping shown',
    hero_storefront_title: 'Popular ways to shop',

    // ── Shop by category sub ──────────────────────────────────────
    shop_by_category_sub:
      'Start with the departments that are live and ready to shop today.',

    // ── PDP route meta (localized) ────────────────────────────────
    pdp_meta_title_suffix: ' – Puchica',
    pdp_meta_description_fallback:
      'Shop {title} from Puchica. Shipping options for Canada are shown at checkout.',
  },

  // ════════════════════════════════════════════════════════════════
  fr: {
    announce_offer: 'Des accessoires de voyage pratiques pour mieux organiser vos bagages',
    announce_freeship: 'Options de livraison affichées au paiement',
    announce_cta: 'Voir les accessoires de voyage',
    offer_first15:
      'Les options et délais de livraison sont affichés au paiement.',
    announce_region_aria: 'Annonces du site',

    footer_tagline:
      'Accessoires de voyage pratiques, détails clairs et livraison affichée au paiement.',
    footer_accepted_payments: 'Paiements acceptés',
    footer_secure: 'Paiement sécurisé par Shopify, chiffré et conforme PCI',
    footer_shop: 'Boutique',
    footer_care: 'Service client',
    footer_about: 'À propos',
    footer_faq: 'FAQ',
    footer_shipping_info: 'Livraison & expédition',
    footer_contact: 'Contactez-nous',
    footer_search: 'Recherche',
    footer_policies: 'Politiques',
    footer_shipping_policy: 'Politique d’expédition',
    footer_refund_policy: 'Politique de remboursement',
    footer_privacy_policy: 'Politique de confidentialité',
    footer_terms_of_service: 'Conditions d’utilisation',
    footer_subscription_policy: 'Politique d’abonnement',
    footer_terms: 'Conditions d’utilisation',
    footer_newsletter_title: 'Abonnez-vous à notre infolettre',
    footer_newsletter_copy:
      'Offres exclusives et nouveautés, directement dans votre boîte de réception.',
    footer_email_placeholder: 'Entrez votre courriel',
    footer_newsletter_email_aria: 'Adresse courriel',
    footer_newsletter_subscribe_aria: "S'abonner",
    footer_newsletter_submitting: '…',

    footer_newsletter_ok: 'Merci, vous êtes inscrit.',
    footer_rights: 'Tous droits réservés.',
    footer_privacy: 'Politique de confidentialité',

    nav_all_products: 'Tous les produits',
    nav_best_sellers: 'Meilleures ventes',
    nav_trending: 'Tendances',
    nav_gifts: 'Cadeaux à moins de 25 $',
    nav_shop: 'Boutique',
    nav_new_arrivals: 'Nouveautés',
    nav_sale: 'Soldes',
    nav_explore: 'Explorer',
    nav_about: 'À propos',
    nav_contact: 'Contact',
    nav_faq: 'FAQ',
    nav_shipping: 'Livraison',

    header_dismiss_aria: "Fermer l'annonce",
    header_menu_open: 'Ouvrir le menu',
    header_menu_close: 'Fermer le menu',
    header_search_open: 'Ouvrir la recherche',
    header_search_close: 'Fermer la recherche',
    header_account_aria: 'Compte',
    header_cart_open: 'Ouvrir le panier',
    header_cart_close: 'Fermer le panier',

    hero_eyebrow: 'Trouvailles · Moins de 200 $',
    hero_title: 'Des trouvailles qui comptent.',
    hero_sub:
      'Une sélection de trouvailles haut de gamme que les clients recommandent — fournisseurs vérifiés, prix transparents, livraison confirmée au paiement.',
    hero_cta_shop: 'Magasiner →',
    hero_cta_browse: 'Tout parcourir',
    hero_stat_products: 'Produits',
    hero_stat_shipping: 'Livraison 50 $+',
    hero_stat_returns: 'Retours faciles',
    hero_pause_label: 'Mettre en pause le diaporama',
    hero_play_label: 'Reprendre le diaporama',
    hero_featured_label: 'Voir le produit en vedette : {title}',
    hero_featured_text: 'En vedette : {title}',

    ticker_products: 'Catalogue actif',
    ticker_new_drops: 'Nouveautés chaque semaine',
    ticker_free_shipping: 'Livraison gratuite au Canada',
    ticker_returns: 'Retours sous 30 jours',
    ticker_ships: 'Livraison rapide',
    ticker_handpicked: 'Sélectionné, jamais aléatoire',
    ticker_real_value: 'Vraie valeur. Vraies trouvailles.',
    ticker_secure: 'Paiement sécurisé',

    swiper_eyebrow: 'Tendances',
    swiper_title: 'Les meilleurs choix de cette semaine',
    swiper_pause_label: 'Mettre en pause le défilement',
    swiper_resume_label: 'Reprendre le défilement',
    swiper_slides_aria: 'Diaporama de sélections',
    swiper_stats_aria: 'Points forts de la boutique',
    swiper_carousel_aria: 'Carrousel de produits',
    swiper_carousel_nav_aria: 'Navigation du carrousel',
    swiper_prev_aria: 'Produit précédent',
    swiper_next_aria: 'Produit suivant',
    swiper_dots_aria: 'Aller au produit',
    match_section_aria: 'Matchmaker de produits par balayage',
    match_deck_aria: 'Pile de cartes produits',
    match_pass_aria: 'Passer ce produit',
    match_super_aria: 'Super balayage – Ajouter au panier',
    match_like_aria: 'Aimer ce produit',
    rack_section_aria: 'Sélections premium',
    rack_scroll_aria: 'Faire défiler les produits',
    rack_scroll_left_aria: 'Faire défiler à gauche',
    rack_scroll_right_aria: 'Faire défiler à droite',
    gift_section_aria: 'Trouver un cadeau selon le budget',
    gift_card_aria: 'Magasiner les cadeaux {label}',
    arrivals_section_aria: 'Nouveautés',
    arrivals_scroll_aria: 'Défiler les nouveautés',
    arrivals_badge_aria: 'Nouveau produit',
    cat_section_aria: 'Magasiner par catégorie',
    mood_section_aria: 'Magasiner par style de vie',
    review_section_aria: 'Avis clients',
    fresh_section_aria: 'Nouvelles trouvailles',
    fresh_scroll_aria: 'Défiler les nouvelles trouvailles',
    banner_section_aria: 'Meilleures ventes',
    catalog_section_aria: 'Explorer le catalogue complet',
    catalog_count_aria: 'Plus de 6 000 produits',
    trust_section_aria: 'Pourquoi Puchica',
    newsletter_section_aria: "Inscription à l'infolettre",

    // ── Shipping reach ────────────────────────────────────────────
    ship_eyebrow: 'Où nous livrons',
    ship_title: 'Nous livrons partout.',
    ship_sub:
      'Nous livrons dans des pays du monde entier. Où que vous soyez, nous vous apporterons votre commande.',
    ship_cta: 'Demander pour votre pays',
    ship_section_aria: 'Destinations de livraison',
    ship_compact_title: 'Couverture par région',
    ship_cities_label: 'villes',
    ship_region_na: 'Amérique du Nord',
    ship_region_sa: 'Amérique du Sud',
    ship_region_uk: 'Royaume-Uni',
    ship_region_eu: 'Europe',
    ship_region_ap: 'Asie-Pacifique',
    ship_region_me: 'Moyen-Orient',
    ship_region_af: 'Afrique',
    ship_region_oc: 'Océanie',
    ship_region_na_sub: 'Canada et États-Unis',
    ship_region_sa_sub: "Du Mexique à l'Argentine",
    ship_region_uk_sub: 'Angleterre, Écosse, Pays de Galles, Irlande du Nord',
    ship_region_eu_sub: 'Europe continentale',
    ship_region_ap_sub: 'Japon, Australie, Singapour et plus',
    ship_region_me_sub: 'Émirats, Arabie, Israël, Qatar',
    ship_region_af_sub: "Du Maroc à l'Afrique du Sud",
    ship_region_oc_sub: 'Australie, Nouvelle-Zélande, Fidji',

    // ── Page livraison ─────────────────────────────────────────────
    ship_hero_eyebrow: 'Livraison & Expédition',
    ship_hero_title_main: 'Livraison &',
    ship_hero_title_em: 'Expédition.',
    ship_hero_sub:
      'Les options, les délais et les coûts de livraison sont confirmés au paiement selon les articles et la destination.',
    ship_hero_cta: 'Voir la sélection voyage',
    ship_launch_hero_sub:
      'Une seule boutique nord-américaine avec des prix adaptés au marché et des options de livraison confirmées au paiement.',
    ship_jump: 'Voir comment la livraison est confirmée',
    ship_launch_regions_eye: 'Boutique nord-américaine',
    ship_launch_regions_title: 'Deux marchés. Une boutique ciblée.',
    ship_launch_regions_sub:
      'Choisissez le Canada ou les États-Unis pour afficher les prix du marché. La livraison dépend toujours des articles et de l’adresse.',
    ship_launch_rates_eye: 'Avant de payer',
    ship_launch_rates_title: 'Vérifiez la livraison avant le paiement',
    ship_launch_rates_sub:
      'Le paiement affiche les options disponibles pour les articles et la destination sélectionnés.',
    ship_market_ca_name: 'Canada · CAD',
    ship_market_ca_detail:
      'Prix en CAD; le paiement confirme si les articles sélectionnés peuvent être livrés.',
    ship_market_us_name: 'États-Unis · USD',
    ship_market_us_detail:
      'Prix en USD; le paiement confirme si les articles sélectionnés peuvent être livrés.',
    ship_check_destination_title: 'Vérifiez votre destination',
    ship_check_destination_body:
      'Entrez votre adresse au paiement pour voir les options disponibles pour votre commande.',
    ship_check_destination_eta: 'Disponibilité affichée avant le paiement',
    ship_check_items_title: 'Vérifiez les articles du panier',
    ship_check_items_body:
      'Les options peuvent varier selon le produit, la variante et la destination.',
    ship_check_items_eta: 'Le paiement confirme les options de la commande',
    ship_check_tracking_title: 'Suivez votre commande',
    ship_check_tracking_body:
      'Lorsqu’un service suivi est disponible, les détails sont envoyés après l’expédition.',
    ship_check_tracking_eta:
      'Consultez la politique d’expédition pour obtenir de l’aide',
    ship_check_duties_title: 'Droits et frais d’importation',
    ship_check_duties_body:
      'Des droits de douane, taxes d’importation, frais de courtage ou frais du transporteur peuvent être imposés à destination. Puchica ne perçoit pas ces frais; le client en est responsable lorsqu’ils s’appliquent.',
    ship_check_duties_eta:
      'Facturés par les douanes ou le transporteur, le cas échéant',
    ship_regions_eye: 'Où nous livrons',
    ship_regions_title: 'La couverture s’étend après validation.',
    ship_regions_sub:
      'Nous ne mettons en avant une destination qu’après confirmation de la couverture du produit et du fournisseur.',
    ship_rates_eye: 'Tarifs de livraison',
    ship_rates_title: 'Livraison claire avant le paiement.',
    ship_rates_sub:
      'Le paiement confirme les services, le coût et l’estimation pour les articles et l’adresse sélectionnés.',
    ship_rates_canada_flag: 'CA',
    ship_rates_canada_title: 'Canada',
    ship_rates_canada_body:
      'Les services et coûts disponibles sont affichés au paiement pour la commande sélectionnée.',
    ship_rates_canada_eta: 'Estimation affichée au paiement',
    ship_rates_canada_badge: '',
    ship_rates_us_flag: 'US',
    ship_rates_us_title: 'États-Unis',
    ship_rates_us_body:
      'La disponibilité dépend des articles, du panier et de la destination.',
    ship_rates_us_eta: 'À confirmer au paiement',
    ship_rates_us_badge: '',
    ship_rates_intl_flag: 'INTL',
    ship_rates_intl_title: 'International',
    ship_rates_intl_body:
      'La livraison internationale n’est pas actuellement mise en avant. Confirmez sa disponibilité au paiement.',
    ship_rates_intl_eta: 'Aucune promesse générale de livraison',
    ship_rates_intl_badge: '',
    ship_how_eye: 'Comment ça marche',
    ship_how_title: 'Vérifiez les détails avant de commander.',
    ship_how_1_title: 'Passez votre commande',
    ship_how_1_body:
      'Parcourez le catalogue, ajoutez au panier et payez en toute sécurité. Vous recevrez une confirmation immédiate.',
    ship_how_2_title: 'Votre commande est traitée',
    ship_how_2_body:
      'Les délais de traitement et de livraison dépendent du produit et du service sélectionnés. Les mises à jour disponibles sont envoyées au fil du traitement.',
    ship_how_3_title: 'Livré à votre porte',
    ship_how_3_body:
      'Utilisez l’estimation affichée au paiement pour les articles et l’adresse sélectionnés.',
    ship_track_eye: 'Suivre votre commande',
    ship_track_title: 'Suivez les mises à jour disponibles.',
    ship_track_body_1:
      'Lorsqu’un service suivi est disponible, les détails sont envoyés après l’expédition.',
    ship_track_body_2:
      'Utilisez le lien du courriel d’expédition ou contactez le support avec votre numéro de commande.',
    ship_track_cta: 'Contacter le support',
    ship_cta_title: 'Prêt à commander ?',
    ship_cta_sub:
      'Magasinez les trouvailles et confirmez la livraison pour votre adresse au paiement.',
    ship_cta_browse: 'Tout voir',

    match_eyebrow: 'Découverte personnalisée',
    match_title: 'Puchica Match.',
    match_sub:
      'Glissez à droite pour <strong>Aimer</strong>, à gauche pour <strong>Passer</strong>, ou vers le haut pour <strong>Super Glissement &amp; Ajouter au panier</strong> !',
    match_empty_title: 'Plus d’articles pour aujourd’hui !',
    match_empty_body:
      'Vous avez parcouru tous les articles tendance et en avez aimé {count}.',
    match_reset: 'Recommencer',
    match_browse: 'Tout parcourir',
    match_stamp_like: 'J’AIME',
    match_stamp_nope: 'NON',
    match_stamp_super: 'SUPER AJP',

    rack_eyebrow: 'Maison & Cuisine',
    rack_title: 'Rehaussez votre espace.',

    gift_eyebrow: 'Idées cadeaux',
    gift_title: 'Trouvez le cadeau parfait.',
    gift_sub:
      'Plus de 6 000 options pour tous les budgets. Quelque chose pour chacun sur votre liste.',
    gift_under25_label: 'Moins de 25 $',
    gift_under25_sub: 'Petits plaisirs, grands sourires',
    gift_25_50_label: '25 $ – 50 $',
    gift_25_50_sub: 'Cadeaux idéaux',
    gift_50_100_label: '50 $ – 100 $',
    gift_50_100_sub: 'Choix premium',
    gift_100_label: '100 $ et plus',
    gift_100_sub: 'Allez-y à fond',

    arrivals_eyebrow: 'Extérieur & Jardin',
    arrivals_title: 'Allez dehors.',
    arrivals_see_all: 'Voir toutes les nouveautés',
    arrivals_badge: 'Nouveau',

    // ── For You ───────────────────────────────────────────────────
    foryou_eyebrow: 'Sélectionné pour vous',
    foryou_title: 'Imaginez ça.',
    foryou_sub: 'Une sélection stylisée, chaque photo créée pour ces produits.',
    foryou_cta: 'Découvrir la sélection',
    foryou_section_aria: 'Vitrine Pour vous',

    cat_eyebrow: 'Magasiner par catégorie',
    cat_title: 'Trouvez votre truc.',
    cat_home_tagline: 'Votre espace, sublimé.',
    cat_beauty_tagline: 'Ressentez-le de l’intérieur.',
    cat_tech_tagline: 'Plus intelligent, chaque jour.',
    cat_outdoor_tagline: 'Sortez en plein air.',
    cat_pet_tagline: 'Ils méritent ce qu’il y a de mieux.',
    cat_fallback_tagline: 'Sélectionné avec soin.',
    cat_shop_now: 'Magasiner →',
    cat_cell_aria: 'Magasiner {title}',

    mood_eyebrow: 'Fait pour votre vie',
    mood_title: 'Tendance. Vérifié. Livré.',
    mood_home_label: 'Maison & Décoration',
    mood_home_title: 'Votre maison mérite mieux.',
    mood_home_sub:
      'Trouvailles et améliorations qui rendent une vraie pièce meilleure.',
    mood_home_cta: 'Améliorez votre espace →',
    mood_beauty_label: 'Beauté & Soins',
    mood_beauty_title: 'Prenez soin de vous.',
    mood_beauty_sub:
      'Soins de la peau, bien-être et produits de soin personnel qui fonctionnent vraiment, choisis par des gens qui les utilisent.',
    mood_beauty_cta: 'Gâtez-vous →',
    mood_tech_label: 'Techno & Gadgets',
    mood_tech_title: 'Travaillez mieux, jouez plus fort.',
    mood_tech_sub:
      'Accessoires, outils et gadgets qui améliorent vraiment votre quotidien. Sans artifice.',
    mood_tech_cta: 'Chargez-vous →',

    review_eyebrow: 'Ce que les gens disent',
    review_title: 'De vrais acheteurs. De vraies opinions.',
    review_1_quote:
      'Commandé trois fois ce mois-ci. La qualité est toujours excellente et la livraison rapide.',
    review_2_quote:
      'J’ai trouvé exactement ce que je cherchais, et bien plus encore. C’est ma nouvelle adresse préférée pour la maison.',
    review_3_quote:
      'La sélection est vraiment bonne. Tout semble avoir été choisi par quelqu’un qui a du goût.',

    banner_eyebrow: 'Meilleures ventes',
    banner_title: 'Ceux dont les gens ne peuvent plus se passer.',
    banner_sub:
      'Trouvailles haut de gamme, triées à la main pour la sélection actuelle.',
    banner_cta: 'Voir toutes les meilleures ventes',

    catalog_body:
      'Un catalogue ciblé de trouvailles haut de gamme — fournisseurs vérifiés, prix transparents, livraison confirmée au paiement.',
    catalog_cta_browse: 'Tout parcourir →',
    catalog_cta_search: 'Rechercher dans le catalogue',

    trust_shipping_title: 'Livraison gratuite',
    trust_shipping_sub: 'Sur les commandes de plus de 50 $',
    trust_returns_title: 'Retours sous 30 jours',
    trust_returns_sub: 'Sans question, sans tracas',
    trust_secure_title: 'Paiement sécurisé',
    trust_secure_sub: 'Chiffré et conforme PCI',
    trust_handpicked_title: 'Sélection exclusive',
    trust_handpicked_sub: 'Construit autour des trouvailles',

    newsletter_pill: 'Rejoignez le club',
    newsletter_title: 'Recevez les bons produits en premier.',
    newsletter_sub:
      'Nouveautés, offres exclusives et coups de cœur introuvables ailleurs, directement dans votre boîte. Pas de spam, désabonnez-vous à tout moment.',
    newsletter_done: 'Vous êtes inscrit ! Vérifiez votre boîte de réception.',
    newsletter_email_label: 'Adresse courriel',
    newsletter_placeholder: 'votre@courriel.com',
    newsletter_joining: 'Inscription…',
    newsletter_subscribe: 'S’abonner',

    counter_products: 'Produits',
    counter_collections: 'Collections',
    counter_categories: 'Catégories',
    counter_canadian: 'Sélectionné',

    explore_home: 'Accueil',
    explore_breadcrumb: 'Explorer le catalogue',
    explore_eyebrow: 'Découvrez la collection',
    explore_title: 'Explorer le catalogue complet',
    explore_showing: 'Affichage de',
    explore_product_singular: 'produit',
    explore_product_plural: 'produits',
    explore_across: 'dans',
    explore_count_active_cat_singular: 'catégorie active',
    explore_count_active_cat_plural: 'catégories actives',
    explore_filter_title: 'Filtrer par catégorie',
    explore_filter_clear: 'Tout effacer',
    explore_empty_title: 'Aucun produit trouvé',
    explore_empty_body:
      'Essayez de modifier vos sélections de catégories ou effacez les filtres.',
    explore_empty_reset: 'Réinitialiser les filtres',
    explore_view_details: 'Voir les détails',
    explore_cat_home: 'Maison & Cuisine',
    explore_cat_beauty: 'Beauté & Soins',
    explore_cat_tech: 'Électronique & Techno',
    explore_cat_pet: 'Animaux de compagnie',
    explore_cat_outdoor: 'Jardin & Extérieur',

    breadcrumb_aria: "Fil d'Ariane",
    col_filters_aria: 'Filtres',
    search_trending_label: 'Recherches populaires',
    search_recent_label: 'Vus récemment',
    search_trending_terms:
      'pistolet de massage, ruban LED, gourde, bouilloire, moulin à café, corde à sauter',
    col_density_aria: 'Densité de la grille',
    col_density_3_aria: 'Afficher 3 par rangée',
    col_density_4_aria: 'Afficher 4 par rangée',
    explore_cat_filter_aria: 'Filtres par catégorie',
    breadcrumb_home: 'Accueil',
    breadcrumb_collections: 'Collections',
    breadcrumb_shop: 'Boutique',

    col_eyebrow: 'Collection',
    col_empty_title: 'Rien ici pour le moment',
    col_empty_filtered: 'Aucun produit ne correspond à ces filtres.',
    col_clear_filters: 'Effacer les filtres',
    col_empty_restocking:
      'Cette collection est en réapprovisionnement. Parcourez les trouvailles ou revenez bientôt.',
    col_showing: 'Affichage de',
    col_showing_more: 'jusqu’ici, voir plus bas',
    col_product_singular: 'produit',
    col_product_plural: 'produits',
    col_sort_by: 'Trier par',
    col_sort_featured: 'En vedette',
    col_sort_best: 'Meilleures ventes',
    col_sort_newest: 'Plus récents',
    col_sort_price_asc: 'Prix : croissant',
    col_sort_price_desc: 'Prix : décroissant',
    col_filter_cat_label: 'Catégorie :',
    col_filter_price_label: 'Prix :',
    col_filter_cat_heading: 'Catégorie',
    col_filter_price_heading: 'Prix',
    col_filter_no_types: 'Aucune sous-catégorie dans cette collection.',
    col_price_under25: 'Moins de 25 $',
    col_price_25_50: '25 $ – 50 $',
    col_price_50_100: '50 $ – 100 $',
    col_price_100_plus: '100 $ et plus',
    col_count_loading: 'Collection en cours de chargement',
    col_count_and_counting: 'et plus',
    col_count_of: 'sur',
    col_brand_chip: 'Puchica',

    // ── Trending landing (homepage) ───────────────────────────────
    trending_eyebrow: 'Tendances · Moins de 200 $',
    trending_title:
      'Des trouvailles tendance à moins de 200 $ — des produits pratiques avec de vrais avis.',
    trending_sub:
      'Une sélection concentrée d’articles à prix élevé que les clients recommanderont : audio, cuisine, conditionnement physique, maison et plein air. Photos réelles des produits, livraison affichée au paiement, aucun abonnement.',
    trending_hero_cta: 'Magasiner la sélection tendance',
    trending_hero_secondary: 'Parcourir le catalogue complet',
    trending_proof_secure_h: 'Paiement Shopify sécurisé',
    trending_proof_secure_s: 'Chiffré et conforme PCI',
    trending_proof_shipping_h: 'Livraison gratuite au Canada',
    trending_proof_shipping_s: 'Pour les commandes de plus de 50 $',
    trending_proof_photos_h: 'Photos réelles des produits',
    trending_proof_photos_s: 'Expédié par des fournisseurs vérifiés',
    trending_feature_spotlight_kicker: 'N° 1 des ventes',
    trending_feature_secondary_kicker: 'N° 2 des ventes',
    trending_feature_tertiary_kicker: 'N° 3 des ventes',
    trending_feature_cta: 'Acheter le choix n° 1',
    trending_grid_eyebrow: 'À la une ce lancement',
    trending_grid_title: 'Plus de trouvailles tendance à découvrir',
    trending_grid_sub:
      'Sélectionnées dans le catalogue du lancement — fournisseurs vérifiés, livraison confirmée au paiement, retours sous 30 jours.',
    trending_grid_more_cta: 'Toutes les trouvailles tendance',
    trending_card_cta: 'Voir le produit',
    trending_explore_eyebrow: 'Plus du catalogue',
    trending_explore_title: 'Découvrez le reste du lancement',
    trending_explore_sub:
      'Chaque produit que nous acheminons au paiement, au même endroit. Faites défiler pour voir tout le lancement.',

    all_breadcrumb: 'Toutes les trouvailles',
    all_eyebrow: 'La boutique complète',
    all_title: 'Magasiner les trouvailles',
    all_sub:
      'Parcourez les trouvailles haut de gamme en audio, cuisine, fitness, maison et plein air.',
    all_empty_title: 'De nouveaux articles arrivent',
    all_empty_body:
      'Le catalogue se charge. Si le problème persiste, actualisez la page.',
    all_count_loading: 'Catalogue en cours de chargement',

    product_trust_shipping: 'Livraison affichée au paiement',
    product_trust_shipping_sub: 'pour votre destination',
    product_trust_returns: 'Délai de retour de 30 jours',
    product_trust_secure: 'Paiement sécurisé',
    product_trust_returns_sub: 'voir la politique pour l’admissibilité',
    product_trust_secure_sub: 'chiffré et conforme PCI',
    product_desc_eyebrow: 'À propos de ce produit',
    product_reco_see_all: 'Voir tout',
    product_perks_aria: 'Promesses de livraison et de service',
    product_highlights_eyebrow: 'Pourquoi ce produit',
    product_care_eyebrow: 'Entretien et livraison',
    product_care_h: 'Conçu pour durer, emballé avec soin',
    product_stock_low: 'Plus que {stock} en inventaire',
    product_badge_sold_out: 'Rupture de stock',
    product_badge_save: 'Économisez {pct}%',
    product_reviews_stub:
      'Les avis de clients vérifiés apparaîtront ici au fur et à mesure qu’ils seront recueillis.',
    product_perk_packed: 'Options de livraison confirmées au paiement',
    product_perk_return:
      'Consultez la politique de remboursement avant de commander',
    product_perk_curated: 'Sélectionné par l’équipe Puchica, jamais aléatoire',
    product_tab_description: 'Description',
    product_story_title: 'Pourquoi il mérite sa place.',
    product_tab_specs: 'Caractéristiques',
    product_tab_shipping: 'Livraison & Retours',
    product_desc_empty: 'Aucune description supplémentaire pour ce produit.',
    product_spec_vendor: 'Fournisseur',
    product_spec_category: 'Catégorie',
    product_spec_sku: 'SKU',
    product_specs_empty: 'Aucune caractéristique disponible pour ce produit.',
    product_shipping_h: 'Livraison',
    product_shipping_body:
      'La disponibilité, les délais et le coût de livraison sont confirmés au paiement selon les articles sélectionnés et votre destination. Lorsqu’un service avec suivi est offert, les détails de suivi sont envoyés après l’expédition par le fournisseur.',
    product_returns_h: 'Retours',
    product_returns_body:
      'Consultez la politique de remboursement avant de commander. L’admissibilité au retour et les instructions dépendent de l’article et de la commande; contactez le soutien avec votre numéro de commande si vous avez besoin d’aide.',
    product_help_h: 'Besoin d’aide ?',
    product_help_body:
      'Envoyez votre question sur le produit ou la commande avec les détails nécessaires pour vous aider.',
    product_help_contact_link: 'page de contact',
    product_share_label: 'Partager :',
    product_share_btn: 'Partager',
    product_copy_link: 'Copier le lien',
    product_link_copied: 'Lien copié',
    product_reco_title: 'Vous aimerez aussi',
    product_recently_viewed_title: 'Vus récemment',
    product_add_to_cart: 'Ajouter au panier',
    product_price_from: 'Dès',
    product_sold_out: 'Rupture de stock',
    product_notify_label: 'Me notifier quand disponible',
    product_notify_placeholder: 'vous@exemple.com',
    product_notify_btn: 'Me notifier',
    product_notify_ok:
      'Merci, nous vous enverrons un courriel quand ce sera disponible.',
    product_notify_error: 'Quelque chose s’est mal passé. Veuillez réessayer.',

    atc_added: 'Ajouté ✓',
    atc_out_of_stock: 'Rupture de stock',
    atc_adding: 'Ajout…',

    search_articles: 'Articles',
    search_pages: 'Pages',
    search_products: 'Produits',
    search_empty: 'Aucun résultat. Essayez un autre terme de recherche.',
    search_articles_aria: "Résultats d'articles",
    search_pages_aria: 'Résultats de pages',
    search_products_aria: 'Résultats de produits',
    card_view_details: 'Voir les détails',
    card_choose_options: 'Choisir les options',
    card_swatches_aria: 'Options du produit',
    card_quick_add_aria: 'Ajout rapide',

    // ── Chrome en-tête / navigation ──────────────────────────────
    nav_shop_all: 'Tout magasiner',
    nav_best_sellers_short: 'Meilleures ventes',
    nav_new_arrivals_short: 'Nouveautés',
    nav_gift_guide: 'Idées cadeaux',
    nav_about_short: 'À propos',
    nav_contact_short: 'Contact',
    megamenu_trigger: 'Boutique',
    megamenu_panel_aria: 'Magasiner par catégorie',
    megamenu_error_body:
      "Nous n'avons pas pu charger les catégories pour le moment.",
    megamenu_error_cta: 'Tout parcourir →',
    megamenu_tile_cta: 'Magasiner →',
    megamenu_intent_heading: 'Magasiner par catégorie',
    megamenu_intent_home_title: 'Meilleures ventes',
    megamenu_intent_home_body:
      'Audio, cuisine, conditionnement physique, maison et plein air — les trouvailles que les clients récommandent.',
    megamenu_intent_cable_title: 'Top du moment',
    megamenu_intent_cable_body:
      'Gardez cordons et techno du quotidien faciles à trouver.',
    megamenu_intent_travel_title: 'Toutes les catégories',
    megamenu_intent_travel_body:
      'Emballage, bagages et transport du quotidien.',
    megamenu_edit_eyebrow: 'Commencer ici',
    megamenu_edit_title: 'Trouvailles haut de gamme sous 200 $ CA.',
    megamenu_edit_body:
      'Solutions pour le rangement sous l’évier, les câbles, l’emballage et le transport quotidien.',
    megamenu_trust_shipping: 'Options de livraison affichées au paiement',
    megamenu_trust_refund: 'Politique de remboursement disponible',
    megamenu_tagline_phone_case: 'Coques, prises, protection.',
    megamenu_tagline_home_essentials: 'Audio, cuisine, déco, rangement.',
    megamenu_tagline_home_kitchen: 'Cuisine, rangement, déco.',
    megamenu_tagline_electronics_accessories: 'Câbles, chargeurs, supports.',
    megamenu_tagline_apparel_accessories: 'Sacs, chapeaux, accessoires.',
    megamenu_tagline_health_wellness: 'Peau, parfum, soin.',
    megamenu_tagline_sports_outdoors: 'Équipement, fitness, sport.',
    megamenu_tagline_pet_finds: 'Jouets, lits, accessoires pour eux.',
    megamenu_tagline_pet_supplies: 'Jouets, lits, accessoires pour eux.',
    megamenu_tagline_automotive: 'Intérieur, outils, gadgets.',
    megamenu_tagline_tools_home_improvement: 'Réparer, construire, finir.',
    megamenu_tagline_beauty_personal_care: 'Maquillage, ongles, soin de soi.',
    megamenu_tagline_toys_games: 'Jouer, apprendre, collectionner.',
    megamenu_tagline_home_decor: 'Mur, lumière, accents.',
    megamenu_tagline_office_school_supplies: 'Bureau, papier, indispensables.',
    megamenu_tagline_baby_nursery: 'Alimentation, déco, confort.',
    megamenu_tagline_outdoor_garden: 'Jardin, patio, plein air.',
    megamenu_tagline_best_sellers: 'Les coups de cœur de tous.',
    megamenu_tagline_trending_finds: 'Ce qui est en vogue.',
    megamenu_tagline_gifts_under_25: 'Bons cadeaux, petit budget.',
    pillnav_aria: 'Sections de la page',
    pillnav_trending: 'Tendances',
    pillnav_home_kitchen: 'Maison & Cuisine',
    pillnav_outdoor: 'Extérieur',
    pillnav_categories: 'Catégories',
    pillnav_best_sellers: 'Meilleures ventes',
    pillnav_about_us: 'À propos',

    // ── Bannière parallax (bandeau d’accueil) ───────────────────
    parallax_aria: 'Bannière de marque',
    parallax_title: 'Trouvez votre truc. Nous l’avons.',
    parallax_sub: 'Des dizaines de collections. Une seule boutique canadienne.',
    parallax_cta: 'Parcourir par catégorie →',

    // ── Bandeau des tendances ───────────────────────────────────
    ticker_section_aria: 'Produits tendance',
    ticker_label: 'Tendances',

    // ── Vitrine de collections (accueil) ───────────────────────
    showcase_section_aria: 'Vitrine de collections',
    showcase_heading: 'Explorez par catégorie',
    showcase_sub: '{count} collections. {pct} % du catalogue couvert.',
    showcase_eyebrow: 'Collection {n}',
    showcase_desc:
      'Découvrez notre sélection de {title}, produits triés sur le volet avec livraison gratuite dès 50 $.',
    showcase_cta: 'Magasiner {title} →',

    // ── 404 / route catch-all ─────────────────────────────────
    notfound_title: "Nous n'avons pas trouvé cette page",
    notfound_sub:
      "Le lien {path} n'existe pas sur Puchica. Il a peut-être été déplacé, renommé, ou n'a jamais existé. Essayez plutôt l'une de ces options :",
    notfound_popular: 'Collections populaires',
    notfound_best: 'Meilleures ventes →',
    notfound_new: 'Nouveautés →',
    notfound_all_collections: 'Toutes les collections →',
    notfound_all_catalog: 'Catalogue complet →',
    notfound_breadcrumb_current: 'Page introuvable',
    notfound_breadcrumb_aria: 'Fil d’Ariane',
    notfound_breadcrumb_home: 'Accueil',
    notfound_eyebrow: '404',

    // ── Panier (tiroir / page) ─────────────────────────────────
    cart_section_aria: 'Tiroir du panier',
    cart_page_aria: 'Page du panier',
    stats_aria: 'Statistiques de la boutique',
    product_price_aria: 'Prix',
    pdp_3d_fallback_product: 'Produit',
    pdp_3d_viewer: 'vue 3D',
    pdp_3d_hint: 'Glissez pour pivoter · molette pour zoomer',
    cart_heading_aria: 'Articles',
    cart_remove_region_aria: 'Retirer du panier',
    cart_empty_title: 'Votre panier est vide.',
    cart_empty_body:
      'Commencez par un organiseur pratique pour votre prochain voyage.',
    cart_empty_cta_shop: 'Voir les trouvailles',
    cart_empty_cta_best: 'Voir les meilleures ventes',
    cart_empty_perks_aria: 'Pourquoi magasiner avec nous',
    cart_empty_perk_shipping: 'Options de livraison affichées au paiement',
    cart_empty_perk_returns: 'Retours sous 30 jours',
    cart_ghost_notice:
      'Ces articles ne sont pas disponibles dans votre région pour le moment. Retirez-les pour vider votre panier.',
    cart_freeship_progress_remaining:
      'Ajoutez {amount} pour la livraison gratuite',
    cart_freeship_progress_done: 'Vous avez la livraison gratuite',
    cart_freeship_threshold_label:
      'Livraison gratuite pour les commandes de plus de {threshold}',
    cart_summary_title: 'Totaux',
    cart_summary_subtotal: 'Sous-total',
    cart_summary_empty_btn: 'Ajoutez un article pour continuer',
    cart_summary_checkout_btn: 'Passer à la caisse',
    cart_checkout_unavailable:
      'Le paiement est temporairement indisponible. Actualisez votre panier et réessayez.',
    cart_checkout_retry: 'Actualiser le panier',
    cart_summary_discounts_aria: 'Remises',
    cart_summary_discounts_h: 'Remises',
    cart_summary_remove_discount: 'Retirer la remise',
    cart_summary_remove: 'Retirer',
    cart_summary_promo_label: 'Code promo',
    cart_summary_promo_placeholder: 'Entrez le code',
    cart_summary_promo_apply_aria: 'Appliquer le code de remise',
    cart_summary_promo_apply: 'Appliquer',
    cart_summary_gift_aria: 'Cartes-cadeaux',
    cart_summary_gift_h: 'Carte(s)-cadeau(x) appliquée(s)',
    cart_summary_gift_label: 'Carte-cadeau',
    cart_summary_gift_placeholder: 'Entrez le code de la carte-cadeau',
    cart_summary_gift_apply_aria: 'Appliquer la carte-cadeau',
    cart_summary_gift_apply: 'Appliquer',
    cart_summary_remove_gift_aria:
      'Retirer la carte-cadeau se terminant par {last}',
    cart_qty_aria: 'Quantité',
    cart_qty_dec_aria: 'Diminuer la quantité',
    cart_qty_inc_aria: 'Augmenter la quantité',
    cart_qty_remove_aria: 'Retirer du panier',
    cart_qty_remove: 'Retirer',
    cart_line_items_aria: 'Articles de {title}',

    // ── Pagination (collections, recherche) ─────────────────────
    pager_aria: 'Pagination',
    pager_prev: 'Page précédente',
    pager_next: 'Charger 12 de plus',
    pager_loading: 'Chargement de plus de produits…',
    pager_end: 'Vous avez atteint la fin',
    pager_showing_one: 'Affichage de {n} produit',
    pager_showing_many: 'Affichage de {n} produits',

    // ── Galerie d’images PDP (3D, zoom, etc.) ──────────────────
    pdp_img_alt_fallback: 'Image du produit',
    pdp_thumbs_aria: 'Images du produit',
    pdp_thumb_aria: 'Voir l’image {n} sur {total}',
    pdp_3d_open_aria: 'Voir le produit en 3D',
    pdp_3d_open: 'Voir en 3D',
    pdp_3d_close_aria: 'Revenir à la vue photo',
    pdp_3d_close: '← Photos',
    pdp_zoom_hint: 'Survolez pour zoomer',
    pdp_prev_aria: 'Image précédente',
    pdp_next_aria: 'Image suivante',

    // ── Formulaire produit ──────────────────────────────────────
    product_qty_aria: 'Quantité',
    product_qty_dec_aria: 'Diminuer la quantité',
    product_qty_inc_aria: 'Augmenter la quantité',
    product_save_aria: 'Sauvegarder pour plus tard',
    product_unsave_aria: 'Retirer des sauvegardés',
    product_stock_phrase: 'Plus que {stock} en stock',

    // ── Embla / carrousels ──────────────────────────────────────
    embla_prev_aria: 'Précédent',
    embla_next_aria: 'Suivant',
    embla_view_all: 'Voir tout →',
    embla_dots_aria: 'Indicateurs de diapositive',
    embla_dot_aria: 'Aller à la diapositive {n}',

    // ── Chrome des tiroirs ──────────────────────────────────────
    aside_close_drawer: 'Fermer le tiroir',
    aside_close: 'Fermer',
    locale_change_aria: 'Changer de marché ou de langue',
    locale_switching: 'Changement…',
    locale_switching_status: 'Mise à jour du marché et de la devise.',
    locale_market_label: 'Marché',
    locale_market_ca: 'Canada',
    locale_market_us: 'États-Unis',
    locale_market_unavailable: 'Indisponible',
    locale_language_label: 'Langue',
    mobile_market_language: 'Marché et langue',
    skip_to_content: 'Passer au contenu principal',

    // ── ErrorBoundary racine / 404 / recherche dans l’erreur ───
    err_404_h: "Nous n'avons pas trouvé cette page",
    err_500_h: "Une erreur s'est produite de notre côté",
    err_404_body:
      'Cette page a peut-être été déplacée pendant la préparation du nouveau catalogue. Retournez à l’accueil ou contactez-nous.',
    err_500_body:
      "Une erreur inattendue s'est produite lors du rendu de cette page. Réessayez ou parcourez le catalogue ci-dessous.",
    err_search_aria: 'Rechercher des articles',
    err_search_placeholder: 'Rechercher…',
    err_search_btn: 'Rechercher',
    err_home: 'Retour à l’accueil',
    err_browse: 'À propos de Puchica',
    err_contact: 'Toujours bloqué·e ? Écrivez à {email} et nous vous aiderons.',

    // ── Pied de page (suite) ────────────────────────────────────
    footer_social_aria: 'Réseaux sociaux',
    footer_payments_aria: 'Moyens de paiement acceptés',
    footer_payments_list_aria: 'Moyens de paiement',
    footer_address: 'Puchica · Toronto, ON, Canada',
    footer_email: 'hello@puchica.ca',
    footer_stats_aria: 'Faits saillants de la boutique',
    footer_stat_products: 'Catalogue',
    footer_stat_collections: 'Collections',
    footer_stat_shipping: 'Livraison gratuite',
    footer_stat_returns: 'Jours de retour',
    footer_copyright: '© {year} Puchica.',
    footer_legal_aria: 'Mentions légales',
    footer_newsletter_cta: '→',
    social_instagram: 'Instagram',
    social_facebook: 'Facebook',
    social_tiktok: 'TikTok',

    // ── Menu mobile (tiroir) ───────────────────────────────────
    mobile_account: 'Compte',
    mobile_signin: 'Se connecter',
    mobile_view_cart: 'Voir le panier',
    mobile_language: 'Langue',
    mobile_customer_care: 'Service client',
    mobile_contact_us: 'Nous contacter',
    mobile_all_policies: 'Toutes les politiques',
    mobile_announce_foot: 'Offres et nouveautés',
    mobile_announce_foot_sep: ' · ',

    // ── Avis Judgeme ────────────────────────────────────────────
    reviews_section_aria: 'Avis clients',
    reviews_heading: 'Avis clients',
    reviews_aria: '{rating} sur 5 étoiles, {count} avis',
    reviews_count_one: '({count} avis)',
    reviews_count_many: '({count} avis)',

    // ── Fenêtre modale d’infolettre ─────────────────────────────
    np_aria: 'Rejoignez la liste Puchica',
    np_close_backdrop: 'Fermer',
    np_close_x: 'Fermer',
    np_success_h: 'Vous êtes inscrit·e !',
    np_success_body:
      'Vous recevrez les nouveautés, les réassorts et les offres occasionnelles.',
    np_copy_btn: 'Copié !',
    np_copy_hint: 'Touchez pour copier',
    np_success_cta: 'Commencer à magasiner →',
    np_form_h: 'Rejoignez la liste Puchica',
    np_form_body:
      'Recevez les nouveautés, les réassorts et les offres occasionnelles. Désabonnement à tout moment.',
    np_email_placeholder: 'vous@courriel.com',
    np_email_aria: 'Adresse courriel',
    np_joining: 'Inscription…',
    np_submit: 'S’abonner',
    np_dismiss: 'Non merci',

    // ── Fiche produit (badges, espace réservé) ──────────────────
    badge_new_arrival: 'Nouveauté',
    badge_top_pick: 'Coup de cœur',
    badge_trending: 'Tendance',
    badge_staff_pick: 'Choix de l’équipe',
    badge_sale: 'Solde',
    badge_new: 'Nouveau',
    badge_best_seller: 'Meilleure vente',

    // ── Route de recherche + prédictive ─────────────────────────
    search_results_h: 'Résultats pour {term}',
    search_results_h_fallback: 'Recherche',
    search_input_placeholder: 'Rechercher des produits…',
    search_submit: 'Rechercher',
    search_zero_hint:
      'Recherchez par mot-clé ou parcourez nos catégories populaires ci-dessus.',
    pred_articles: 'Articles',
    pred_collections: 'Collections',
    pred_pages: 'Pages',
    pred_products: 'Trouvailles',
    pred_empty_title: 'Commencez à taper pour rechercher',
    pred_empty_body:
      'Essayez des catégories comme « meilleures ventes », « maison » ou des noms de produits précis.',
    pred_pill_best: 'Meilleures ventes',
    pred_pill_all: 'Toutes les catégories',
    pred_pill_new: 'Nouveautés',
    pred_no_results_h: 'Aucun résultat pour « {term} ».',
    pred_no_results_body:
      'Essayez un autre mot-clé ou parcourez les coups de cœur.',

    // ── H1 de la page Panier ────────────────────────────────────
    cart_page_h: 'Panier',
    cart_page_eyebrow: 'Votre panier',
    cart_trust_aria: 'Pourquoi magasiner chez nous',
    cart_trust_returns: 'Retours sous 30 jours',
    cart_trust_shipping: 'Expédition sous 24 h',
    cart_trust_secure: 'Paiement sécurisé',

    // ── Page d’index des collections ───────────────────────────
    col_index_breadcrumb_aria: 'Fil d’Ariane',
    col_index_breadcrumb_home: 'Accueil',
    col_index_breadcrumb_current: 'Collections',
    col_index_eyebrow: 'Parcourir',
    col_index_h: 'Toutes les collections',
    col_index_sub:
      'Parcourez les trouvailles par catégorie, problème ou usage.',
    col_index_count: 'Puchica',
    col_index_empty_h: 'Aucune collection pour l’instant',
    col_index_empty_body:
      'Les collections apparaîtront ici à mesure que nous les ajouterons.',
    col_index_card_cta: 'Magasiner la collection →',

    // ── Index des politiques ────────────────────────────────────
    policies_h: 'Politiques',
    policies_sub:
      'Livraison, retours, confidentialité et conditions pour les commandes chez Puchica.',

    // ── Lien retour des politiques ──────────────────────────────
    policy_back: 'Retour aux politiques',
    refund_summary_title: 'Avant d’expédier un retour',
    refund_summary_start:
      'Contactez-nous dans les 30 jours suivant la livraison. N’expédiez rien avant la confirmation de l’admissibilité, des instructions et de l’adresse de retour.',
    refund_summary_shipping:
      'La responsabilité des frais de retour dépend du motif et de la politique complète. Si un article arrive endommagé ou incorrect, écrivez-nous rapidement avec les détails de la commande.',
    refund_summary_timing:
      'Les remboursements approuvés sont versés sur le mode de paiement original après réception et examen du retour. Le délai bancaire peut varier.',
    refund_summary_control:
      'Ce résumé ne remplace pas la politique Shopify complète ci-dessous, qui prévaut en cas de différence.',

    // ── Index des blogs ─────────────────────────────────────────
    blogs_h: 'Blogues',

    // ── Espace compte (présentation, profil, commandes, adresses)
    account_welcome: 'Bienvenue, {firstName}',
    account_welcome_fallback: 'Bienvenue dans votre compte.',
    account_welcome_anon: 'Détails du compte',
    account_nav_orders: 'Commandes',
    account_nav_profile: 'Profil',
    account_nav_addresses: 'Adresses',
    account_signout: 'Se déconnecter',
    account_profile_h: 'Mon profil',
    account_profile_fieldset: 'Informations personnelles',
    account_first_name: 'Prénom',
    account_last_name: 'Nom',
    account_updating: 'Mise à jour',
    account_update: 'Mettre à jour',
    account_addresses_h: 'Adresses',
    account_addresses_create_legend: 'Créer une adresse',
    account_addresses_empty: "Vous n'avez enregistré aucune adresse.",
    account_addresses_creating: 'Création',
    account_addresses_create: 'Créer',
    account_addresses_existing: 'Adresses existantes',
    account_addresses_saving: 'Enregistrement',
    account_addresses_save: 'Enregistrer',
    account_addresses_deleting: 'Suppression',
    account_addresses_delete: 'Supprimer',
    account_address_first: 'Prénom',
    account_address_last: 'Nom',
    account_address_company: 'Entreprise',
    account_address_line1: 'Ligne d’adresse 1',
    account_address_line2: 'Ligne d’adresse 2',
    account_address_city: 'Ville',
    account_address_state: 'État / Province',
    account_address_zip: 'Code postal',
    account_address_country: 'Pays',
    account_address_phone: 'Téléphone',
    account_address_phone_aria: 'Numéro de téléphone',
    account_address_phone_ph: '+16135551111',
    account_address_default_label: 'Définir comme adresse par défaut',
    account_orders_h: 'Commandes',
    account_orders_meta: 'Commandes',
    account_orders_empty_filtered:
      'Aucune commande ne correspond à votre recherche.',
    account_orders_empty_filtered_cta: 'Effacer les filtres →',
    account_orders_empty: "Vous n'avez pas encore passé de commande.",
    account_orders_empty_cta: 'Commencer à magasiner →',
    account_orders_search_aria: 'Rechercher des commandes',
    account_orders_filter_legend: 'Filtrer les commandes',
    account_orders_search_ph: 'N° de commande',
    account_orders_search_aria_named: 'Numéro de commande',
    account_orders_conf_ph: 'N° de confirmation',
    account_orders_conf_aria: 'Numéro de confirmation',
    account_orders_searching: 'Recherche',
    account_orders_search: 'Rechercher',
    account_orders_clear: 'Effacer',
    account_orders_confirmation: 'Confirmation : {num}',
    account_orders_view: 'Voir la commande →',
    account_order_h: 'Commande {name}',
    account_order_meta: 'Commande {name}',
    account_order_placed: 'Passée le {date}',
    account_order_confirmation: 'Confirmation : {num}',
    account_order_th_product: 'Produit',
    account_order_th_price: 'Prix',
    account_order_th_qty: 'Quantité',
    account_order_th_total: 'Total',
    account_order_discounts: 'Remises',
    account_order_discount_line: '-{pct} % DE RABAIS',
    account_order_subtotal: 'Sous-total',
    account_order_tax: 'Taxes',
    account_order_total: 'Total',
    account_order_shipping_h: 'Adresse de livraison',
    account_order_no_shipping: 'Aucune adresse de livraison définie',
    account_order_status_h: 'Statut',
    account_order_status_na: 'N/D',
    account_order_status_link: 'Voir le statut de la commande →',

    // ── Page À propos ──────────────────────────────────────────────
    about_hero_eyebrow: 'Notre histoire',
    about_hero_title_main: 'Une petite boutique de voyage',
    about_hero_title_em: 'avec de meilleures raisons d’acheter.',
    about_hero_sub:
      'Puchica est une boutique canadienne indépendante qui commence avec trois organisateurs de voyage pratiques pour les vêtements, les câbles et les articles de toilette.',
    about_hero_cta: 'Voir la sélection voyage →',
    about_stats_aria: 'Puchica en chiffres',
    about_stat_products_num: 'Actif',
    about_stat_products_label: 'Produits sélectionnés',
    about_stat_quality_num: '100 %',
    about_stat_quality_label: 'Contrôle qualité',
    about_stat_shipping_num: '50 $+',
    about_stat_shipping_label: 'Livraison au Canada',
    about_stat_returns_num: '30 jours',
    about_stat_returns_label: 'Retours sans tracas',
    about_mission_eye: 'Pourquoi nous existons',
    about_mission_title:
      'Dans un petit espace, chaque objet mal rangé prend plus de place.',
    about_mission_body_1:
      'Un tiroir encombré, un câble emmêlé ou un sac trop rempli peut compliquer une journée ordinaire. Puchica aide à résoudre ces petits problèmes récurrents.',
    about_mission_body_2:
      'Puchica prend l’approche inverse. Notre première sélection vise un seul objectif : rendre un sac plus facile à utiliser. Chaque produit doit avoir un rôle clair et des options compréhensibles.',
    about_mission_card_text:
      'Utile d’abord. Clair avant le paiement. À la hauteur de l’espace occupé.',
    about_how_eye: 'Ce qui mérite une place',
    about_how_title: 'Chaque produit doit justifier l’espace qu’il occupe.',
    about_how_1_title: 'Résout un problème précis',
    about_how_1_body:
      'Nous partons d’une fonction claire : séparer les vêtements, contenir les petits appareils ou garder les articles de toilette faciles à trouver.',
    about_how_2_title: 'Fait partie du même système de voyage',
    about_how_2_body:
      'Les trois produits fonctionnent ensemble dans une valise, un sac de week-end, un sac de sport ou un bagage à main.',
    about_how_3_title: 'Clair avant l’achat',
    about_how_3_body:
      'Le produit doit avoir un usage, des détails et des options compréhensibles. La disponibilité, le coût et le délai de livraison sont confirmés au paiement.',
    about_cats_eye: 'Ce que nous offrons',
    about_cats_title: 'Des trouvailles utiles. Une seule boutique.',
    about_cats_sub:
      'Dans toutes les catégories qui comptent vraiment au quotidien.',
    about_cat_home_name: 'Maison & Déco',
    about_cat_home_sub: 'Audio, cuisine, déco, rangement',
    about_cat_beauty_name: 'Beauté & Soins',
    about_cat_beauty_sub: 'Soins de la peau, bien-être, soins personnels',
    about_cat_tech_name: 'Techno & Gadgets',
    about_cat_tech_sub: 'Accessoires, outils, maison connectée',
    about_cat_outdoor_name: 'Extérieur & Jardin',
    about_cat_outdoor_sub: 'Patio, camping, jardinage',
    about_cat_pet_name: 'Trouvailles pour animaux',
    about_cat_pet_sub: 'Jouets, équipement, toilettage',
    about_cat_gift_name: 'Cadeaux',
    about_cat_gift_sub: 'Pour tous ceux sur votre liste',
    about_promise_quote:
      'Chaque produit Puchica a été soigneusement testé par notre équipe. Nous offrons la sélection la plus soignée de produits que nous puissions trouver. Si nous ne l’utiliserions pas nous-mêmes, ce ne sera pas Puchica.',
    about_promise_attr: 'L’équipe Puchica, Toronto ON',
    about_cta_title:
      'Prêt·e à faire de la place pour des journées plus calmes ?',
    about_dept_title: 'Parcourir la boutique',
    about_cta_sub:
      'Commencez par un article, un problème à résoudre ou une catégorie qui vous attire.',
    about_cta_browse: 'Voir toutes les trouvailles →',
    about_cta_contact: 'Nous joindre',

    // ── Page About, nouvelles sections (chronologie, valeurs, équipe, racines, départements) ──
    about_story_eye: 'Notre histoire',
    about_story_title: 'Comment Puchica est né.',
    about_story_sub: 'Quelques moments qui nous ont menés ici.',
    about_story_1_year: '2021',
    about_story_1_title: 'Tout a commencé par un « puchica »',
    about_story_1_body:
      'Une petite idée née à Toronto : créer une boutique où tout mérite d’être acheté. Pas de remplissage, pas de déchets, pas de choix par algorithme.',
    about_story_2_year: '2022',
    about_story_2_title: 'Les 1 000 premiers produits',
    about_story_2_body:
      'Un catalogue trop large rendait chaque produit difficile à expliquer. On s’est resserré autour des trouvailles haut de gamme et on a bâti un réseau fournisseurs fiable.',
    about_story_3_year: '2024',
    about_story_3_title: 'Une boutique ciblée pour trouvailles',
    about_story_3_body:
      'Le catalogue est maintenant construit autour de trouvailles haut de gamme — fournisseurs vérifiés, livraison transparente au paiement et retour de 30 jours sur chaque commande.',
    about_story_4_year: 'Aujourd’hui',
    about_story_4_title: 'Des racines across the Americas',
    about_story_4_body:
      'D’une base à Toronto jusqu’aux acheteurs across the Americas, la mission reste la même : le bon truc, choisi à la main.',

    about_values_eye: 'Ce que nous défendons',
    about_values_title: 'Nos valeurs.',
    about_values_sub: 'Les règles derrière chaque choix que nous faisons.',
    about_values_1_title: 'Sélectionné, pas encombré',
    about_values_1_body:
      'Nous disons non à bien plus de choses qu’on dit oui. Un catalogue plus petit et meilleur vaut mieux qu’un géant médiocre.',
    about_values_2_title: 'Toujours des prix justes',
    about_values_2_body:
      'Pas de fausses remises, pas de majorations mystère. Le prix que vous voyez est honnête, et la valeur est réelle.',
    about_values_3_title: 'L’âme avant les tendances',
    about_values_3_body:
      'On choisit des choses qui durent et comptent, pas ce que l’algorithme pousse cette semaine.',
    about_values_4_title: 'Expédié par des partenaires de confiance',
    about_values_4_body:
      'Chaque commande part d’un partenaire vérifié sous 24 h, avec une étiquette de retour prépayée dans chaque boîte.',

    about_team_eye: 'Qui nous sommes',
    about_team_title: 'Des gens réels, des choix réels.',
    about_team_sub:
      'Une petite équipe à Toronto, derrière chaque produit qui passe le filtre.',
    about_team_1_name: 'Mariana L.',
    about_team_1_role: 'Fondatrice & Curatrice',
    about_team_1_bio:
      'On choisit des produits qui résolvent un vrai problème, proviennent de fournisseurs vérifiés et méritent leur place dans une collection ciblée.',
    about_team_2_name: 'Diego R.',
    about_team_2_role: 'Responsable des opérations',
    about_team_2_bio:
      'Garde le réseau de fournisseurs en marche et s’assure que chaque commande parte à temps. La raison pour laquelle votre colis arrive vite.',
    about_team_3_name: 'Sofía M.',
    about_team_3_role: 'Communauté & Service',
    about_team_3_bio:
      'Répond à vos questions, écoute vos retours et s’assure que la boutique ne cesse de s’améliorer.',

    about_roots_aria: 'Nos racines centroaméricaines',
    about_roots_eyebrow: 'L’origine du nom',
    about_roots_heading: 'Puchica commence par un sentiment de surprise utile.',
    about_roots_body:
      '« Puchica » est une expression centroaméricaine familière de surprise, comme la réaction que peut provoquer une solution étonnamment astucieuse. Cet esprit guide la marque : des objets pratiques qui règlent un irritant quotidien sans ajouter de désordre.',
    about_roots_signature:
      'Entreprise canadienne. Petite sélection, vraie utilité.',
    about_hero_caption: 'Pensé autour des choses utiles sur la route.',
    about_hero_image_alt:
      'Vêtements et essentiels de voyage disposés avant le rangement',
    about_roots_image_alt:
      'Un textile tissé coloré et un récipient en céramique peinte',
    about_standards_intro:
      'Un petit catalogue ne fonctionne que si la raison d’être de chaque produit est claire.',
    about_shop_eye: 'La sélection voyage',
    about_shop_title: 'Commencez par la partie du rangement qui vous ralentit.',
    about_shop_home_title: 'Cubes de rangement',
    about_shop_cable_title: 'Étui pour câbles',
    about_shop_travel_title: 'Trousse de toilette',
    about_shop_home_body: 'Séparez les vêtements dans trois cubes zippés.',
    about_shop_cable_body:
      'Gardez chargeurs, adaptateurs et écouteurs ensemble.',
    about_shop_travel_body:
      'Donnez une place aux flacons, outils de soin et cosmétiques.',
    about_shop_all: 'Voir toute la sélection voyage',
    about_now_eye: 'Une livraison plus claire',
    about_now_title: 'Voyez vos options de livraison avant de payer.',
    about_now_body:
      'L’origine et le délai d’expédition peuvent varier selon l’article et l’adresse. Le paiement affiche les options disponibles pour votre commande avant la transaction.',
    about_now_email: 'Des questions? Écrivez à hello@puchica.ca',
    about_delivery_panel_title: 'Aperçu de livraison au paiement',
    about_delivery_step_1_title: 'Choisissez un article',
    about_delivery_step_1_body: 'Ajoutez un article et entrez votre adresse.',
    about_delivery_step_2_title: 'Voyez les options disponibles',
    about_delivery_step_2_body:
      'Le paiement calcule les choix pour cette commande.',
    about_delivery_step_3_title: 'Vérifiez avant de payer',
    about_delivery_step_3_body: 'Comparez le délai et le coût disponibles.',
    about_delivery_note: 'Détails de livraison affichés avant le paiement',
    about_fact_based_label: 'Établie au',
    about_fact_based_value: 'Canada',
    about_fact_market_label: 'Marché actuel',
    about_fact_market_value: 'Clients aux États-Unis',
    about_fact_delivery_label: 'Avant le paiement',
    about_fact_delivery_value: 'Options de livraison affichées au paiement',

    about_depts_eye: 'Continuez à explorer',
    about_depts_title: 'Magasiner par département.',
    about_depts_sub:
      'Chaque catégorie, sélectionnée avec le même soin. Choisissez par où commencer.',
    about_depts_shop_cta: 'Magasiner →',
    about_depts_home: 'Maison & Déco',
    about_depts_beauty: 'Beauté & Soins',
    about_depts_tech: 'Techno & Gadgets',
    about_depts_outdoor: 'Extérieur & Jardin',
    about_depts_pet: 'Trouvailles pour animaux',
    about_depts_gifts: 'Cadeaux',

    // ── Page Contact ──────────────────────────────────────────────
    contact_hero_eyebrow: 'Nous joindre',
    contact_hero_title: 'Nous sommes là pour aider.',
    contact_hero_sub:
      'Pour une commande, indiquez votre numéro de commande. Pour un produit, ajoutez son nom ou son lien.',
    contact_channels_aria: 'Façons de nous joindre',
    contact_ig_title: 'DM sur Instagram',
    contact_ig_body: 'Suivez les démos et les nouveautés.',
    contact_ig_fallback: 'Instagram',
    contact_fb_title: 'Message sur Facebook',
    contact_fb_body: 'Suivez les mises à jour et nouveautés.',
    contact_fb_fallback: 'Facebook',
    contact_tiktok_title: 'Retrouvez-nous sur TikTok',
    contact_tiktok_body: 'Démos et nouveautés.',
    contact_tiktok_fallback: 'TikTok',
    contact_promises_aria: 'À quoi s’attendre',
    contact_promises_eyebrow: 'À quoi s’attendre',
    contact_promises_title: 'Aidez-nous à trouver la bonne réponse',
    contact_promise_1_strong: 'Ajoutez les détails utiles',
    contact_promise_1_body:
      'Indiquez le numéro de commande, le lien du produit et votre question.',
    contact_promise_2_strong: 'Prévoyez deux jours ouvrables',
    contact_promise_2_body:
      'Nous visons une réponse sous deux jours ouvrables. Une vérification auprès du fournisseur ou du transporteur peut prendre plus de temps.',
    contact_promise_3_strong: 'Nous confirmons les options possibles',
    contact_promise_3_body:
      'Les modifications, annulations et retours dépendent de l’état de la commande et de la politique applicable.',
    contact_faq_aria: 'Questions fréquentes',
    contact_faq_eyebrow: 'Questions fréquentes',
    contact_faq_title: 'La version courte',
    contact_faq_1_q: 'Où est ma commande ?',
    contact_faq_1_a:
      'Lorsqu’un service avec suivi est offert, le lien figure dans votre courriel de confirmation d’expédition. Écrivez-nous avec votre numéro de commande si vous avez besoin d’aide.',
    contact_faq_2_q: 'Puis-je modifier ou annuler ma commande ?',
    contact_faq_2_a:
      'Contactez-nous dès que possible avec votre numéro de commande. Nous confirmerons si le fournisseur a commencé à la traiter et quelles options sont encore possibles.',
    contact_faq_3_q: 'Comment fonctionnent les retours ?',
    contact_faq_3_a:
      'Contactez-nous dans les 30 jours suivant la livraison. N’expédiez rien avant confirmation de l’admissibilité et des instructions. La responsabilité des frais de retour dépend du motif et de la politique de remboursement.',
    contact_faq_4_q: 'Où livrez-vous ?',
    contact_faq_4_a:
      'Le Canada et les États-Unis sont des marchés sélectionnables. La livraison varie selon le produit et l’adresse; le paiement doit confirmer le panier avant le règlement.',
    contact_faq_5_q:
      'Les produits sur les photos sont-ils exactement ce que je reçois ?',
    contact_faq_5_a:
      'Consultez les photos, la variante choisie, les dimensions et la description. Écrivez-nous avant de commander si un détail n’est pas clair.',
    contact_cta_title: 'Vous avez encore une question ?',
    contact_cta_body:
      'Le courriel est préférable pour une commande. Nous visons une réponse sous deux jours ouvrables.',
    contact_cta_button: 'Écrire à {email}',

    // ── Page FAQ (route dédiée /pages/faq) ──────────────────────
    faq_accordion_aria: 'Questions fréquentes',
    faq_hero_eyebrow: 'Centre d’aide',
    faq_hero_title: 'Questions fréquentes',
    faq_hero_sub:
      'Des réponses rapides aux questions que nous entendons le plus, commandes, retours, produits et votre compte.',
    faq_cat_orders: 'Commandes & Livraison',
    faq_cat_returns: 'Retours & Remboursements',
    faq_cat_products: 'Produits',
    faq_cat_account: 'Compte',
    faq_orders_1_q: 'Combien de temps prend la livraison ?',
    faq_orders_1_a:
      'Les délais de traitement et de livraison varient selon le produit. Entrez votre adresse au paiement pour consulter l’estimation disponible avant de payer.',
    faq_orders_2_q: 'Livrez-vous à l’international ?',
    faq_orders_2_a:
      'Le Canada et les États-Unis sont des marchés sélectionnables. Ce choix ne garantit pas la livraison de chaque article; le paiement confirme le panier et l’adresse avant le règlement.',
    faq_orders_3_q: 'Comment puis-je suivre ma commande ?',
    faq_orders_3_a:
      'Lorsqu’un service avec suivi est offert, le lien figure dans votre courriel de confirmation d’expédition. Contactez-nous avec votre numéro de commande si vous avez besoin d’aide.',
    faq_orders_4_q: 'Quels sont vos frais de livraison ?',
    faq_orders_4_a:
      'Les services, le coût et les délais de livraison sont confirmés au paiement selon les articles sélectionnés et la destination.',
    faq_returns_1_q: 'Quelle est votre politique de retour ?',
    faq_returns_1_a:
      'Contactez-nous dans les 30 jours suivant la livraison. L’admissibilité dépend de l’article, de son état et de la politique de remboursement. Écrivez-nous rapidement si l’article est endommagé ou incorrect.',
    faq_returns_2_q: 'Comment démarrer un retour ?',
    faq_returns_2_a:
      'Écrivez-nous avec le numéro de commande et le motif. N’expédiez rien avant confirmation de l’admissibilité et de l’adresse de retour. La responsabilité des frais dépend du motif et de la politique.',
    faq_returns_3_q: 'Quand recevrai-je mon remboursement ?',
    faq_returns_3_a:
      'Les remboursements approuvés sont versés sur le mode de paiement original après réception et examen de l’article retourné. Le délai de traitement bancaire peut varier.',
    faq_products_1_q: 'Où trouver les détails du produit ?',
    faq_products_1_a:
      'Consultez la page du produit pour les options, dimensions, matériaux et le contenu. Contactez-nous si un détail manque.',
    faq_products_2_q: 'D’où viennent vos produits ?',
    faq_products_2_a:
      'Nous travaillons avec des fournisseurs tiers et l’origine peut varier selon l’article. Contactez-nous avant de commander si vous avez besoin d’un détail précis.',
    faq_products_3_q: 'Comment choisir la bonne option ?',
    faq_products_3_a:
      'Vérifiez la taille, la couleur, la quantité et l’ensemble sélectionnés avant d’ajouter l’article au panier.',
    faq_account_1_q: 'Comment accéder à mon compte ?',
    faq_account_1_a:
      'Choisissez Compte, entrez votre courriel et suivez les étapes de connexion. Vous pourrez consulter vos commandes et gérer les renseignements enregistrés.',
    faq_account_2_q: 'Je n’arrive pas à me connecter. Que faire ?',
    faq_account_2_a:
      'Demandez un nouveau code ou lien depuis la page Compte, puis vérifiez vos courriels indésirables. Contactez-nous s’il n’arrive toujours pas.',
    faq_cta_eyebrow: 'Toujours coincé ?',
    faq_cta_title: 'Vous avez encore une question ?',
    faq_cta_sub:
      'Envoyez les détails du produit ou de la commande. Nous visons une réponse sous deux jours ouvrables.',
    faq_cta_button: 'Nous contacter',
    faq_contact_aria: 'Nous contacter',
    faq_contact_title: 'Nous contacter',
    faq_contact_body:
      'Vous ne trouvez pas ce que vous cherchez ? Écrivez-nous, nous sommes heureux d’aider avec les commandes, les retours, les produits ou autre chose.',

    aside_heading_cart: 'Panier',
    aside_heading_search: 'Recherche',
    aside_heading_menu: 'Menu',
    cart_loading: 'Chargement du panier…',
    search_placeholder: 'Rechercher par catégorie, problème ou usage',
    search_aria_submit: 'Rechercher',
    search_submit_label: 'Rechercher',
    search_loading_for: 'Recherche de « {term} »…',
    search_view_all: 'Voir tous les résultats pour « {term} » →',

    // ── Sections de la page d’accueil (redesign Phase 1) ─────────
    hero_split_aria: 'Hero',
    hero_split_eyebrow: 'Trouvailles · Moins de 200 $',
    hero_split_heading: 'Magasinez maison, tech, animaux, cadeaux et plus.',
    hero_split_body:
      'Trouvailles haut de gamme sous 200 $ — fournisseurs vérifiés, livraison transparente, retours de 30 jours.',
    hero_split_cta_primary: 'Voir les meilleures ventes',
    hero_split_cta_secondary: 'Tout parcourir',
    hero_split_trust:
      'Options de livraison à la caisse · Retours sous 30 jours · Soutien humain',
    hero_trust_returns: 'Retours sous 30 jours',
    hero_trust_checkout: 'Paiement Shopify sécurisé',
    hero_trust_canada: 'Petit catalogue actif',
    hero_showcase_bar: 'Magasiner par département →',

    shop_by_category_aria: 'Magasiner par catégorie',
    shop_by_category_eyebrow: 'Catégories',
    shop_by_category_heading: 'Trouvez votre bonheur',
    shop_by_category_shop_cta: 'Magasiner',

    best_sellers_aria: 'Meilleures ventes',
    best_sellers_eyebrow: 'Les plus aimés',
    best_sellers_heading: 'Meilleures ventes de la semaine',
    best_sellers_see_all: 'Tout voir',

    lifestyle_banner_aria: 'Art de vivre',
    lifestyle_shop_eyebrow: 'Explorer',
    lifestyle_shop_heading: 'Magasiner par style de vie',
    lifestyle_shop_sub:
      'Commencez par le moment, puis trouvez la catégorie qui vous convient.',
    lifestyle_shop_home_title: 'Améliorations maison qui valent le coup',
    lifestyle_shop_home_body:
      'Des améliorations utiles pour les pièces et les routines de chaque jour.',
    lifestyle_shop_motion_title: 'Au quotidien',
    lifestyle_shop_motion_body:
      'Des trouvailles pratiques pour sortir, rester actif et bouger.',
    lifestyle_shop_family_title: 'Jeu et famille',
    lifestyle_shop_family_body:
      'Des choix réfléchis pour le jeu, les petites routines et les moments partagés.',
    lifestyle_shop_cta: 'Voir la sélection →',
    lifestyle_banner_eyebrow: 'Slow living',
    lifestyle_banner_heading: 'Trouvez votre prochain coup de cœur.',
    lifestyle_banner_body:
      'Trouvailles et solutions du quotidien qui méritent leur place dans une vraie maison, cuisine ou sac de voyage.',
    lifestyle_banner_cta: 'Voir les trouvailles',

    new_arrivals_aria: 'Nouveautés',
    new_arrivals_eyebrow: 'Tout neufs',
    new_arrivals_heading: 'Nouveautés',
    new_arrivals_see_all: 'Tout voir',
    new_arrivals_scroll_left: 'Défiler à gauche',
    new_arrivals_scroll_right: 'Défiler à droite',

    sports_aria: 'Sports et plein air',
    sports_eyebrow: 'Bougez',
    sports_heading: 'Sports & plein air',
    sports_see_all: 'Magasiner',

    world_cup_aria: 'Maillots et équipement de soccer',
    world_cup_eyebrow: 'Représentez votre pays',
    world_cup_heading: 'Le maillot de chez vous, où que ce soit.',
    world_cup_see_all: 'Voir tout le soccer',

    rail_scroll_left: 'Défiler à gauche',
    rail_scroll_right: 'Défiler à droite',

    trust_bar_aria: 'Pourquoi magasiner chez nous',
    trust_bar_shipping_h: 'Livraison claire',
    trust_bar_shipping_sub: 'Options et coûts affichés à la caisse',
    trust_bar_returns_h: 'Retours sous 30 jours',
    trust_bar_returns_sub: 'Consultez la politique avant de commander',
    trust_bar_curated_h: 'Catalogue actif',
    trust_bar_curated_sub: 'Produits prêts à acheter aujourd’hui',

    home_reviews_aria: 'Avis des clients',
    home_reviews_eyebrow: 'Aimé par plus de 12 000 acheteurs',
    home_reviews_heading: 'Ce que disent nos clients',
    home_reviews_verified: 'Acheteur vérifié',
    home_reviews_quote_1_text:
      'La qualité est constante, la livraison rapide, et les retours sont simples. C’est pourquoi je reviens.',
    home_reviews_quote_1_author: 'Maya R. Toronto',
    home_reviews_quote_2_text:
      'J’ai trouvé un cadeau introuvable ailleurs. L’emballage était soigné.',
    home_reviews_quote_2_author: 'James P. Vancouver',
    home_reviews_quote_3_text:
      'Le service client répond vraiment. J’avais une question et j’ai eu une vraie réponse le jour même.',
    home_reviews_quote_3_author: 'Sophie L. Montréal',

    home_newsletter_aria: 'Infolettre',
    home_newsletter_eyebrow: 'Rejoignez la liste',
    home_newsletter_heading: 'Des nouvelles voyage, sans encombrement',
    home_newsletter_body:
      'Nouveautés, réassorts et ventes occasionnelles, dans votre boîte, jamais de spam.',
    home_newsletter_placeholder: 'vous@exemple.com',
    home_newsletter_submit: 'S’abonner',
    home_newsletter_promise: 'Pas de spam. Désabonnement en un clic.',

    home_roots_aria: 'Nos racines',
    home_roots_eyebrow: 'Les racines de Puchica',
    home_roots_heading: "D'Amérique centrale au monde entier.",
    home_roots_body:
      "Puchica, c'est ce qu'on dit quand quelque chose vous surprend. Un lever de soleil sur le lac Atitlán. Du café cultivé sur les pentes volcaniques. Des textiles tissés de la même manière depuis trois générations dans les hautes terres du Guatemala. D'Antigua au Honduras, nous apportons ce sentiment aux clients du monde entier.",
    home_roots_signature: 'Hecho con alma · Fait avec âme',

    // ── World map ─────────────────────────────────────────────────
    world_map_aria: 'Pays que nous servons',
    world_map_eyebrow: 'Mondial',
    world_map_heading: 'De nos racines à votre porte.',
    world_map_sub:
      'Puchica livre aux clients du monde entier. Touchez un repère pour voir ce qui nous relie.',

    home_shop_dept_aria: 'Magasiner par département',
    home_shop_dept_eyebrow: 'Tendance cette semaine',
    home_shop_dept_heading: 'Trouvailles haut de gamme, triées à la main.',
    home_shop_dept_body:
      'Trouvailles en audio, cuisine, fitness, maison et plein air — chaque produit provient d’un fournisseur vérifié.',
    home_dept_home: 'Maison & Cuisine',
    home_dept_electronics: 'Électronique',
    home_dept_apparel: 'Vêtements',
    home_dept_health: 'Santé & Soins',
    home_dept_pet: 'Animaux',
    home_dept_sports: 'Sports & Plein air',

    home_curate_aria: 'Notre sélection',
    home_curate_eyebrow: 'Pourquoi Puchica',
    home_curate_heading: 'Le bon stock, sans le casse-tête.',
    home_curate_step1_h: 'On part d’un vrai problème à résoudre.',
    home_curate_step1_b:
      'Nous travaillons avec des fournisseurs vérifiés partout dans le monde pour vous offrir des produits qui valent votre argent.',
    home_curate_step2_h: 'On prix juste.',
    home_curate_step2_b:
      'Nous comparons le prix au coût livré et ne mettons en avant que les produits pouvant soutenir une offre viable.',
    home_curate_step3_h: 'On livre vite.',
    home_curate_step3_b:
      'Les options de livraison sont confirmées au paiement selon les articles et la destination. Notre équipe est là pour vous aider avant ou après la commande.',

    hero_store_stat_products: 'Catalogue',
    hero_store_stat_departments: 'Départements',
    hero_store_stat_shipping: 'Livraison affichée',
    hero_storefront_title: 'Façons populaires de magasiner',
    shop_by_category_sub:
      'Commencez avec les départements en ligne et prêts à magasiner.',

    // ── PDP route meta (localized) ────────────────────────────────
    pdp_meta_title_suffix: ' – Puchica',
    pdp_meta_description_fallback:
      'Découvrez {title} chez Puchica. Les options de livraison pour le Canada sont affichées au paiement.',
  },

  // ════════════════════════════════════════════════════════════════
  es: {
    announce_offer: 'Organizadores de viaje prácticos para empacar mejor',
    announce_freeship:
      'Las opciones de envío se muestran al finalizar la compra',
    announce_cta: 'Ver organizadores de viaje',
    offer_first15:
      'Las opciones y los plazos de envío se muestran al pagar.',
    announce_region_aria: 'Anuncios del sitio',

    footer_tagline:
      'Organizadores de viaje prácticos, detalles claros y envío mostrado al pagar.',
    footer_accepted_payments: 'Pagos aceptados',
    footer_secure: 'Pago seguro con Shopify, cifrado y conforme con PCI',
    footer_shop: 'Tienda',
    footer_care: 'Atención al cliente',
    footer_about: 'Sobre nosotros',
    footer_faq: 'Preguntas frecuentes',
    footer_shipping_info: 'Envíos y entrega',
    footer_contact: 'Contáctanos',
    footer_search: 'Buscar',
    footer_policies: 'Políticas',
    footer_shipping_policy: 'Política de envío',
    footer_refund_policy: 'Política de reembolso',
    footer_privacy_policy: 'Política de privacidad',
    footer_terms_of_service: 'Términos del servicio',
    footer_subscription_policy: 'Política de suscripción',
    footer_terms: 'Términos del servicio',
    footer_newsletter_title: 'Unéte a nuestro boletín',
    footer_newsletter_copy:
      'Ofertas exclusivas y novedades, directamente en tu correo.',
    footer_email_placeholder: 'Ingresa tu correo',
    footer_newsletter_email_aria: 'Correo electrónico',
    footer_newsletter_subscribe_aria: 'Suscribirse',
    footer_newsletter_submitting: '…',

    footer_newsletter_ok: '¡Gracias! Ya estás en la lista.',
    footer_rights: 'Todos los derechos reservados.',
    footer_privacy: 'Política de privacidad',

    nav_all_products: 'Todos los productos',
    nav_best_sellers: 'Más vendidos',
    nav_trending: 'Tendencias',
    nav_gifts: 'Regalos por menos de $25',
    nav_shop: 'Tienda',
    nav_new_arrivals: 'Novedades',
    nav_sale: 'Ofertas',
    nav_explore: 'Explorar',
    nav_about: 'Nosotros',
    nav_contact: 'Contacto',
    nav_faq: 'Preguntas frecuentes',
    nav_shipping: 'Envío',

    header_dismiss_aria: 'Cerrar anuncio',
    header_menu_open: 'Abrir menú',
    header_menu_close: 'Cerrar menú',
    header_search_open: 'Abrir búsqueda',
    header_search_close: 'Cerrar búsqueda',
    header_account_aria: 'Cuenta',
    header_cart_open: 'Abrir carrito',
    header_cart_close: 'Cerrar carrito',

    hero_eyebrow: 'Hallazgos · Menos de C$200',
    hero_title: 'Todo lo que vale.',
    hero_sub:
      'Una selección de hallazgos de alto valor que los clientes repiten — proveedores verificados, precios transparentes, envío confirmado al pagar.',
    hero_cta_shop: 'Comprar ahora →',
    hero_cta_browse: 'Ver todo',
    hero_stat_products: 'Productos',
    hero_stat_shipping: 'Envío gratis',
    hero_stat_returns: 'Devoluciones fáciles',
    hero_pause_label: 'Pausar presentación',
    hero_play_label: 'Reproducir presentación',
    hero_featured_label: 'Ver producto destacado: {title}',
    hero_featured_text: 'Destacado: {title}',

    ticker_products: 'Catálogo activo',
    ticker_new_drops: 'Novedades cada semana',
    ticker_free_shipping: 'Envío gratis en Canadá',
    ticker_returns: 'Devoluciones en 30 días',
    ticker_ships: 'Envío rápido',
    ticker_handpicked: 'Seleccionado, nunca aleatorio',
    ticker_real_value: 'Valor real. Hallazgos reales.',
    ticker_secure: 'Pago seguro',

    swiper_eyebrow: 'Tendencias',
    swiper_title: 'Los mejores picks de esta semana',
    swiper_pause_label: 'Pausar reproducción automática',
    swiper_resume_label: 'Reanudar reproducción automática',
    swiper_slides_aria: 'Presentación de selecciones',
    swiper_stats_aria: 'Destacados de la tienda',
    swiper_carousel_aria: 'Carrusel de productos',
    swiper_carousel_nav_aria: 'Navegación del carrusel',
    swiper_prev_aria: 'Producto anterior',
    swiper_next_aria: 'Producto siguiente',
    swiper_dots_aria: 'Ir al producto',
    match_section_aria: 'Matchmaker de productos por deslizamiento',
    match_deck_aria: 'Mazo de tarjetas de productos',
    match_pass_aria: 'Pasar este producto',
    match_super_aria: 'Super deslizamiento – Agregar al carrito',
    match_like_aria: 'Me gusta este producto',
    rack_section_aria: 'Selecciones premium',
    rack_scroll_aria: 'Desplazar productos',
    rack_scroll_left_aria: 'Desplazar a la izquierda',
    rack_scroll_right_aria: 'Desplazar a la derecha',
    gift_section_aria: 'Encontrar un regalo por presupuesto',
    gift_card_aria: 'Comprar regalos {label}',
    arrivals_section_aria: 'Novedades',
    arrivals_scroll_aria: 'Desplazar novedades',
    arrivals_badge_aria: 'Producto nuevo',
    cat_section_aria: 'Comprar por categoría',
    mood_section_aria: 'Comprar por estilo de vida',
    review_section_aria: 'Reseñas de clientes',
    fresh_section_aria: 'Nuevos hallazgos',
    fresh_scroll_aria: 'Desplazar nuevos hallazgos',
    banner_section_aria: 'Más vendidos',
    catalog_section_aria: 'Explorar el catálogo completo',
    catalog_count_aria: 'Más de 6,000 productos',
    trust_section_aria: 'Por qué Puchica',
    newsletter_section_aria: 'Suscripción al boletín',

    // ── Shipping reach ────────────────────────────────────────────
    ship_eyebrow: 'A dónde enviamos',
    ship_title: 'Enviamos a cualquier parte.',
    ship_sub:
      'Enviamos a países de todo el mundo. Estés donde estés, te haremos llegar tu pedido.',
    ship_cta: 'Pregunta por tu país',
    ship_section_aria: 'Destinos de envío',
    ship_compact_title: 'Cobertura por región',
    ship_cities_label: 'ciudades',
    ship_region_na: 'América del Norte',
    ship_region_sa: 'América del Sur',
    ship_region_uk: 'Reino Unido',
    ship_region_eu: 'Europa',
    ship_region_ap: 'Asia-Pacífico',
    ship_region_me: 'Medio Oriente',
    ship_region_af: 'África',
    ship_region_oc: 'Oceanía',
    ship_region_na_sub: 'Canadá y EE. UU.',
    ship_region_sa_sub: 'De México a Argentina',
    ship_region_uk_sub: 'Inglaterra, Escocia, Gales, Irlanda del Norte',
    ship_region_eu_sub: 'Europa continental',
    ship_region_ap_sub: 'Japón, Australia, Singapur y más',
    ship_region_me_sub: 'EAU, Arabia, Israel, Catar',
    ship_region_af_sub: 'De Marruecos a Sudáfrica',
    ship_region_oc_sub: 'Australia, Nueva Zelanda, Fiyi',

    // ── Página de envío ────────────────────────────────────────────
    ship_hero_eyebrow: 'Envío y Entrega',
    ship_hero_title_main: 'Envío y',
    ship_hero_title_em: 'Entrega.',
    ship_hero_sub:
      'La disponibilidad, los plazos y el coste de entrega se confirman al finalizar la compra según los artículos y el destino.',
    ship_hero_cta: 'Ver la selección de viaje',
    ship_launch_hero_sub:
      'Una sola tienda norteamericana con precios según el mercado y opciones de entrega confirmadas al pagar.',
    ship_jump: 'Ver cómo se confirma la entrega',
    ship_launch_regions_eye: 'Tienda norteamericana',
    ship_launch_regions_title: 'Dos mercados. Una tienda enfocada.',
    ship_launch_regions_sub:
      'Elige Canadá o Estados Unidos para ver los precios del mercado. La entrega aún depende de los artículos y la dirección.',
    ship_launch_rates_eye: 'Antes de pagar',
    ship_launch_rates_title: 'Comprueba la entrega antes del pago',
    ship_launch_rates_sub:
      'El pago muestra las opciones disponibles para los artículos y el destino seleccionados.',
    ship_market_ca_name: 'Canadá · CAD',
    ship_market_ca_detail:
      'Precios en CAD; el checkout confirma si los artículos seleccionados pueden entregarse.',
    ship_market_us_name: 'Estados Unidos · USD',
    ship_market_us_detail:
      'Precios en USD; el checkout confirma si los artículos seleccionados pueden entregarse.',
    ship_check_destination_title: 'Comprueba tu destino',
    ship_check_destination_body:
      'Ingresa tu dirección al pagar para ver las opciones disponibles para tu pedido.',
    ship_check_destination_eta: 'Disponibilidad visible antes del pago',
    ship_check_items_title: 'Revisa los artículos del carrito',
    ship_check_items_body:
      'Las opciones pueden variar según el producto, la variante y el destino.',
    ship_check_items_eta: 'El pago confirma las opciones del pedido',
    ship_check_tracking_title: 'Sigue tu pedido',
    ship_check_tracking_body:
      'Cuando haya un servicio con seguimiento, recibirás los detalles después del envío.',
    ship_check_tracking_eta:
      'Consulta la política de envíos para obtener ayuda',
    ship_check_duties_title: 'Aranceles y cargos de importación',
    ship_check_duties_body:
      'El destino puede aplicar aranceles, impuestos de importación, gastos de gestión o cargos del transportista. Puchica no cobra estos importes; cuando correspondan, son responsabilidad del cliente.',
    ship_check_duties_eta:
      'Cobrados por aduanas o el transportista cuando corresponda',
    ship_regions_eye: 'A dónde enviamos',
    ship_regions_title: 'La cobertura se amplía tras la validación.',
    ship_regions_sub:
      'Solo promocionamos destinos después de confirmar la cobertura del producto y del proveedor.',
    ship_rates_eye: 'Tarifas de envío',
    ship_rates_title: 'Envío claro antes del pago.',
    ship_rates_sub:
      'El checkout confirma los servicios, el costo y la estimación para los artículos y la dirección seleccionados.',
    ship_rates_canada_flag: 'CA',
    ship_rates_canada_title: 'Canadá',
    ship_rates_canada_body:
      'Los servicios y costos disponibles se muestran al pagar para el pedido seleccionado.',
    ship_rates_canada_eta: 'Estimación mostrada al pagar',
    ship_rates_canada_badge: '',
    ship_rates_us_flag: 'US',
    ship_rates_us_title: 'Estados Unidos',
    ship_rates_us_body:
      'La disponibilidad depende de los artículos, el carrito y el destino.',
    ship_rates_us_eta: 'Confirmar al pagar',
    ship_rates_us_badge: '',
    ship_rates_intl_flag: 'INTL',
    ship_rates_intl_title: 'Internacional',
    ship_rates_intl_body:
      'La entrega internacional no se promociona actualmente. Confirma la disponibilidad al pagar.',
    ship_rates_intl_eta: 'Sin promesa general de entrega',
    ship_rates_intl_badge: '',
    ship_how_eye: 'Cómo funciona',
    ship_how_title: 'Revisa los detalles antes de pedir.',
    ship_how_1_title: 'Haz tu pedido',
    ship_how_1_body:
      'Explora el catálogo, añade al carrito y paga de forma segura. Recibirás una confirmación de pedido al instante.',
    ship_how_2_title: 'Tu pedido se procesa',
    ship_how_2_body:
      'Los tiempos de procesamiento y entrega dependen del producto y servicio seleccionados. Las actualizaciones disponibles se envían durante el proceso.',
    ship_how_3_title: 'Entregado en tu puerta',
    ship_how_3_body:
      'Usa la estimación mostrada al pagar para los artículos y la dirección seleccionados.',
    ship_track_eye: 'Rastrea tu pedido',
    ship_track_title: 'Sigue las actualizaciones disponibles.',
    ship_track_body_1:
      'Cuando haya un servicio con seguimiento, los datos se enviarán después del envío.',
    ship_track_body_2:
      'Usa el enlace del correo de envío o contacta al soporte con tu número de pedido.',
    ship_track_cta: 'Contactar soporte',
    ship_cta_title: '¿Listo para pedir?',
    ship_cta_sub:
      'Compra hallazgos y confirma el envío para tu dirección al pagar.',
    ship_cta_browse: 'Ver todo',

    match_eyebrow: 'Descubrimiento personalizado',
    match_title: 'Puchica Match.',
    match_sub:
      'Desliza a la derecha para <strong>Me gusta</strong>, a la izquierda para <strong>Pasar</strong>, o hacia arriba para <strong>Super Deslizamiento &amp; Añadir al carrito</strong>!',
    match_empty_title: '¡No hay más artículos por hoy!',
    match_empty_body:
      'Has visto todos los artículos de tendencia y te han gustado {count}.',
    match_reset: 'Volver a deslizar',
    match_browse: 'Ver todo',
    match_stamp_like: 'ME GUSTA',
    match_stamp_nope: 'NO',
    match_stamp_super: 'SUPER ATC',

    rack_eyebrow: 'Hogar & Cocina',
    rack_title: 'Mejora tu espacio.',

    gift_eyebrow: 'Ideas de regalo',
    gift_title: 'Encuentra el regalo perfecto.',
    gift_sub:
      'Más de 6.000 opciones para todos los presupuestos. Algo para cada persona en tu lista.',
    gift_under25_label: 'Menos de $25',
    gift_under25_sub: 'Pequeños gustos, grandes sonrisas',
    gift_25_50_label: '$25 – $50',
    gift_25_50_sub: 'Regalos perfectos',
    gift_50_100_label: '$50 – $100',
    gift_50_100_sub: 'Opciones premium',
    gift_100_label: '$100+',
    gift_100_sub: 'Sin límites',

    arrivals_eyebrow: 'Exterior & Jardín',
    arrivals_title: 'Sal afuera.',
    arrivals_see_all: 'Ver todas las novedades',
    arrivals_badge: 'Nuevo',

    // ── For You ───────────────────────────────────────────────────
    foryou_eyebrow: 'Seleccionado para ti',
    foryou_title: 'Imagínalo así.',
    foryou_sub:
      'Una selección con estilo propio, cada foto creada para estos productos.',
    foryou_cta: 'Ver la selección',
    foryou_section_aria: 'Vitrina Para ti',

    cat_eyebrow: 'Comprar por categoría',
    cat_title: 'Encuentra lo tuyo.',
    cat_home_tagline: 'Tu espacio, elevado.',
    cat_beauty_tagline: 'Siéntelo desde adentro.',
    cat_tech_tagline: 'Más inteligente, cada día.',
    cat_outdoor_tagline: 'Sal a explorarlo.',
    cat_pet_tagline: 'Ellos también lo merecen.',
    cat_fallback_tagline: 'Curado con cuidado.',
    cat_shop_now: 'Comprar →',
    cat_cell_aria: 'Comprar {title}',

    mood_eyebrow: 'Hecho para tu vida',
    mood_title: 'Tendencia. Verificado. Entregado.',
    mood_home_label: 'Hogar & Decoración',
    mood_home_title: 'Tu hogar merece más.',
    mood_home_sub:
      'Hallazgos y mejoras que hacen que una habitación real se sienta mejor.',
    mood_home_cta: 'Mejora tu espacio →',
    mood_beauty_label: 'Belleza & Cuidado personal',
    mood_beauty_title: 'Cuídate.',
    mood_beauty_sub:
      'Productos de cuidado de la piel, bienestar y cuidado personal que realmente funcionan, elegidos por personas que los usan.',
    mood_beauty_cta: 'Date un gusto →',
    mood_tech_label: 'Tech & Gadgets',
    mood_tech_title: 'Trabaja mejor, juega más duro.',
    mood_tech_sub:
      'Accesorios, herramientas y gadgets que mejoran genuinamente tu día. Sin trucos.',
    mood_tech_cta: 'Poténciate →',

    review_eyebrow: 'Lo que dice la gente',
    review_title: 'Compradores reales. Opiniones reales.',
    review_1_quote:
      'Pedí tres veces este mes. La calidad es siempre excelente y el envío es rápido.',
    review_2_quote:
      'Encontré exactamente lo que buscaba, y mucho más. Es mi nuevo lugar favorito para el hogar.',
    review_3_quote:
      'La selección es genuinamente buena. Todo parece haber sido elegido por alguien con buen gusto.',

    banner_eyebrow: 'Más vendidos',
    banner_title: 'Los que la gente no puede dejar de comprar.',
    banner_sub:
      'Hallazgos de alto valor, seleccionados a mano para la selección actual.',
    banner_cta: 'Ver todos los más vendidos',

    catalog_body:
      'Un catálogo enfocado de hallazgos de alto valor — proveedores verificados, precios transparentes, envío confirmado al pagar.',
    catalog_cta_browse: 'Ver todo →',
    catalog_cta_search: 'Buscar en el catálogo',

    trust_shipping_title: 'Envío gratis',
    trust_shipping_sub: 'En pedidos a Canadá',
    trust_returns_title: 'Devoluciones en 30 días',
    trust_returns_sub: 'Sin preguntas, sin complicaciones',
    trust_secure_title: 'Pago seguro',
    trust_secure_sub: 'Cifrado y conforme con PCI',
    trust_handpicked_title: 'Solo seleccionados',
    trust_handpicked_sub: 'Construido alrededor de hallazgos',

    newsletter_pill: 'Unéte al club',
    newsletter_title: 'Recibe lo mejor primero.',
    newsletter_sub:
      'Novedades, ofertas exclusivas y picks que no encontrarás en otro lugar, directo a tu correo. Sin spam, cancela cuando quieras.',
    newsletter_done: '¡Ya estás dentro! Revisa tu bandeja de entrada.',
    newsletter_email_label: 'Correo electrónico',
    newsletter_placeholder: 'tu@correo.com',
    newsletter_joining: 'Uniéndome…',
    newsletter_subscribe: 'Suscribirme',

    counter_products: 'Productos',
    counter_collections: 'Colecciones',
    counter_categories: 'Categorías',
    counter_canadian: 'Seleccionado',

    explore_home: 'Inicio',
    explore_breadcrumb: 'Explorar catálogo',
    explore_eyebrow: 'Descubre la colección',
    explore_title: 'Explorar el catálogo completo',
    explore_showing: 'Mostrando',
    explore_product_singular: 'producto',
    explore_product_plural: 'productos',
    explore_across: 'en',
    explore_count_active_cat_singular: 'categoría activa',
    explore_count_active_cat_plural: 'categorías activas',
    explore_filter_title: 'Filtrar por categoría',
    explore_filter_clear: 'Borrar todo',
    explore_empty_title: 'No se encontraron productos',
    explore_empty_body:
      'Intenta ajustar tus categorías seleccionadas o borra los filtros.',
    explore_empty_reset: 'Restablecer filtros',
    explore_view_details: 'Ver detalles',
    explore_cat_home: 'Hogar & Cocina',
    explore_cat_beauty: 'Belleza & Cuidado',
    explore_cat_tech: 'Electrónica & Tech',
    explore_cat_pet: 'Mascotas',
    explore_cat_outdoor: 'Jardín & Exterior',

    breadcrumb_aria: 'Ruta de navegación',
    col_filters_aria: 'Filtros',
    search_trending_label: 'Búsquedas populares',
    search_recent_label: 'Vistos recientemente',
    search_trending_terms:
      'pistola de masaje, tira LED, termo, hervidor, molinillo de café, cuerda de saltar',
    col_density_aria: 'Densidad de la cuadrícula',
    col_density_3_aria: 'Mostrar 3 por fila',
    col_density_4_aria: 'Mostrar 4 por fila',
    explore_cat_filter_aria: 'Filtros por categoría',
    breadcrumb_home: 'Inicio',
    breadcrumb_collections: 'Colecciones',
    breadcrumb_shop: 'Tienda',

    col_eyebrow: 'Colección',
    col_empty_title: 'Nada aquí todavía',
    col_empty_filtered: 'Ningún producto coincide con estos filtros.',
    col_clear_filters: 'Borrar filtros',
    col_empty_restocking:
      'Estamos reabasteciendo esta colección. Explora los hallazgos o vuelve pronto.',
    col_showing: 'Mostrando',
    col_showing_more: 'hasta ahora, carga más abajo',
    col_product_singular: 'producto',
    col_product_plural: 'productos',
    col_sort_by: 'Ordenar por',
    col_sort_featured: 'Destacados',
    col_sort_best: 'Más vendidos',
    col_sort_newest: 'Más recientes',
    col_sort_price_asc: 'Precio: menor a mayor',
    col_sort_price_desc: 'Precio: mayor a menor',
    col_filter_cat_label: 'Categoría:',
    col_filter_price_label: 'Precio:',
    col_filter_cat_heading: 'Categoría',
    col_filter_price_heading: 'Precio',
    col_filter_no_types: 'No hay subcategorías en esta colección.',
    col_price_under25: 'Menos de $25',
    col_price_25_50: '$25 – $50',
    col_price_50_100: '$50 – $100',
    col_price_100_plus: '$100 +',
    col_count_loading: 'Colección cargando',
    col_count_and_counting: 'y contando',
    col_count_of: 'de',
    col_brand_chip: 'Puchica',

    // ── Trending landing (homepage) ───────────────────────────────
    trending_eyebrow: 'Tendencias · Menos de $200',
    trending_title:
      'Hallazgos de moda por menos de $200 — productos prácticos con reseñas reales.',
    trending_sub:
      'Una selección concentrada de artículos de alto valor que los clientes siguen pidiendo: audio, cocina, estado físico, hogar y aire libre. Fotos reales, envío confirmado al pagar, sin suscripciones.',
    trending_hero_cta: 'Comprar la selección de moda',
    trending_hero_secondary: 'Ver el catálogo completo',
    trending_proof_secure_h: 'Pago seguro de Shopify',
    trending_proof_secure_s: 'Cifrado y conforme con PCI',
    trending_proof_shipping_h: 'Envío gratis en Canadá',
    trending_proof_shipping_s: 'En pedidos mayores a $50',
    trending_proof_photos_h: 'Fotos reales de los productos',
    trending_proof_photos_s: 'Enviado por proveedores verificados',
    trending_feature_spotlight_kicker: 'Más vendido #1',
    trending_feature_secondary_kicker: 'Más vendido #2',
    trending_feature_tertiary_kicker: 'Más vendido #3',
    trending_feature_cta: 'Comprar el #1',
    trending_grid_eyebrow: 'Destacados en este lanzamiento',
    trending_grid_title: 'Más hallazgos de moda para descubrir',
    trending_grid_sub:
      'Seleccionados del catálogo del lanzamiento — proveedores verificados, envío confirmado al pagar, devoluciones dentro de 30 días.',
    trending_grid_more_cta: 'Ver todos los hallazgos',
    trending_card_cta: 'Ver producto',
    trending_explore_eyebrow: 'Más del catálogo',
    trending_explore_title: 'Descubre el resto del lanzamiento',
    trending_explore_sub:
      'Cada producto que enviamos al pago, en un solo lugar. Desplázate para ver todo el lanzamiento.',

    all_breadcrumb: 'Todos los hallazgos',
    all_eyebrow: 'La tienda completa',
    all_title: 'Ver hallazgos',
    all_sub:
      'Explora hallazgos de alto valor en audio, cocina, fitness, hogar y aire libre.',
    all_empty_title: 'Próximos hallazgos en camino',
    all_empty_body:
      'El catálogo está cargando. Si el problema persiste, intenta recargar.',
    all_count_loading: 'Catálogo cargando',

    product_trust_shipping: 'Envío mostrado al pagar',
    product_trust_shipping_sub: 'para tu destino',
    product_trust_returns: 'Plazo de devolución de 30 días',
    product_trust_returns_sub:
      'consulta la política para conocer la elegibilidad',
    product_trust_secure: 'Pago seguro',
    product_trust_secure_sub: 'cifrado y cumple PCI',
    product_desc_eyebrow: 'Acerca de este producto',
    product_reco_see_all: 'Ver todo',
    product_perks_aria: 'Promesas de envío y servicio',
    product_highlights_eyebrow: 'Por qué este producto',
    product_care_eyebrow: 'Cuidado y envío',
    product_care_h: 'Hecho para durar, empaquetado con cuidado',
    product_stock_low: 'Solo quedan {stock}',
    product_badge_sold_out: 'Agotado',
    product_badge_save: 'Ahorra {pct}%',
    product_reviews_stub:
      'Las reseñas de clientes verificados aparecerán aquí a medida que se recopilen.',
    product_perk_packed: 'Opciones de envío confirmadas al pagar',
    product_perk_return: 'Revisa la política de reembolso antes de ordenar',
    product_perk_curated: 'Seleccionado por el equipo Puchica, nunca aleatorio',
    product_tab_description: 'Descripción',
    product_story_title: 'Por qué merece su espacio.',
    product_tab_specs: 'Especificaciones',
    product_tab_shipping: 'Envío & Devoluciones',
    product_desc_empty: 'Sin descripción adicional para este producto.',
    product_spec_vendor: 'Proveedor',
    product_spec_category: 'Categoría',
    product_spec_sku: 'SKU',
    product_specs_empty:
      'No hay especificaciones disponibles para este producto.',
    product_shipping_h: 'Envío',
    product_shipping_body:
      'La disponibilidad, el plazo y el costo de envío se confirman al pagar según los artículos seleccionados y tu destino. Cuando haya un servicio con seguimiento, los detalles se envían después de que el proveedor despache tu pedido.',
    product_returns_h: 'Devoluciones',
    product_returns_body:
      'Revisa la política de reembolso antes de ordenar. La elegibilidad y las instrucciones de devolución dependen del artículo y del pedido; contacta a soporte con tu número de pedido si necesitas ayuda.',
    product_help_h: '¿Necesitas ayuda?',
    product_help_body:
      'Envía tu pregunta sobre el producto o pedido con los detalles que necesitamos para ayudarte.',
    product_help_contact_link: 'página de contacto',
    product_share_label: 'Compartir:',
    product_share_btn: 'Compartir',
    product_copy_link: 'Copiar enlace',
    product_link_copied: 'Enlace copiado',
    product_reco_title: 'También te puede interesar',
    product_recently_viewed_title: 'Vistos recientemente',
    product_add_to_cart: 'Agregar al carrito',
    product_price_from: 'Desde',
    product_sold_out: 'Agotado',
    product_notify_label: 'Notificarme cuando esté disponible',
    product_notify_placeholder: 'tu@correo.com',
    product_notify_btn: 'Notificarme',
    product_notify_ok:
      'Gracias, te avisaremos por correo cuando vuelva a estar disponible.',
    product_notify_error: 'Algo salió mal. Por favor intenta de nuevo.',

    atc_added: 'Agregado ✓',
    atc_out_of_stock: 'Agotado',
    atc_adding: 'Agregando…',

    search_articles: 'Artículos',
    search_pages: 'Páginas',
    search_products: 'Productos',
    search_empty: 'Sin resultados. Intenta con otro término de búsqueda.',
    search_articles_aria: 'Resultados de artículos',
    search_pages_aria: 'Resultados de páginas',
    search_products_aria: 'Resultados de productos',
    card_view_details: 'Ver detalles',
    card_choose_options: 'Elegir opciones',
    card_swatches_aria: 'Opciones del producto',
    card_quick_add_aria: 'Añadir rápido',

    // ── Chrome de encabezado / navegación ───────────────────────
    nav_shop_all: 'Comprar todo',
    nav_best_sellers_short: 'Más vendidos',
    nav_new_arrivals_short: 'Novedades',
    nav_gift_guide: 'Guía de regalos',
    nav_about_short: 'Nosotros',
    nav_contact_short: 'Contacto',
    megamenu_trigger: 'Tienda',
    megamenu_panel_aria: 'Comprar por categoría',
    megamenu_error_body: 'No pudimos cargar las categorías en este momento.',
    megamenu_error_cta: 'Ver todo →',
    megamenu_tile_cta: 'Comprar →',
    megamenu_intent_heading: 'Comprar por categoría',
    megamenu_intent_home_title: 'Más vendidos',
    megamenu_intent_home_body:
      'Audio, cocina, condición física, hogar y aire libre — los hallazgos que los clientes repiten.',
    megamenu_intent_cable_title: 'Tendencias top',
    megamenu_intent_cable_body:
      'Mantén cordones y tecnología diaria fáciles de encontrar.',
    megamenu_intent_travel_title: 'Todas las categorías',
    megamenu_intent_travel_body:
      'Empaque, equipaje y transporte del día a día.',
    megamenu_edit_eyebrow: 'Empezar aquí',
    megamenu_edit_title:
      'Productos populares de alto valor por menos de 200 $ CAD.',
    megamenu_edit_body:
      'Soluciones para almacenaje bajo el fregadero, cables, empaque y transporte del día a día.',
    megamenu_trust_shipping: 'Opciones de envío mostradas al pagar',
    megamenu_trust_refund: 'Política de reembolso disponible',
    megamenu_tagline_phone_case: 'Fundas, agarres, protección.',
    megamenu_tagline_home_essentials:
      'Audio, cocina, decoración, almacenamiento.',
    megamenu_tagline_home_kitchen: 'Cocina, almacenamiento, decoración.',
    megamenu_tagline_electronics_accessories: 'Cables, cargadores, soportes.',
    megamenu_tagline_apparel_accessories: 'Bolsos, sombreros, wearables.',
    megamenu_tagline_health_wellness: 'Piel, aroma, cuidado.',
    megamenu_tagline_sports_outdoors: 'Equipo, fitness, deporte.',
    megamenu_tagline_pet_finds: 'Juguetes, camas, cosas para ellos.',
    megamenu_tagline_pet_supplies: 'Juguetes, camas, cosas para ellos.',
    megamenu_tagline_automotive: 'Interior, herramientas, gadgets.',
    megamenu_tagline_tools_home_improvement: 'Reparar, construir, terminar.',
    megamenu_tagline_beauty_personal_care: 'Maquillaje, uñas, autocuidado.',
    megamenu_tagline_toys_games: 'Jugar, aprender, coleccionar.',
    megamenu_tagline_home_decor: 'Pared, luz, acentos.',
    megamenu_tagline_office_school_supplies:
      'Escritorio, papel, imprescindibles.',
    megamenu_tagline_baby_nursery: 'Alimentación, decoración, confort.',
    megamenu_tagline_outdoor_garden: 'Jardín, patio, exterior.',
    megamenu_tagline_best_sellers: 'Los favoritos de todos.',
    megamenu_tagline_trending_finds: 'Lo que está de moda ahora.',
    megamenu_tagline_gifts_under_25: 'Buenos regalos, poco presupuesto.',
    pillnav_aria: 'Secciones de la página',
    pillnav_trending: 'Tendencias',
    pillnav_home_kitchen: 'Hogar & Cocina',
    pillnav_outdoor: 'Exterior',
    pillnav_categories: 'Categorías',
    pillnav_best_sellers: 'Más vendidos',
    pillnav_about_us: 'Sobre nosotros',

    // ── Banner de paralaje (banda de marca en el inicio) ───────
    parallax_aria: 'Banner de marca',
    parallax_title: '¿Cuál es tu cosa? La tenemos.',
    parallax_sub: 'Docenas de colecciones. Una sola tienda canadiense.',
    parallax_cta: 'Explorar por categoría →',

    // ── Banda de tendencias ─────────────────────────────────────
    ticker_section_aria: 'Productos en tendencia',
    ticker_label: 'Tendencias',

    // ── Vitrina de colecciones (inicio) ─────────────────────────
    showcase_section_aria: 'Vitrina de colecciones',
    showcase_heading: 'Explorar por categoría',
    showcase_sub: '{count} colecciones. {pct} % del catálogo cubierto.',
    showcase_eyebrow: 'Colección {n}',
    showcase_desc:
      'Descubre nuestra selección de {title}, productos seleccionados con envío gratis en Canadá.',
    showcase_cta: 'Comprar {title} →',

    // ── 404 / ruta catch-all ────────────────────────────────────
    notfound_title: 'No pudimos encontrar esa página',
    notfound_sub:
      'El enlace {path} no existe en Puchica. Puede haber sido movido, renombrado, o nunca existió. Prueba una de estas opciones:',
    notfound_popular: 'Colecciones populares',
    notfound_best: 'Más vendidos →',
    notfound_new: 'Novedades →',
    notfound_all_collections: 'Todas las colecciones →',
    notfound_all_catalog: 'Catálogo completo →',
    notfound_breadcrumb_current: 'Página no encontrada',
    notfound_breadcrumb_aria: 'Ruta de navegación',
    notfound_breadcrumb_home: 'Inicio',
    notfound_eyebrow: '404',

    // ── Carrito (cajón / página) ────────────────────────────────
    cart_section_aria: 'Cajón del carrito',
    cart_page_aria: 'Página del carrito',
    stats_aria: 'Estadísticas de la tienda',
    product_price_aria: 'Precio',
    pdp_3d_fallback_product: 'Producto',
    pdp_3d_viewer: 'visor 3D',
    pdp_3d_hint: 'Arrastra para rotar · desplaza para hacer zoom',
    cart_heading_aria: 'Artículos',
    cart_remove_region_aria: 'Quitar del carrito',
    cart_empty_title: 'Tu carrito está vacío.',
    cart_empty_body:
      'Empieza con un organizador práctico para tu próximo viaje.',
    cart_empty_cta_shop: 'Ver hallazgos',
    cart_empty_cta_best: 'Ver más vendidos',
    cart_empty_perks_aria: 'Por qué comprar con nosotros',
    cart_empty_perk_shipping: 'Opciones de envío mostradas al pagar',
    cart_empty_perk_returns: 'Devoluciones en 30 días',
    cart_ghost_notice:
      'Estos artículos no están disponibles en tu región ahora. Quítalos para vaciar tu carrito.',
    cart_freeship_progress_remaining: 'Añade {amount} para envío gratis',
    cart_freeship_progress_done: 'Has conseguido envío gratis',
    cart_freeship_threshold_label:
      'Envío gratis en pedidos superiores a {threshold}',
    cart_summary_title: 'Totales',
    cart_summary_subtotal: 'Subtotal',
    cart_summary_empty_btn: 'Agrega un artículo para continuar',
    cart_summary_checkout_btn: 'Continuar al pago',
    cart_checkout_unavailable:
      'El pago no está disponible temporalmente. Actualiza el carrito e inténtalo de nuevo.',
    cart_checkout_retry: 'Actualizar carrito',
    cart_summary_discounts_aria: 'Descuentos',
    cart_summary_discounts_h: 'Descuentos',
    cart_summary_remove_discount: 'Quitar descuento',
    cart_summary_remove: 'Quitar',
    cart_summary_promo_label: 'Código promocional',
    cart_summary_promo_placeholder: 'Ingresa el código',
    cart_summary_promo_apply_aria: 'Aplicar código de descuento',
    cart_summary_promo_apply: 'Aplicar',
    cart_summary_gift_aria: 'Tarjetas de regalo',
    cart_summary_gift_h: 'Tarjeta(s) de regalo aplicada(s)',
    cart_summary_gift_label: 'Tarjeta de regalo',
    cart_summary_gift_placeholder: 'Ingresa el código de la tarjeta',
    cart_summary_gift_apply_aria: 'Aplicar tarjeta de regalo',
    cart_summary_gift_apply: 'Aplicar',
    cart_summary_remove_gift_aria:
      'Quitar tarjeta de regalo terminada en {last}',
    cart_qty_aria: 'Cantidad',
    cart_qty_dec_aria: 'Disminuir cantidad',
    cart_qty_inc_aria: 'Aumentar cantidad',
    cart_qty_remove_aria: 'Quitar del carrito',
    cart_qty_remove: 'Quitar',
    cart_line_items_aria: 'Artículos de {title}',

    // ── Paginación (colecciones, búsqueda) ─────────────────────
    pager_aria: 'Paginación',
    pager_prev: 'Página anterior',
    pager_next: 'Cargar 12 más',
    pager_loading: 'Cargando más productos…',
    pager_end: 'Has llegado al final',
    pager_showing_one: 'Mostrando {n} producto',
    pager_showing_many: 'Mostrando {n} productos',

    // ── Galería de imágenes del PDP (3D, zoom, etc.) ───────────
    pdp_img_alt_fallback: 'Imagen del producto',
    pdp_thumbs_aria: 'Imágenes del producto',
    pdp_thumb_aria: 'Ver imagen {n} de {total}',
    pdp_3d_open_aria: 'Ver producto en 3D',
    pdp_3d_open: 'Ver en 3D',
    pdp_3d_close_aria: 'Volver a la vista de fotos',
    pdp_3d_close: '← Fotos',
    pdp_zoom_hint: 'Pasa el cursor para ampliar',
    pdp_prev_aria: 'Imagen anterior',
    pdp_next_aria: 'Imagen siguiente',

    // ── Formulario de producto ──────────────────────────────────
    product_qty_aria: 'Cantidad',
    product_qty_dec_aria: 'Disminuir cantidad',
    product_qty_inc_aria: 'Aumentar cantidad',
    product_save_aria: 'Guardar para después',
    product_unsave_aria: 'Quitar de guardados',
    product_stock_phrase: 'Solo quedan {stock}',

    // ── Embla / carrusels ───────────────────────────────────────
    embla_prev_aria: 'Anterior',
    embla_next_aria: 'Siguiente',
    embla_view_all: 'Ver todo →',
    embla_dots_aria: 'Indicadores de diapositiva',
    embla_dot_aria: 'Ir a la diapositiva {n}',

    // ── Chrome de cajones ───────────────────────────────────────
    aside_close_drawer: 'Cerrar cajón',
    aside_close: 'Cerrar',
    locale_change_aria: 'Cambiar mercado o idioma',
    locale_switching: 'Cambiando…',
    locale_switching_status: 'Actualizando el mercado y la moneda.',
    locale_market_label: 'Mercado',
    locale_market_ca: 'Canadá',
    locale_market_us: 'Estados Unidos',
    locale_market_unavailable: 'No disponible',
    locale_language_label: 'Idioma',
    mobile_market_language: 'Mercado e idioma',
    skip_to_content: 'Saltar al contenido principal',

    // ── ErrorBoundary raíz / 404 / búsqueda en error ──────────
    err_404_h: 'No pudimos encontrar esa página',
    err_500_h: 'Algo salió mal de nuestro lado',
    err_404_body:
      'Esa página puede haberse movido mientras preparamos el nuevo catálogo. Vuelve al inicio o contáctanos.',
    err_500_body:
      'Tuvimos un error inesperado al renderizar esta página. Inténtalo de nuevo o explora el catálogo abajo.',
    err_search_aria: 'Buscar hallazgos',
    err_search_placeholder: 'Buscar…',
    err_search_btn: 'Buscar',
    err_home: 'Volver al inicio',
    err_browse: 'Acerca de Puchica',
    err_contact: '¿Sigues atorado? Escríbenos a {email} y te ayudamos.',

    // ── Pie de página (resto) ───────────────────────────────────
    footer_social_aria: 'Redes sociales',
    footer_payments_aria: 'Métodos de pago aceptados',
    footer_payments_list_aria: 'Métodos de pago',
    footer_address: 'Puchica · Toronto, ON, Canadá',
    footer_email: 'hello@puchica.ca',
    footer_stats_aria: 'Destacados de la tienda',
    footer_stat_products: 'Catálogo',
    footer_stat_collections: 'Colecciones',
    footer_stat_shipping: 'Envío gratis',
    footer_stat_returns: 'Días de devolución',
    footer_copyright: '© {year} Puchica.',
    footer_legal_aria: 'Legal',
    footer_newsletter_cta: '→',
    social_instagram: 'Instagram',
    social_facebook: 'Facebook',
    social_tiktok: 'TikTok',

    // ── Menú móvil (cajón) ──────────────────────────────────────
    mobile_account: 'Cuenta',
    mobile_signin: 'Iniciar sesión',
    mobile_view_cart: 'Ver carrito',
    mobile_language: 'Idioma',
    mobile_customer_care: 'Atención al cliente',
    mobile_contact_us: 'Contáctanos',
    mobile_all_policies: 'Todas las políticas',
    mobile_announce_foot: 'Ofertas y novedades',
    mobile_announce_foot_sep: ' · ',

    // ── Reseñas de Judgeme ──────────────────────────────────────
    reviews_section_aria: 'Reseñas de clientes',
    reviews_heading: 'Reseñas de clientes',
    reviews_aria: '{rating} de 5 estrellas, {count} reseñas',
    reviews_count_one: '({count} reseña)',
    reviews_count_many: '({count} reseñas)',

    // ── Modal del boletín ───────────────────────────────────────
    np_aria: 'Únete a la lista de Puchica',
    np_close_backdrop: 'Cerrar',
    np_close_x: 'Cerrar',
    np_success_h: '¡Ya estás dentro!',
    np_success_body:
      'Recibirás novedades, reposiciones y ofertas ocasionales.',
    np_copy_btn: '¡Copiado!',
    np_copy_hint: 'Toca para copiar',
    np_success_cta: 'Empezar a comprar →',
    np_form_h: 'Únete a la lista de Puchica',
    np_form_body:
      'Recibe novedades, reposiciones y ofertas ocasionales. Cancela cuando quieras.',
    np_email_placeholder: 'tu@correo.com',
    np_email_aria: 'Correo electrónico',
    np_joining: 'Uniéndome…',
    np_submit: 'Suscribirse',
    np_dismiss: 'No gracias',

    // ── Tarjeta de producto (insignias, espacio) ───────────────
    badge_new_arrival: 'Novedad',
    badge_top_pick: 'Top Pick',
    badge_trending: 'Tendencia',
    badge_staff_pick: 'Selección del equipo',
    badge_sale: 'Oferta',
    badge_new: 'Nuevo',
    badge_best_seller: 'Más vendido',

    // ── Ruta de búsqueda + predictiva ──────────────────────────
    search_results_h: 'Resultados para {term}',
    search_results_h_fallback: 'Buscar',
    search_input_placeholder: 'Buscar productos…',
    search_submit: 'Buscar',
    search_zero_hint:
      'Busca por palabra clave o explora nuestras categorías más populares arriba.',
    pred_articles: 'Artículos',
    pred_collections: 'Colecciones',
    pred_pages: 'Páginas',
    pred_products: 'Hallazgos',
    pred_empty_title: 'Empieza a escribir para buscar',
    pred_empty_body:
      'Prueba categorías como "más vendidos", "hogar" o nombres específicos de productos.',
    pred_pill_best: 'Más vendidos',
    pred_pill_all: 'Todas las categorías',
    pred_pill_new: 'Novedades',
    pred_no_results_h: 'Ningún resultado para «{term}».',
    pred_no_results_body:
      'Prueba otra palabra clave o explora los más queridos.',

    // ── H1 de la página del carrito ─────────────────────────────
    cart_page_h: 'Carrito',
    cart_page_eyebrow: 'Tu carrito',
    cart_trust_aria: 'Por qué comprar con nosotros',
    cart_trust_returns: 'Devoluciones en 30 días',
    cart_trust_shipping: 'Envío en 24 horas',
    cart_trust_secure: 'Pago seguro',

    // ── Página índice de colecciones ───────────────────────────
    col_index_breadcrumb_aria: 'Ruta de navegación',
    col_index_breadcrumb_home: 'Inicio',
    col_index_breadcrumb_current: 'Colecciones',
    col_index_eyebrow: 'Explorar',
    col_index_h: 'Todas las colecciones',
    col_index_sub: 'Explora hallazgos por categoría, problema o uso.',
    col_index_count: 'Puchica',
    col_index_empty_h: 'Aún no hay colecciones',
    col_index_empty_body:
      'Las colecciones aparecerán aquí a medida que las agreguemos.',
    col_index_card_cta: 'Comprar la colección →',

    // ── Índice de políticas ─────────────────────────────────────
    policies_h: 'Políticas',
    policies_sub:
      'Envío, devoluciones, privacidad y términos para pedidos en Puchica.',

    // ── Enlace de vuelta de políticas ───────────────────────────
    policy_back: 'Volver a Políticas',
    refund_summary_title: 'Antes de enviar una devolución',
    refund_summary_start:
      'Contáctanos dentro de los 30 días posteriores a la entrega. No envíes nada hasta que confirmemos la elegibilidad, las instrucciones y la dirección de devolución.',
    refund_summary_shipping:
      'La responsabilidad del envío de devolución depende del motivo y de la política completa. Si un artículo llega dañado o incorrecto, escríbenos pronto con los datos del pedido.',
    refund_summary_timing:
      'Los reembolsos aprobados se envían al método de pago original después de recibir y revisar la devolución. El plazo bancario puede variar.',
    refund_summary_control:
      'Este resumen no reemplaza la política completa de Shopify que aparece abajo y que prevalece si existe alguna diferencia.',

    // ── Índice de blogs ─────────────────────────────────────────
    blogs_h: 'Blogs',

    // ── Área de cuenta (layout, perfil, pedidos, direcciones) ─
    account_welcome: 'Bienvenido, {firstName}',
    account_welcome_fallback: 'Bienvenido a tu cuenta.',
    account_welcome_anon: 'Detalles de la cuenta',
    account_nav_orders: 'Pedidos',
    account_nav_profile: 'Perfil',
    account_nav_addresses: 'Direcciones',
    account_signout: 'Cerrar sesión',
    account_profile_h: 'Mi perfil',
    account_profile_fieldset: 'Información personal',
    account_first_name: 'Nombre',
    account_last_name: 'Apellido',
    account_updating: 'Actualizando',
    account_update: 'Actualizar',
    account_addresses_h: 'Direcciones',
    account_addresses_create_legend: 'Crear dirección',
    account_addresses_empty: 'No tienes direcciones guardadas.',
    account_addresses_creating: 'Creando',
    account_addresses_create: 'Crear',
    account_addresses_existing: 'Direcciones existentes',
    account_addresses_saving: 'Guardando',
    account_addresses_save: 'Guardar',
    account_addresses_deleting: 'Eliminando',
    account_addresses_delete: 'Eliminar',
    account_address_first: 'Nombre',
    account_address_last: 'Apellido',
    account_address_company: 'Empresa',
    account_address_line1: 'Línea de dirección 1',
    account_address_line2: 'Línea de dirección 2',
    account_address_city: 'Ciudad',
    account_address_state: 'Estado / Provincia',
    account_address_zip: 'Código postal',
    account_address_country: 'País',
    account_address_phone: 'Teléfono',
    account_address_phone_aria: 'Número de teléfono',
    account_address_phone_ph: '+16135551111',
    account_address_default_label: 'Establecer como dirección predeterminada',
    account_orders_h: 'Pedidos',
    account_orders_meta: 'Pedidos',
    account_orders_empty_filtered:
      'No se encontraron pedidos que coincidan con tu búsqueda.',
    account_orders_empty_filtered_cta: 'Borrar filtros →',
    account_orders_empty: 'Aún no has hecho ningún pedido.',
    account_orders_empty_cta: 'Empezar a comprar →',
    account_orders_search_aria: 'Buscar pedidos',
    account_orders_filter_legend: 'Filtrar pedidos',
    account_orders_search_ph: 'N.° de pedido',
    account_orders_search_aria_named: 'Número de pedido',
    account_orders_conf_ph: 'N.° de confirmación',
    account_orders_conf_aria: 'Número de confirmación',
    account_orders_searching: 'Buscando',
    account_orders_search: 'Buscar',
    account_orders_clear: 'Borrar',
    account_orders_confirmation: 'Confirmación: {num}',
    account_orders_view: 'Ver pedido →',
    account_order_h: 'Pedido {name}',
    account_order_meta: 'Pedido {name}',
    account_order_placed: 'Realizado el {date}',
    account_order_confirmation: 'Confirmación: {num}',
    account_order_th_product: 'Producto',
    account_order_th_price: 'Precio',
    account_order_th_qty: 'Cantidad',
    account_order_th_total: 'Total',
    account_order_discounts: 'Descuentos',
    account_order_discount_line: '-{pct} % DE DESCUENTO',
    account_order_subtotal: 'Subtotal',
    account_order_tax: 'Impuestos',
    account_order_total: 'Total',
    account_order_shipping_h: 'Dirección de envío',
    account_order_no_shipping: 'No se ha definido una dirección de envío',
    account_order_status_h: 'Estado',
    account_order_status_na: 'N/D',
    account_order_status_link: 'Ver estado del pedido →',

    // ── Página Nosotros ───────────────────────────────────────────
    about_hero_eyebrow: 'Nuestra historia',
    about_hero_title_main: 'Una tienda de viaje más pequeña',
    about_hero_title_em: 'con mejores razones para comprar.',
    about_hero_sub:
      'Puchica es una tienda canadiense independiente que empieza con tres organizadores de viaje prácticos para ropa, cables y artículos de aseo.',
    about_hero_cta: 'Ver la selección de viaje →',
    about_stats_aria: 'Puchica en números',
    about_stat_products_num: 'Activo',
    about_stat_products_label: 'Productos seleccionados',
    about_stat_quality_num: '100 %',
    about_stat_quality_label: 'Control de calidad',
    about_stat_shipping_num: '$0',
    about_stat_shipping_label: 'Envío a Canadá',
    about_stat_returns_num: '30 días',
    about_stat_returns_label: 'Devoluciones sin complicaciones',
    about_mission_eye: 'Por qué existimos',
    about_mission_title:
      'En un espacio pequeño, cada cosa fuera de lugar se siente más grande.',
    about_mission_body_1:
      'Un cajón lleno, un cable enredado o una maleta sobrecargada puede complicar un día normal. Puchica ayuda a resolver esos pequeños problemas repetidos.',
    about_mission_body_2:
      'Puchica toma el enfoque opuesto. Nuestra primera selección tiene un solo objetivo: hacer que una maleta sea más fácil de usar. Cada producto debe tener una función clara y opciones comprensibles.',
    about_mission_card_text:
      'Útil primero. Claro antes del pago. Vale el espacio que ocupa.',
    about_how_eye: 'Qué merece un lugar',
    about_how_title: 'Cada producto debe justificar el espacio que ocupa.',
    about_how_1_title: 'Resuelve un problema específico',
    about_how_1_body:
      'Partimos de una función clara: separar la ropa, contener accesorios tecnológicos o mantener los artículos de aseo fáciles de encontrar.',
    about_how_2_title: 'Forma parte del mismo sistema de viaje',
    about_how_2_body:
      'Los tres productos funcionan juntos en una maleta, bolsa de fin de semana, bolsa de gimnasio o equipaje de mano.',
    about_how_3_title: 'Fácil de entender antes de comprar',
    about_how_3_body:
      'El producto debe tener un propósito, detalles y opciones claros. La disponibilidad, el costo y el plazo de entrega se confirman al pagar.',
    about_cats_eye: 'Lo que ofrecemos',
    about_cats_title: 'Hallazgos útiles. Una sola tienda.',
    about_cats_sub: 'En cada categoría que realmente importa en tu día a día.',
    about_cat_home_name: 'Hogar & Decoración',
    about_cat_home_sub: 'Audio, cocina, decoración, almacenamiento',
    about_cat_beauty_name: 'Belleza & Cuidado personal',
    about_cat_beauty_sub: 'Skincare, bienestar, cuidado personal',
    about_cat_tech_name: 'Tech & Gadgets',
    about_cat_tech_sub: 'Accesorios, herramientas, hogar inteligente',
    about_cat_outdoor_name: 'Exterior & Jardín',
    about_cat_outdoor_sub: 'Patio, camping, jardinería',
    about_cat_pet_name: 'Para mascotas',
    about_cat_pet_sub: 'Juguetes, equipo, aseo',
    about_cat_gift_name: 'Regalos',
    about_cat_gift_sub: 'Para todos en tu lista',
    about_promise_quote:
      'Cada producto Puchica ha sido probado a fondo por nuestro equipo. Ofrecemos la selección más curada de productos que podamos encontrar. Si no lo usaríamos nosotros, no será Puchica.',
    about_promise_attr: 'El equipo Puchica, Toronto ON',
    about_cta_title: '¿Listo para hacer espacio para días más tranquilos?',
    about_dept_title: 'Explorar la tienda',
    about_cta_sub:
      'Empieza con un hallazgo, un problema que quieres resolver o una categoría que te llame la atención.',
    about_cta_browse: 'Ver todos los hallazgos →',
    about_cta_contact: 'Contáctanos',

    // ── Página About, nuevas secciones (cronología, valores, equipo, raíces, departamentos) ──
    about_story_eye: 'Nuestra historia',
    about_story_title: 'Cómo nació Puchica.',
    about_story_sub: 'Algunos momentos que nos trajeron hasta aquí.',
    about_story_1_year: '2021',
    about_story_1_title: 'Empezó con un "puchica"',
    about_story_1_body:
      'Una pequeña idea nacida en Toronto: crear una tienda donde todo valga la pena comprar. Nada de relleno, nada de basura, nada de elecciones por algoritmo.',
    about_story_2_year: '2022',
    about_story_2_title: 'Los primeros 1.000 productos',
    about_story_2_body:
      'Un catálogo amplio hacía difícil explicar por qué cada producto pertenecía. Nos enfocamos en hallazgos de alto valor y construimos una red de proveedores confiable.',
    about_story_3_year: '2024',
    about_story_3_title: 'Una tienda enfocada en hallazgos',
    about_story_3_body:
      'El catálogo ahora se construye alrededor de hallazgos de alto valor — proveedores verificados, envío transparente al pagar y devolución de 30 días en cada pedido.',
    about_story_4_year: 'Hoy',
    about_story_4_title: 'Raíces en las Américas',
    about_story_4_body:
      'Desde nuestra base en Toronto hasta compradores en toda las Américas, la misión sigue siendo la misma: lo bueno, elegido a mano.',

    about_values_eye: 'Lo que defendemos',
    about_values_title: 'Nuestros valores.',
    about_values_sub: 'Las reglas detrás de cada elección que hacemos.',
    about_values_1_title: 'Curado, no abarrotado',
    about_values_1_body:
      'Decimos que no a mucho más de lo que decimos que sí. Un catálogo más pequeño y mejor le gana a uno gigante y mediocre.',
    about_values_2_title: 'Precios justos siempre',
    about_values_2_body:
      'Sin rebajas falsas, sin márgenes misteriosos. El precio que ves es honesto, y el valor es real.',
    about_values_3_title: 'Alma antes que tendencias',
    about_values_3_body:
      'Elegimos cosas que duran e importan, no lo que el algoritmo empuja esta semana.',
    about_values_4_title: 'Enviado por socios de confianza',
    about_values_4_body:
      'Cada pedido sale de un socio verificado en 24 horas, con una etiqueta de devolución prepagada en cada caja.',

    about_team_eye: 'Quiénes somos',
    about_team_title: 'Personas reales, selecciones reales.',
    about_team_sub:
      'Un equipo pequeño en Toronto, detrás de cada producto que pasa el filtro.',
    about_team_1_name: 'Mariana L.',
    about_team_1_role: 'Fundadora y Curadora',
    about_team_1_bio:
      'Elegimos productos que resuelven un problema real, vienen de proveedores verificados y se ganan su lugar en una colección enfocada.',
    about_team_2_name: 'Diego R.',
    about_team_2_role: 'Líder de Operaciones',
    about_team_2_bio:
      'Mantiene la red de proveedores funcionando y cada pedido enviado a tiempo. La razón por la que tu paquete llega rápido.',
    about_team_3_name: 'Sofía M.',
    about_team_3_role: 'Comunidad y Atención',
    about_team_3_bio:
      'Responde tus preguntas, escucha tus comentarios y se asegura de que la tienda siga mejorando.',

    about_roots_aria: 'Nuestras raíces centroamericanas',
    about_roots_eyebrow: 'De dónde viene el nombre',
    about_roots_heading: 'Puchica empieza con una sensación de sorpresa útil.',
    about_roots_body:
      '“Puchica” es una expresión centroamericana familiar de sorpresa, como la reacción que puede provocar una solución inesperadamente ingeniosa. Ese espíritu guía la marca: objetos prácticos que resuelven una molestia cotidiana sin añadir más desorden.',
    about_roots_signature:
      'Empresa canadiense. Pocos productos, utilidad clara.',
    about_hero_caption:
      'Pensado alrededor de lo que necesitas durante el viaje.',
    about_hero_image_alt: 'Ropa y artículos esenciales preparados para empacar',
    about_roots_image_alt:
      'Un tejido colorido y una vasija de cerámica pintada',
    about_standards_intro:
      'Un catálogo pequeño solo funciona si la razón de cada producto es fácil de explicar.',
    about_shop_eye: 'La selección de viaje',
    about_shop_title: 'Empieza con la parte del empaque que más te retrasa.',
    about_shop_home_title: 'Cubos de empaque',
    about_shop_cable_title: 'Organizador de cables',
    about_shop_travel_title: 'Organizador de aseo',
    about_shop_home_body: 'Separa la ropa en tres cubos con cierre.',
    about_shop_cable_body:
      'Mantén juntos cargadores, adaptadores y auriculares.',
    about_shop_travel_body:
      'Dale un lugar a botellas, herramientas de cuidado y cosméticos.',
    about_shop_all: 'Ver toda la selección de viaje',
    about_now_eye: 'Entrega más clara',
    about_now_title: 'Consulta tus opciones de entrega antes de pagar.',
    about_now_body:
      'El origen y el tiempo de envío pueden variar según el artículo y la dirección. El pago muestra las opciones disponibles para tu pedido antes de realizar el cobro.',
    about_now_email: '¿Preguntas? Escribe a hello@puchica.ca',
    about_delivery_panel_title: 'Vista previa de entrega',
    about_delivery_step_1_title: 'Elige un artículo',
    about_delivery_step_1_body: 'Agrega un hallazgo e ingresa tu dirección.',
    about_delivery_step_2_title: 'Consulta las opciones',
    about_delivery_step_2_body:
      'El pago calcula las alternativas para ese pedido.',
    about_delivery_step_3_title: 'Revisa antes de pagar',
    about_delivery_step_3_body: 'Compara el tiempo y el costo disponibles.',
    about_delivery_note: 'Detalles de entrega visibles antes del pago',
    about_fact_based_label: 'Ubicada en',
    about_fact_based_value: 'Canadá',
    about_fact_market_label: 'Mercado actual',
    about_fact_market_value: 'Clientes en Estados Unidos',
    about_fact_delivery_label: 'Antes del pago',
    about_fact_delivery_value:
      'Opciones de entrega visibles al finalizar la compra',

    about_depts_eye: 'Sigue explorando',
    about_depts_title: 'Comprar por departamento.',
    about_depts_sub:
      'Cada categoría, curada con el mismo cuidado. Elige por dónde empezar.',
    about_depts_shop_cta: 'Comprar →',
    about_depts_home: 'Hogar y Decoración',
    about_depts_beauty: 'Belleza y Cuidado',
    about_depts_tech: 'Tecnología y Gadgets',
    about_depts_outdoor: 'Exterior y Jardín',
    about_depts_pet: 'Para Mascotas',
    about_depts_gifts: 'Regalos',

    // ── Página de contacto ────────────────────────────────────────
    contact_hero_eyebrow: 'Contáctanos',
    contact_hero_title: 'Estamos aquí para ayudar.',
    contact_hero_sub:
      'Para ayuda con un pedido, incluye el número. Para un producto, incluye el nombre o enlace.',
    contact_channels_aria: 'Formas de contactarnos',
    contact_ig_title: 'DM en Instagram',
    contact_ig_body: 'Sigue demos y novedades.',
    contact_ig_fallback: 'Instagram',
    contact_fb_title: 'Mensaje en Facebook',
    contact_fb_body: 'Sigue actualizaciones y novedades.',
    contact_fb_fallback: 'Facebook',
    contact_tiktok_title: 'Encuéntranos en TikTok',
    contact_tiktok_body: 'Demos y novedades.',
    contact_tiktok_fallback: 'TikTok',
    contact_promises_aria: 'Qué esperar',
    contact_promises_eyebrow: 'Qué esperar',
    contact_promises_title: 'Ayúdanos a encontrar la respuesta correcta',
    contact_promise_1_strong: 'Incluye los datos clave',
    contact_promise_1_body:
      'Incluye el número de pedido, el enlace del producto y tu pregunta.',
    contact_promise_2_strong: 'Espera dos días hábiles',
    contact_promise_2_body:
      'Intentamos responder en dos días hábiles. Las consultas al proveedor o transportista pueden tardar más.',
    contact_promise_3_strong: 'Confirmamos lo que es posible',
    contact_promise_3_body:
      'Los cambios, cancelaciones y devoluciones dependen del estado del pedido y de la política aplicable.',
    contact_faq_aria: 'Preguntas comunes',
    contact_faq_eyebrow: 'Preguntas comunes',
    contact_faq_title: 'La versión corta',
    contact_faq_1_q: '¿Dónde está mi pedido?',
    contact_faq_1_a:
      'Cuando haya un servicio con seguimiento, el enlace se incluirá en el correo de confirmación de envío. Escríbenos con tu número de pedido si necesitas ayuda.',
    contact_faq_2_q: '¿Puedo cambiar o cancelar mi pedido?',
    contact_faq_2_a:
      'Contáctanos lo antes posible con tu número de pedido. Confirmaremos si el proveedor ya empezó a procesarlo y qué opciones siguen disponibles.',
    contact_faq_3_q: '¿Cómo funcionan las devoluciones?',
    contact_faq_3_a:
      'Contáctanos dentro de los 30 días posteriores a la entrega. No envíes nada hasta que confirmemos la elegibilidad y las instrucciones. La responsabilidad del envío de devolución depende del motivo y de la política.',
    contact_faq_4_q: '¿A dónde envían?',
    contact_faq_4_a:
      'Canadá y Estados Unidos son mercados seleccionables. La entrega aún depende del producto y la dirección; el checkout debe confirmar el carrito antes del pago.',
    contact_faq_5_q:
      '¿Los productos en las fotos son exactamente lo que recibiré?',
    contact_faq_5_a:
      'Revisa las fotos, la variante seleccionada, las dimensiones y la descripción. Escríbenos antes de pedir si algún detalle no está claro.',
    contact_cta_title: '¿Aún tienes una pregunta?',
    contact_cta_body:
      'El correo es la mejor opción para pedidos. Intentamos responder en dos días hábiles.',
    contact_cta_button: 'Escribir a {email}',

    // ── Página FAQ (ruta dedicada /pages/faq) ───────────────────
    faq_accordion_aria: 'Preguntas frecuentes',
    faq_hero_eyebrow: 'Centro de ayuda',
    faq_hero_title: 'Preguntas frecuentes',
    faq_hero_sub:
      'Respuestas rápidas a las preguntas que más escuchamos, pedidos, devoluciones, productos y tu cuenta.',
    faq_cat_orders: 'Pedidos y envío',
    faq_cat_returns: 'Devoluciones y reembolsos',
    faq_cat_products: 'Productos',
    faq_cat_account: 'Cuenta',
    faq_orders_1_q: '¿Cuánto tarda el envío?',
    faq_orders_1_a:
      'Los tiempos de procesamiento y entrega varían según el producto. Introduce tu dirección al pagar para consultar la estimación disponible antes del pago.',
    faq_orders_2_q: '¿Envían a nivel internacional?',
    faq_orders_2_a:
      'Canadá y Estados Unidos son mercados seleccionables. La selección no garantiza que todos los artículos puedan entregarse; el checkout confirma el carrito y la dirección antes del pago.',
    faq_orders_3_q: '¿Cómo rastreo mi pedido?',
    faq_orders_3_a:
      'Cuando haya un servicio con seguimiento, el enlace se incluirá en el correo de confirmación de envío. Contáctanos con tu número de pedido si necesitas ayuda.',
    faq_orders_4_q: '¿Cuáles son sus tarifas de envío?',
    faq_orders_4_a:
      'Los servicios, el costo y el tiempo de entrega se confirman al pagar según los artículos seleccionados y el destino.',
    faq_returns_1_q: '¿Cuál es su política de devoluciones?',
    faq_returns_1_a:
      'Contáctanos dentro de los 30 días posteriores a la entrega. La elegibilidad depende del artículo, su estado y la política de reembolso. Escríbenos pronto si llega dañado o incorrecto.',
    faq_returns_2_q: '¿Cómo inicio una devolución?',
    faq_returns_2_a:
      'Escríbenos con el número de pedido y el motivo. No envíes nada hasta que confirmemos la elegibilidad y la dirección. La responsabilidad del envío depende del motivo y de la política.',
    faq_returns_3_q: '¿Cuándo recibiré mi reembolso?',
    faq_returns_3_a:
      'Los reembolsos aprobados se envían al método de pago original después de recibir y revisar el artículo devuelto. El tiempo de procesamiento bancario puede variar.',
    faq_products_1_q: '¿Dónde encuentro los detalles del producto?',
    faq_products_1_a:
      'Revisa la página del producto para ver opciones, dimensiones, materiales y lo que incluye. Contáctanos si falta algún detalle.',
    faq_products_2_q: '¿De dónde vienen sus productos?',
    faq_products_2_a:
      'Trabajamos con proveedores externos y el origen puede variar según el artículo. Contáctanos antes de pedir si necesitas un dato específico.',
    faq_products_3_q: '¿Cómo elijo la opción correcta?',
    faq_products_3_a:
      'Revisa la talla, el color, la cantidad y el conjunto seleccionados antes de agregar el artículo al carrito.',
    faq_account_1_q: '¿Cómo accedo a mi cuenta?',
    faq_account_1_a:
      'Elige Cuenta, ingresa tu correo y sigue los pasos de inicio de sesión. Desde tu cuenta puedes ver pedidos y administrar los datos guardados.',
    faq_account_2_q: 'No puedo iniciar sesión. ¿Qué hago?',
    faq_account_2_a:
      'Solicita un nuevo código o enlace desde la página Cuenta y revisa la carpeta de spam. Contáctanos si todavía no llega.',
    faq_cta_eyebrow: '¿Aún con dudas?',
    faq_cta_title: '¿Aún tienes preguntas?',
    faq_cta_sub:
      'Envía los detalles del producto o pedido. Intentamos responder en dos días hábiles.',
    faq_cta_button: 'Contáctanos',
    faq_contact_aria: 'Contáctanos',
    faq_contact_title: 'Contáctanos',
    faq_contact_body:
      '¿No encuentras lo que buscas? Escríbenos, estamos felices de ayudar con pedidos, devoluciones, productos o cualquier otra cosa.',

    aside_heading_cart: 'Carrito',
    aside_heading_search: 'Buscar',
    aside_heading_menu: 'Menú',
    cart_loading: 'Cargando carrito…',
    search_placeholder: 'Buscar por categoría, problema o uso',
    search_aria_submit: 'Buscar',
    search_submit_label: 'Buscar',
    search_loading_for: 'Buscando «{term}»…',
    search_view_all: 'Ver todos los resultados de «{term}» →',

    // ── Secciones de la página de inicio (rediseño Fase 1) ──────────
    hero_split_aria: 'Hero',
    hero_split_eyebrow: 'Hallazgos · Menos de C$200',
    hero_split_heading: 'Compra hogar, tecnología, mascotas, regalos y más.',
    hero_split_body:
      'Hallazgos de alto valor bajo C$200 — proveedores verificados, envío transparente, devoluciones de 30 días.',
    hero_split_cta_primary: 'Ver los más vendidos',
    hero_split_cta_secondary: 'Ver todo',
    hero_split_trust:
      'Opciones de envío al pagar · Devoluciones de 30 días · Soporte humano',
    hero_trust_returns: 'Devoluciones de 30 días',
    hero_trust_checkout: 'Pago seguro con Shopify',
    hero_trust_canada: 'Catálogo pequeño y activo',
    hero_showcase_bar: 'Comprar por departamento →',

    shop_by_category_aria: 'Comprar por categoría',
    shop_by_category_eyebrow: 'Categorías',
    shop_by_category_heading: 'Encuentra lo tuyo',
    shop_by_category_shop_cta: 'Comprar',

    best_sellers_aria: 'Más vendidos',
    best_sellers_eyebrow: 'Los más amados',
    best_sellers_heading: 'Más vendidos de la semana',
    best_sellers_see_all: 'Ver todo',

    lifestyle_banner_aria: 'Estilo de vida',
    lifestyle_shop_eyebrow: 'Explorar',
    lifestyle_shop_heading: 'Comprar por estilo de vida',
    lifestyle_shop_sub:
      'Empieza por el momento y encuentra la categoría que encaja.',
    lifestyle_shop_home_title: 'Mejoras para el hogar que valen la pena',
    lifestyle_shop_home_body:
      'Mejoras útiles para los espacios y rutinas de todos los días.',
    lifestyle_shop_motion_title: 'Movimiento diario',
    lifestyle_shop_motion_body:
      'Hallazgos prácticos para salir, mantenerse activo y moverse mejor.',
    lifestyle_shop_family_title: 'Juego y familia',
    lifestyle_shop_family_body:
      'Opciones pensadas para jugar, las pequeñas rutinas y los momentos compartidos.',
    lifestyle_shop_cta: 'Ver la selección →',
    lifestyle_banner_eyebrow: 'Vida tranquila',
    lifestyle_banner_heading: 'Encuentra tu próximo favorito.',
    lifestyle_banner_body:
      'Hallazgos y soluciones cotidianas que se ganan su lugar en una casa, cocina o bolso de viaje real.',
    lifestyle_banner_cta: 'Ver hallazgos',

    new_arrivals_aria: 'Novedades',
    new_arrivals_eyebrow: 'Recién llegados',
    new_arrivals_heading: 'Novedades',
    new_arrivals_see_all: 'Ver todo',
    new_arrivals_scroll_left: 'Desplazar a la izquierda',
    new_arrivals_scroll_right: 'Desplazar a la derecha',

    sports_aria: 'Deportes y aire libre',
    sports_eyebrow: 'Muévete',
    sports_heading: 'Deportes y aire libre',
    sports_see_all: 'Comprar deportes',

    world_cup_aria: 'Camisetas y equipo de fútbol',
    world_cup_eyebrow: 'Representa a tu país',
    world_cup_heading: 'La camiseta de tu tierra, donde quiera que sea.',
    world_cup_see_all: 'Ver todo el fútbol',

    rail_scroll_left: 'Desplazar a la izquierda',
    rail_scroll_right: 'Desplazar a la derecha',

    trust_bar_aria: 'Por qué comprar con nosotros',
    trust_bar_shipping_h: 'Envío claro',
    trust_bar_shipping_sub: 'Opciones y costos al finalizar la compra',
    trust_bar_returns_h: 'Devoluciones en 30 días',
    trust_bar_returns_sub: 'Consulta la política antes de comprar',
    trust_bar_curated_h: 'Catálogo activo',
    trust_bar_curated_sub: 'Productos listos para comprar hoy',

    home_reviews_aria: 'Reseñas de clientes',
    home_reviews_eyebrow: 'Amado por más de 12,000 compradores',
    home_reviews_heading: 'Lo que dicen nuestros clientes',
    home_reviews_verified: 'Comprador verificado',
    home_reviews_quote_1_text:
      'La calidad es constante, el envío rápido y las devoluciones son sin preguntas. Por eso sigo volviendo.',
    home_reviews_quote_1_author: 'Maya R. Toronto',
    home_reviews_quote_2_text:
      'Encontré un regalo que no hallé en ningún otro sitio. El empaque se sentía pensado.',
    home_reviews_quote_2_author: 'James P. Vancouver',
    home_reviews_quote_3_text:
      'El servicio al cliente realmente responde. Hice una pregunta y obtuve respuesta el mismo día.',
    home_reviews_quote_3_author: 'Sophie L. Montréal',

    home_newsletter_aria: 'Boletín',
    home_newsletter_eyebrow: 'Únete a la lista',
    home_newsletter_heading: 'Novedades de viaje, sin desorden',
    home_newsletter_body:
      'Novedades, reposiciones y ofertas ocasionales, directo a tu correo, sin spam.',
    home_newsletter_placeholder: 'tu@ejemplo.com',
    home_newsletter_submit: 'Suscribirse',
    home_newsletter_promise: 'Sin spam. Cancela cuando quieras.',

    home_roots_aria: 'Nuestras raíces',
    home_roots_eyebrow: 'Las raíces de Puchica',
    home_roots_heading: 'De Centroamérica al mundo.',
    home_roots_body:
      'Puchica, así se dice cuando algo te sorprende. Un amanecer sobre el lago Atitlán. Café cultivado en laderas volcánicas. Textiles tejidos de la misma forma por tres generaciones en los altiplanos de Guatemala. De Antigua a Honduras, traemos ese sentimiento a clientes de todo el mundo.',
    home_roots_signature: 'Hecho con alma · Made with soul',

    // ── World map ─────────────────────────────────────────────────
    world_map_aria: 'Países que servimos',
    world_map_eyebrow: 'Mundial',
    world_map_heading: 'De nuestras raíces a tu puerta.',
    world_map_sub:
      'Puchica envía a clientes de todo el mundo. Toca un pin para ver qué nos conecta.',

    home_shop_dept_aria: 'Comprar por departamento',
    home_shop_dept_eyebrow: 'Tendencia esta semana',
    home_shop_dept_heading: 'Hallazgos de alto valor, seleccionados a mano.',
    home_shop_dept_body:
      'Hallazgos en audio, cocina, fitness, hogar y aire libre — cada producto viene de un proveedor verificado.',
    home_dept_home: 'Hogar & Cocina',
    home_dept_electronics: 'Electrónica',
    home_dept_apparel: 'Ropa',
    home_dept_health: 'Salud & Bienestar',
    home_dept_pet: 'Mascotas',
    home_dept_sports: 'Deportes & Aire Libre',

    home_curate_aria: 'Cómo seleccionamos',
    home_curate_eyebrow: 'Por qué Puchica',
    home_curate_heading: 'Lo bueno, sin complicaciones.',
    home_curate_step1_h: 'Partimos de un problema real que vale resolver.',
    home_curate_step1_b:
      'Trabajamos con proveedores verificados en todo el mundo para ofrecerte productos que valgan tu dinero.',
    home_curate_step2_h: 'Precio justo.',
    home_curate_step2_b:
      'Comparamos el precio con el costo de entrega y solo destacamos productos que pueden sostener una oferta viable.',
    home_curate_step3_h: 'Envío rápido.',
    home_curate_step3_b:
      'Las opciones de envío se confirman al pagar según los artículos y el destino. Nuestro equipo puede ayudarte antes o después de tu pedido.',

    hero_store_stat_products: 'Catálogo',
    hero_store_stat_departments: 'Departamentos',
    hero_store_stat_shipping: 'Envío mostrado',
    hero_storefront_title: 'Formas populares de comprar',
    shop_by_category_sub:
      'Empieza por los departamentos activos y listos para comprar.',

    // ── PDP route meta (localized) ────────────────────────────────
    pdp_meta_title_suffix: ' – Puchica',
    pdp_meta_description_fallback:
      'Compra {title} en Puchica. Las opciones de envío a Canadá se muestran al pagar.',
  },

  // ════════════════════════════════════════════════════════════════
  'pt-br': {
    announce_offer: 'Organizadores de viagem práticos para arrumar melhor',
    announce_freeship: 'Opções de envio mostradas no checkout',
    announce_cta: 'Ver organizadores de viagem',
    offer_first15:
      'As opções e os prazos de envio aparecem no checkout.',
    announce_region_aria: 'Avisos do site',

    footer_tagline:
      'Organizadores de viagem práticos, detalhes claros e frete mostrado no checkout.',
    footer_accepted_payments: 'Pagamentos aceitos',
    footer_secure:
      'Checkout seguro pela Shopify, criptografado e em conformidade com PCI',
    footer_shop: 'Loja',
    footer_care: 'Atendimento ao cliente',
    footer_about: 'Sobre nós',
    footer_faq: 'Perguntas frequentes',
    footer_shipping_info: 'Envios e entrega',
    footer_contact: 'Fale conosco',
    footer_search: 'Buscar',
    footer_policies: 'Políticas',
    footer_shipping_policy: 'Política de envio',
    footer_refund_policy: 'Política de reembolso',
    footer_privacy_policy: 'Política de privacidade',
    footer_terms_of_service: 'Termos de serviço',
    footer_subscription_policy: 'Política de assinatura',
    footer_terms: 'Termos de serviço',
    footer_newsletter_title: 'Assine nossa newsletter',
    footer_newsletter_copy:
      'Ofertas exclusivas e novidades, direto no seu e-mail.',
    footer_email_placeholder: 'Digite seu e-mail',
    footer_newsletter_email_aria: 'Endereço de e-mail',
    footer_newsletter_subscribe_aria: 'Inscrever-se',
    footer_newsletter_submitting: '…',

    footer_newsletter_ok: 'Obrigado, você está na lista.',
    footer_rights: 'Todos os direitos reservados.',
    footer_privacy: 'Política de privacidade',

    nav_all_products: 'Todos os produtos',
    nav_best_sellers: 'Mais vendidos',
    nav_trending: 'Tendências',
    nav_gifts: 'Presentes até $25',
    nav_shop: 'Loja',
    nav_new_arrivals: 'Novidades',
    nav_sale: 'Promoções',
    nav_explore: 'Explorar',
    nav_about: 'Sobre',
    nav_contact: 'Contato',
    nav_faq: 'Perguntas frequentes',
    nav_shipping: 'Frete',

    header_dismiss_aria: 'Fechar anúncio',
    header_menu_open: 'Abrir menu',
    header_menu_close: 'Fechar menu',
    header_search_open: 'Abrir busca',
    header_search_close: 'Fechar busca',
    header_account_aria: 'Conta',
    header_cart_open: 'Abrir carrinho',
    header_cart_close: 'Fechar carrinho',

    hero_eyebrow: 'Achados · Abaixo de C$200',
    hero_title: 'Tudo que importa.',
    hero_sub:
      'Uma seleção de achados de alto valor que os clientes recomendam — fornecedores verificados, preços transparentes, frete confirmado no checkout.',
    hero_cta_shop: 'Comprar agora →',
    hero_cta_browse: 'Ver tudo',
    hero_stat_products: 'Produtos',
    hero_stat_shipping: 'Frete grátis',
    hero_stat_returns: 'Devoluções fáceis',
    hero_pause_label: 'Pausar apresentação de slides',
    hero_play_label: 'Reproduzir apresentação de slides',
    hero_featured_label: 'Ver produto em destaque: {title}',
    hero_featured_text: 'Em destaque: {title}',

    ticker_products: 'Catálogo ativo',
    ticker_new_drops: 'Novidades toda semana',
    ticker_free_shipping: 'Frete grátis no Canadá',
    ticker_returns: 'Devoluções em 30 dias',
    ticker_ships: 'Entrega rápida',
    ticker_handpicked: 'Selecionado, nunca aleatório',
    ticker_real_value: 'Valor real. Descobertas reais.',
    ticker_secure: 'Checkout seguro',

    swiper_eyebrow: 'Em alta',
    swiper_title: 'Os melhores picks desta semana',
    swiper_pause_label: 'Pausar reprodução automática',
    swiper_resume_label: 'Retomar reprodução automática',
    swiper_slides_aria: 'Apresentação de seleções',
    swiper_stats_aria: 'Destaques da loja',
    swiper_carousel_aria: 'Carrossel de produtos',
    swiper_carousel_nav_aria: 'Navegação do carrossel',
    swiper_prev_aria: 'Produto anterior',
    swiper_next_aria: 'Próximo produto',
    swiper_dots_aria: 'Ir para o produto',
    match_section_aria: 'Matchmaker de produtos por deslize',
    match_deck_aria: 'Baralho de cartões de produtos',
    match_pass_aria: 'Passar este produto',
    match_super_aria: 'Super deslize – Adicionar ao carrinho',
    match_like_aria: 'Curtir este produto',
    rack_section_aria: 'Seleções premium',
    rack_scroll_aria: 'Rolar produtos',
    rack_scroll_left_aria: 'Rolar para a esquerda',
    rack_scroll_right_aria: 'Rolar para a direita',
    gift_section_aria: 'Encontrar um presente por orçamento',
    gift_card_aria: 'Comprar presentes {label}',
    arrivals_section_aria: 'Novidades',
    arrivals_scroll_aria: 'Rolar novidades',
    arrivals_badge_aria: 'Produto novo',
    cat_section_aria: 'Comprar por categoria',
    mood_section_aria: 'Comprar por estilo de vida',
    review_section_aria: 'Avaliações de clientes',
    fresh_section_aria: 'Achados frescos',
    fresh_scroll_aria: 'Rolar achados frescos',
    banner_section_aria: 'Mais vendidos',
    catalog_section_aria: 'Explorar o catálogo completo',
    catalog_count_aria: 'Mais de 6.000 produtos',
    trust_section_aria: 'Por que Puchica',
    newsletter_section_aria: 'Inscrição na newsletter',

    // ── Shipping reach ────────────────────────────────────────────
    ship_eyebrow: 'Para onde enviamos',
    ship_title: 'Enviamos para qualquer lugar.',
    ship_sub:
      'Enviamos para países do mundo inteiro. Onde quer que você esteja, nós levamos o seu pedido até você.',
    ship_cta: 'Pergunte sobre o seu país',
    ship_section_aria: 'Destinos de envio',
    ship_compact_title: 'Cobertura por região',
    ship_cities_label: 'cidades',
    ship_region_na: 'América do Norte',
    ship_region_sa: 'América do Sul',
    ship_region_uk: 'Reino Unido',
    ship_region_eu: 'Europa',
    ship_region_ap: 'Ásia-Pacífico',
    ship_region_me: 'Oriente Médio',
    ship_region_af: 'África',
    ship_region_oc: 'Oceania',
    ship_region_na_sub: 'Canadá e EUA',
    ship_region_sa_sub: 'Do México à Argentina',
    ship_region_uk_sub: 'Inglaterra, Escócia, País de Gales, Irlanda do Norte',
    ship_region_eu_sub: 'Europa continental',
    ship_region_ap_sub: 'Japão, Austrália, Singapura e mais',
    ship_region_me_sub: 'EAU, Arábia, Israel, Catar',
    ship_region_af_sub: 'Do Marrocos à África do Sul',
    ship_region_oc_sub: 'Austrália, Nova Zelândia, Fiji',

    // ── Página de envio ────────────────────────────────────────────
    ship_hero_eyebrow: 'Envio e Entrega',
    ship_hero_title_main: 'Envio e',
    ship_hero_title_em: 'Entrega.',
    ship_hero_sub:
      'A disponibilidade, os prazos e os custos de entrega são confirmados no checkout conforme os itens e o destino.',
    ship_hero_cta: 'Ver a seleção de viagem',
    ship_launch_hero_sub:
      'Uma única loja norte-americana com preços por mercado e opções de entrega confirmadas no checkout.',
    ship_jump: 'Veja como a entrega é confirmada',
    ship_launch_regions_eye: 'Loja norte-americana',
    ship_launch_regions_title: 'Dois mercados. Uma loja focada.',
    ship_launch_regions_sub:
      'Escolha Canadá ou Estados Unidos para ver os preços do mercado. A entrega ainda depende dos itens e do endereço.',
    ship_launch_rates_eye: 'Antes de pagar',
    ship_launch_rates_title: 'Confira a entrega antes do pagamento',
    ship_launch_rates_sub:
      'O checkout mostra as opções disponíveis para os itens e o destino selecionados.',
    ship_market_ca_name: 'Canadá · CAD',
    ship_market_ca_detail:
      'Preços em CAD; o checkout confirma se os itens selecionados podem ser entregues.',
    ship_market_us_name: 'Estados Unidos · USD',
    ship_market_us_detail:
      'Preços em USD; o checkout confirma se os itens selecionados podem ser entregues.',
    ship_check_destination_title: 'Confira seu destino',
    ship_check_destination_body:
      'Informe seu endereço no checkout para ver as opções disponíveis para o pedido.',
    ship_check_destination_eta: 'Disponibilidade exibida antes do pagamento',
    ship_check_items_title: 'Confira os itens do carrinho',
    ship_check_items_body:
      'As opções podem variar conforme o produto, a variante e o destino.',
    ship_check_items_eta: 'O checkout confirma as opções do pedido',
    ship_check_tracking_title: 'Acompanhe seu pedido',
    ship_check_tracking_body:
      'Quando houver serviço com rastreio, os detalhes serão enviados após o despacho.',
    ship_check_tracking_eta: 'Consulte a política de envio para obter ajuda',
    ship_check_duties_title: 'Impostos e taxas de importação',
    ship_check_duties_body:
      'O destino pode cobrar impostos aduaneiros, tributos de importação, corretagem ou taxas da transportadora. A Puchica não cobra esses valores; quando aplicáveis, são responsabilidade do cliente.',
    ship_check_duties_eta:
      'Cobrados pela alfândega ou transportadora quando aplicável',
    ship_regions_eye: 'Para onde enviamos',
    ship_regions_title: 'A cobertura aumenta após validação.',
    ship_regions_sub:
      'Só promovemos destinos após confirmar a cobertura do produto e do fornecedor.',
    ship_rates_eye: 'Taxas de envio',
    ship_rates_title: 'Envio claro antes do pagamento.',
    ship_rates_sub:
      'O checkout confirma os serviços, o custo e a estimativa para os itens e o endereço selecionados.',
    ship_rates_canada_flag: 'CA',
    ship_rates_canada_title: 'Canadá',
    ship_rates_canada_body:
      'Os serviços e custos disponíveis são mostrados no checkout para o pedido selecionado.',
    ship_rates_canada_eta: 'Estimativa mostrada no checkout',
    ship_rates_canada_badge: '',
    ship_rates_us_flag: 'US',
    ship_rates_us_title: 'Estados Unidos',
    ship_rates_us_body:
      'A disponibilidade depende dos itens, do carrinho e do destino.',
    ship_rates_us_eta: 'Confirme no checkout',
    ship_rates_us_badge: '',
    ship_rates_intl_flag: 'INTL',
    ship_rates_intl_title: 'Internacional',
    ship_rates_intl_body:
      'A entrega internacional não é promovida atualmente. Confirme a disponibilidade no checkout.',
    ship_rates_intl_eta: 'Sem promessa geral de entrega',
    ship_rates_intl_badge: '',
    ship_how_eye: 'Como funciona',
    ship_how_title: 'Confira os detalhes antes de pedir.',
    ship_how_1_title: 'Faça seu pedido',
    ship_how_1_body:
      'Navegue pelo catálogo, adicione ao carrinho e finalize com segurança. Você receberá uma confirmação de pedido imediatamente.',
    ship_how_2_title: 'Seu pedido é processado',
    ship_how_2_body:
      'Os prazos de processamento e entrega dependem do produto e do serviço escolhidos. As atualizações disponíveis são enviadas durante o processo.',
    ship_how_3_title: 'Entregue na sua porta',
    ship_how_3_body:
      'Use a estimativa mostrada no checkout para os itens e o endereço selecionados.',
    ship_track_eye: 'Rastreie seu pedido',
    ship_track_title: 'Acompanhe as atualizações disponíveis.',
    ship_track_body_1:
      'Quando houver um serviço com rastreamento, os detalhes serão enviados após o despacho.',
    ship_track_body_2:
      'Use o link no e-mail de envio ou fale com o suporte informando o número do pedido.',
    ship_track_cta: 'Contatar suporte',
    ship_cta_title: 'Pronto para pedir?',
    ship_cta_sub:
      'Compre achados e confirme o frete para seu endereço no checkout.',
    ship_cta_browse: 'Ver tudo',

    match_eyebrow: 'Descoberta personalizada',
    match_title: 'Puchica Match.',
    match_sub:
      'Deslize para a direita para <strong>Curtir</strong>, para a esquerda para <strong>Passar</strong>, ou para cima para <strong>Super Deslize &amp; Adicionar ao carrinho</strong>!',
    match_empty_title: 'Não há mais itens por hoje!',
    match_empty_body: 'Você viu todos os itens em alta e curtiu {count} deles.',
    match_reset: 'Deslizar novamente',
    match_browse: 'Ver tudo',
    match_stamp_like: 'CURTIR',
    match_stamp_nope: 'NÃO',
    match_stamp_super: 'SUPER ATC',

    rack_eyebrow: 'Casa & Cozinha',
    rack_title: 'Melhore seu espaço.',

    gift_eyebrow: 'Ideias de presente',
    gift_title: 'Encontre o presente perfeito.',
    gift_sub:
      'Mais de 6.000 opções para todos os orçamentos. Algo para cada pessoa na sua lista.',
    gift_under25_label: 'Menos de $25',
    gift_under25_sub: 'Pequenos mimos, grandes sorrisos',
    gift_25_50_label: '$25 – $50',
    gift_25_50_sub: 'Presentes ideais',
    gift_50_100_label: '$50 – $100',
    gift_50_100_sub: 'Opções premium',
    gift_100_label: '$100+',
    gift_100_sub: 'Sem limites',

    arrivals_eyebrow: 'Ar livre & Jardim',
    arrivals_title: 'Vá para fora.',
    arrivals_see_all: 'Ver todas as novidades',
    arrivals_badge: 'Novo',

    // ── For You ───────────────────────────────────────────────────
    foryou_eyebrow: 'Selecionado para você',
    foryou_title: 'Imagine assim.',
    foryou_sub:
      'Uma curadoria com estilo próprio, cada foto feita para estes produtos.',
    foryou_cta: 'Ver a seleção',
    foryou_section_aria: 'Vitrine Para você',

    cat_eyebrow: 'Comprar por categoria',
    cat_title: 'Encontre o seu.',
    cat_home_tagline: 'Seu espaço, elevado.',
    cat_beauty_tagline: 'Sinta por dentro.',
    cat_tech_tagline: 'Mais inteligente, todo dia.',
    cat_outdoor_tagline: 'Saia para explorar.',
    cat_pet_tagline: 'Eles merecem o melhor também.',
    cat_fallback_tagline: 'Curado com cuidado.',
    cat_shop_now: 'Comprar →',
    cat_cell_aria: 'Comprar {title}',

    mood_eyebrow: 'Feito para sua vida',
    mood_title: 'Tendência. Verificado. Entregue.',
    mood_home_label: 'Casa & Decoração',
    mood_home_title: 'Sua casa merece mais.',
    mood_home_sub: 'Achados e melhorias que tornam um ambiente real melhor.',
    mood_home_cta: 'Melhore seu espaço →',
    mood_beauty_label: 'Beleza & Cuidado pessoal',
    mood_beauty_title: 'Cuide-se.',
    mood_beauty_sub:
      'Produtos de skincare, bem-estar e cuidado pessoal que realmente funcionam, escolhidos por quem os usa.',
    mood_beauty_cta: 'Se presenteie →',
    mood_tech_label: 'Tech & Gadgets',
    mood_tech_title: 'Trabalhe melhor, jogue mais forte.',
    mood_tech_sub:
      'Acessórios, ferramentas e gadgets que genuinamente melhoram seu dia. Sem enganação.',
    mood_tech_cta: 'Potencialize-se →',

    review_eyebrow: 'O que as pessoas dizem',
    review_title: 'Compradores reais. Opiniões reais.',
    review_1_quote:
      'Fiz três pedidos este mês. A qualidade é sempre ótima e a entrega é rápida.',
    review_2_quote:
      'Encontrei exatamente o que procurava, e muito mais. Este é meu novo lugar favorito para coisas de casa.',
    review_3_quote:
      'A curadoria é genuinamente boa. Tudo parece ter sido escolhido por alguém com bom gosto.',

    banner_eyebrow: 'Mais vendidos',
    banner_title: 'Os que as pessoas não param de comprar.',
    banner_sub:
      'Achados de alto valor, selecionados a mão para a seleção atual.',
    banner_cta: 'Ver todos os mais vendidos',

    catalog_body:
      'Um catálogo focado de achados de alto valor — fornecedores verificados, preços transparentes, frete confirmado no checkout.',
    catalog_cta_browse: 'Ver tudo →',
    catalog_cta_search: 'Buscar no catálogo',

    trust_shipping_title: 'Frete grátis',
    trust_shipping_sub: 'Em pedidos para o Canadá',
    trust_returns_title: 'Devoluções em 30 dias',
    trust_returns_sub: 'Sem perguntas, sem complicações',
    trust_secure_title: 'Checkout seguro',
    trust_secure_sub: 'Criptografado e em conformidade PCI',
    trust_handpicked_title: 'Apenas selecionados',
    trust_handpicked_sub: 'Construído em torno dos achados',

    newsletter_pill: 'Entre no clube',
    newsletter_title: 'Receba o melhor primeiro.',
    newsletter_sub:
      'Novidades, ofertas exclusivas e picks que você não encontrará em outro lugar, direto na sua caixa. Sem spam, cancele quando quiser.',
    newsletter_done: 'Você está dentro! Verifique sua caixa de entrada.',
    newsletter_email_label: 'Endereço de e-mail',
    newsletter_placeholder: 'seu@email.com',
    newsletter_joining: 'Entrando…',
    newsletter_subscribe: 'Assinar',

    counter_products: 'Produtos',
    counter_collections: 'Coleções',
    counter_categories: 'Categorias',
    counter_canadian: 'Selecionado',

    explore_home: 'Início',
    explore_breadcrumb: 'Explorar catálogo',
    explore_eyebrow: 'Descubra a coleção',
    explore_title: 'Explorar o catálogo completo',
    explore_showing: 'Mostrando',
    explore_product_singular: 'produto',
    explore_product_plural: 'produtos',
    explore_across: 'em',
    explore_count_active_cat_singular: 'categoria ativa',
    explore_count_active_cat_plural: 'categorias ativas',
    explore_cat_filter_aria: 'Filtros por categoria',
    explore_filter_title: 'Filtrar por categoria',
    explore_filter_clear: 'Limpar tudo',
    explore_empty_title: 'Nenhum produto encontrado',
    explore_empty_body:
      'Tente ajustar suas seleções de categoria ou limpe os filtros.',
    explore_empty_reset: 'Redefinir filtros',
    explore_view_details: 'Ver detalhes',
    explore_cat_home: 'Casa & Cozinha',
    explore_cat_beauty: 'Beleza & Cuidados',
    explore_cat_tech: 'Eletrônicos & Tech',
    explore_cat_pet: 'Pets',
    explore_cat_outdoor: 'Jardim & Ar livre',

    breadcrumb_aria: 'Caminho de navegação',
    col_filters_aria: 'Filtros',
    search_trending_label: 'Buscas populares',
    search_recent_label: 'Vistos recentemente',
    search_trending_terms:
      'massageador, fita LED, garrafa térmica, chaleira, moedor de café, corda de pular',
    col_density_aria: 'Densidade da grade',
    col_density_3_aria: 'Mostrar 3 por linha',
    col_density_4_aria: 'Mostrar 4 por linha',
    breadcrumb_home: 'Início',
    breadcrumb_collections: 'Coleções',
    breadcrumb_shop: 'Loja',

    col_eyebrow: 'Coleção',
    col_empty_title: 'Nada aqui ainda',
    col_empty_filtered: 'Nenhum produto corresponde a esses filtros.',
    col_clear_filters: 'Limpar filtros',
    col_empty_restocking:
      'Estamos reabastecendo esta coleção. Explore os achados ou volte em breve.',
    col_showing: 'Mostrando',
    col_showing_more: 'até agora, carregue mais abaixo',
    col_product_singular: 'produto',
    col_product_plural: 'produtos',
    col_sort_by: 'Ordenar por',
    col_sort_featured: 'Destaque',
    col_sort_best: 'Mais vendidos',
    col_sort_newest: 'Mais recentes',
    col_sort_price_asc: 'Preço: menor para maior',
    col_sort_price_desc: 'Preço: maior para menor',
    col_filter_cat_label: 'Categoria:',
    col_filter_price_label: 'Preço:',
    col_filter_cat_heading: 'Categoria',
    col_filter_price_heading: 'Preço',
    col_filter_no_types: 'Nenhuma subcategoria nesta coleção.',
    col_price_under25: 'Menos de $25',
    col_price_25_50: '$25 – $50',
    col_price_50_100: '$50 – $100',
    col_price_100_plus: '$100 +',
    col_count_loading: 'Coleção carregando',
    col_count_and_counting: 'e contando',
    col_count_of: 'de',
    col_brand_chip: 'Puchica',

    // ── Trending landing (homepage) ───────────────────────────────
    trending_eyebrow: 'Em alta · Menos de $200',
    trending_title:
      'Achados em alta por menos de $200 — produtos práticos com avaliações reais.',
    trending_sub:
      'Uma seleção focada de itens de alto valor que os clientes continuam comprando: áudio, cozinha, fitness, casa e ar livre. Fotos reais, frete confirmado no checkout, sem assinaturas.',
    trending_hero_cta: 'Comprar a seleção em alta',
    trending_hero_secondary: 'Ver o catálogo completo',
    trending_proof_secure_h: 'Checkout seguro da Shopify',
    trending_proof_secure_s: 'Criptografado e em conformidade com PCI',
    trending_proof_shipping_h: 'Frete grátis no Canadá',
    trending_proof_shipping_s: 'Em pedidos acima de $50',
    trending_proof_photos_h: 'Fotos reais dos produtos',
    trending_proof_photos_s: 'Enviado por fornecedores verificados',
    trending_feature_spotlight_kicker: 'Mais vendido #1',
    trending_feature_secondary_kicker: 'Mais vendido #2',
    trending_feature_tertiary_kicker: 'Mais vendido #3',
    trending_feature_cta: 'Comprar o #1',
    trending_grid_eyebrow: 'Em destaque neste lançamento',
    trending_grid_title: 'Mais achados em alta para conhecer',
    trending_grid_sub:
      'Selecionados do catálogo de lançamento — fornecedores verificados, frete confirmado no checkout, devoluções em 30 dias.',
    trending_grid_more_cta: 'Ver todos os achados em alta',
    trending_card_cta: 'Ver produto',
    trending_explore_eyebrow: 'Mais do catálogo',
    trending_explore_title: 'Descubra o resto do lançamento',
    trending_explore_sub:
      'Cada produto que enviamos ao checkout, em um só lugar. Role para ver todo o lançamento.',

    all_breadcrumb: 'Todos os achados',
    all_eyebrow: 'A loja completa',
    all_title: 'Ver achados',
    all_sub:
      'Explore achados de alto valor em áudio, cozinha, fitness, casa e ar livre.',
    all_empty_title: 'Novos achados a caminho',
    all_empty_body:
      'O catálogo está carregando. Se o problema persistir, tente atualizar a página.',
    all_count_loading: 'Catálogo carregando',

    product_trust_shipping: 'Frete exibido no checkout',
    product_trust_shipping_sub: 'para o seu destino',
    product_trust_returns: 'Janela de devolução de 30 dias',
    product_trust_returns_sub: 'consulte a política para elegibilidade',
    product_trust_secure: 'Checkout seguro',
    product_trust_secure_sub: 'criptografado e em conformidade com PCI',
    product_desc_eyebrow: 'Sobre este produto',
    product_reco_see_all: 'Ver tudo',
    product_perks_aria: 'Promessas de envio e serviço',
    product_highlights_eyebrow: 'Por que este produto',
    product_care_eyebrow: 'Cuidados e envio',
    product_care_h: 'Feito para durar, embalado com cuidado',
    product_stock_low: 'Restam apenas {stock}',
    product_badge_sold_out: 'Esgotado',
    product_badge_save: 'Economize {pct}%',
    product_reviews_stub:
      'As avaliações de clientes verificados aparecerão aqui à medida que forem coletadas.',
    product_perk_packed: 'Opções de envio confirmadas no checkout',
    product_perk_return: 'Leia a política de reembolso antes de pedir',
    product_perk_curated: 'Curado pela equipe Puchica, nunca aleatório',
    product_tab_description: 'Descrição',
    product_story_title: 'Por que merece seu espaço.',
    product_tab_specs: 'Especificações',
    product_tab_shipping: 'Envio & Devoluções',
    product_desc_empty: 'Sem descrição adicional para este produto.',
    product_spec_vendor: 'Fornecedor',
    product_spec_category: 'Categoria',
    product_spec_sku: 'SKU',
    product_specs_empty: 'Nenhuma especificação disponível para este produto.',
    product_shipping_h: 'Envio',
    product_shipping_body:
      'A disponibilidade, o prazo e o custo de envio são confirmados no checkout para os itens e o destino selecionados. Quando houver serviço com rastreamento, os detalhes são enviados após o fornecedor despachar o pedido.',
    product_returns_h: 'Devoluções',
    product_returns_body:
      'Leia a política de reembolso antes de pedir. A elegibilidade e as instruções de devolução dependem do item e do pedido; fale com o suporte e informe seu número de pedido se precisar de ajuda.',
    product_help_h: 'Precisa de ajuda?',
    product_help_body:
      'Envie sua dúvida sobre o produto ou pedido com os detalhes necessários para ajudarmos.',
    product_help_contact_link: 'página de contato',
    product_share_label: 'Compartilhar:',
    product_share_btn: 'Compartilhar',
    product_copy_link: 'Copiar link',
    product_link_copied: 'Link copiado',
    product_reco_title: 'Você também pode gostar',
    product_recently_viewed_title: 'Vistos recentemente',
    product_add_to_cart: 'Adicionar ao carrinho',
    product_price_from: 'A partir de',
    product_sold_out: 'Esgotado',
    product_notify_label: 'Notificar-me quando disponível',
    product_notify_placeholder: 'seu@email.com',
    product_notify_btn: 'Notificar-me',
    product_notify_ok:
      'Obrigado, avisaremos quando estiver disponível novamente.',
    product_notify_error: 'Algo deu errado. Por favor, tente novamente.',

    atc_added: 'Adicionado ✓',
    atc_out_of_stock: 'Esgotado',
    atc_adding: 'Adicionando…',

    search_articles: 'Artigos',
    search_pages: 'Páginas',
    search_products: 'Produtos',
    search_empty: 'Nenhum resultado. Tente um termo de busca diferente.',
    search_articles_aria: 'Resultados de artigos',
    search_pages_aria: 'Resultados de páginas',
    search_products_aria: 'Resultados de produtos',
    card_view_details: 'Ver detalhes',
    card_choose_options: 'Escolher opções',
    card_swatches_aria: 'Opções do produto',
    card_quick_add_aria: 'Adição rápida',

    // ── Chrome do cabeçalho / navegação ─────────────────────────
    nav_shop_all: 'Comprar tudo',
    nav_best_sellers_short: 'Mais vendidos',
    nav_new_arrivals_short: 'Novidades',
    nav_gift_guide: 'Guia de presentes',
    nav_about_short: 'Sobre',
    nav_contact_short: 'Contato',
    megamenu_trigger: 'Loja',
    megamenu_panel_aria: 'Comprar por categoria',
    megamenu_error_body: 'Não conseguimos carregar as categorias agora.',
    megamenu_error_cta: 'Ver tudo →',
    megamenu_tile_cta: 'Comprar →',
    megamenu_intent_heading: 'Comprar por categoria',
    megamenu_intent_home_title: 'Mais vendidos',
    megamenu_intent_home_body:
      'Áudio, cozinha, fitness, casa, exterior — os achados que os clientes repetem.',
    megamenu_intent_cable_title: 'Tendências',
    megamenu_intent_cable_body:
      'Mantenha cabos e tecnologia do dia a dia fáceis de encontrar.',
    megamenu_intent_travel_title: 'Todas as categorias',
    megamenu_intent_travel_body:
      'Embalagem, bagagem e transporte do dia a dia.',
    megamenu_edit_eyebrow: 'Comece aqui',
    megamenu_edit_title: 'Achados premium por menos de 200 $ CAD.',
    megamenu_edit_body:
      'Soluções para armazenamento sob a pia, cabos, embalagem e transporte do dia a dia.',
    megamenu_trust_shipping: 'Opções de entrega mostradas no checkout',
    megamenu_trust_refund: 'Política de reembolso disponível',
    megamenu_tagline_phone_case: 'Capas, suportes, proteção.',
    megamenu_tagline_home_essentials:
      'Áudio, cozinha, decoração, armazenamento.',
    megamenu_tagline_home_kitchen: 'Cozinha, armazenamento, decoração.',
    megamenu_tagline_electronics_accessories: 'Cabos, carregadores, suportes.',
    megamenu_tagline_apparel_accessories: 'Bolsas, chapéus, wearables.',
    megamenu_tagline_health_wellness: 'Pele, aroma, cuidado.',
    megamenu_tagline_sports_outdoors: 'Equipamento, fitness, esporte.',
    megamenu_tagline_pet_finds: 'Brinquedos, camas, coisas para eles.',
    megamenu_tagline_pet_supplies: 'Brinquedos, camas, coisas para eles.',
    megamenu_tagline_automotive: 'Interior, ferramentas, gadgets.',
    megamenu_tagline_tools_home_improvement: 'Consertar, construir, finalizar.',
    megamenu_tagline_beauty_personal_care: 'Maquiagem, unhas, autocuidado.',
    megamenu_tagline_toys_games: 'Brincar, aprender, colecionar.',
    megamenu_tagline_home_decor: 'Parede, luz, acentos.',
    megamenu_tagline_office_school_supplies: 'Mesa, papel, indispensáveis.',
    megamenu_tagline_baby_nursery: 'Alimentação, decoração, conforto.',
    megamenu_tagline_outdoor_garden: 'Jardim, pátio, exterior.',
    megamenu_tagline_best_sellers: 'Os favoritos de todos.',
    megamenu_tagline_trending_finds: 'O que está em alta agora.',
    megamenu_tagline_gifts_under_25: 'Bons presentes, orçamento pequeno.',
    pillnav_aria: 'Seções da página',
    pillnav_trending: 'Em alta',
    pillnav_home_kitchen: 'Casa & Cozinha',
    pillnav_outdoor: 'Ar livre',
    pillnav_categories: 'Categorias',
    pillnav_best_sellers: 'Mais vendidos',
    pillnav_about_us: 'Sobre nós',

    // ── Banner de paralaxe (faixa da marca no início) ──────────
    parallax_aria: 'Banner da marca',
    parallax_title: 'Qual é o seu? A gente tem.',
    parallax_sub: 'Dezenas de coleções. Uma só loja canadense.',
    parallax_cta: 'Explorar por categoria →',

    // ── Faixa de tendências ─────────────────────────────────────
    ticker_section_aria: 'Produtos em alta',
    ticker_label: 'Em alta',

    // ── Vitrine de coleções (início) ───────────────────────────
    showcase_section_aria: 'Vitrine de coleções',
    showcase_heading: 'Explore por categoria',
    showcase_sub: '{count} coleções. {pct} % do catálogo coberto.',
    showcase_eyebrow: 'Coleção {n}',
    showcase_desc:
      'Descubra nossa seleção de {title}, produtos curados com frete grátis no Canadá.',
    showcase_cta: 'Comprar {title} →',

    // ── 404 / rota catch-all ────────────────────────────────────
    notfound_title: 'Não encontramos essa página',
    notfound_sub:
      'O link {path} não existe na Puchica. Pode ter sido movido, renomeado, ou nunca existiu. Tente uma destas opções:',
    notfound_popular: 'Coleções populares',
    notfound_best: 'Mais vendidos →',
    notfound_new: 'Novidades →',
    notfound_all_collections: 'Todas as coleções →',
    notfound_all_catalog: 'Catálogo completo →',
    notfound_breadcrumb_current: 'Página não encontrada',
    notfound_breadcrumb_aria: 'Caminho de navegação',
    notfound_breadcrumb_home: 'Início',
    notfound_eyebrow: '404',

    // ── Carrinho (gaveta / página) ──────────────────────────────
    cart_section_aria: 'Gaveta do carrinho',
    cart_page_aria: 'Página do carrinho',
    stats_aria: 'Estatísticas da loja',
    product_price_aria: 'Preço',
    pdp_3d_fallback_product: 'Produto',
    pdp_3d_viewer: 'visualizador 3D',
    pdp_3d_hint: 'Arraste para girar · role para dar zoom',
    cart_heading_aria: 'Itens',
    cart_remove_region_aria: 'Remover do carrinho',
    cart_empty_title: 'Seu carrinho está vazio.',
    cart_empty_body:
      'Comece com um organizador prático para a sua próxima viagem.',
    cart_empty_cta_shop: 'Ver achados',
    cart_empty_cta_best: 'Ver mais vendidos',
    cart_empty_perks_aria: 'Por que comprar com a gente',
    cart_empty_perk_shipping: 'Opções de entrega exibidas no checkout',
    cart_empty_perk_returns: 'Devoluções em 30 dias',
    cart_ghost_notice:
      'Estes itens não estão disponíveis na sua região agora. Remova-os para esvaziar o carrinho.',
    cart_freeship_progress_remaining: 'Adicione {amount} para frete grátis',
    cart_freeship_progress_done: 'Você ganhou frete grátis',
    cart_freeship_threshold_label:
      'Frete grátis em pedidos acima de {threshold}',
    cart_summary_title: 'Totais',
    cart_summary_subtotal: 'Subtotal',
    cart_summary_empty_btn: 'Adicione um item para continuar',
    cart_summary_checkout_btn: 'Continuar para o pagamento',
    cart_checkout_unavailable:
      'O pagamento está temporariamente indisponível. Atualize o carrinho e tente novamente.',
    cart_checkout_retry: 'Atualizar carrinho',
    cart_summary_discounts_aria: 'Descontos',
    cart_summary_discounts_h: 'Descontos',
    cart_summary_remove_discount: 'Remover desconto',
    cart_summary_remove: 'Remover',
    cart_summary_promo_label: 'Código promocional',
    cart_summary_promo_placeholder: 'Digite o código',
    cart_summary_promo_apply_aria: 'Aplicar código de desconto',
    cart_summary_promo_apply: 'Aplicar',
    cart_summary_gift_aria: 'Cartões-presente',
    cart_summary_gift_h: 'Cartão(ões)-presente aplicado(s)',
    cart_summary_gift_label: 'Cartão-presente',
    cart_summary_gift_placeholder: 'Digite o código do cartão',
    cart_summary_gift_apply_aria: 'Aplicar cartão-presente',
    cart_summary_gift_apply: 'Aplicar',
    cart_summary_remove_gift_aria:
      'Remover cartão-presente terminado em {last}',
    cart_qty_aria: 'Quantidade',
    cart_qty_dec_aria: 'Diminuir quantidade',
    cart_qty_inc_aria: 'Aumentar quantidade',
    cart_qty_remove_aria: 'Remover do carrinho',
    cart_qty_remove: 'Remover',
    cart_line_items_aria: 'Itens de {title}',

    // ── Paginação (coleções, busca) ─────────────────────────────
    pager_aria: 'Paginação',
    pager_prev: 'Página anterior',
    pager_next: 'Carregar mais 12',
    pager_loading: 'Carregando mais produtos…',
    pager_end: 'Você chegou ao fim',
    pager_showing_one: 'Mostrando {n} produto',
    pager_showing_many: 'Mostrando {n} produtos',

    // ── Galeria de imagens do PDP (3D, zoom, etc.) ─────────────
    pdp_img_alt_fallback: 'Imagem do produto',
    pdp_thumbs_aria: 'Imagens do produto',
    pdp_thumb_aria: 'Ver imagem {n} de {total}',
    pdp_3d_open_aria: 'Ver produto em 3D',
    pdp_3d_open: 'Ver em 3D',
    pdp_3d_close_aria: 'Voltar para a vista de fotos',
    pdp_3d_close: '← Fotos',
    pdp_zoom_hint: 'Passe o mouse para ampliar',
    pdp_prev_aria: 'Imagem anterior',
    pdp_next_aria: 'Próxima imagem',

    // ── Formulário de produto ───────────────────────────────────
    product_qty_aria: 'Quantidade',
    product_qty_dec_aria: 'Diminuir quantidade',
    product_qty_inc_aria: 'Aumentar quantidade',
    product_save_aria: 'Salvar para depois',
    product_unsave_aria: 'Remover dos salvos',
    product_stock_phrase: 'Restam apenas {stock}',

    // ── Embla / carrosséis ──────────────────────────────────────
    embla_prev_aria: 'Anterior',
    embla_next_aria: 'Próximo',
    embla_view_all: 'Ver tudo →',
    embla_dots_aria: 'Indicadores de slide',
    embla_dot_aria: 'Ir para o slide {n}',

    // ── Chrome das gavetas ──────────────────────────────────────
    aside_close_drawer: 'Fechar gaveta',
    aside_close: 'Fechar',
    locale_change_aria: 'Mudar mercado ou idioma',
    locale_switching: 'Alterando…',
    locale_switching_status: 'Atualizando o mercado e a moeda.',
    locale_market_label: 'Mercado',
    locale_market_ca: 'Canadá',
    locale_market_us: 'Estados Unidos',
    locale_market_unavailable: 'Indisponível',
    locale_language_label: 'Idioma',
    mobile_market_language: 'Mercado e idioma',
    skip_to_content: 'Pular para o conteúdo principal',

    // ── ErrorBoundary raiz / 404 / busca em erro ──────────────
    err_404_h: 'Não encontramos essa página',
    err_500_h: 'Algo deu errado do nosso lado',
    err_404_body:
      'Essa página pode ter sido movida enquanto preparamos o novo catálogo. Volte ao início ou entre em contato.',
    err_500_body:
      'Tivemos um erro inesperado ao renderizar esta página. Tente de novo, ou explore o catálogo abaixo.',
    err_search_aria: 'Buscar achados',
    err_search_placeholder: 'Buscar…',
    err_search_btn: 'Buscar',
    err_home: 'Voltar ao início',
    err_browse: 'Sobre a Puchica',
    err_contact: 'Ainda travado? Escreva para {email} e a gente ajuda.',

    // ── Rodapé (resto) ──────────────────────────────────────────
    footer_social_aria: 'Redes sociais',
    footer_payments_aria: 'Meios de pagamento aceitos',
    footer_payments_list_aria: 'Meios de pagamento',
    footer_address: 'Puchica · Toronto, ON, Canadá',
    footer_email: 'hello@puchica.ca',
    footer_stats_aria: 'Destaques da loja',
    footer_stat_products: 'Catálogo',
    footer_stat_collections: 'Coleções',
    footer_stat_shipping: 'Frete grátis',
    footer_stat_returns: 'Dias de devolução',
    footer_copyright: '© {year} Puchica.',
    footer_legal_aria: 'Legal',
    footer_newsletter_cta: '→',
    social_instagram: 'Instagram',
    social_facebook: 'Facebook',
    social_tiktok: 'TikTok',

    // ── Menu mobile (gaveta) ────────────────────────────────────
    mobile_account: 'Conta',
    mobile_signin: 'Entrar',
    mobile_view_cart: 'Ver carrinho',
    mobile_language: 'Idioma',
    mobile_customer_care: 'Atendimento ao cliente',
    mobile_contact_us: 'Fale conosco',
    mobile_all_policies: 'Todas as políticas',
    mobile_announce_foot: 'Ofertas e novidades',
    mobile_announce_foot_sep: ' · ',

    // ── Avaliações Judgeme ──────────────────────────────────────
    reviews_section_aria: 'Avaliações de clientes',
    reviews_heading: 'Avaliações de clientes',
    reviews_aria: '{rating} de 5 estrelas, {count} avaliações',
    reviews_count_one: '({count} avaliação)',
    reviews_count_many: '({count} avaliações)',

    // ── Modal do boletim ────────────────────────────────────────
    np_aria: 'Entre na lista da Puchica',
    np_close_backdrop: 'Fechar',
    np_close_x: 'Fechar',
    np_success_h: 'Você está dentro!',
    np_success_body:
      'Você receberá novidades, reposições e ofertas ocasionais.',
    np_copy_btn: 'Copiado!',
    np_copy_hint: 'Toque para copiar',
    np_success_cta: 'Comece a comprar →',
    np_form_h: 'Entre na lista da Puchica',
    np_form_body:
      'Receba novidades, reposições e ofertas ocasionais. Cancele quando quiser.',
    np_email_placeholder: 'seu@email.com',
    np_email_aria: 'Endereço de e-mail',
    np_joining: 'Entrando…',
    np_submit: 'Inscrever-se',
    np_dismiss: 'Não, obrigado',

    // ── Cartão de produto (selos, placeholder) ──────────────────
    badge_new_arrival: 'Novidade',
    badge_top_pick: 'Top Pick',
    badge_trending: 'Em alta',
    badge_staff_pick: 'Escolha da equipe',
    badge_sale: 'Promoção',
    badge_new: 'Novo',
    badge_best_seller: 'Mais vendido',

    // ── Rota de busca + preditiva ───────────────────────────────
    search_results_h: 'Resultados para {term}',
    search_results_h_fallback: 'Buscar',
    search_input_placeholder: 'Buscar produtos…',
    search_submit: 'Buscar',
    search_zero_hint:
      'Busque por palavra-chave ou navegue pelas nossas categorias mais populares acima.',
    pred_articles: 'Artigos',
    pred_collections: 'Coleções',
    pred_pages: 'Páginas',
    pred_products: 'Achados',
    pred_empty_title: 'Comece a digitar para buscar',
    pred_empty_body:
      'Tente categorias como "mais vendidos", "casa" ou nomes específicos de produtos.',
    pred_pill_best: 'Mais vendidos',
    pred_pill_all: 'Todas as categorias',
    pred_pill_new: 'Novidades',
    pred_no_results_h: 'Nenhum resultado para «{term}».',
    pred_no_results_body:
      'Tente outra palavra-chave ou explore os mais amados.',

    // ── H1 da página do carrinho ────────────────────────────────
    cart_page_h: 'Carrinho',
    cart_page_eyebrow: 'Seu carrinho',
    cart_trust_aria: 'Por que comprar com a gente',
    cart_trust_returns: 'Devoluções em 30 dias',
    cart_trust_shipping: 'Envio em 24 horas',
    cart_trust_secure: 'Pagamento seguro',

    // ── Página índice de coleções ───────────────────────────────
    col_index_breadcrumb_aria: 'Caminho de navegação',
    col_index_breadcrumb_home: 'Início',
    col_index_breadcrumb_current: 'Coleções',
    col_index_eyebrow: 'Explorar',
    col_index_h: 'Todas as coleções',
    col_index_sub: 'Explore achados por categoria, problema ou uso.',
    col_index_count: 'Puchica',
    col_index_empty_h: 'Ainda não há coleções',
    col_index_empty_body:
      'As coleções aparecerão aqui conforme forem adicionadas.',
    col_index_card_cta: 'Comprar a coleção →',

    // ── Índice de políticas ─────────────────────────────────────
    policies_h: 'Políticas',
    policies_sub:
      'Envio, devoluções, privacidade e termos para pedidos na Puchica.',

    // ── Link de volta das políticas ─────────────────────────────
    policy_back: 'Voltar para Políticas',
    refund_summary_title: 'Antes de enviar uma devolução',
    refund_summary_start:
      'Entre em contato dentro de 30 dias após a entrega. Não envie nada antes de confirmarmos a elegibilidade, as instruções e o endereço de devolução.',
    refund_summary_shipping:
      'A responsabilidade pelo frete de devolução depende do motivo e da política completa. Se um item chegar danificado ou incorreto, escreva logo com os dados do pedido.',
    refund_summary_timing:
      'Os reembolsos aprovados são enviados ao método de pagamento original após o recebimento e a análise da devolução. O prazo bancário pode variar.',
    refund_summary_control:
      'Este resumo não substitui a política completa da Shopify abaixo, que prevalece se houver alguma diferença.',

    // ── Índice de blogs ─────────────────────────────────────────
    blogs_h: 'Blogs',

    // ── Área de conta (layout, perfil, pedidos, endereços) ────
    account_welcome: 'Bem-vindo, {firstName}',
    account_welcome_fallback: 'Bem-vindo à sua conta.',
    account_welcome_anon: 'Detalhes da conta',
    account_nav_orders: 'Pedidos',
    account_nav_profile: 'Perfil',
    account_nav_addresses: 'Endereços',
    account_signout: 'Sair',
    account_profile_h: 'Meu perfil',
    account_profile_fieldset: 'Informações pessoais',
    account_first_name: 'Nome',
    account_last_name: 'Sobrenome',
    account_updating: 'Atualizando',
    account_update: 'Atualizar',
    account_addresses_h: 'Endereços',
    account_addresses_create_legend: 'Criar endereço',
    account_addresses_empty: 'Você não tem endereços salvos.',
    account_addresses_creating: 'Criando',
    account_addresses_create: 'Criar',
    account_addresses_existing: 'Endereços existentes',
    account_addresses_saving: 'Salvando',
    account_addresses_save: 'Salvar',
    account_addresses_deleting: 'Excluindo',
    account_addresses_delete: 'Excluir',
    account_address_first: 'Nome',
    account_address_last: 'Sobrenome',
    account_address_company: 'Empresa',
    account_address_line1: 'Linha de endereço 1',
    account_address_line2: 'Linha de endereço 2',
    account_address_city: 'Cidade',
    account_address_state: 'Estado / Província',
    account_address_zip: 'CEP',
    account_address_country: 'País',
    account_address_phone: 'Telefone',
    account_address_phone_aria: 'Número de telefone',
    account_address_phone_ph: '+16135551111',
    account_address_default_label: 'Definir como endereço padrão',
    account_orders_h: 'Pedidos',
    account_orders_meta: 'Pedidos',
    account_orders_empty_filtered: 'Nenhum pedido encontrado para sua busca.',
    account_orders_empty_filtered_cta: 'Limpar filtros →',
    account_orders_empty: 'Você ainda não fez nenhum pedido.',
    account_orders_empty_cta: 'Comece a comprar →',
    account_orders_search_aria: 'Buscar pedidos',
    account_orders_filter_legend: 'Filtrar pedidos',
    account_orders_search_ph: 'Nº do pedido',
    account_orders_search_aria_named: 'Número do pedido',
    account_orders_conf_ph: 'Nº de confirmação',
    account_orders_conf_aria: 'Número de confirmação',
    account_orders_searching: 'Buscando',
    account_orders_search: 'Buscar',
    account_orders_clear: 'Limpar',
    account_orders_confirmation: 'Confirmação: {num}',
    account_orders_view: 'Ver pedido →',
    account_order_h: 'Pedido {name}',
    account_order_meta: 'Pedido {name}',
    account_order_placed: 'Feito em {date}',
    account_order_confirmation: 'Confirmação: {num}',
    account_order_th_product: 'Produto',
    account_order_th_price: 'Preço',
    account_order_th_qty: 'Quantidade',
    account_order_th_total: 'Total',
    account_order_discounts: 'Descontos',
    account_order_discount_line: '-{pct}% DE DESCONTO',
    account_order_subtotal: 'Subtotal',
    account_order_tax: 'Impostos',
    account_order_total: 'Total',
    account_order_shipping_h: 'Endereço de envio',
    account_order_no_shipping: 'Nenhum endereço de envio definido',
    account_order_status_h: 'Status',
    account_order_status_na: 'N/D',
    account_order_status_link: 'Ver status do pedido →',

    // ── Página Sobre ──────────────────────────────────────────────
    about_hero_eyebrow: 'Nossa história',
    about_hero_title_main: 'Uma loja de viagem menor',
    about_hero_title_em: 'com motivos melhores para comprar.',
    about_hero_sub:
      'A Puchica é uma loja canadense independente que começa com três organizadores de viagem práticos para roupas, cabos e itens de higiene.',
    about_hero_cta: 'Ver a seleção de viagem →',
    about_stats_aria: 'Puchica em números',
    about_stat_products_num: 'Ativo',
    about_stat_products_label: 'Produtos selecionados',
    about_stat_quality_num: '100%',
    about_stat_quality_label: 'Controle de qualidade',
    about_stat_shipping_num: '$0',
    about_stat_shipping_label: 'Frete no Canadá',
    about_stat_returns_num: '30 dias',
    about_stat_returns_label: 'Devoluções sem complicação',
    about_mission_eye: 'Por que existimos',
    about_mission_title:
      'Em um espaço pequeno, cada coisa fora do lugar parece maior.',
    about_mission_body_1:
      'Uma gaveta cheia, um cabo enrolado ou uma mala lotada pode complicar um dia comum. A Puchica ajuda a resolver esses pequenos problemas recorrentes.',
    about_mission_body_2:
      'A Puchica adota a abordagem oposta. Nossa primeira seleção tem um objetivo: deixar uma mala mais fácil de usar. Cada produto deve ter uma função clara e opções compreensíveis.',
    about_mission_card_text:
      'Útil primeiro. Claro antes do pagamento. Vale o espaço que ocupa.',
    about_how_eye: 'O que merece um lugar',
    about_how_title: 'Cada produto deve justificar o espaço que ocupa.',
    about_how_1_title: 'Resolve um problema específico',
    about_how_1_body:
      'Começamos com uma função clara: separar roupas, guardar pequenos acessórios ou manter itens de higiene fáceis de encontrar.',
    about_how_2_title: 'Faz parte do mesmo sistema de viagem',
    about_how_2_body:
      'Os três produtos funcionam juntos em uma mala, bolsa de fim de semana, bolsa de academia ou bagagem de mão.',
    about_how_3_title: 'Fácil de entender antes da compra',
    about_how_3_body:
      'O produto precisa ter um propósito, detalhes e opções claros. A disponibilidade, o custo e o prazo de entrega são confirmados no checkout.',
    about_cats_eye: 'O que oferecemos',
    about_cats_title: 'Achados úteis. Uma só loja.',
    about_cats_sub:
      'Em todas as categorias que realmente importam no seu dia a dia.',
    about_cat_home_name: 'Casa & Decoração',
    about_cat_home_sub: 'Áudio, cozinha, decoração, armazenamento',
    about_cat_beauty_name: 'Beleza & Cuidados',
    about_cat_beauty_sub: 'Skincare, bem-estar, cuidados pessoais',
    about_cat_tech_name: 'Tech & Gadgets',
    about_cat_tech_sub: 'Acessórios, ferramentas, casa inteligente',
    about_cat_outdoor_name: 'Ar livre & Jardim',
    about_cat_outdoor_sub: 'Patio, camping, jardinagem',
    about_cat_pet_name: 'Achados para pets',
    about_cat_pet_sub: 'Brinquedos, equipamentos, higiene',
    about_cat_gift_name: 'Presentes',
    about_cat_gift_sub: 'Para todos na sua lista',
    about_promise_quote:
      'Cada produto Puchica foi testado a fundo pela nossa equipe. Oferecemos a seleção mais curada de produtos que conseguimos encontrar. Se não usaríamos nós mesmos, não será Puchica.',
    about_promise_attr: 'Equipe Puchica, Toronto ON',
    about_cta_title: 'Pronto para abrir espaço para dias mais tranquilos?',
    about_dept_title: 'Explorar a loja',
    about_cta_sub:
      'Comece com um achado, um problema para resolver ou uma categoria que te chamou atenção.',
    about_cta_browse: 'Ver todos os achados →',
    about_cta_contact: 'Fale conosco',

    // ── Página About, novas seções (linha do tempo, valores, equipe, raízes, departamentos) ──
    about_story_eye: 'Nossa história',
    about_story_title: 'Como a Puchica nasceu.',
    about_story_sub: 'Alguns momentos que nos trouxeram até aqui.',
    about_story_1_year: '2021',
    about_story_1_title: 'Começou com um "puchica"',
    about_story_1_body:
      'Uma pequena ideia nascida em Toronto: criar uma loja onde tudo valha a pena comprar. Sem enrolação, sem lixo, sem escolhas por algoritmo.',
    about_story_2_year: '2022',
    about_story_2_title: 'Os primeiros 1.000 produtos',
    about_story_2_body:
      'Um catálogo amplo dificultava explicar por que cada produto pertencia. Focamos em achados de alto valor e construímos uma rede de fornecedores confiável.',
    about_story_3_year: '2024',
    about_story_3_title: 'Uma loja focada em achados',
    about_story_3_body:
      'O catálogo agora é construído em torno de achados de alto valor — fornecedores verificados, frete transparente no checkout e devolução de 30 dias em cada pedido.',
    about_story_4_year: 'Hoje',
    about_story_4_title: 'Raízes pelas Américas',
    about_story_4_body:
      'De uma base em Toronto até compradores por toda as Américas, a missão continua a mesma: o que é bom, escolhido à mão.',

    about_values_eye: 'O que defendemos',
    about_values_title: 'Nossos valores.',
    about_values_sub: 'As regras por trás de cada escolha que fazemos.',
    about_values_1_title: 'Curado, não lotado',
    about_values_1_body:
      'Dizemos não a muito mais do que dizemos sim. Um catálogo menor e melhor vence um gigante e medíocre.',
    about_values_2_title: 'Preços justos sempre',
    about_values_2_body:
      'Sem descontos falsos, sem margens misteriosas. O preço que você vê é honesto, e o valor é real.',
    about_values_3_title: 'Alma acima de tendências',
    about_values_3_body:
      'Escolhemos coisas que duram e importam, não o que o algoritmo está empurrando esta semana.',
    about_values_4_title: 'Enviado por parceiros de confiança',
    about_values_4_body:
      'Cada pedido sai de um parceiro verificado em 24 horas, com uma etiqueta de devolução pré-paga em cada caixa.',

    about_team_eye: 'Quem somos',
    about_team_title: 'Pessoas reais, escolhas reais.',
    about_team_sub:
      'Uma equipe pequena em Toronto, por trás de cada produto que passa no filtro.',
    about_team_1_name: 'Mariana L.',
    about_team_1_role: 'Fundadora & Curadora',
    about_team_1_bio:
      'Escolhemos produtos que resolvem um problema real, vêm de fornecedores verificados e merecem seu lugar em uma coleção focada.',
    about_team_2_name: 'Diego R.',
    about_team_2_role: 'Líder de Operações',
    about_team_2_bio:
      'Mantém a rede de fornecedores funcionando e cada pedido enviado no prazo. O motivo de o seu pacote chegar rápido.',
    about_team_3_name: 'Sofía M.',
    about_team_3_role: 'Comunidade & Atendimento',
    about_team_3_bio:
      'Responde às suas perguntas, ouve o seu feedback e garante que a loja continue melhorando.',

    about_roots_aria: 'Nossas raízes centro-americanas',
    about_roots_eyebrow: 'De onde vem o nome',
    about_roots_heading: 'Puchica começa com uma sensação de surpresa útil.',
    about_roots_body:
      '“Puchica” é uma expressão centro-americana familiar de surpresa, como a reação que uma solução inesperadamente inteligente pode provocar. Esse espírito orienta a marca: itens práticos que resolvem um incômodo cotidiano sem criar mais bagunça.',
    about_roots_signature:
      'Empresa canadense. Poucos produtos, utilidade clara.',
    about_hero_caption: 'Pensado em torno do que você usa durante a viagem.',
    about_hero_image_alt:
      'Roupas e itens essenciais preparados para arrumar a mala',
    about_roots_image_alt:
      'Um tecido colorido e um recipiente de cerâmica pintada',
    about_standards_intro:
      'Um catálogo menor só funciona quando o motivo de cada produto é fácil de explicar.',
    about_shop_eye: 'A seleção de viagem',
    about_shop_title: 'Comece pela parte da arrumação que mais atrasa você.',
    about_shop_home_title: 'Cubos organizadores',
    about_shop_cable_title: 'Organizador de cabos',
    about_shop_travel_title: 'Necessaire organizadora',
    about_shop_home_body: 'Separe as roupas em três cubos com zíper.',
    about_shop_cable_body: 'Mantenha carregadores, adaptadores e fones juntos.',
    about_shop_travel_body:
      'Dê um lugar a frascos, itens de cuidado e cosméticos.',
    about_shop_all: 'Ver toda a seleção de viagem',
    about_now_eye: 'Entrega mais clara',
    about_now_title: 'Veja suas opções de entrega antes de pagar.',
    about_now_body:
      'A origem e o prazo de envio podem variar conforme o item e o endereço. O checkout mostra as opções disponíveis para o pedido antes do pagamento.',
    about_now_email: 'Dúvidas? Escreva para hello@puchica.ca',
    about_delivery_panel_title: 'Prévia de entrega no checkout',
    about_delivery_step_1_title: 'Escolha um item',
    about_delivery_step_1_body: 'Adicione um achado e informe seu endereço.',
    about_delivery_step_2_title: 'Veja as opções disponíveis',
    about_delivery_step_2_body:
      'O checkout calcula as alternativas para o pedido.',
    about_delivery_step_3_title: 'Revise antes de pagar',
    about_delivery_step_3_body: 'Compare o prazo e o custo disponíveis.',
    about_delivery_note: 'Detalhes de entrega exibidos antes do pagamento',
    about_fact_based_label: 'Localizada no',
    about_fact_based_value: 'Canadá',
    about_fact_market_label: 'Mercado atual',
    about_fact_market_value: 'Clientes nos Estados Unidos',
    about_fact_delivery_label: 'Antes do pagamento',
    about_fact_delivery_value: 'Opções de entrega exibidas no checkout',

    about_depts_eye: 'Continue explorando',
    about_depts_title: 'Comprar por departamento.',
    about_depts_sub:
      'Cada categoria, curada com o mesmo cuidado. Escolha por onde começar.',
    about_depts_shop_cta: 'Comprar →',
    about_depts_home: 'Casa & Decoração',
    about_depts_beauty: 'Beleza & Cuidados',
    about_depts_tech: 'Tecnologia & Gadgets',
    about_depts_outdoor: 'Exterior & Jardim',
    about_depts_pet: 'Para Pets',
    about_depts_gifts: 'Presentes',

    // ── Página de contato ─────────────────────────────────────────
    contact_hero_eyebrow: 'Fale conosco',
    contact_hero_title: 'Estamos aqui para ajudar.',
    contact_hero_sub:
      'Para ajuda com um pedido, inclua o número. Para um produto, inclua o nome ou link.',
    contact_channels_aria: 'Formas de entrar em contato',
    contact_ig_title: 'DM no Instagram',
    contact_ig_body: 'Acompanhe demos e novidades.',
    contact_ig_fallback: 'Instagram',
    contact_fb_title: 'Mensagem no Facebook',
    contact_fb_body: 'Acompanhe atualizações e novidades.',
    contact_fb_fallback: 'Facebook',
    contact_tiktok_title: 'Nos encontre no TikTok',
    contact_tiktok_body: 'Demos e novidades.',
    contact_tiktok_fallback: 'TikTok',
    contact_promises_aria: 'O que esperar',
    contact_promises_eyebrow: 'O que esperar',
    contact_promises_title: 'Ajude-nos a encontrar a resposta certa',
    contact_promise_1_strong: 'Inclua os dados principais',
    contact_promise_1_body:
      'Inclua o número do pedido, o link do produto e sua pergunta.',
    contact_promise_2_strong: 'Aguarde dois dias úteis',
    contact_promise_2_body:
      'Buscamos responder em até dois dias úteis. Consultas ao fornecedor ou transportador podem levar mais tempo.',
    contact_promise_3_strong: 'Confirmamos o que é possível',
    contact_promise_3_body:
      'Alterações, cancelamentos e devoluções dependem do status do pedido e da política aplicável.',
    contact_faq_aria: 'Perguntas comuns',
    contact_faq_eyebrow: 'Perguntas comuns',
    contact_faq_title: 'A versão curta',
    contact_faq_1_q: 'Onde está meu pedido?',
    contact_faq_1_a:
      'Quando houver um serviço com rastreamento, o link será incluído no e-mail de confirmação de envio. Escreva para nós com o número do pedido se precisar de ajuda.',
    contact_faq_2_q: 'Posso alterar ou cancelar meu pedido?',
    contact_faq_2_a:
      'Entre em contato o mais rápido possível com o número do pedido. Confirmaremos se o fornecedor já começou a processá-lo e quais opções ainda estão disponíveis.',
    contact_faq_3_q: 'Como funcionam as devoluções?',
    contact_faq_3_a:
      'Entre em contato dentro de 30 dias após a entrega. Não envie nada antes de confirmarmos a elegibilidade e as instruções. A responsabilidade pelo frete depende do motivo e da política.',
    contact_faq_4_q: 'Para onde vocês enviam?',
    contact_faq_4_a:
      'Canadá e Estados Unidos são mercados selecionáveis. A entrega ainda depende do produto e endereço; o checkout deve confirmar o carrinho antes do pagamento.',
    contact_faq_5_q: 'Os produtos nas fotos são exatamente o que vou receber?',
    contact_faq_5_a:
      'Confira as fotos, a variante escolhida, as dimensões e a descrição. Escreva antes de pedir se algum detalhe não estiver claro.',
    contact_cta_title: 'Ainda tem uma pergunta?',
    contact_cta_body:
      'O e-mail é melhor para pedidos. Buscamos responder em até dois dias úteis.',
    contact_cta_button: 'Escrever para {email}',

    // ── Página FAQ (rota dedicada /pages/faq) ──────────────────
    faq_accordion_aria: 'Perguntas frequentes',
    faq_hero_eyebrow: 'Central de ajuda',
    faq_hero_title: 'Perguntas frequentes',
    faq_hero_sub:
      'Respostas rápidas para as perguntas que mais ouvimos, pedidos, devoluções, produtos e sua conta.',
    faq_cat_orders: 'Pedidos e envio',
    faq_cat_returns: 'Devoluções e reembolsos',
    faq_cat_products: 'Produtos',
    faq_cat_account: 'Conta',
    faq_orders_1_q: 'Quanto tempo leva o envio?',
    faq_orders_1_a:
      'Os prazos de processamento e entrega variam conforme o produto. Informe seu endereço no checkout para consultar a estimativa disponível antes do pagamento.',
    faq_orders_2_q: 'Vocês enviam internacionalmente?',
    faq_orders_2_a:
      'Canadá e Estados Unidos são mercados selecionáveis. A seleção não garante a entrega de todos os itens; o checkout confirma o carrinho e o endereço antes do pagamento.',
    faq_orders_3_q: 'Como rastrear meu pedido?',
    faq_orders_3_a:
      'Quando houver um serviço com rastreamento, o link será incluído no e-mail de confirmação de envio. Entre em contato com o número do pedido se precisar de ajuda.',
    faq_orders_4_q: 'Quais são as taxas de envio?',
    faq_orders_4_a:
      'Os serviços, o custo e o prazo de entrega são confirmados no checkout conforme os itens selecionados e o destino.',
    faq_returns_1_q: 'Qual é a política de devoluções?',
    faq_returns_1_a:
      'Entre em contato dentro de 30 dias após a entrega. A elegibilidade depende do item, do estado e da política de reembolso. Escreva logo se chegar danificado ou incorreto.',
    faq_returns_2_q: 'Como iniciar uma devolução?',
    faq_returns_2_a:
      'Escreva com o número do pedido e o motivo. Não envie nada antes de confirmarmos a elegibilidade e o endereço. A responsabilidade pelo frete depende do motivo e da política.',
    faq_returns_3_q: 'Quando receberei meu reembolso?',
    faq_returns_3_a:
      'Os reembolsos aprovados são enviados ao método de pagamento original após o recebimento e a análise do item devolvido. O prazo de processamento bancário pode variar.',
    faq_products_1_q: 'Onde encontro os detalhes do produto?',
    faq_products_1_a:
      'Confira a página do produto para ver opções, dimensões, materiais e o que está incluído. Fale conosco se faltar algum detalhe.',
    faq_products_2_q: 'De onde vêm seus produtos?',
    faq_products_2_a:
      'Trabalhamos com fornecedores terceiros e a origem pode variar por item. Fale conosco antes de pedir se precisar de uma informação específica.',
    faq_products_3_q: 'Como escolho a opção correta?',
    faq_products_3_a:
      'Confira o tamanho, a cor, a quantidade e o conjunto selecionados antes de adicionar o item ao carrinho.',
    faq_account_1_q: 'Como acesso minha conta?',
    faq_account_1_a:
      'Escolha Conta, digite seu e-mail e siga as etapas de acesso. Na conta, você pode ver pedidos e gerenciar os dados salvos.',
    faq_account_2_q: 'Não consigo entrar. O que faço?',
    faq_account_2_a:
      'Peça um novo código ou link na página Conta e verifique a pasta de spam. Fale conosco se ainda não chegar.',
    faq_cta_eyebrow: 'Ainda com dúvidas?',
    faq_cta_title: 'Ainda tem perguntas?',
    faq_cta_sub:
      'Envie os detalhes do produto ou pedido. Buscamos responder em até dois dias úteis.',
    faq_cta_button: 'Fale conosco',
    faq_contact_aria: 'Fale conosco',
    faq_contact_title: 'Fale conosco',
    faq_contact_body:
      'Não encontra o que procura? Escreva para nós, ficamos felizes em ajudar com pedidos, devoluções, produtos ou qualquer outra coisa.',

    aside_heading_cart: 'Carrinho',
    aside_heading_search: 'Pesquisar',
    aside_heading_menu: 'Menu',
    cart_loading: 'Carregando carrinho…',
    search_placeholder: 'Buscar por categoria, problema ou uso',
    search_aria_submit: 'Pesquisar',
    search_submit_label: 'Pesquisar',
    search_loading_for: 'Pesquisando por “{term}”…',
    search_view_all: 'Ver todos os resultados para “{term}” →',

    // ── Seções da página inicial (redesign Fase 1) ────────────────
    hero_split_aria: 'Hero',
    hero_split_eyebrow: 'Achados · Abaixo de C$200',
    hero_split_heading: 'Compre casa, tech, pets, presentes e mais.',
    hero_split_body:
      'Achados de alto valor abaixo de C$200 — fornecedores verificados, frete transparente, devoluções de 30 dias.',
    hero_split_cta_primary: 'Ver mais vendidos',
    hero_split_cta_secondary: 'Ver tudo',
    hero_split_trust:
      'Opções de frete no checkout · Devoluções em 30 dias · Suporte humano',
    hero_trust_returns: 'Devoluções em 30 dias',
    hero_trust_checkout: 'Checkout Shopify seguro',
    hero_trust_canada: 'Catálogo pequeno e ativo',
    hero_showcase_bar: 'Comprar por departamento →',

    shop_by_category_aria: 'Comprar por categoria',
    shop_by_category_eyebrow: 'Categorias',
    shop_by_category_heading: 'Encontre o seu',
    shop_by_category_shop_cta: 'Comprar',

    best_sellers_aria: 'Mais vendidos',
    best_sellers_eyebrow: 'Os mais amados',
    best_sellers_heading: 'Mais vendidos da semana',
    best_sellers_see_all: 'Ver tudo',

    lifestyle_banner_aria: 'Estilo de vida',
    lifestyle_shop_eyebrow: 'Explorar',
    lifestyle_shop_heading: 'Comprar por estilo de vida',
    lifestyle_shop_sub: 'Comece pelo momento e encontre a categoria ideal.',
    lifestyle_shop_home_title: 'Upgrades para casa que valem a pena',
    lifestyle_shop_home_body:
      'Melhorias úteis para os ambientes e rotinas de todos os dias.',
    lifestyle_shop_motion_title: 'Movimento diário',
    lifestyle_shop_motion_body:
      'Achados práticos para sair, se manter ativo e se movimentar melhor.',
    lifestyle_shop_family_title: 'Brincadeira e família',
    lifestyle_shop_family_body:
      'Escolhas pensadas para brincar, pequenas rotinas e momentos compartilhados.',
    lifestyle_shop_cta: 'Ver a seleção →',
    lifestyle_banner_eyebrow: 'Vida lenta',
    lifestyle_banner_heading: 'Encontre seu próximo favorito.',
    lifestyle_banner_body:
      'Achados e soluções do dia a dia que merecem seu lugar em uma casa, cozinha ou bolsa de viagem de verdade.',
    lifestyle_banner_cta: 'Ver achados',

    new_arrivals_aria: 'Novidades',
    new_arrivals_eyebrow: 'Acabou de chegar',
    new_arrivals_heading: 'Novidades',
    new_arrivals_see_all: 'Ver tudo',
    new_arrivals_scroll_left: 'Rolar para a esquerda',
    new_arrivals_scroll_right: 'Rolar para a direita',

    sports_aria: 'Esportes e ar livre',
    sports_eyebrow: 'Mexa-se',
    sports_heading: 'Esportes e ar livre',
    sports_see_all: 'Comprar esportes',

    world_cup_aria: 'Camisas e equipamento de futebol',
    world_cup_eyebrow: 'Represente seu país',
    world_cup_heading: 'A camisa da sua terra, onde quer que seja.',
    world_cup_see_all: 'Ver todo o futebol',

    rail_scroll_left: 'Rolar para a esquerda',
    rail_scroll_right: 'Rolar para a direita',

    trust_bar_aria: 'Por que comprar conosco',
    trust_bar_shipping_h: 'Frete claro',
    trust_bar_shipping_sub: 'Opções e custos exibidos no checkout',
    trust_bar_returns_h: 'Devoluções em 30 dias',
    trust_bar_returns_sub: 'Consulte a política antes de comprar',
    trust_bar_curated_h: 'Catálogo ativo',
    trust_bar_curated_sub: 'Produtos prontos para comprar hoje',

    home_reviews_aria: 'Avaliações de clientes',
    home_reviews_eyebrow: 'Amado por mais de 12.000 compradores',
    home_reviews_heading: 'O que nossos clientes dizem',
    home_reviews_verified: 'Comprador verificado',
    home_reviews_quote_1_text:
      'A qualidade é constante, o envio é rápido e as devoluções são sem perguntas. Por isso volto sempre.',
    home_reviews_quote_1_author: 'Maya R. Toronto',
    home_reviews_quote_2_text:
      'Encontrei um presente que não achei em nenhum outro lugar. A embalagem parecia pensada nos mínimos detalhes.',
    home_reviews_quote_2_author: 'James P. Vancouver',
    home_reviews_quote_3_text:
      'O atendimento responde mesmo. Tive uma dúvida e recebi uma resposta de verdade no mesmo dia.',
    home_reviews_quote_3_author: 'Sophie L. Montréal',

    home_newsletter_aria: 'Newsletter',
    home_newsletter_eyebrow: 'Junte-se à lista',
    home_newsletter_heading: 'Novidades de viagem, sem bagunça',
    home_newsletter_body:
      'Novidades, reposições e promoções ocasionais, direto no seu e-mail, sem spam.',
    home_newsletter_placeholder: 'voce@exemplo.com',
    home_newsletter_submit: 'Inscrever',
    home_newsletter_promise: 'Sem spam. Cancele quando quiser.',

    home_roots_aria: 'Nossas raízes',
    home_roots_eyebrow: 'As raízes da Puchica',
    home_roots_heading: 'Da América Central ao mundo.',
    home_roots_body:
      'Puchica, é o que se diz quando algo te pega de surpresa. Um nascer do sol sobre o lago Atitlán. Café cultivado em encostas vulcânicas. Têxteis tecidos da mesma forma há três gerações nas terras altas da Guatemala. De Antigua a Honduras, trazemos esse sentimento para clientes do mundo todo.',
    home_roots_signature: 'Hecho con alma · Feito com alma',

    // ── World map ─────────────────────────────────────────────────
    world_map_aria: 'Países que atendemos',
    world_map_eyebrow: 'Mundial',
    world_map_heading: 'De nossas raízes à sua porta.',
    world_map_sub:
      'Puchica envia para clientes do mundo todo. Toque num pino para ver o que nos conecta.',

    home_shop_dept_aria: 'Comprar por departamento',
    home_shop_dept_eyebrow: 'Tendência desta semana',
    home_shop_dept_heading: 'Achados de alto valor, selecionados a mão.',
    home_shop_dept_body:
      'Achados em áudio, cozinha, fitness, casa e ar livre — cada produto vem de um fornecedor verificado.',
    home_dept_home: 'Casa & Cozinha',
    home_dept_electronics: 'Eletrônicos',
    home_dept_apparel: 'Roupas',
    home_dept_health: 'Saúde & Bem-estar',
    home_dept_pet: 'Pets',
    home_dept_sports: 'Esportes & Ar Livre',

    home_curate_aria: 'Como selecionamos',
    home_curate_eyebrow: 'Por que Puchica',
    home_curate_heading: 'O que vale, sem complicação.',
    home_curate_step1_h: 'Começamos com um problema real que vale resolver.',
    home_curate_step1_b:
      'Trabalhamos com fornecedores verificados em todo o mundo para trazer produtos que valem seu dinheiro.',
    home_curate_step2_h: 'Preço justo.',
    home_curate_step2_b:
      'Comparamos o preço com o custo de entrega e só destacamos produtos que podem sustentar uma oferta viável.',
    home_curate_step3_h: 'Entrega rápida.',
    home_curate_step3_b:
      'As opções de entrega são confirmadas no checkout conforme os itens e o destino. Nossa equipe pode ajudar antes ou depois do pedido.',

    hero_store_stat_products: 'Catálogo',
    hero_store_stat_departments: 'Departamentos',
    hero_store_stat_shipping: 'Frete exibido',
    hero_storefront_title: 'Formas populares de comprar',
    shop_by_category_sub:
      'Comece pelos departamentos ativos e prontos para comprar.',

    // ── PDP route meta (localized) ────────────────────────────────
    pdp_meta_title_suffix: ' – Puchica',
    pdp_meta_description_fallback:
      'Compre {title} na Puchica. As opções de envio para o Canadá são mostradas no checkout.',
  },
};
