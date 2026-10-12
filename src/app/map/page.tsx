import MapSearch from '@/components/map/MapSearch';
import { mockRentals } from '@/lib/mockRentals';

export default function MapPage() {
  return <MapSearch rentals={mockRentals} />;
}
