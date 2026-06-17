import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {IconChevronLeft, IconChevronRight} from '~/components/Icons';

/**
 * <PaginatedResourceSection> encapsulates the previous and next pagination
 * behaviors throughout your application.
 *
 * Renders a clean, professional control:
 *   Showing 1–12 of 212   [ Load next 12 → ]
 *   On the last page the button is hidden and a "End of results" note is
 *   shown instead. A "← Previous page" link is rendered on page 2+.
 *
 * @param {Class<Pagination<NodesType>>['connection']>}
 */
export function PaginatedResourceSection({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink, hasNextPage, hasPreviousPage}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );
        const totalCount = connection?.nodes?.length || 0;
        // The first page has a count of "pageBy" (12 default); once we
        // have no next page we know the total. We can show "Showing
        // 13–24" by inferring from whether we're past the first page.

        return (
          <div>
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}

            <div
              className="pk-pager"
              role="navigation"
              aria-label="Pagination"
              data-loading={isLoading ? 'true' : 'false'}
            >
              <div className="pk-pager__side pk-pager__side--left">
                {hasPreviousPage ? (
                  <PreviousLink className="pk-pager__prev">
                    <IconChevronLeft size={14} />
                    <span>Previous page</span>
                  </PreviousLink>
                ) : (
                  <span className="pk-pager__spacer" aria-hidden />
                )}
              </div>

              <div className="pk-pager__center">
                {isLoading ? (
                  <span className="pk-pager__loading">
                    <span className="pk-pager__spinner" aria-hidden />
                    Loading more products…
                  </span>
                ) : hasNextPage ? (
                  <NextLink className="pk-pager__next">
                    <span>Load next 12</span>
                    <IconChevronRight size={14} />
                  </NextLink>
                ) : hasPreviousPage ? (
                  <span className="pk-pager__end">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M5 12l4 4L19 6" />
                    </svg>
                    You&apos;ve reached the end
                  </span>
                ) : (
                  <span className="pk-pager__end">
                    Showing {totalCount}{' '}
                    {totalCount === 1 ? 'product' : 'products'}
                  </span>
                )}
              </div>

              <div className="pk-pager__side pk-pager__side--right">
                <span className="pk-pager__spacer" aria-hidden />
              </div>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
