import {useT} from '~/lib/t';
import {IconGift} from '~/components/Icons';

/**
 * OfferCallout — first-order incentive shown at the decision points (next to
 * Add-to-Cart and in the cart). The offer previously lived only in the top
 * announcement bar, which is easy to ignore — especially on mobile (~93% of
 * traffic). Placing the FIRST15 incentive right where the buy decision happens
 * reduces hesitation and targets the two funnel leaks (add-to-cart + checkout).
 *
 * Styling is intentionally inline (not a CSS class): it guarantees consistent,
 * on-brand rendering (Puchica violet) without depending on stylesheet classes,
 * and keeps the component fully self-contained. Copy comes from the `offer_first15`
 * dictionary key (all 4 languages), so it localizes automatically.
 *
 * @param {{style?: React.CSSProperties}} props
 */
export function OfferCallout({style}) {
  const t = useT();
  return (
    <div
      role="note"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        margin: '12px 0 0',
        padding: '10px 14px',
        background: '#F1ECFF',
        color: '#4A32C4',
        border: '1px solid #DBCEFF',
        borderRadius: 12,
        fontSize: 14,
        lineHeight: 1.35,
        fontWeight: 500,
        ...style,
      }}
    >
      <IconGift size={18} aria-hidden />
      <span>{t('offer_first15')}</span>
    </div>
  );
}
