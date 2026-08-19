import { useState, type FormEvent } from 'react';
import { Button, TextInput, Text, Icon, Dialog, DialogHeader, DialogBody, DialogFooter } from '@gravity-ui/uikit';
import { Eye, EyeSlash } from '@gravity-ui/icons';

import { settingsSelector, setSettings, type SettingsState } from '../../store';
import { useSetSettingsMutation, useGetProjectDictQuery, useAddProjectCodeMutation, useRemoveProjectCodeMutation } from '../../store/api';
import { useAppDispatch, useAppSelector } from '../../hooks';

import style from './settings.module.css';

function Settings() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(settingsSelector);
  const [form, setForm] = useState<SettingsState>(settings);
  const [syncedSettings, setSyncedSettings] = useState(settings);
  const [showToken, setShowToken] = useState(false);
  const [showBridgeKey, setShowBridgeKey] = useState(false);
  const [setSettingsRequest] = useSetSettingsMutation();

  if (settings !== syncedSettings) {
    setSyncedSettings(settings);
    setForm(settings);
  }

  const { data: projectDict = {} } = useGetProjectDictQuery();
  const [addProjectCode] = useAddProjectCodeMutation();
  const [removeProjectCode] = useRemoveProjectCodeMutation();
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [codeForm, setCodeForm] = useState({ code: '', label: '' });
  const [codeToRemove, setCodeToRemove] = useState<string | null>(null);

  const handleChange = (key: keyof SettingsState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const saved = await setSettingsRequest(form).unwrap();
    dispatch(setSettings(saved));
  };

  const handleAddCode = () => {
    if (codeForm.code && codeForm.label) {
      addProjectCode(codeForm);
    }

    setIsCodeDialogOpen(false);
    setCodeForm({ code: '', label: '' });
  };

  const handleRemoveCode = () => {
    if (codeToRemove) {
      removeProjectCode({ code: codeToRemove });
    }

    setCodeToRemove(null);
  };

  return (
    <>
    <div className={style.page}>
    <form className={style.form} onSubmit={handleSubmit}>
      <Text variant="header-2">Settings</Text>
      <div className={style.group}>
        <TextInput
          label="GitLab URL"
          placeholder="https://gitlab.com/api/v4"
          value={form.gitlabUrl}
          onUpdate={handleChange('gitlabUrl')}
        />
        <TextInput
          label="Private token"
          type={showToken ? 'text' : 'password'}
          value={form.privateToken}
          onUpdate={handleChange('privateToken')}
          endContent={(
            <Button
              view="flat"
              size="s"
              onClick={() => setShowToken((prev) => !prev)}
              title={showToken ? 'Hide' : 'Show'}
            >
              <Icon data={showToken ? EyeSlash : Eye} size={16} />
            </Button>
          )}
        />
      </div>
      <div className={style.group}>
        <TextInput
          label="User ID"
          value={form.userId}
          onUpdate={handleChange('userId')}
        />
        <TextInput
          label="Employee"
          placeholder="Сотрудник"
          value={form.employee}
          onUpdate={handleChange('employee')}
        />
        <TextInput
          label="Company"
          placeholder="Название компании"
          value={form.company}
          onUpdate={handleChange('company')}
        />
      </div>
      <div className={style.group}>
        <TextInput
          label="Bridge API URL"
          placeholder="http://localhost:3002/api/v1/time/export/day-offs"
          value={form.bridgeApiUrl}
          onUpdate={handleChange('bridgeApiUrl')}
        />
        <TextInput
          label="Bridge API key"
          type={showBridgeKey ? 'text' : 'password'}
          value={form.bridgeApiKey}
          onUpdate={handleChange('bridgeApiKey')}
          endContent={(
            <Button
              view="flat"
              size="s"
              onClick={() => setShowBridgeKey((prev) => !prev)}
              title={showBridgeKey ? 'Hide' : 'Show'}
            >
              <Icon data={showBridgeKey ? EyeSlash : Eye} size={16} />
            </Button>
          )}
        />
      </div>
      <Button view="action" size="l" type="submit" width="max">
        Save
      </Button>
    </form>
    <div className={style.codes}>
      <Button view="action" size="m" onClick={() => setIsCodeDialogOpen(true)}>
        Add code
      </Button>
      <div className={style.codesList}>
        {Object.entries(projectDict).map(([code, label]) => (
          <button
            key={code}
            type="button"
            className={style.codesItem}
            onClick={() => setCodeToRemove(code)}
          >
            {code}: {label}
          </button>
        ))}
      </div>
    </div>
    </div>
    <Dialog open={isCodeDialogOpen} onClose={() => setIsCodeDialogOpen(false)}>
      <DialogHeader caption="Add code" />
      <DialogBody>
        <div className={style.codeForm}>
          <TextInput
            label="Code"
            value={codeForm.code}
            onUpdate={(code) => setCodeForm((prev) => ({ ...prev, code }))}
          />
          <TextInput
            label="Label"
            value={codeForm.label}
            onUpdate={(label) => setCodeForm((prev) => ({ ...prev, label }))}
          />
        </div>
      </DialogBody>
      <DialogFooter
        onClickButtonCancel={() => setIsCodeDialogOpen(false)}
        onClickButtonApply={handleAddCode}
        textButtonApply="Add"
        textButtonCancel="Cancel"
        propsButtonApply={{ disabled: !codeForm.code || !codeForm.label }}
      />
    </Dialog>
    <Dialog open={!!codeToRemove} onClose={() => setCodeToRemove(null)}>
      <DialogHeader caption="Remove code" />
      <DialogBody>
        Удалить {codeToRemove}: {codeToRemove && projectDict[codeToRemove]} из списка кодов проектов?
      </DialogBody>
      <DialogFooter
        onClickButtonCancel={() => setCodeToRemove(null)}
        onClickButtonApply={handleRemoveCode}
        textButtonApply="Remove"
        textButtonCancel="Cancel"
      />
    </Dialog>
    </>
  )
}

export default Settings;
