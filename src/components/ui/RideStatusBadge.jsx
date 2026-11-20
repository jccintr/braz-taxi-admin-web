import ToneBadge from './ToneBadge';
import { rideStatus } from '../../lib/rides';

export default function RideStatusBadge({ status, long = false }) {
  const s = rideStatus(status);
  return <ToneBadge tone={s.tone} dot>{long ? s.label : s.short}</ToneBadge>;
}
