import {data, useActionData} from 'react-router';

/**
 * Newsletter subscription endpoint.
 *
 * Uses the **public Storefront API** `customerCreate` mutation (no admin
 * scope required) to register the email. The customer can later set a
 * password via Shopify's account activation email if they want to log in.
 *
 * Marketing consent is captured via the same customer record so the
 * address is opted in for future Klaviyo sync (when installed).
 *
 * NOTE: We deliberately accept-marketing by default because the form
 * promises "Get 10% off your first order" — single opt-in matches the
 * UX contract. CASL/CAN-SPAM/Privacy Act (Canada) require:
 *   1. Clear identification of sender (we identify as Puchica)
 *   2. Unsubscribe in every email (handled by Klaviyo when live)
 *   3. Physical address in footer (set in templates)
 */

const STOREFRONT_API_VERSION = '2025-01';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAllowedEmail(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return EMAIL_RE.test(trimmed);
}

async function customerCreate({email, firstName, lastName, acceptsMarketing, env}) {
  const query = `
    mutation newsletterCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email }
        customerUserErrors { field message code }
      }
    }
  `;
  const variables = {
    input: {
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      password: cryptoRandomPassword(),
      acceptsMarketing: acceptsMarketing !== false,
    },
  };
  const shop = env.PUBLIC_STORE_DOMAIN || 'puchica.myshopify.com';
  const token = env.PUBLIC_STOREFRONT_API_TOKEN || env.SHOPIFY_STOREFRONT_API_TOKEN || '';
  if (!token) {
    return {ok: false, error: 'Storefront token not configured'};
  }
  const res = await fetch(
    `https://${shop}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
        Accept: 'application/json',
      },
      body: JSON.stringify({query, variables}),
    },
  );
  if (!res.ok) {
    return {ok: false, error: `upstream ${res.status}`};
  }
  const json = await res.json();
  if (json.errors?.length) {
    return {ok: false, error: json.errors[0].message};
  }
  const payload = json.data?.customerCreate;
  if (!payload) {
    return {ok: false, error: 'no payload'};
  }
  const userErrors = payload.customerUserErrors || [];
  if (userErrors.length) {
    // If customer already exists, treat as success for idempotency
    const alreadyThere = userErrors.some(
      (e) => e.code === 'TAKEN' || /already/i.test(e.message || ''),
    );
    if (alreadyThere) {
      return {ok: true, alreadySubscribed: true};
    }
    return {ok: false, error: userErrors[0].message};
  }
  if (!payload.customer) {
    return {ok: false, error: 'customer not returned'};
  }
  return {ok: true, customerId: payload.customer.id};
}

function cryptoRandomPassword() {
  // 24-char random base36 string — customer must activate via email
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

/** @param {Route.ActionArgs} */
export async function action({request, context}) {
  const env = context?.env || {};
  if (request.method !== 'POST') {
    return data(
      {ok: false, error: 'Method not allowed'},
      {status: 405, headers: {'Allow': 'POST'}},
    );
  }

  const contentType = request.headers.get('content-type') || '';
  let email = '';
  let firstName = '';
  let lastName = '';
  let honeypot = '';

  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email || '';
      firstName = body.firstName || '';
      lastName = body.lastName || '';
      honeypot = body.company || '';
    } else {
      const form = await request.formData();
      email = (form.get('email') || '').toString();
      firstName = (form.get('firstName') || '').toString();
      lastName = (form.get('lastName') || '').toString();
      honeypot = (form.get('company') || '').toString();
    }
  } catch (e) {
    return data({ok: false, error: 'Invalid request body'}, {status: 400});
  }

  // Honeypot — bots fill hidden "company" field; humans don't.
  if (honeypot) {
    return data({ok: true}, {status: 200});
  }

  if (!isAllowedEmail(email)) {
    return data(
      {ok: false, error: 'Please enter a valid email address.'},
      {status: 400},
    );
  }

  const result = await customerCreate({
    email: email.trim().toLowerCase(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    acceptsMarketing: true,
    env,
  });

  if (!result.ok) {
    return data(
      {ok: false, error: result.error || 'Subscription failed'},
      {status: 502},
    );
  }

  return data(
    {
      ok: true,
      alreadySubscribed: !!result.alreadySubscribed,
    },
    {status: 200},
  );
}

export async function loader() {
  return {};
}

export default function NewsletterRoute() {
  const actionData = useActionData();

  if (actionData?.ok) {
    return (
      <div className="pk-section pk-section--newsletter">
        <div className="pk-section__inner">
          <h1>You're in!</h1>
          <p>
            {actionData.alreadySubscribed
              ? 'You were already subscribed — your code is on its way.'
              : 'Thanks for subscribing! Check your inbox for your 10% off code.'}
          </p>
          <p>
            <a href="/">← Back to the shop</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pk-section pk-section--newsletter">
      <div className="pk-section__inner">
        <h1>Newsletter</h1>
        {actionData && !actionData.ok ? (
          <p role="alert">{actionData.error}</p>
        ) : null}
        <form action="/newsletter" method="post">
          <label htmlFor="pk-newsletter-email-fb" className="sr-only">
            Email
          </label>
          <input
            id="pk-newsletter-email-fb"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            style={{position: 'absolute', left: '-9999px'}}
            aria-hidden="true"
          />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  );
}