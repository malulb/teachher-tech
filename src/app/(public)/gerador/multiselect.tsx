import React, { useState, useEffect } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';

interface MultiSelectSubjectsProps {
  register?: UseFormRegister<any>;
  setValue?: UseFormSetValue<any>;
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
}

const MultiSelectSubjects: React.FC<MultiSelectSubjectsProps> = ({ 
  register, 
  setValue, 
  defaultValue = [],
  onChange 
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(defaultValue);

  const subjects = [
    "Arte",
    "História",
    "Geografia",
    "Matemática",
    "Ciências",
    "Língua Portuguesa"
  ];

  // Split subjects into two columns for larger screens
  const midpoint = Math.ceil(subjects.length / 2);
  const leftColumnSubjects = subjects.slice(0, midpoint);
  const rightColumnSubjects = subjects.slice(midpoint);

  const toggleSubject = (subject: string) => {
    const updated = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject];
    
    setSelectedSubjects(updated);
    if (setValue) {
      setValue('otherSubjects', updated);
    }
    if (onChange) {
      onChange(updated);
    }
  };

  // Update hidden input when selections change
  useEffect(() => {
    if (setValue) {
      setValue('otherSubjects', selectedSubjects);
    }
  }, [selectedSubjects, setValue]);

  const SubjectItem = ({ subject }: { subject: string }) => (
    <div
      onClick={() => toggleSubject(subject)}
      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
    >
      {selectedSubjects.includes(subject) ? (
        <CheckSquare className="h-5 w-5 text-indigo-600" />
      ) : (
        <Square className="h-5 w-5 text-gray-400" />
      )}
      <span className="text-sm text-gray-700">{subject}</span>
    </div>
  );

  return (
    <div className="mt-1">
      <input
        type="hidden"
        {...(register ? register('otherSubjects') : {})}
        value={JSON.stringify(selectedSubjects)}
      />
      
      {/* Mobile view (single column) */}
      <div className="sm:hidden space-y-1">
        {subjects.map((subject) => (
          <SubjectItem key={subject} subject={subject} />
        ))}
      </div>

      {/* Desktop view (two columns) */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4">
        {/* Left column */}
        <div className="space-y-1">
          {leftColumnSubjects.map((subject) => (
            <SubjectItem key={subject} subject={subject} />
          ))}
        </div>
        {/* Right column */}
        <div className="space-y-1">
          {rightColumnSubjects.map((subject) => (
            <SubjectItem key={subject} subject={subject} />
          ))}
        </div>
      </div>

      {selectedSubjects.length > 0 && (
        <div className="text-sm text-gray-500 mt-2">
          Selecionados: {selectedSubjects.length} disciplina(s)
        </div>
      )}
    </div>
  );
};

export default MultiSelectSubjects;