import React from 'react';

interface SliderGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label:string;
    id: string;
    value: number | string;
    displayValue: string;
}

export const SliderGroup: React.FC<SliderGroupProps> = ({ label, id, value, displayValue, ...props }) => {
    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={id} className="font-medium text-slate-700">
                    {label}
                </label>
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                    {displayValue}
                </span>
            </div>
            <input
                id={id}
                type="range"
                value={value}
                {...props}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );
};