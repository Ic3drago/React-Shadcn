'use client'
import dynamic from 'next/dynamic'

const DynamicHeaderModerno = dynamic(
  () => import('./HeaderModerno'),
  { ssr: false }
);

export default DynamicHeaderModerno;