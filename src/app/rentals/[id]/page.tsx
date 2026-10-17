import Link from 'next/link';
import { notFound } from 'next/navigation';

import RentalGallery from '@/components/rental/detail/RentalGallery';
import RentalPricePanel from '@/components/rental/detail/RentalPricePanel';
import RentalContact from '@/components/rental/detail/RentalContact';
import RentalFees from '@/components/rental/detail/RentalFees';
import RentalPropertyInfo from '@/components/rental/detail/RentalPropertyInfo';
import RentalAmenities from '@/components/rental/detail/RentalAmenities';
import RentalContract from '@/components/rental/detail/RentalContract';
import RentalLocation from '@/components/rental/detail/RentalLocation';
import RentalDescription from '@/components/rental/detail/RentalDescription';

import { mockRentals } from '@/lib/mockRentals';

import styles from './page.module.css';
import RentalManagement from "@/components/rental/detail/RentalManagement";
import RentalHistoryTracker from "@/components/account/RentalHistoryTracker";

interface RentalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RentalDetailPage({
                                                 params,
                                               }: RentalDetailPageProps) {
  const { id } = await params;

  const rental = mockRentals.find((item) => item.id === id);

  if (!rental) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <nav
        className={styles.breadcrumb}
        aria-label="パンくずリスト"
      >
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">/</span>

        <Link href="/rentals">お部屋探し</Link>
        <span aria-hidden="true">/</span>

        <span aria-current="page">{rental.name}</span>
      </nav>

      <header className={styles.heading}>
        <h1 className={styles.title}>{rental.name}</h1>

        <div className={styles.location}>
          <span>{rental.address}</span>
          <span>
            {rental.station} 徒歩{rental.walkingMinutes}分
          </span>
        </div>
      </header>

      {/* 顶部：左侧图库，右侧租金和联系人 */}
      <div className={styles.topGrid}>
        <RentalGallery
          key={rental.id}
          images={rental.images}
          name={rental.name}
        />

        <div className={styles.sidebar}>
          <RentalPricePanel rental={rental} />

          <RentalContact
            key={rental.id}
            rental={rental}
          />
        </div>
      </div>

      {/* 下方：房源详细信息 */}
      <div className={styles.detailsGrid}>
        <RentalFees rental={rental} />
        <RentalPropertyInfo rental={rental} />
        <RentalAmenities rental={rental} />
        <RentalContract rental={rental} />
        <RentalLocation rental={rental} />
        <RentalDescription rental={rental} />

      </div>
      <RentalHistoryTracker
        key={rental.id}
        rentalId={rental.id}
      />
      <RentalManagement rental={rental} />
    </div>
  );
}
