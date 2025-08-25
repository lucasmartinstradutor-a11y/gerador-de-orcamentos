
import React from 'react';

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, id, ...props }) => {
    return (
        <div className="flex flex-col">
            <label htmlFor={id} className="mb-1.5 font-medium text-slate-700">
                {label}
            </label>
            <input
                id={id}
                {...props}
                className="w-full px-4 py-2 text-slate-700 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );
};
