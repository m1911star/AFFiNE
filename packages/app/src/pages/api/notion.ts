// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NotionAPI } from 'notion-client';
const api = new NotionAPI();

export default async function handler(req, res) {
  // 去 query Notion database
  console.log(req.query.pageId);
  const a = await api.getPageRaw(req.query.pageId);
  console.log(a, 'a');
  const resp = await api.getPage(req.query.pageId);

  // 用 Next.js 提供的 response helper 回傳 JSON 格式的 `resp`
  res.json(resp);
}
