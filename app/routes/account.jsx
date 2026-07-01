import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {useT} from '~/lib/t';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const t = useT();
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  const heading = customer
    ? customer.firstName
      ? t('account_welcome', {firstName: customer.firstName})
      : t('account_welcome_fallback')
    : t('account_welcome_anon');

  return (
    <div className="account">
      <h1>{heading}</h1>
      <br />
      <AccountMenu />
      <br />
      <br />
      <Outlet context={{customer}} />
    </div>
  );
}

function AccountMenu() {
  const t = useT();
  function isActiveStyle({isActive, isPending}) {
    return {
      fontWeight: isActive ? 'bold' : undefined,
      color: isPending ? 'grey' : 'black',
    };
  }

  return (
    <nav role="navigation">
      <NavLink to="/account/orders" style={isActiveStyle}>
        {t('account_nav_orders')} &nbsp;
      </NavLink>
      &nbsp;|&nbsp;
      <NavLink to="/account/profile" style={isActiveStyle}>
        &nbsp; {t('account_nav_profile')} &nbsp;
      </NavLink>
      &nbsp;|&nbsp;
      <NavLink to="/account/addresses" style={isActiveStyle}>
        &nbsp; {t('account_nav_addresses')} &nbsp;
      </NavLink>
      &nbsp;|&nbsp;
      <Logout />
    </nav>
  );
}

function Logout() {
  const t = useT();
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      &nbsp;<button type="submit">{t('account_signout')}</button>
    </Form>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
