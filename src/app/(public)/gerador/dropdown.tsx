import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface MultiSelectCheckboxProps {
  options: string[];
  selectedOptions: string[];
  onChange: (selectedOptions: string[]) => void;
}

const MultiSelectCheckbox: React.FC<MultiSelectCheckboxProps> = ({ options, selectedOptions, onChange }) => {
  const handleCheckboxChange = (option: string) => {
    const updatedSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    onChange(updatedSelection);
  };

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {options.map((option) => (
        <div 
          key={option} 
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
          onClick={() => handleCheckboxChange(option)}
        >
          {selectedOptions.includes(option) ? (
            <CheckSquare className="h-5 w-5 text-indigo-600 flex-shrink-0" />
          ) : (
            <Square className="h-5 w-5 text-gray-400 flex-shrink-0" />
          )}
          <label className="text-sm text-gray-700 cursor-pointer">
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

export default MultiSelectCheckbox;