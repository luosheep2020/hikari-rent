'use client';

import { useState, type ComponentProps } from 'react';
import Image from 'next/image';

type Props = Omit<ComponentProps<typeof Image>, 'src' | 'onError'> & {
  src?: string | null;
};

const PLACEHOLDER = '/images/rentals/placeholder.svg';

export default function RentalImage({ src, ...props }: Props) {
  const desiredSource = src || PLACEHOLDER;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const actualSource = failedSource === desiredSource
    ? PLACEHOLDER
    : desiredSource;

  return (
    <Image
      {...props}
      src={actualSource}
      unoptimized={/^https?:\/\//.test(actualSource)}
      onError={() => setFailedSource(desiredSource)}
    />
  );
}
