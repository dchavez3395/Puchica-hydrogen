import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {useId} from 'react';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';
import {useT} from '~/lib/t';
import {utilityMetaCopy} from '~/lib/utility-meta';
import {error as logError} from '~/lib/logger';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({params}) => {
  return [{title: utilityMetaCopy(params?.locale).account.addressesTitle}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address = {};
    const keys = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error) {
          logError('customer address create failed', error);
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: 'account_address_create_error'}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: 'account_address_create_error'}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error) {
          logError('customer address update failed', error);
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: 'account_address_update_error'}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: 'account_address_update_error'}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error) {
          logError('customer address delete failed', error);
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: 'account_address_delete_error'}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: 'account_address_delete_error'}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error) {
    logError('customer address action failed', error);
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const t = useT();
  const {customer} = useOutletContext();
  const {defaultAddress, addresses} = customer;

  return (
    <div className="account-addresses">
      <h2>{t('account_addresses_h')}</h2>
      <br />
      <div>
        <div>
          <h3>{t('account_addresses_create_legend')}</h3>
          <NewAddressForm key={addresses.nodes.length} />
        </div>
        <br />
        <hr />
        <br />
        {!addresses.nodes.length ? (
          <p>{t('account_addresses_empty')}</p>
        ) : (
          <ExistingAddresses
            addresses={addresses}
            defaultAddress={defaultAddress}
          />
        )}
      </div>
    </div>
  );
}

function NewAddressForm() {
  const t = useT();
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  };

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div>
          <button
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
          >
            {stateForMethod('POST') !== 'idle' ? t('account_addresses_creating') : t('account_addresses_create')}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

/**
 * @param {Pick<CustomerFragment, 'addresses' | 'defaultAddress'>}
 */
function ExistingAddresses({addresses, defaultAddress}) {
  const t = useT();
  return (
    <div>
      <h3>{t('account_addresses_existing')}</h3>
      {addresses.nodes.map((address) => (
        <AddressForm
          key={address.id}
          addressId={address.id}
          address={address}
          defaultAddress={defaultAddress}
        >
          {({stateForMethod}) => (
            <div>
              <button
                disabled={stateForMethod('PUT') !== 'idle'}
                formMethod="PUT"
                type="submit"
              >
                {stateForMethod('PUT') !== 'idle' ? t('account_addresses_saving') : t('account_addresses_save')}
              </button>
              <button
                disabled={stateForMethod('DELETE') !== 'idle'}
                formMethod="DELETE"
                type="submit"
                onClick={(event) => {
                  if (!window.confirm(t('account_addresses_delete_confirm'))) {
                    event.preventDefault();
                  }
                }}
              >
                {stateForMethod('DELETE') !== 'idle' ? t('account_addresses_deleting') : t('account_addresses_delete')}
              </button>
            </div>
          )}
        </AddressForm>
      ))}
    </div>
  );
}

/**
 * @param {{
 *   addressId: AddressFragment['id'];
 *   address: CustomerAddressInput;
 *   defaultAddress: CustomerFragment['defaultAddress'];
 *   children: (props: {
 *     stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
 *   }) => React.ReactNode;
 * }}
 */
export function AddressForm({addressId, address, defaultAddress, children}) {
  const t = useT();
  const idPrefix = useId();
  const fieldId = (name) => `${idPrefix}-${name}`;
  const {state, formMethod} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  return (
    <Form id={addressId}>
      <fieldset>
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <label htmlFor={fieldId('firstName')}>{t('account_address_first')}*</label>
        <input
          aria-label={t('account_address_first')}
          autoComplete="given-name"
          defaultValue={address?.firstName ?? ''}
          id={fieldId('firstName')}
          name="firstName"
          placeholder={t('account_address_first')}
          required
          type="text"
        />
        <label htmlFor={fieldId('lastName')}>{t('account_address_last')}*</label>
        <input
          aria-label={t('account_address_last')}
          autoComplete="family-name"
          defaultValue={address?.lastName ?? ''}
          id={fieldId('lastName')}
          name="lastName"
          placeholder={t('account_address_last')}
          required
          type="text"
        />
        <label htmlFor={fieldId('company')}>{t('account_address_company')}</label>
        <input
          aria-label={t('account_address_company')}
          autoComplete="organization"
          defaultValue={address?.company ?? ''}
          id={fieldId('company')}
          name="company"
          placeholder={t('account_address_company')}
          type="text"
        />
        <label htmlFor={fieldId('address1')}>{t('account_address_line1')}*</label>
        <input
          aria-label={t('account_address_line1')}
          autoComplete="address-line1"
          defaultValue={address?.address1 ?? ''}
          id={fieldId('address1')}
          name="address1"
          placeholder={t('account_address_line1')}
          required
          type="text"
        />
        <label htmlFor={fieldId('address2')}>{t('account_address_line2')}</label>
        <input
          aria-label={t('account_address_line2')}
          autoComplete="address-line2"
          defaultValue={address?.address2 ?? ''}
          id={fieldId('address2')}
          name="address2"
          placeholder={t('account_address_line2')}
          type="text"
        />
        <label htmlFor={fieldId('city')}>{t('account_address_city')}*</label>
        <input
          aria-label={t('account_address_city')}
          autoComplete="address-level2"
          defaultValue={address?.city ?? ''}
          id={fieldId('city')}
          name="city"
          placeholder={t('account_address_city')}
          required
          type="text"
        />
        <label htmlFor={fieldId('zoneCode')}>{t('account_address_state')}*</label>
        <input
          aria-label={t('account_address_state')}
          autoComplete="address-level1"
          defaultValue={address?.zoneCode ?? ''}
          id={fieldId('zoneCode')}
          name="zoneCode"
          placeholder={t('account_address_state')}
          required
          type="text"
        />
        <label htmlFor={fieldId('zip')}>{t('account_address_zip')}*</label>
        <input
          aria-label={t('account_address_zip')}
          autoComplete="postal-code"
          defaultValue={address?.zip ?? ''}
          id={fieldId('zip')}
          name="zip"
          placeholder={t('account_address_zip')}
          required
          type="text"
        />
        <label htmlFor={fieldId('territoryCode')}>{t('account_address_country')}*</label>
        <input
          aria-label={t('account_address_country')}
          aria-describedby={fieldId('territoryCodeHint')}
          autoComplete="country"
          defaultValue={address?.territoryCode ?? ''}
          id={fieldId('territoryCode')}
          name="territoryCode"
          placeholder={t('account_address_country_hint')}
          required
          type="text"
          maxLength={2}
        />
        <small id={fieldId('territoryCodeHint')}>
          {t('account_address_country_hint')}
        </small>
        <label htmlFor={fieldId('phoneNumber')}>{t('account_address_phone')}</label>
        <input
          aria-label={t('account_address_phone_aria')}
          autoComplete="tel"
          defaultValue={address?.phoneNumber ?? ''}
          id={fieldId('phoneNumber')}
          name="phoneNumber"
          placeholder={t('account_address_phone_ph')}
          pattern="^\+?[1-9]\d{3,14}$"
          type="tel"
        />
        <div>
          <input
            defaultChecked={isDefaultAddress}
            id={fieldId('defaultAddress')}
            name="defaultAddress"
            type="checkbox"
          />
          <label htmlFor={fieldId('defaultAddress')}>
            {t('account_address_default_label')}
          </label>
        </div>
        {error ? (
          <p role="alert">
            <mark>
            <small>{t(error)}</small>
            </mark>
          </p>
        ) : (
          <br />
        )}
        {children({
          stateForMethod: (method) => (formMethod === method ? state : 'idle'),
        })}
      </fieldset>
    </Form>
  );
}

/**
 * @typedef {{
 *   addressId?: string | null;
 *   createdAddress?: AddressFragment;
 *   defaultAddress?: string | null;
 *   deletedAddress?: string | null;
 *   error: Record<AddressFragment['id'], string> | null;
 *   updatedAddress?: AddressFragment;
 * }} ActionResponse
 */

/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerAddressInput} CustomerAddressInput */
/** @typedef {import('customer-accountapi.generated').AddressFragment} AddressFragment */
/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @template T @typedef {import('react-router').Fetcher<T>} Fetcher */
/** @typedef {import('./+types/account.addresses').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
/** @typedef {ReturnType<typeof useActionData<typeof action>>} ActionReturnData */
