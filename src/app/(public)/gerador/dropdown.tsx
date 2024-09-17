import React from 'react';

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
        <div key={option} className="flex items-center">
          <input
            type="checkbox"
            id={option}
            checked={selectedOptions.includes(option)}
            onChange={() => handleCheckboxChange(option)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor={option} className="ml-2 block text-sm text-gray-900">
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

export default MultiSelectCheckbox;