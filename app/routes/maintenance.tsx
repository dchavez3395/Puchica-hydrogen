import {data, type LoaderFunctionArgs} from 'react-router';
import {useLoaderData} from 'react-router';

/**
 * Maintenance / password page — `/maintenance`
 *
 * This route renders a branded "we'll be right back" page that can
 * be shown during store updates. It's NOT automatically enabled —
 * it's controlled by the `MAINTENANCE_MODE` env var in the root
 * loader, which redirects all routes here when set to "true".
 *
 * To enable: set MAINTENANCE_MODE=true in Oxygen env vars.
 * To disable: remove the env var or set to false.
 *
 * The page is self-contained (no external CSS dependencies) so it
 * renders even if the rest of the app is broken.
 */

export async function loader({context}: LoaderFunctionArgs) {
  const {env} = context;
  return data({
    storeName: env.PUBLIC_STORE_NAME || 'Puchica',
    storeDomain: env.PUBLIC_STORE_DOMAIN || 'puchica.ca',
    maintenanceMessage: env.MAINTENANCE_MESSAGE || null,
  });
}

export default function MaintenancePage() {
  const {storeName, storeDomain, maintenanceMessage} =
    useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>{storeName} — We'll be right back</title>
        <style dangerouslySetInnerHTML={{__html: STYLES}} />
      </head>
      <body>
        <div className="maintenance-shell">
          <div className="maintenance-card">
            <div className="maintenance-logo">{storeName}</div>
            <h1>We&rsquo;ll be right back</h1>
            <p className="maintenance-msg">
              {maintenanceMessage ||
                'We&rsquo;re doing a quick update to bring you something better. Check back soon!'}
            </p>
            <div className="maintenance-contact">
              Questions? Email{' '}
              <a href={`mailto:hello@${storeDomain}`}>
                hello@{storeDomain}
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

const STYLES = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #2d1b4e 0%, #4a2c6f 50%, #6b3a8a 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f2ebda;
}
.maintenance-shell {
  padding: 2rem;
  width: 100%;
  max-width: 480px;
}
.maintenance-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 3rem 2.5rem;
  text-align: center;
}
.maintenance-logo {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  color: #f2ebda;
  text-transform: lowercase;
}
h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.maintenance-msg {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(242, 235, 218, 0.75);
  margin-bottom: 2rem;
}
.maintenance-contact {
  font-size: 0.875rem;
  color: rgba(242, 235, 218, 0.5);
}
.maintenance-contact a {
  color: #c9a8e8;
  text-decoration: none;
}
.maintenance-contact a:hover {
  text-decoration: underline;
}
@media (max-width: 480px) {
  .maintenance-card { padding: 2rem 1.5rem; }
  h1 { font-size: 1.25rem; }
}
`;