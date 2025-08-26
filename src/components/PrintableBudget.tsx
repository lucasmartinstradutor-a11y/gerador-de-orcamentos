import React from 'react';

interface CalculationDetails {
    basePrice: number;
    discountValue: number;
    finalPrice: number;
    installmentValue: number;
    budgetDate: string;
    deliveryDate: string;
}

interface FormattedValues {
    basePrice: string;
    discountValue: string;
    finalPrice: string;
    installmentText: string;
    wordCount: string;
    discountDisplay: string;
}

interface PrintableBudgetProps {
    clientName: string;
    consultant: string;
    consultantPhone: string;
    observations: string;
    deliveryDays: number;
    calculations: CalculationDetails;
    formattedValues: FormattedValues;
}

export const PrintableBudget: React.FC<PrintableBudgetProps> = ({
    clientName,
    consultant,
    consultantPhone,
    observations,
    deliveryDays,
    calculations,
    formattedValues,
}) => {
    return (
        <div className="w-full h-full p-10 bg-white text-black font-sans">
            <header className="flex justify-between items-center pb-6 border-b-2 border-gray-300">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Orçamento de Revisão</h1>
                    <p className="text-gray-600">Proposta de Serviços</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">Data do Orçamento</p>
                    <p className="text-gray-700">{calculations.budgetDate}</p>
                </div>
            </header>

            <section className="my-8 grid grid-cols-2 gap-8">
                <div>
                    <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-2">PARA</h2>
                    <p className="text-xl font-medium text-gray-800">{clientName || 'Cliente não informado'}</p>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-2">DE</h2>
                    <p className="text-xl font-medium text-gray-800">{consultant || 'Consultor não informado'}</p>
                    <p className="text-gray-600">{consultantPhone || 'Telefone não informado'}</p>
                    <p className="text-gray-600">Dialética Revisões</p>
                </div>
            </section>

            <section className="my-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Detalhes do Serviço</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 font-semibold text-gray-600">Descrição</th>
                            <th className="p-3 font-semibold text-gray-600 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-3">Revisão ortográfica e gramatical ({formattedValues.wordCount} palavras)</td>
                            <td className="p-3 text-right">{formattedValues.basePrice}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3">Desconto ({formattedValues.discountDisplay})</td>
                            <td className="p-3 text-right text-red-600">- {formattedValues.discountValue}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section className="mt-8 flex justify-end">
                <div className="w-1/2">
                    <div className="flex justify-between items-center p-4 bg-gray-200 rounded-t-lg">
                        <span className="text-xl font-semibold text-gray-800">Valor Total</span>
                        <span className="text-2xl font-bold text-gray-900">{formattedValues.finalPrice}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg border-x border-b">
                        <p className="text-gray-700"><strong>Condição de Pagamento:</strong> {formattedValues.installmentText}</p>
                    </div>
                </div>
            </section>

            <section className="my-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Prazo de Entrega</h2>
                <p className="text-gray-700">O prazo estimado para a conclusão do serviço é de <strong>{deliveryDays} dias</strong>, com data de entrega prevista para <strong>{calculations.deliveryDate}</strong>.</p>
            </section>
            
            {observations && (
                <section className="my-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Observações</h2>
                    <p className="text-gray-700 italic border-l-4 border-gray-300 pl-4">{observations}</p>
                </section>
            )}

            <footer className="mt-16 pt-6 border-t-2 border-gray-300 text-center text-gray-500">
                <p>Obrigado Pela Confiança - Revisões Dialética</p>
            </footer>
        </div>
    );
};