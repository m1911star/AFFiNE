import { Modal, ModalWrapper, ModalCloseButton } from '@/ui/modal';
import { StyledButtonWrapper, StyledTitle } from './styles';
import { Button } from '@/ui/button';
import { Wrapper, Content } from '@/ui/layout';
import Loading from '@/components/loading';
import { usePageHelper } from '@/hooks/use-page-helper';
import { useAppState } from '@/providers/app-state-provider/context';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@affine/i18n';
import { StyledInputContent } from '../quick-search/style';
import type { ExtendedRecordMap } from 'notion-types';
import { parseNotionData } from '@/utils/notion';

type ImportModalProps = {
  open: boolean;
  onClose: () => void;
};
type Template = {
  name: string;
  source: string;
};
export const ImportModal = ({ open, onClose }: ImportModalProps) => {
  const [status, setStatus] = useState<'unImported' | 'importing'>('importing');
  const { openPage, createPage } = usePageHelper();
  const { currentWorkspace } = useAppState();
  const { t } = useTranslation();
  const [notionPageId, setPageId] = useState('');
  const _applyTemplate = function (pageId: string, template: Template) {
    const page = currentWorkspace?.getPage(pageId);
    const title = template.name;
    if (page) {
      page.captureSync();
      currentWorkspace?.setPageMeta(page.id, { title });
      if (page && page.root === null) {
        setTimeout(() => {
          const editor = document.querySelector('editor-container');
          if (editor) {
            page.addBlock({ flavour: 'affine:surface' }, null);
            const frameId = page.addBlock({ flavour: 'affine:frame' }, pageId);
            // TODO blocksuite should offer a method to import markdown from store
            editor.clipboard.importMarkdown(template.source, `${frameId}`);
            page.resetHistory();
            editor.requestUpdate();
          }
        }, 300);
      }
    }
  };
  const _handleAppleTemplate = useCallback(
    async function (template: Template) {
      const pageId = await createPage();
      if (pageId) {
        openPage(pageId);
        _applyTemplate(pageId, template);
      }
    },
    [openPage, createPage, _applyTemplate]
  );

  const _handleApplyTemplateFromNotionPage = useCallback(async () => {
    const records = (await fetch(`/api/notion?pageId=${notionPageId}`).then(
      res => res.json()
    )) as ExtendedRecordMap;
    const pageId = await createPage();
    if (pageId) {
      openPage(pageId);
      const page = currentWorkspace?.getPage(pageId);
      if (page) {
        page.captureSync();
        page.addBlock({ flavour: 'affine:surface' }, null);
        const frameId = page.addBlock({ flavour: 'affine:frame' }, pageId);
        const { title } = await parseNotionData(
          records,
          notionPageId,
          frameId,
          page
        );
        const editor = document.querySelector('editor-container');
        currentWorkspace?.setPageMeta(page.id, { title });

        if (editor) {
          page.resetHistory();
          editor.requestUpdate();
        }
      }
    }

    onClose && onClose();
  }, [createPage, notionPageId, onClose, currentWorkspace]);

  useEffect(() => {
    if (status === 'importing') {
      setTimeout(() => {
        setStatus('unImported');
      }, 1500);
    }
  }, [status]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalWrapper width={460} minHeight={240}>
        <ModalCloseButton onClick={onClose} />
        <StyledTitle>{t('Import')}</StyledTitle>

        {status === 'unImported' && (
          <>
            <StyledInputContent>
              <input
                placeholder="Notion Page Id"
                onChange={e => {
                  setPageId(e.target.value);
                }}
              />
            </StyledInputContent>
            <StyledButtonWrapper>
              <Button
                onClick={() => {
                  _handleApplyTemplateFromNotionPage();
                }}
              >
                Notion Page
              </Button>
            </StyledButtonWrapper>
          </>
        )}

        {status === 'importing' && (
          <Wrapper
            wrap={true}
            justifyContent="center"
            style={{ marginTop: 22, paddingBottom: '32px' }}
          >
            <Loading size={25}></Loading>
            <Content align="center" weight="500">
              OOOOPS! Sorry forgot to remind you that we are working on the
              import function
            </Content>
          </Wrapper>
        )}
      </ModalWrapper>
    </Modal>
  );
};

export default ImportModal;
