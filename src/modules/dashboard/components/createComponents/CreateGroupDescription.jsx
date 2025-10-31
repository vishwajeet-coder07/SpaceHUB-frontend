import React, { useState, useEffect } from 'react';

const CreateGroupDescription = ({ onBack, onSkip, onConfirm, entityLabel = 'group', initialDescription = '', onChange }) => {
  const [description, setDescription] = useState(initialDescription || '');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (initialDescription !== undefined) setDescription(initialDescription || '');
  }, [initialDescription]);

  const showError = touched && !description.trim();

  const handleConfirm = () => {
    setTouched(true);
    if (!description.trim()) return;
    onConfirm?.({ description });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    onChange?.(value);
  };

  return (
    <div className="relative w-[94%] max-w-[750px] rounded-2xl overflow-hidden shadow-2xl h-[680px]">
      <div className="bg-white py-4 px-2 h-full">
        <div className="relative bg-[#282828] text-white p-6 h-full rounded-2xl flex flex-col">
          {/* Main center content */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <h2 className="text-4xl sm:text-5xl font-semibold leading-tight text-center">
              Wanna add description
              <br />
              for your {entityLabel}?
            </h2>
            <div className="w-full mt-10">
              <input
                value={description}
                onChange={handleChange}
                onBlur={() => setTouched(true)}
                placeholder="Add description"
                className="w-full bg-white text-gray-900 rounded-xl px-4 py-4 text-lg outline-none"
              />
              {showError && (
                <p className="mt-2 text-sm text-red-400">Description is required.</p>
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-8">
            <button onClick={onBack} className="text-white/90 hover:text-white text-lg">Back</button>
            <button onClick={handleConfirm} className={`px-5 py-2 rounded-xl font-semibold ${description.trim() ? 'bg-indigo-100 text-gray-900' : 'bg-indigo-100/60 text-gray-900/70'}`}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupDescription;


