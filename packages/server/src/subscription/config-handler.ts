import type { Request, Response } from 'express';
import type { CommentTemplateType, DictionaryEntryType, StreamEvent, TrackedProjectType } from '@reports/shared';

import {
  getSubscriptionConfig,
  addTrackedProject,
  removeTrackedProject,
  addDictionaryEntry,
  removeDictionaryEntry,
  addCommentTemplate,
  removeCommentTemplate,
} from './config-props';

function sender(res: Response) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  return (event: StreamEvent) => {
    res.write(JSON.stringify(event) + '\n');
  };
}

function withSync(res: Response, label: string, run: () => unknown) {
  const sendEvent = sender(res);

  try {
    sendEvent({ type: 'message', data: run() });
  } catch (error) {
    console.error(`${label} error:`, error);
    sendEvent({ type: 'error', data: error instanceof Error ? error.message : 'Unknown error' });
  } finally {
    res.end();
  }
}

export function handleGetSubscriptionConfig(req: Request, res: Response) {
  withSync(res, 'Get subscription config', () => getSubscriptionConfig());
}

export function handleAddTrackedProject(req: Request, res: Response) {
  withSync(res, 'Add tracked project', () => addTrackedProject(req.body as TrackedProjectType));
}

export function handleRemoveTrackedProject(req: Request, res: Response) {
  withSync(res, 'Remove tracked project', () => removeTrackedProject(req.params.gitlabProjectId));
}

export function handleAddDictionaryEntry(req: Request, res: Response) {
  withSync(res, 'Add dictionary entry', () => addDictionaryEntry(req.body as DictionaryEntryType));
}

export function handleRemoveDictionaryEntry(req: Request, res: Response) {
  withSync(res, 'Remove dictionary entry', () => removeDictionaryEntry(decodeURIComponent(req.params.key)));
}

export function handleAddCommentTemplate(req: Request, res: Response) {
  withSync(res, 'Add comment template', () => addCommentTemplate(req.body as CommentTemplateType));
}

export function handleRemoveCommentTemplate(req: Request, res: Response) {
  withSync(res, 'Remove comment template', () => removeCommentTemplate(req.params.id));
}
