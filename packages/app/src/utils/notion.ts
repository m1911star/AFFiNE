import type { Page } from '@blocksuite/store';
import * as notion from 'notion-types';

export const parseNotionData = async (
  notionData: notion.ExtendedRecordMap,
  notionPageId: string,
  frameId: string,
  page: Page
) => {
  // page.captureSync();
  const block = notionData.block;
  const realPageId = convertToRealPageId(notionPageId);
  const pageMeta = notionData.block[realPageId];
  for (const blockId of pageMeta.value.content ?? []) {
    const blockData = block[blockId];
    switch (blockData.value.type) {
      case 'text':
        console.log(blockData.value?.properties?.title[0][0] ?? '');
        page.addBlockByFlavour(
          'affine:paragraph',
          {
            text: new page.Text(
              page,
              blockData.value?.properties?.title[0][0] ?? ''
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
