import { loader } from 'fumadocs-core/source';
import { docs } from '../../.source/index';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

export function getPageImage(page: unknown): string | { url: string } | undefined {
  const data = (page as { data?: { image?: string | { url: string } } }).data;
  return data?.image;
}