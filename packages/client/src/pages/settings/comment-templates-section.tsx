import { useState } from 'react';
import {
  Button, TextInput, Text, Icon, Dialog, DialogHeader, DialogBody, DialogFooter, useToaster,
} from '@gravity-ui/uikit';
import { Plus, TrashBin } from '@gravity-ui/icons';
import type { CommentTemplateType } from '@reports/shared';

import {
  useGetSubscriptionConfigQuery,
  useAddCommentTemplateMutation,
  useRemoveCommentTemplateMutation,
} from '../../store/api';
import { describeError } from '../../utils/describe-error';

import style from './settings.module.css';

const emptyForm = { title: '', body: '' };

function CommentTemplatesSection() {
  const toaster = useToaster();
  const { data: config } = useGetSubscriptionConfigQuery();
  const [addCommentTemplate] = useAddCommentTemplateMutation();
  const [removeCommentTemplate] = useRemoveCommentTemplateMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toRemove, setToRemove] = useState<CommentTemplateType | null>(null);

  const templates = config?.commentTemplates ?? [];

  const handleAdd = async () => {
    if (!form.title || !form.body) {
      return;
    }

    const template: CommentTemplateType = {
      id: crypto.randomUUID(),
      title: form.title,
      body: form.body,
    };

    setIsDialogOpen(false);
    setForm(emptyForm);

    try {
      await addCommentTemplate(template).unwrap();
    } catch (error) {
      toaster.add({
        name: 'comment-template-add-error',
        theme: 'danger',
        title: 'Не удалось добавить шаблон',
        content: describeError(error),
        isClosable: true,
      });
    }
  };

  const handleRemove = async () => {
    const template = toRemove;

    setToRemove(null);

    if (!template) {
      return;
    }

    try {
      await removeCommentTemplate({ id: template.id }).unwrap();
    } catch (error) {
      toaster.add({
        name: 'comment-template-remove-error',
        theme: 'danger',
        title: 'Не удалось удалить шаблон',
        content: describeError(error),
        isClosable: true,
      });
    }
  };

  return (
    <>
      <section className={style.codes}>
        <div className={style.sectionHead}>
          <Text variant="subheader-2">Шаблоны комментариев</Text>
          <Text variant="caption-2" color="secondary">
            Выбираются на шаге publish в Subscription. {'{{branch}}'} подставляется автоматически
          </Text>
        </div>
        {templates.length === 0 ? (
          <Text variant="body-2" color="secondary" className={style.codesEmpty}>
            Шаблоны ещё не добавлены
          </Text>
        ) : (
          <ul className={style.codesList}>
            {templates.map((template) => (
              <li key={template.id} className={style.codesItem}>
                <span className={style.codesLabel}>{template.title}</span>
                <Button
                  view="flat"
                  size="s"
                  onClick={() => setToRemove(template)}
                  aria-label={`Удалить шаблон ${template.title}`}
                  className={style.codesRemove}
                >
                  <Icon data={TrashBin} size={16} />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button view="outlined" size="m" width="max" onClick={() => setIsDialogOpen(true)} className={style.codesAdd}>
          <Icon data={Plus} size={16} />
          Добавить шаблон
        </Button>
      </section>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader caption="Добавить шаблон комментария" />
        <DialogBody>
          <div className={style.codeForm}>
            <TextInput
              label="Название"
              placeholder="Готово к ревью"
              value={form.title}
              onUpdate={(title) => setForm((prev) => ({ ...prev, title }))}
            />
            <div>
              <label htmlFor="comment-template-body">
                <Text variant="body-short">Текст комментария</Text>
              </label>
              <textarea
                id="comment-template-body"
                className={style.templateBody}
                placeholder="Ветка {{branch}} готова, изменения запушены."
                value={form.body}
                onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter
          onClickButtonCancel={() => setIsDialogOpen(false)}
          onClickButtonApply={handleAdd}
          textButtonApply="Добавить"
          textButtonCancel="Отмена"
          propsButtonApply={{ disabled: !form.title || !form.body }}
        />
      </Dialog>

      <Dialog open={!!toRemove} onClose={() => setToRemove(null)}>
        <DialogHeader caption="Удалить шаблон" />
        <DialogBody>
          Удалить шаблон «{toRemove?.title}»?
        </DialogBody>
        <DialogFooter
          onClickButtonCancel={() => setToRemove(null)}
          onClickButtonApply={handleRemove}
          textButtonApply="Удалить"
          textButtonCancel="Отмена"
          propsButtonApply={{ view: 'outlined-danger' }}
        />
      </Dialog>
    </>
  )
}

export default CommentTemplatesSection;
