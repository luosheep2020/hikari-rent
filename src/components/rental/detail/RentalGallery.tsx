'use client';

import { useRef, useState } from 'react';
import NextImage from 'next/image';
import { Carousel, Image as AntImage } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';

import styles from '@/components/rental/detail/css/RentalGallery.module.css';

interface RentalGalleryProps {
  images: string[];
  name: string;
}

export default function RentalGallery({
                                        images,
                                        name,
                                      }: RentalGalleryProps) {
  const carouselRef = useRef<CarouselRef>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  if (images.length === 0) {
    return <div className={styles.empty}>写真は準備中です</div>;
  }

  const multiple = images.length > 1;

  return (
    <div className={styles.gallery}>
      <div className={styles.carouselWrapper}>
        <Carousel
          ref={carouselRef}
          arrows={multiple}
          dots={false}
          infinite={multiple}
          draggable={multiple}
          afterChange={setSelectedIndex}
        >
          {images.map((image, index) => (
            <div key={`${image}-${index}`}>
              <button
                type="button"
                className={styles.slide}
                onClick={() => {
                  setPreviewIndex(index);
                  setPreviewOpen(true);
                }}
                aria-label={`写真 ${index + 1}を拡大`}
              >
                <NextImage
                  src={image}
                  alt={`${name}の写真 ${index + 1}`}
                  fill
                  sizes="(max-width: 900px) 100vw, 65vw"
                  className={styles.image}
                />
              </button>
            </div>
          ))}
        </Carousel>

        <span className={styles.counter}>
          {selectedIndex + 1} / {images.length}
        </span>
      </div>

      <div className={styles.thumbnails}>
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            className={`${styles.thumbnail} ${
              selectedIndex === index ? styles.selected : ''
            }`}
            onClick={() => carouselRef.current?.goTo(index)}
            aria-label={`写真 ${index + 1}を表示`}
            aria-pressed={selectedIndex === index}
          >
            <NextImage
              src={image}
              alt=""
              fill
              sizes="96px"
              className={styles.image}
            />
          </button>
        ))}
      </div>

      <AntImage.PreviewGroup
        items={images}
        preview={{
          open: previewOpen,
          current: previewIndex,
          onOpenChange: (open) => {
            setPreviewOpen(open);

            if (!open) {
              carouselRef.current?.goTo(previewIndex);
            }
          },
          onChange: (current) => setPreviewIndex(current),
        }}
      />
    </div>
  );
}
