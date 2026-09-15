import { useState } from 'react';
import {
  Button, TextInput, Text, Icon, Dialog, DialogHeader, DialogBody, DialogFooter, useToaster,
} from '@gravity-ui/uikit';
import { Plus, TrashBin } from '@gravity-ui/icons';
import type { DictionaryEntryType } from '@reports/shared';

import {
  useGetSubscriptionConfigQuery,
  useAddDictionaryEntryMutation,
  useRemoveDictionaryEntryMutation,
} from '../../store/api';
import { describeError } from '../../utils/describe-error';

import style from './settings.module.css';

const emptyForm = { key: '', value: '' };

/** Same-length dot mask as bridge's Purge page, so the real value never renders in the clear here. */
function mask(value: string): string {
  return '•'.repeat(Math.min(value.length, 40)) || '—';
}

function DictionarySection() {
  const toaster = useToaster();
  const { data: config } = useGetSubscriptionConfigQuery();
  const [addDictionaryEntry] = useAddDictionaryEntryMutation();
  const [removeDictionaryEntry] = useRemoveDictionaryEntryMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toRemove, setToRemove] = useState<DictionaryEntryType | null>(null);

  const dictionary = config?.dictionary ?? [];
  const isDuplicate = Boolean(form.key) && dictionary.some((entry) => entry.key === form.key);

  const handleAdd = async () => {
    if (!form.key || !form.value || isDuplicate) {
      return;
    }

    const entry = form;

    setIsDialogOpen(false);
    setForm(emptyForm);

    try {
      await addDictionaryEntry(entry).unwrap();
    } catch (error) {
      toaster.add({
        name: 'dictionary-add-error',
        theme: 'danger',
        title: 'Не удалось добавить запись словаря',
        content: describeError(error),
        isClosable: true,
      });
    }
  };

  const handleRemove = async () => {
    const entry = toRemove;

    setToRemove(null);

    if (!entry) {
      return;
    }

    try {
      await removeDictionaryEntry({ key: entry.key }).unwrap();
    } catch (error) {
      toaster.add({
        name: 'dictionary-remove-error',
        theme: 'danger',
        title: 'Не удалось удалить запись словаря',
        content: describeError(error),
        isClosable: true,
      });
    }
  };

  return (
    <>
      <section className={style.codes}>
        <div className={style.sectionHead}>
          <Text variant="subheader-2">Словарь подстановки</Text>
          <Text variant="caption-2" color="secondary">
            Реальное значение → плейсхолдер при push, обратно при pull. Формат совпадает с экспортом Purge из bridge
          </Text>
        </div>
        {dictionary.length === 0 ? (
          <Text variant="body-2" color="secondary" className={style.codesEmpty}>
            Словарь пуст — код и текст задачи будут передаваться без подстановки
          </Text>
        ) : (
          <ul className={style.codesList}>
            {dictionary.map((entry) => (
              <li key={entry.key} className={style.codesItem}>
                <span className={style.codesCode}>{entry.value}</span>
                <span className={style.codesLabel}>{mask(entry.key)}</span>
                <Button
                  view="flat"
                  size="s"
                  onClick={() => setToRemove(entry)}
                  aria-label={`Удалить запись ${entry.value}`}
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
          Добавить запись
        </Button>
      </section>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader caption="Добавить запись словаря" />
        <DialogBody>
          <div className={style.codeForm}>
            <TextInput
              label="Реальное значение"
              placeholder="prod-db.internal.example.com"
              value={form.key}
              onUpdate={(key) => setForm((prev) => ({ ...prev, key }))}
              validationState={isDuplicate ? 'invalid' : undefined}
              errorMessage={isDuplicate ? 'Такая запись уже есть' : undefined}
            />
            <TextInput
              label="Плейсхолдер"
              placeholder="{{DB_HOST}}"
              value={form.value}
              onUpdate={(value) => setForm((prev) => ({ ...prev, value }))}
            />
          </div>
        </DialogBody>
        <DialogFooter
          onClickButtonCancel={() => setIsDialogOpen(false)}
          onClickButtonApply={handleAdd}
          textButtonApply="Добавить"
          textButtonCancel="Отмена"
          propsButtonApply={{ disabled: !form.key || !form.value || isDuplicate }}
        />
      </Dialog>

      <Dialog open={!!toRemove} onClose={() => setToRemove(null)}>
        <DialogHeader caption="Удалить запись" />
        <DialogBody>
          Удалить запись словаря {toRemove?.value}?
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

export default DictionarySection;
