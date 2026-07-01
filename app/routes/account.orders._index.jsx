import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {useT} from '~/lib/t';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Orders'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, filters} = useLoaderData();
  const {orders} = customer;

  return (
    <div className="orders">
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

/**
 * @param {{
 *   orders: CustomerOrdersFragment['orders'];
 *   filters: OrderFilterParams;
 * }}
 */
function OrdersTable({orders, filters}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div className="acccount-orders" aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

/**
 * @param {{hasFilters?: boolean}}
 */
function EmptyOrders({hasFilters = false}) {
  const t = useT();
  return (
    <div>
      {hasFilters ? (
        <>
          <p>{t('account_orders_empty_filtered')}</p>
          <br />
          <p>
            <Link to="/account/orders">{t('account_orders_empty_filtered_cta')}</Link>
          </p>
        </>
      ) : (
        <>
          <p>{t('account_orders_empty')}</p>
          <br />
          <p>
            <Link to="/collections">{t('account_orders_empty_cta')}</Link>
          </p>
        </>
      )}
    </div>
  );
}

/**
 * @param {{
 *   currentFilters: OrderFilterParams;
 * }}
 */
function OrderSearchForm({currentFilters}) {
  const t = useT();
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="order-search-form"
      aria-label={t('account_orders_search_aria')}
    >
      <fieldset className="order-search-fieldset">
        <legend className="order-search-legend">{t('account_orders_filter_legend')}</legend>

        <div className="order-search-inputs">
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder={t('account_orders_search_ph')}
            aria-label={t('account_orders_search_aria_named')}
            defaultValue={currentFilters.name || ''}
            className="order-search-input"
          />
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder={t('account_orders_conf_ph')}
            aria-label={t('account_orders_conf_aria')}
            defaultValue={currentFilters.confirmationNumber || ''}
            className="order-search-input"
          />
        </div>

        <div className="order-search-buttons">
          <button type="submit" disabled={isSearching}>
            {isSearching ? t('account_orders_searching') : t('account_orders_search')}
          </button>
          {hasFilters && (
            <button
              type="button"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
            >
              {t('account_orders_clear')}
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
}

/**
 * @param {{order: OrderItemFragment}}
 */
function OrderItem({order}) {
  const t = useT();
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  return (
    <>
      <fieldset>
        <Link to={`/account/orders/${btoa(order.id)}`}>
          <strong>#{order.number}</strong>
        </Link>
        <p>{new Date(order.processedAt).toDateString()}</p>
        {order.confirmationNumber && (
          <p>{t('account_orders_confirmation', {num: order.confirmationNumber})}</p>
        )}
        <p>{order.financialStatus}</p>
        {fulfillmentStatus && <p>{fulfillmentStatus}</p>}
        <Money data={order.totalPrice} />
        <Link to={`/account/orders/${btoa(order.id)}`}>{t('account_orders_view')}</Link>
      </fieldset>
      <br />
    </>
  );
}

/**
 * @typedef {{
 *   customer: CustomerOrdersFragment;
 *   filters: OrderFilterParams;
 * }} OrdersLoaderData
 */

/** @typedef {import('./+types/account.orders._index').Route} Route */
/** @typedef {import('~/lib/orderFilters').OrderFilterParams} OrderFilterParams */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
