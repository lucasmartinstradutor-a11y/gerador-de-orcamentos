import React from 'react';

interface SelectGroupProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    id: string;
    children: React.ReactNode;
}

export const SelectGroup: React.FC<SelectGroupProps> = ({ label, id, children, ...props }) => {
    return (
        <div className="flex flex-col">
            <label htmlFor={id} className="mb-1.5 font-medium text-slate-700">
                {label}
            </label>
            <select
                id={id}
                {...props}
                className="w-full px-4 py-2 text-slate-700 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            >
                {children}
            </select>
        </div>
    );
};
