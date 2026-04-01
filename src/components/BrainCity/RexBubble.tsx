interface RexBubbleProps {
  message: string;
}

const RexBubble = ({ message }: RexBubbleProps) => (
  <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
    <span className="text-2xl flex-shrink-0" aria-hidden="true">🐕</span>
    <div className="bg-braincity-bubble rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 leading-snug">
      {message}
    </div>
  </div>
);

export default RexBubble;
