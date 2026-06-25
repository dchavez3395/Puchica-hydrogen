import {useEffect, useRef} from 'react';
import {Pagination} from '@shopify/hydrogen';
import {IconChevronLeft, IconChevronRight} from '~/components/Icons';

/**
 * <PaginatedResourceSection> encapsulates the previous and next pagination
 * behaviors throughout your application.
 *
 * It uses an IntersectionObserver to automatically trigger the next page load
 * as the user scrolls, creating a smooth infinite scroll experience while keeping
 * the fallback "Load next" button functional.
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
      {(paginationProps) => (
        <PaginatedResourceContent
          paginationProps={paginationProps}
          connection={connection}
          ariaLabel={ariaLabel}
          resourcesClassName={resourcesClassName}
        >
          {children}
        </PaginatedResourceContent>
      )}
    </Pagination>
  );
}

function PaginatedResourceContent({
  paginationProps,
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}) {
  const {
    nodes,
    isLoading,
    PreviousLink,
    NextLink,
    hasNextPage,
    hasPreviousPage,
  } = paginationProps;

  const nextButtonRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentRef = nextButtonRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading && hasNextPage) {
          const nextButton = currentRef.querySelector('.pk-pager__next');
          if (nextButton) {
            nextButton.click();
          }
        }
      },
      {
        rootMargin: '240px', // trigger load before reaching the absolute bottom
      }
    );

    observer.observe(currentRef);
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isLoading, hasNextPage]);

  const resourcesMarkup = nodes.map((node, index) =>
    children({node, index}),
  );
  const totalCount = connection?.nodes?.length || 0;

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

        <div className="pk-pager__center" ref={nextButtonRef}>
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
              Showing {totalCount} {totalCount === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>

        <div className="pk-pager__side pk-pager__side--right">
          <span className="pk-pager__spacer" aria-hidden />
        </div>
      </div>
    </div>
  );
}
