// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NotionAPI } from 'notion-client';
const api = new NotionAPI();

export default async function handler(req, res) {
  const resp = await api.getPage(req.query.pageId);
  res.json(resp);
}
