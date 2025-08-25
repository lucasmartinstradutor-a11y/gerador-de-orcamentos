
import React from 'react';

interface ToggleSwitchProps {
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, setEnabled }) => {
    return (
        <div className="flex items-center">
            <label htmlFor="toggle-discount" className="mr-3 font-medium text-slate-700">Aplicar desconto?</label>
            <button
                id="toggle-discount"
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`${enabled ? 'bg-indigo-600' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                role="switch"
                aria-checked={enabled}
            >
                <span
                    aria-hidden="true"
                    className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    );
};
