import { memo } from 'react';
import type { TooltipRenderProps } from 'react-joyride';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';

const BC = {
  coral: '#EF476F',
  blue: '#118AB2',
  pink: '#FF70A6',
  violet: '#9D4EDD',
  border: '#073B4C',
  bg: '#FFF9EC',
  text: '#073B4C',
  dim: '#6b7280',
};

const BC_CARD = 'bg-white border-4 border-braincity-border rounded-2xl overflow-hidden shadow-[0_4px_0_0_#073B4C] relative';

const TourTooltip = memo(({
  index,
  size,
  step,
  backProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  const { isBrainCity } = useScenarioTheme();

  return (
    <div
      {...tooltipProps}
      className={
        isBrainCity
          ? `${BC_CARD} max-w-sm w-full p-5 mt-2`
          : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-5 max-w-sm w-full shadow-2xl relative overflow-hidden mt-2'
      }
    >
      {!isBrainCity && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forensics-orange to-forensics-cyan" />
      )}

      {/* Header */}
      <div className="mb-3 flex gap-4">
        {isBrainCity ? (
          <img
            src="/images/inspecteur/Ricardo_Pouleto_sticker.png"
            alt="Ricardo"
            className="w-12 h-12 object-contain hidden sm:block"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-forensics-cyan/40 bg-forensics-cyan/10 flex items-center justify-center shrink-0">
            <span className="text-forensics-cyan text-sm font-mono">V</span>
          </div>
        )}

        <div className="flex-1 mt-1">
          {step.title && (
            <h3 className={
              isBrainCity
                ? "font-bangers text-2xl tracking-wider leading-none mb-1"
                : "text-forensics-cyan font-mono font-bold text-sm tracking-wider uppercase mb-1"
            } style={isBrainCity ? { color: BC.coral } : {}}>
              {step.title}
            </h3>
          )}
          <p className={
            isBrainCity
              ? "font-fredoka text-sm font-bold"
              : "font-mono text-xs text-gray-300 leading-relaxed"
          } style={isBrainCity ? { color: BC.text } : {}}>
            {step.content}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-500/20">
        <div className={
          isBrainCity
            ? "font-bangers text-lg tracking-widest"
            : "font-mono text-[10px] text-gray-500"
        } style={isBrainCity ? { color: BC.dim } : {}}>
          ÉTAPE {index + 1} / {size}
        </div>

        <div className="flex gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className={
                isBrainCity
                  ? "px-3 py-1 font-bangers text-base tracking-wider rounded-lg border-2 border-braincity-border bg-gray-100 text-braincity-text hover:-translate-y-0.5 transition-transform"
                  : "px-3 py-1 text-xs font-mono text-gray-400 hover:text-white transition-colors"
              }
            >
              RETOUR
            </button>
          )}

          <button
            {...primaryProps}
            className={
              isBrainCity
                ? "px-4 py-1.5 font-bangers text-lg tracking-wider rounded-lg text-white border-2 border-braincity-border hover:-translate-y-1 hover:shadow-[0_2px_0_0_#073B4C] transition-all"
                : "px-4 py-1.5 text-xs font-mono font-bold bg-forensics-cyan/20 text-forensics-cyan border border-forensics-cyan hover:bg-forensics-cyan hover:text-forensics-bg transition-colors rounded"
            }
            style={isBrainCity ? { background: BC.blue } : {}}
          >
            {isLastStep ? (isBrainCity ? 'COMPRIS !' : 'TERMINER') : (isBrainCity ? 'SUIVANT' : 'SUIVANT')}
          </button>
        </div>
      </div>
    </div>
  );
});

export default TourTooltip;
