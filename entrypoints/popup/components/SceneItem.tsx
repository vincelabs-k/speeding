import { formatSpeed } from "../speed-model";
import type { Scene } from "../speed-model";
import { getSceneName } from "./SceneSection";

type Props = {
  scene: Scene;
  isBound: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const ICON_EDIT =
  "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10";
const ICON_TRASH =
  "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0";

export const SceneItem = ({ scene, isBound, onSelect, onEdit, onDelete }: Props) => (
  <div
    className={`group relative flex items-center gap-1 rounded-lg border transition-all duration-150 ${
      isBound
        ? "border-brand-300 bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20"
        : "border-slate-200/80 bg-white/80 text-slate-700 hover:border-brand-200 hover:bg-brand-50/40"
    }`}
  >
    <button
      onClick={onSelect}
      aria-pressed={isBound}
      aria-label={browser.i18n.getMessage("ariaSceneApply", [getSceneName(scene), formatSpeed(scene.speed)])}
      className={`flex-1 flex items-center gap-2 pl-3 pr-1 py-2 rounded-lg text-left focus:outline-none focus-visible:ring-2 ${
        isBound ? "focus-visible:ring-white/60" : "focus-visible:ring-brand-400/40"
      }`}
    >
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${isBound ? "bg-emerald-300" : "bg-brand-400"}`} />
      <span className="flex-1 text-body font-semibold truncate">{getSceneName(scene)}</span>
      <span
        className={`text-caption font-bold tabular-nums rounded-md px-1.5 py-0.5 ${
          isBound ? "bg-white/20 text-white" : "bg-brand-50 text-brand-600"
        }`}
      >
        {formatSpeed(scene.speed)}&times;
      </span>
    </button>
    <div className="flex items-center pr-1.5 gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
      <button
        onClick={onEdit}
        aria-label={browser.i18n.getMessage("ariaSceneEdit", getSceneName(scene))}
        className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 ${
          isBound ? "text-white/80 hover:bg-white/20" : "text-slate-400 hover:bg-brand-50 hover:text-brand-600"
        }`}
      >
        <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={ICON_EDIT} />
        </svg>
      </button>
      <button
        onClick={onDelete}
        aria-label={browser.i18n.getMessage("ariaSceneDelete", getSceneName(scene))}
        className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 ${
          isBound ? "text-white/80 hover:bg-white/20" : "text-slate-400 hover:bg-red-50 hover:text-red-500"
        }`}
      >
        <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={ICON_TRASH} />
        </svg>
      </button>
    </div>
  </div>
);
