// Homepage Glow App card: the balance counts up to ₿91 375 when the card
// scrolls into view, timed to land as the balance block finishes its
// reveal. Without JS or with reduced motion the markup's static value
// stands.
import { countUpBalance } from './lib/count-up';

const value = document.querySelector('.playground-home-card .gw-balance__value');
if (value) countUpBalance(value, [value], { delay: 500, threshold: 0.4 });
