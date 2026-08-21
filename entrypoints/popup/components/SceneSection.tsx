import { useState } from "react";
import { clamp, formatSpeed } from "../speed-model";
import type { Scene } from "../speed-model";
import { SceneForm } from "./SceneForm";
import { SceneItem } from "./SceneItem";

type Props = {
  scenes: Scene[];
  siteSceneId: string | null;
  onSelect: (sceneId: string | null) => void;
  onSave: (scenes: Scene[]) => void;
};

export const getSceneName = (s: Scene): string =>
  s.builtin ? browser.i18n.getMessage(s.name) || s.name : s.name;

const newSceneId = () =>
  `scene-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type FormState = { id: string | null; name: string; speed: string };

export const SceneSection = ({ scenes, siteSceneId, onSelect, onSave }: Props) => {
  const [form, setForm] = useState<FormState | null>(null);

  const submit = () => {
    if (!form) return;
    const name = form.name.trim();
    if (!name) return;
    const parsed = parseFloat(form.speed);
    const speed = clamp(Number.isNaN(parsed) ? 1 : parsed);
    if (form.id === null) {
      onSave([...scenes, { id: newSceneId(), name, speed }]);
    } else {
      onSave(scenes.map((s) => (s.id === form.id ? { ...s, name, speed, builtin: false } : s)));
    }
    setForm(null);
  };

  const remove = (id: string) => {
    onSave(scenes.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-1.5">
      {scenes.map((scene) => {
        if (form?.id === scene.id) {
          return (
            <SceneForm
              key={scene.id}
              nameValue={form.name}
              onNameChange={(v) => setForm({ ...form, name: v })}
              speedValue={form.speed}
              onSpeedChange={(v) => setForm({ ...form, speed: v })}
              onSubmit={submit}
              onCancel={() => setForm(null)}
            />
          );
        }
        return (
          <SceneItem
            key={scene.id}
            scene={scene}
            isBound={siteSceneId === scene.id}
            onSelect={() => onSelect(siteSceneId === scene.id ? null : scene.id)}
            onEdit={() => setForm({ id: scene.id, name: getSceneName(scene), speed: formatSpeed(scene.speed) })}
            onDelete={() => remove(scene.id)}
          />
        );
      })}
      {form?.id === null && (
        <SceneForm
          nameValue={form.name}
          onNameChange={(v) => setForm({ ...form, name: v })}
          speedValue={form.speed}
          onSpeedChange={(v) => setForm({ ...form, speed: v })}
          onSubmit={submit}
          onCancel={() => setForm(null)}
        />
      )}
      {form?.id !== null && (
        <>
          {scenes.length === 0 && (
            <p className="text-hint text-slate-400 text-center py-1">
              {browser.i18n.getMessage("sceneEmpty")}
            </p>
          )}
          <button
            onClick={() => setForm({ id: null, name: "", speed: "1" })}
            aria-label={browser.i18n.getMessage("ariaSceneAdd")}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-hint font-semibold text-slate-400 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/40 active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {browser.i18n.getMessage("sceneAdd")}
          </button>
        </>
      )}
    </div>
  );
};
