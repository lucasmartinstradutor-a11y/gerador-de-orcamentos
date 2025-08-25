
import React from 'react';

interface MetricCardProps {
    label: string;
    value: string;
    isHighlighted?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, isHighlighted = false }) => {
    const baseClasses = "p-4 rounded-lg text-center transition-all duration-300";
    const normalClasses = "bg-slate-100 text-slate-800 border border-slate-200";
    const highlightedClasses = "bg-indigo-600 text-white shadow-lg scale-105";

    return (
        <div className={`${baseClasses} ${isHighlighted ? highlightedClasses : normalClasses}`}>
            <p className={`text-sm font-medium ${isHighlighted ? 'text-indigo-200' : 'text-slate-500'}`}>{label}</p>
            <p className={`text-2xl font-bold ${isHighlighted ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        </div>
    );
};
