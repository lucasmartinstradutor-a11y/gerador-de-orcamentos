import React, { useState } from 'react';
import { ProofreadingBudget } from './components/ProofreadingBudget';
import { ElivBudget } from './components/ElivBudget';

type Page = 'revisao' | 'eliv';

const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>('revisao');

    const navItemClasses = (page: Page) =>
        `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            activePage === page
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-200'
        }`;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-900">📝 Gerador de Orçamento</h1>
                    <p className="text-lg text-slate-600 mt-2">Uma ferramenta moderna para criar orçamentos de forma rápida e profissional.</p>
                </header>

                <nav className="flex justify-center mb-8">
                    <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                        <button onClick={() => setActivePage('revisao')} className={navItemClasses('revisao')}>
                            Orçamento de Revisão
                        </button>
                        <button onClick={() => setActivePage('eliv')} className={navItemClasses('eliv')}>
                            Orçamento ELIV 📦
                        </button>
                    </div>
                </nav>

                <main>
                    {activePage === 'revisao' && <ProofreadingBudget />}
                    {activePage === 'eliv' && <ElivBudget />}
                </main>
            </div>
        </div>
    );
};

export default App;