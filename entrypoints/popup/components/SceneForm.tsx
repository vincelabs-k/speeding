import { MAX_SPEED, MIN_SPEED } from "../speed-model";

type Props = {
  nameValue: string;
  onNameChange: (v: string) => void;
  speedValue: string;
  onSpeedChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const inputCls =
  "w-full h-8 bg-white border border-slate-200 rounded-md pl-2.5 pr-2 text-body font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/15 transition-all";

export const SceneForm = ({ nameValue, onNameChange, speedValue, onSpeedChange, onSubmit, onCancel }: Props) => {
  const canSave = nameValue.trim().length > 0;
  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-2 space-y-1.5">
      <input
        autoFocus
        type="text"
        value={nameValue}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={browser.i18n.getMessage("sceneName")}
        aria-label={browser.i18n.getMessage("ariaSceneName")}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canSave) onSubmit();
          if (e.key === "Escape") onCancel();
        }}
        className={inputCls}
      />
      <input
        type="number"
        value={speedValue}
        min={MIN_SPEED}
        max={MAX_SPEED}
        step={0.25}
        onChange={(e) => onSpeedChange(e.target.value)}
        placeholder={browser.i18n.getMessage("sceneSpeed")}
        aria-label={browser.i18n.getMessage("ariaSceneSpeed")}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canSave) onSubmit();
          if (e.key === "Escape") onCancel();
        }}
        className={inputCls}
      />
      <div className="flex gap-1.5 justify-end">
        <button
          onClick={onCancel}
          className="h-7 px-3 rounded-md text-hint font-semibold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.97] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
        >
          {browser.i18n.getMessage("sceneCancel")}
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSave}
          className="h-7 px-3 rounded-md text-hint font-semibold text-white bg-gradient-to-br from-brand-500 to-brand-600 shadow-sm shadow-brand-500/20 hover:from-brand-600 hover:to-brand-700 active:scale-[0.97] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {browser.i18n.getMessage("sceneSave")}
        </button>
      </div>
    </div>
  );
};
