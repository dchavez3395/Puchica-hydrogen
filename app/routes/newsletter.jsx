import {data} from 'react-router';

/**
 * Newsletter signup — creates (or no-ops on existing) a Shopify customer with
 * email marketing consent via the Storefront API.
 * @param {import('react-router').ActionFunctionArgs & {context: any}} args
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return data({ok: false, error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();
  const email = String(form.get('email') || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return data({ok: false, error: 'Please enter a valid email.'}, {status: 400});
  }

  // Storefront customerCreate needs a password (max 40 chars); subscribers never use it.
  const password = `Pk${crypto.randomUUID().replace(/-/g, '').slice(0, 28)}Aa1!`;

  try {
    const result = await context.storefront.mutate(CUSTOMER_CREATE, {
      variables: {input: {email, password, acceptsMarketing: true}},
    });

    const errors = result?.customerCreate?.customerUserErrors ?? [];
    // "Email already taken" means they're already a customer — treat as success.
    const alreadyExists = errors.some(
      (e) => e?.code === 'TAKEN' || /taken|already/i.test(e?.message || ''),
    );

    if (errors.length && !alreadyExists) {
      return data({ok: false, error: errors[0].message}, {status: 400});
    }

    return data({ok: true});
  } catch {
    return data(
      {ok: false, error: 'Something went wrong. Please try again.'},
      {status: 500},
    );
  }
}

const CUSTOMER_CREATE = `#graphql
  mutation NewsletterSignup($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
