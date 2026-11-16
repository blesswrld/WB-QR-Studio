import React, { useState } from 'react';
import {
  Check,
  Copy,
  Crown,
  FolderOpen,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { ProFeatureKey, SavedTemplate } from '../types/studio';
import {
  CARD_FORMATS,
  CONVERSION_PRESETS,
  FREE_PLAN_MAX_TEMPLATES,
} from '../utils/studioLogic';
import { CardCanvas } from './CardCanvas';

interface TemplatesGalleryProps {
  templates: SavedTemplate[];
  isPro: boolean;
  onLoadTemplate: (template: SavedTemplate) => void;
  onDuplicateTemplate: (template: SavedTemplate) => void;
  onRequestDeleteTemplate: (template: SavedTemplate) => void;
  onRestoreSeeds: () => void;
  onOpenUpgrade: (feature: ProFeatureKey) => void;
}

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({
  templates,
  isPro,
  onLoadTemplate,
  onDuplicateTemplate,
  onRequestDeleteTemplate,
  onRestoreSeeds,
  onOpenUpgrade,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  const customCount = templates.filter((t) => !t.id.startsWith('seed-')).length;

  const filteredTemplates = templates.filter((tpl) => {
    const matchesFormat =
      formatFilter === 'all' || tpl.config.formatId === formatFilter;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesFormat;
    return (
      matchesFormat &&
      (tpl.name.toLowerCase().includes(q) ||
        tpl.config.brandName.toLowerCase().includes(q) ||
        tpl.config.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 studio-grid-bg">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-zinc-100">
                Сохранённые макеты ({templates.length})
              </h1>
              {!isPro && (
                <button
                  type="button"
                  onClick={() => onOpenUpgrade('unlimited_templates')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 hover:text-amber-200 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Лимит FREE: {customCount}/{FREE_PLAN_MAX_TEMPLATES} своих макетов (Снять лимит →)
                  </span>
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Шаблоны синхронизируются с вашим профилем и доступны для быстрой загрузки в конструктор.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по бренду или названию..."
                aria-label="Поиск сохранённых макетов"
                className="w-64 pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg">
              <button
                type="button"
                onClick={() => setFormatFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  formatFilter === 'all'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Все форматы
              </button>
              <button
                type="button"
                onClick={() => setFormatFilter('business_card_90x50')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap cursor-pointer ${
                  formatFilter === 'business_card_90x50'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                90×50
              </button>
              <button
                type="button"
                onClick={() => setFormatFilter('thermal_58x40')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap cursor-pointer ${
                  formatFilter === 'thermal_58x40'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                58×40
              </button>
              <button
                type="button"
                onClick={() => setFormatFilter('square_70x70')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap cursor-pointer ${
                  formatFilter === 'square_70x70'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                70×70
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center max-w-lg mx-auto my-8">
            <FolderOpen className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-zinc-100">
              {templates.length === 0
                ? 'У вас пока нет сохранённых макетов'
                : 'По вашему запросу макеты не найдены'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              {templates.length === 0
                ? 'Создайте свой дизайн в конструкторе и нажмите «Сохранить в мои макеты», или восстановите стартовые шаблоны для WB и Ozon.'
                : 'Попробуйте изменить поисковый запрос или переключить фильтр формата.'}
            </p>
            {templates.length === 0 && (
              <button
                type="button"
                onClick={onRestoreSeeds}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Загрузить стартовые примеры</span>
              </button>
            )}
          </div>
        ) : (
          /* Populated Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => {
              const fmt = CARD_FORMATS[tpl.config.formatId];
              const preset = CONVERSION_PRESETS[tpl.config.presetId];
              const formattedDate = new Date(tpl.updatedAt).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              return (
                <article
                  key={tpl.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-colors"
                >
                  {/* Visual Preview Header */}
                  <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-center min-h-[210px]">
                    <div className="w-full max-w-[300px]">
                      <CardCanvas config={tpl.config} isPro={isPro} scale="mini" />
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 truncate">
                        {tpl.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1 font-mono whitespace-nowrap overflow-hidden">
                        {tpl.nicheTag && (
                          <>
                            <span className="text-violet-400 font-semibold shrink-0">
                              {tpl.nicheTag}
                            </span>
                            <span aria-hidden="true" className="shrink-0">·</span>
                          </>
                        )}
                        <span className="shrink-0">{fmt.shortLabel}</span>
                        <span aria-hidden="true" className="shrink-0">·</span>
                        <span className="truncate">{preset.name}</span>
                        <span aria-hidden="true" className="shrink-0">·</span>
                        <span className="shrink-0">{formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onLoadTemplate(tpl)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>Открыть в конструкторе</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateTemplate(tpl)}
                        aria-label={`Дублировать макет ${tpl.name}`}
                        title="Дублировать макет"
                        className="p-2 text-xs font-medium bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRequestDeleteTemplate(tpl)}
                        aria-label={`Удалить макет ${tpl.name}`}
                        title="Удалить макет"
                        className="p-2 text-xs font-medium bg-zinc-950 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
