interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const SuggestionChips = ({ suggestions, onSelect }: SuggestionChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center stagger-children">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="suggestion-chip bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};
