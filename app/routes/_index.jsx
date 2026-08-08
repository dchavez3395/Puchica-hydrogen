import {useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {
  JsonLdScript,
  organizationJsonLd,
  puchicaMeta,
} from '~/lib/seo';

const HOME_COPY = {
  en: {
    metaTitle: 'Puchica — practical finds, carefully chosen',
    metaDescription:
      'Puchica is building a focused shop for practical everyday products. Every product is reviewed before it earns a place in the catalog.',
    eyebrow: 'Puchica · Canada',
    title: 'A more useful shop is taking shape.',
    intro:
      'We’re carefully reviewing every product, supplier, price, and delivery detail before it earns a place here.',
    focus:
      'Puchica is reviewing a focused catalog of practical products for everyday life.',
    artNote: 'Useful things deserve a clear reason to be here.',
    primary: 'Read our story',
    secondary: 'Contact us',
    standardEyebrow: 'Our standard',
    standardTitle: 'A smaller catalog. Better reasons to buy.',
    standardIntro:
      'We would rather pause than fill the shop with products we have not checked carefully enough.',
    principles: [
      {
        number: '01',
        title: 'Useful by design',
        body: 'Each product should solve a clear, everyday problem without adding more clutter.',
      },
      {
        number: '02',
        title: 'Clear before checkout',
        body: 'Price, options, dimensions, delivery, and returns should be easy to understand.',
      },
      {
        number: '03',
        title: 'Checked before launch',
        body: 'Supplier routes, product details, and storefront claims must be verified first.',
      },
    ],
    pauseEyebrow: 'Behind the scenes',
    pauseTitle: 'We’re doing the unglamorous work now.',
    pauseBody:
      'The storefront is being rebuilt around a focused catalog, dependable product information, and accessible shopping. When products return, they should be here for a reason—not simply to fill a page.',
    linksTitle: 'Puchica is still here.',
    linksBody:
      'Learn about the shop, read our current policies, or reach us directly while the new catalog is being prepared.',
    about: 'About Puchica',
    policies: 'View policies',
    contact: 'Contact us',
  },
  fr: {
    metaTitle: 'Puchica — des trouvailles pratiques, choisies avec soin',
    metaDescription:
      'Puchica prépare une boutique ciblée de produits pratiques pour la vie quotidienne. Chaque produit est examiné avant son ajout au catalogue.',
    eyebrow: 'Puchica · Canada',
    title: 'Une boutique plus utile prend forme.',
    intro:
      'Nous examinons soigneusement chaque produit, fournisseur, prix et détail de livraison avant de lui faire une place ici.',
    focus:
      'Puchica examine un catalogue ciblé de produits pratiques pour la vie quotidienne.',
    artNote: 'Les objets utiles méritent une vraie raison d’être ici.',
    primary: 'Découvrir notre histoire',
    secondary: 'Nous contacter',
    standardEyebrow: 'Notre standard',
    standardTitle: 'Un catalogue plus petit. De meilleures raisons d’acheter.',
    standardIntro:
      'Nous préférons faire une pause plutôt que de remplir la boutique de produits qui n’ont pas été assez vérifiés.',
    principles: [
      {
        number: '01',
        title: 'Utile par conception',
        body: 'Chaque produit doit résoudre un problème quotidien clair sans créer plus d’encombrement.',
      },
      {
        number: '02',
        title: 'Clair avant le paiement',
        body: 'Le prix, les options, les dimensions, la livraison et les retours doivent être faciles à comprendre.',
      },
      {
        number: '03',
        title: 'Vérifié avant le lancement',
        body: 'Les fournisseurs, les détails des produits et les affirmations du site doivent d’abord être vérifiés.',
      },
    ],
    pauseEyebrow: 'En coulisses',
    pauseTitle: 'Nous faisons maintenant le travail essentiel.',
    pauseBody:
      'La boutique est reconstruite autour d’un catalogue ciblé, d’informations fiables et d’une expérience accessible. Lorsque les produits reviendront, chacun aura une vraie raison d’être ici.',
    linksTitle: 'Puchica est toujours là.',
    linksBody:
      'Découvrez la boutique, consultez nos politiques actuelles ou écrivez-nous pendant la préparation du nouveau catalogue.',
    about: 'À propos de Puchica',
    policies: 'Voir les politiques',
    contact: 'Nous contacter',
  },
  es: {
    metaTitle: 'Puchica — productos prácticos, elegidos con cuidado',
    metaDescription:
      'Puchica está creando una tienda enfocada en productos prácticos para la vida diaria. Cada producto se revisa antes de entrar al catálogo.',
    eyebrow: 'Puchica · Canadá',
    title: 'Una tienda más útil está tomando forma.',
    intro:
      'Estamos revisando cuidadosamente cada producto, proveedor, precio y detalle de entrega antes de darle un lugar aquí.',
    focus:
      'Puchica está revisando un catálogo enfocado de productos prácticos para la vida diaria.',
    artNote: 'Las cosas útiles merecen una razón clara para estar aquí.',
    primary: 'Conoce nuestra historia',
    secondary: 'Contáctanos',
    standardEyebrow: 'Nuestro estándar',
    standardTitle: 'Un catálogo más pequeño. Mejores razones para comprar.',
    standardIntro:
      'Preferimos hacer una pausa antes que llenar la tienda con productos que no hemos revisado lo suficiente.',
    principles: [
      {
        number: '01',
        title: 'Útil por diseño',
        body: 'Cada producto debe resolver un problema cotidiano claro sin añadir más desorden.',
      },
      {
        number: '02',
        title: 'Claro antes de pagar',
        body: 'El precio, las opciones, las medidas, la entrega y las devoluciones deben ser fáciles de entender.',
      },
      {
        number: '03',
        title: 'Revisado antes del lanzamiento',
        body: 'Las rutas de proveedores, los detalles y las afirmaciones de la tienda deben verificarse primero.',
      },
    ],
    pauseEyebrow: 'Entre bastidores',
    pauseTitle: 'Ahora estamos haciendo el trabajo esencial.',
    pauseBody:
      'Estamos reconstruyendo la tienda alrededor de un catálogo enfocado, información confiable y una experiencia accesible. Cuando vuelvan los productos, cada uno estará aquí por una razón.',
    linksTitle: 'Puchica sigue aquí.',
    linksBody:
      'Conoce la tienda, consulta nuestras políticas actuales o escríbenos mientras preparamos el nuevo catálogo.',
    about: 'Acerca de Puchica',
    policies: 'Ver políticas',
    contact: 'Contáctanos',
  },
  'pt-br': {
    metaTitle: 'Puchica — produtos práticos, escolhidos com cuidado',
    metaDescription:
      'A Puchica está criando uma loja focada em produtos práticos para o dia a dia. Cada produto é revisado antes de entrar no catálogo.',
    eyebrow: 'Puchica · Canadá',
    title: 'Uma loja mais útil está tomando forma.',
    intro:
      'Estamos revisando cuidadosamente cada produto, fornecedor, preço e detalhe de entrega antes de dar a ele um lugar aqui.',
    focus:
      'A Puchica está revisando um catálogo focado de produtos práticos para o dia a dia.',
    artNote: 'Coisas úteis merecem uma razão clara para estar aqui.',
    primary: 'Conheça nossa história',
    secondary: 'Fale conosco',
    standardEyebrow: 'Nosso padrão',
    standardTitle: 'Um catálogo menor. Motivos melhores para comprar.',
    standardIntro:
      'Preferimos fazer uma pausa a preencher a loja com produtos que ainda não foram verificados com cuidado.',
    principles: [
      {
        number: '01',
        title: 'Útil por princípio',
        body: 'Cada produto deve resolver um problema cotidiano claro sem criar mais desordem.',
      },
      {
        number: '02',
        title: 'Claro antes do pagamento',
        body: 'Preço, opções, dimensões, entrega e devoluções devem ser fáceis de entender.',
      },
      {
        number: '03',
        title: 'Verificado antes do lançamento',
        body: 'Fornecedores, detalhes do produto e afirmações da loja devem ser verificados primeiro.',
      },
    ],
    pauseEyebrow: 'Nos bastidores',
    pauseTitle: 'Agora estamos fazendo o trabalho essencial.',
    pauseBody:
      'A loja está sendo reconstruída em torno de um catálogo focado, informações confiáveis e uma experiência acessível. Quando os produtos voltarem, cada um deverá estar aqui por um motivo.',
    linksTitle: 'A Puchica continua aqui.',
    linksBody:
      'Conheça a loja, consulte nossas políticas atuais ou fale conosco enquanto o novo catálogo é preparado.',
    about: 'Sobre a Puchica',
    policies: 'Ver políticas',
    contact: 'Fale conosco',
  },
};

function normalizeLanguageKey(language) {
  const normalized = String(language || 'en')
    .toLowerCase()
    .replace(/_/g, '-');
  return ['fr', 'es', 'pt-br'].includes(normalized) ? normalized : 'en';
}

export const meta = ({matches}) => {
  const root = matches?.find((match) => match.id === 'root');
  const langKey = normalizeLanguageKey(
    root?.data?.selectedLocale?.language,
  );
  const copy = HOME_COPY[langKey];

  return puchicaMeta({
    title: copy.metaTitle,
    description: copy.metaDescription,
    pathname: '/',
    langKey,
  });
};

export async function loader({context}) {
  return {langKey: normalizeLanguageKey(context.storefront.i18n.language)};
}

export default function Index() {
  const {langKey} = useLoaderData();
  const copy = HOME_COPY[langKey] || HOME_COPY.en;

  return (
    <div className="pk-hold">
      <JsonLdScript data={organizationJsonLd({})} />

      <section className="pk-hold__hero" aria-labelledby="hold-title">
        <div className="pk-hold__hero-copy">
          <p className="pk-hold__eyebrow">{copy.eyebrow}</p>
          <h1 id="hold-title">{copy.title}</h1>
          <p className="pk-hold__lead">{copy.intro}</p>
          <p className="pk-hold__focus">{copy.focus}</p>
          <div className="pk-hold__actions">
            <Link className="pk-hold__button pk-hold__button--primary" to="/pages/about">
              {copy.primary}
            </Link>
            <Link className="pk-hold__button pk-hold__button--secondary" to="/pages/contact">
              {copy.secondary}
            </Link>
          </div>
        </div>

        <div className="pk-hold__art" aria-hidden="true">
          <span className="pk-hold__art-label">Puchica</span>
          <span className="pk-hold__shape pk-hold__shape--one" />
          <span className="pk-hold__shape pk-hold__shape--two" />
          <span className="pk-hold__shape pk-hold__shape--three" />
          <span className="pk-hold__art-note">{copy.artNote}</span>
        </div>
      </section>

      <section className="pk-hold__standards" aria-labelledby="standards-title">
        <div className="pk-hold__section-heading">
          <p className="pk-hold__eyebrow">{copy.standardEyebrow}</p>
          <h2 id="standards-title">{copy.standardTitle}</h2>
          <p>{copy.standardIntro}</p>
        </div>
        <ol className="pk-hold__principles">
          {copy.principles.map((principle) => (
            <li key={principle.number}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pk-hold__pause" aria-labelledby="pause-title">
        <div className="pk-hold__pause-mark" aria-hidden="true">
          <span>P</span>
        </div>
        <div>
          <p className="pk-hold__eyebrow">{copy.pauseEyebrow}</p>
          <h2 id="pause-title">{copy.pauseTitle}</h2>
          <p>{copy.pauseBody}</p>
        </div>
      </section>

      <section className="pk-hold__links" aria-labelledby="links-title">
        <div>
          <p className="pk-hold__eyebrow">Puchica</p>
          <h2 id="links-title">{copy.linksTitle}</h2>
          <p>{copy.linksBody}</p>
        </div>
        <nav aria-label={copy.linksTitle}>
          <Link to="/pages/about">{copy.about}<span aria-hidden="true">↗</span></Link>
          <Link to="/policies">{copy.policies}<span aria-hidden="true">↗</span></Link>
          <Link to="/pages/contact">{copy.contact}<span aria-hidden="true">↗</span></Link>
        </nav>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
