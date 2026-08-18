import {redirect, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {CurrencyMoney} from '~/components/CurrencyMoney';
import {localizePath} from '~/lib/i18n';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {useT} from '~/lib/t';
import {utilityMetaCopy} from '~/lib/utility-meta';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data, params}) => {
  const name = data?.order?.name || '';
  return [
    {
      title: utilityMetaCopy(params?.locale).account.orderTitle.replace(
        '{name}',
        name,
      ),
    },
  ];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect(localizePath('/account/orders', params?.locale));
  }

  const orderId = atob(params.id);
  const {data, errors} = await customerAccount.query(CUSTOMER_ORDER_QUERY, {
    variables: {
      orderId,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? null;

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' ? firstDiscount : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? firstDiscount.percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const t = useT();
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();
  return (
    <div className="account-order">
      <h2>{t('account_order_h', {name: order.name})}</h2>
      <p>{t('account_order_placed', {date: new Date(order.processedAt).toDateString()})}</p>
      {order.confirmationNumber && (
        <p>{t('account_order_confirmation', {num: order.confirmationNumber})}</p>
      )}
      <br />
      <div>
        <table>
          <thead>
            <tr>
              <th scope="col">{t('account_order_th_product')}</th>
              <th scope="col">{t('account_order_th_price')}</th>
              <th scope="col">{t('account_order_th_qty')}</th>
              <th scope="col">{t('account_order_th_total')}</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((lineItem, lineItemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
            ))}
          </tbody>
          <tfoot>
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr>
                <th scope="row" colSpan={3}>
                  <p>{t('account_order_discounts')}</p>
                </th>
                <th scope="row">
                  <p>{t('account_order_discounts')}</p>
                </th>
                <td>
                  {discountPercentage ? (
                    <span>{t('account_order_discount_line', {pct: discountPercentage})}</span>
                  ) : (
                    discountValue && <CurrencyMoney data={discountValue} />
                  )}
                </td>
              </tr>
            )}
            <tr>
              <th scope="row" colSpan={3}>
                <p>{t('account_order_subtotal')}</p>
              </th>
              <th scope="row">
                <p>{t('account_order_subtotal')}</p>
              </th>
              <td>
                <CurrencyMoney data={order.subtotal} />
              </td>
            </tr>
            <tr>
              <th scope="row" colSpan={3}>
                {t('account_order_tax')}
              </th>
              <th scope="row">
                <p>{t('account_order_tax')}</p>
              </th>
              <td>
                <CurrencyMoney data={order.totalTax} />
              </td>
            </tr>
            <tr>
              <th scope="row" colSpan={3}>
                {t('account_order_total')}
              </th>
              <th scope="row">
                <p>{t('account_order_total')}</p>
              </th>
              <td>
                <CurrencyMoney data={order.totalPrice} />
              </td>
            </tr>
          </tfoot>
        </table>
        <div>
          <h3>{t('account_order_shipping_h')}</h3>
          {order?.shippingAddress ? (
            <address>
              <p>{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted ? (
                <p>{order.shippingAddress.formatted}</p>
              ) : (
                ''
              )}
              {order.shippingAddress.formattedArea ? (
                <p>{order.shippingAddress.formattedArea}</p>
              ) : (
                ''
              )}
            </address>
          ) : (
            <p>{t('account_order_no_shipping')}</p>
          )}
          <h3>{t('account_order_status_h')}</h3>
          <div>
            <p>{fulfillmentStatus ?? t('account_order_status_na')}</p>
          </div>
        </div>
      </div>
      <br />
      <p>
        <a target="_blank" href={order.statusPageUrl} rel="noreferrer">
          {t('account_order_status_link')}
        </a>
      </p>
    </div>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({lineItem}) {
  return (
    <tr key={lineItem.id}>
      <td>
        <div>
          {lineItem?.image && (
            <div>
              <Image data={lineItem.image} width={96} height={96} />
            </div>
          )}
          <div>
            <p>{lineItem.title}</p>
            <small>{lineItem.variantTitle}</small>
          </div>
        </div>
      </td>
      <td>
        <CurrencyMoney data={lineItem.price} />
      </td>
      <td>{lineItem.quantity}</td>
      <td>
        <CurrencyMoney data={lineItem.totalDiscount} />
      </td>
    </tr>
  );
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('customer-accountapi.generated').OrderQuery} OrderQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
