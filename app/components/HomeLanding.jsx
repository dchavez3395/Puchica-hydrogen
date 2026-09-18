import {Image} from '@shopify/hydrogen';
import {useRouteLoaderData} from 'react-router';
import {CurrencyMoney} from '~/components/CurrencyMoney';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {findApprovedVariant} from '~/lib/launch-catalog';
import {presentProductTitle} from '~/lib/product-presentation';
import {cardTitle, sizeChipFor} from '~/lib/size-chip';
import {useT} from '~/lib/t';

/**
 * The woven-lighting home page ("Warm room", 2026-09-18).
 *
 * Replaces SmallSpaceLanding, which was written for the travel-organizer
 * launch. Products arrive launch-filtered from the route loader, so nothing
 * here can surface a fixture the catalogue gate has not approved. Every image
 * is a real product image from Shopify; the room tiles and the cluster band
 * borrow specific products' photos and fall back to whatever is approved if
 * a handle is ever retired.
 *
 * @param {{products?: Array<Record<string, any>>}} props
 */
export function HomeLanding({products = []}) {
  const t = useT();
  const rootData = useRouteLoaderData('root');
  const market = rootData?.selectedLocale?.country || 'CA';
  const byHandle = new Map(products.map((p) => [p.handle, p]));
  const pick = (handle, fallbackIndex = 0) =>
    byHandle.get(handle) || products[fallbackIndex] || null;

  const hero = pick(HERO_HANDLE);
  const heroVariant = findApprovedVariant(hero, market);
  const heroImage = heroVariant?.image || hero?.featuredImage;
  const heroTitle = hero
    ? presentProductTitle(hero.title, heroVariant, hero.handle, t)
    : '';

  const rooms = ROOMS.map((room, i) => ({
    ...room,
    product: pick(room.handle, i),
  })).filter((room) => room.product);

  const grid = [...products]
    .sort((a, b) => rank(a.handle) - rank(b.handle))
    .slice(0, 8);

  const cluster = pick(CLUSTER_HANDLE, 1);
  const clusterImage =
    findApprovedVariant(cluster, market)?.image || cluster?.featuredImage;

  return (
    <div className="wr-home">
      <section className="wr-hero" aria-labelledby="home-title">
        {/* The photo is capped at its 1024px source width and anchored right;
            the copy sits on solid ink to its left, and the shade fades one
            into the other. Stretching a 1024px file across 1920px fails the
            CI resolution probe and looks soft besides. */}
        <div className="wr-hero__visual" aria-hidden="true">
          {heroImage ? (
            <Image
              className="wr-hero__img"
              data={heroImage}
              alt=""
              sizes="(min-width: 1024px) 1024px, 100vw"
              loading="eager"
              {...{fetchpriority: 'high'}}
            />
          ) : null}
          <div className="wr-hero__shade"></div>
        </div>
        <div className="wr-hero__copy">
          <p className="wr-eyebrow">{t('home_hero_eyebrow')}</p>
          <h1 id="home-title">{t('launch_home_title')}</h1>
          <p className="wr-hero__sub">{t('home_hero_sub')}</p>
          <div className="wr-hero__actions">
            <Link className="wr-btn wr-btn--clay" to={PENDANTS} prefetch="intent">
              {t('nav_pendants')}
            </Link>
            <Link className="wr-btn wr-btn--ghost" to={SCONCES} prefetch="intent">
              {t('nav_sconces')}
            </Link>
          </div>
        </div>
        {hero ? (
          <Link
            className="wr-hero__pictured"
            to={`/products/${hero.handle}`}
            prefetch="intent"
            aria-label={t('launch_home_shop_product', {title: heroTitle})}
          >
            {heroImage ? (
              <span className="wr-hero__pictured__thumb">
                <Image data={heroImage} alt="" aspectRatio="1/1" sizes="40px" />
              </span>
            ) : null}
            <span>
              <strong>{heroTitle}</strong>
              <span>
                {heroVariant?.price ? (
                  <CurrencyMoney data={heroVariant.price} />
                ) : null}{' '}
                · {t('home_hero_pictured')}
              </span>
            </span>
            <ArrowIcon />
          </Link>
        ) : null}
      </section>

      {rooms.length ? (
        <section className="wr-section" aria-labelledby="rooms-title">
          <div className="wr-section__head">
            <div>
              <p className="wr-eyebrow">{t('home_rooms_eyebrow')}</p>
              <h2 id="rooms-title">{t('home_rooms_title')}</h2>
            </div>
            <Link className="wr-section__link" to="/collections/all" prefetch="intent">
              {t('launch_home_view_all')} <ArrowIcon size={16} />
            </Link>
          </div>
          <div className="wr-rooms">
            {rooms.map((room) => {
              const image =
                findApprovedVariant(room.product, market)?.image ||
                room.product.featuredImage;
              return (
                <Link
                  key={room.key}
                  className="wr-room"
                  to={room.to}
                  prefetch="intent"
                >
                  {image ? (
                    <Image
                      data={image}
                      alt=""
                      sizes="(min-width: 900px) 25vw, 50vw"
                      loading="lazy"
                    />
                  ) : null}
                  <span className="wr-room__label">
                    <strong>{t(room.titleKey)}</strong>
                    <span>{t(room.subKey)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {grid.length ? (
        <section className="wr-section" aria-labelledby="grid-title">
          <div className="wr-section__head">
            <div>
              <p className="wr-eyebrow">{t('home_grid_eyebrow')}</p>
              <h2 id="grid-title">{t('home_grid_title')}</h2>
            </div>
            <Link className="wr-section__link" to="/collections/all" prefetch="intent">
              {t('launch_home_view_all')} <ArrowIcon size={16} />
            </Link>
          </div>
          <div className="wr-grid">
            {grid.map((product, index) => {
              const variant = findApprovedVariant(product, market);
              const image = variant?.image || product.featuredImage;
              const title = presentProductTitle(
                product.title,
                variant,
                product.handle,
                t,
              );
              const tag = TAGS[product.handle];
              return (
                <Link
                  key={product.id}
                  className="wr-card"
                  to={`/products/${product.handle}`}
                  prefetch="intent"
                  aria-label={t('launch_home_view_product', {title})}
                >
                  <span className="wr-card__media">
                    {image ? (
                      <Image
                        data={image}
                        alt={image.altText || title}
                        sizes="(min-width: 900px) 25vw, 50vw"
                        loading={index < 4 ? 'eager' : 'lazy'}
                      />
                    ) : null}
                    {tag ? <span className="wr-card__tag">{t(tag)}</span> : null}
                  </span>
                  <span className="wr-card__row">
                    <span className="wr-card__name">{cardTitle(title)}</span>
                    {variant?.price ? (
                      <span className="wr-card__price">
                        <CurrencyMoney data={variant.price} />
                      </span>
                    ) : null}
                  </span>
                  {sizeChipFor(product) ? (
                    <span>
                      <span className="wr-size">{sizeChipFor(product)}</span>
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="wr-cluster-band" id="cluster" aria-labelledby="cluster-title">
        {clusterImage ? (
          <Image
            data={clusterImage}
            alt={clusterImage.altText || ''}
            sizes="(min-width: 900px) 55vw, 100vw"
            loading="lazy"
          />
        ) : null}
        <div className="wr-cluster-band__copy">
          <p className="wr-eyebrow">{t('home_cluster_eyebrow')}</p>
          <h2 id="cluster-title">{t('home_cluster_title')}</h2>
          <p>{t('home_cluster_body')}</p>
          <ul>
            <li>
              <CheckIcon /> {t('home_cluster_1')}
            </li>
            <li>
              <CheckIcon /> {t('home_cluster_2')}
            </li>
            <li>
              <CheckIcon /> {t('home_cluster_3')}
            </li>
          </ul>
          <div>
            <Link className="wr-btn wr-btn--clay" to={PENDANTS} prefetch="intent">
              {t('home_cluster_cta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="wr-section" aria-labelledby="arrives-title">
        <div className="wr-section__head">
          <div>
            <p className="wr-eyebrow">{t('home_arrives_eyebrow')}</p>
            <h2 id="arrives-title">{t('home_arrives_title')}</h2>
          </div>
        </div>
        <div className="wr-arrives">
          {ARRIVES.map(({key, Icon, titleKey, bodyKey}) => (
            <div key={key}>
              <div className="wr-arrives__icon" aria-hidden="true">
                <Icon />
              </div>
              <div>
                <strong>{t(titleKey)}</strong>
                <p>{t(bodyKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wr-about" aria-labelledby="about-title">
        <div className="wr-about__copy">
          <p className="wr-eyebrow">{t('home_about_eyebrow')}</p>
          <h2 id="about-title">{t('home_about_title')}</h2>
          <p>{t('home_about_body')}</p>
          <div>
            <Link className="wr-btn wr-btn--outline" to="/pages/about" prefetch="intent">
              {t('nav_about')}
            </Link>
          </div>
        </div>
      </section>
      <div style={{height: 'clamp(56px, 7vw, 96px)'}} aria-hidden="true"></div>
    </div>
  );
}

const PENDANTS = '/collections/pendant-lights';
const SCONCES = '/collections/wall-sconces';
const HERO_HANDLE = 'woven-bamboo-globe-pendant-25cm';
const CLUSTER_HANDLE = 'bamboo-slat-pumpkin-pendant-18cm';

const ROOMS = [
  {key: 'table', handle: 'woven-bamboo-nest-pendant-30cm', to: PENDANTS, titleKey: 'home_room_table', subKey: 'home_room_table_sub'},
  {key: 'island', handle: 'bamboo-slat-drum-pendant-30cm', to: PENDANTS, titleKey: 'home_room_island', subKey: 'home_room_island_sub'},
  {key: 'bedside', handle: 'rattan-cone-wall-sconce-15cm', to: SCONCES, titleKey: 'home_room_bedside', subKey: 'home_room_bedside_sub'},
  {key: 'hall', handle: 'woven-bamboo-egg-pendant-15cm', to: PENDANTS, titleKey: 'home_room_hall', subKey: 'home_room_hall_sub'},
];

// Grid order: the fixtures with a lit-room photo first, in the order the
// design canvas hangs them. Anything not listed keeps collection order after.
const GRID_ORDER = [
  'woven-bamboo-globe-pendant-25cm',
  'woven-bamboo-gourd-pendant-23cm',
  'bamboo-slat-drum-pendant-30cm',
  'rattan-cone-wall-sconce-15cm',
  'woven-bamboo-nest-pendant-30cm',
  'iron-cage-pendant-15cm',
  'bamboo-slat-pumpkin-pendant-18cm',
  'woven-bamboo-egg-pendant-15cm',
];
function rank(handle) {
  const i = GRID_ORDER.indexOf(handle);
  return i === -1 ? GRID_ORDER.length : i;
}

const TAGS = {
  'rattan-cone-wall-sconce-15cm': 'home_tag_bedside',
  'bamboo-slat-pumpkin-pendant-18cm': 'home_tag_cluster',
  'woven-bamboo-egg-pendant-15cm': 'home_tag_cluster',
};

// Static key names on purpose: scripts/check-dictionary-usage.mjs can only
// see a key it can read verbatim in source.
const ARRIVES = [
  {key: 'size', Icon: RulerIcon, titleKey: 'home_arrives_size_t', bodyKey: 'home_arrives_size_b'},
  {key: 'cord', Icon: CordIcon, titleKey: 'home_arrives_cord_t', bodyKey: 'home_arrives_cord_b'},
  {key: 'bulb', Icon: BulbIcon, titleKey: 'home_arrives_bulb_t', bodyKey: 'home_arrives_bulb_b'},
  {key: 'ship', Icon: TruckIcon, titleKey: 'home_arrives_ship_t', bodyKey: 'home_arrives_ship_b'},
];

function ArrowIcon({size = 18}) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10h14" />
      <path d="M11 4l6 6-6 6" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="var(--pk-honey)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10l4 4 8-8" />
    </svg>
  );
}
function RulerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 14l12-12 4 4-12 12z" />
      <path d="M6 10l2 2M9 7l2 2M12 4l2 2" />
    </svg>
  );
}
function CordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2v6" />
      <circle cx="10" cy="12" r="4" />
      <path d="M6 12H2M18 12h-4" />
    </svg>
  );
}
function BulbIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 14a5 5 0 116 0v2H7z" />
      <path d="M8 18h4" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 5h10v9H2zM12 8h4l2 3v3h-6z" />
      <circle cx="5" cy="15" r="1.5" />
      <circle cx="15" cy="15" r="1.5" />
    </svg>
  );
}
