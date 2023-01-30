import type { Page } from '@blocksuite/store';
import * as notion from 'notion-types';

const headerMaps: Record<string, 'h1' | 'h2' | 'h3'> = {
  header: 'h1',
  sub_header: 'h2',
  sub_sub_header: 'h3',
};

export const parseNotionData = async (
  notionData: notion.ExtendedRecordMap,
  notionPageId: string,
  frameId: string,
  page: Page
) => {
  const block = notionData.block;
  const realPageId = convertToRealPageId(notionPageId);
  const pageMeta = notionData.block[realPageId];
  for (const blockId of pageMeta.value.content ?? []) {
    const blockData = block[blockId];
    switch (blockData.value.type) {
      case 'text':
        page.addBlockByFlavour(
          'affine:paragraph',
          {
            text: new page.Text(
              page,
              blockData.value?.properties?.title[0]?.[0] ?? ''
            ),
          },
          frameId
        );
        break;
      case 'header':
      case 'sub_header':
      case 'sub_sub_header':
        page.addBlockByFlavour(
          'affine:paragraph',
          {
            type: headerMaps[blockData.value.type],
            text: page.Text.fromDelta(
              page,
              blockData.value.properties?.title.map(item => ({
                insert: item?.[0] ?? '',
                attributes: {
                  bold: ((item?.[1]?.[0] as string[]) ?? ['']).includes('b'),
                  italic: ((item?.[1]?.[0] as string[]) ?? ['']).includes('i'),
                  underline: ((item?.[1]?.[0] as string[]) ?? ['']).includes(
                    'u'
                  ),
                },
              })) ?? []
            ),
          },
          frameId
        );
        break;
      case 'bulleted_list':
        page.addBlockByFlavour(
          'affine:list',
          {
            type: 'bulleted',
            text: page.Text.fromDelta(
              page,
              blockData.value.properties?.title.map(item => ({
                insert: item?.[0] ?? '',
                attributes: {
                  bold: ((item?.[1]?.[0] as string[]) ?? ['']).includes('b'),
                  italic: ((item?.[1]?.[0] as string[]) ?? ['']).includes('i'),
                  underline: ((item?.[1]?.[0] as string[]) ?? ['']).includes(
                    'u'
                  ),
                },
              })) ?? []
            ),
          },
          frameId
        );
        break;
      default:
        break;
    }
  }
  return {
    title: pageMeta.value.properties.title[0][0] ?? '',
  };
};

// insert '-' at dedicated index of input `id`, index 8, 12, 16, 20
export const convertToRealPageId = (id: string): string => {
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(
    16,
    20
  )}-${id.slice(20)}`;
};
