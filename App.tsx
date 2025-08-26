import React, { useState, useMemo, useCallback } from 'react';
import { InputGroup } from './components/InputGroup';
import { MetricCard } from './components/MetricCard';
import { ToggleSwitch } from './components/ToggleSwitch';
import { PrintableBudget } from './components/PrintableBudget';
import { CopyIcon, PrinterIcon, CheckIcon, DownloadIcon, FileTextIcon } from './components/Icons';

// Declare global variables from CDN scripts for TypeScript
// This makes them available on the `window` object for robust access
declare global {
  interface Window {
    PizZip: any;
    docxtemplater: any;
    saveAs: (blob: Blob | string, filename: string) => void;
  }
}


const App: React.FC = () => {
    const [clientName, setClientName] = useState('Prof. João Silva');
    const [consultant, setConsultant] = useState('Lucas Martins');
    const [observations, setObservations] = useState('Valores válidos por 7 dias. Entrega estimada conforme cronograma.');
    const [wordCount, setWordCount] = useState<number>(30000);
    const [pricePerWord, setPricePerWord] = useState<number>(0.03);
    const [applyDiscount, setApplyDiscount] = useState(true);
    const [discountPercentage, setDiscountPercentage] = useState<number>(20);
    const [installments, setInstallments] = useState<number>(4);
    const [deliveryDays, setDeliveryDays] = useState<number>(30);

    const [isCopied, setIsCopied] = useState(false);
    const [templateFile, setTemplateFile] = useState<File | null>(null);

    const brMoney = useCallback((value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    }, []);

    const brInt = useCallback((value: number): string => {
        return new Intl.NumberFormat('pt-BR').format(value);
    }, []);

    const calculations = useMemo(() => {
        const basePrice = wordCount * pricePerWord;
        const discountRate = applyDiscount ? discountPercentage / 100 : 0;
        const discountValue = basePrice * discountRate;
        const finalPrice = basePrice - discountValue;
        const installmentValue = finalPrice > 0 ? finalPrice / installments : 0;

        const today = new Date();
        const deliveryDate = new Date();
        deliveryDate.setDate(today.getDate() + deliveryDays);

        const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');

        return {
            basePrice,
            discountValue,
            finalPrice,
            installmentValue,
            budgetDate: formatDate(today),
            deliveryDate: formatDate(deliveryDate),
        };
    }, [wordCount, pricePerWord, applyDiscount, discountPercentage, installments, deliveryDays]);
    
    const formattedValues = useMemo(() => {
        return {
            basePrice: brMoney(calculations.basePrice),
            discountValue: brMoney(calculations.discountValue),
            finalPrice: brMoney(calculations.finalPrice),
            installmentValue: brMoney(calculations.installmentValue),
            installmentText: `${installments}x sem juros de ${brMoney(calculations.installmentValue)} cada`,
            wordCount: brInt(wordCount),
            discountDisplay: applyDiscount && discountPercentage > 0 ? `${discountPercentage.toFixed(1)}%` : '— (não aplicado)',
        };
    }, [calculations, brMoney, brInt, installments, applyDiscount, discountPercentage, wordCount]);

    const salesScript = useMemo(() => {
        return `
Olá! 😊 Segue o orçamento da revisão ortográfica e gramatical (data: ${calculations.budgetDate}):

• Cliente: ${clientName || "-"}
• Consultor: ${consultant || "-"}
• Contagem de palavras: ${formattedValues.wordCount}
• Preço base: ${formattedValues.basePrice}
• Desconto aplicado: ${formattedValues.discountDisplay}
• Valor do desconto: ${formattedValues.discountValue}
• Valor final: ${formattedValues.finalPrice}
• Condição de pagamento: ${formattedValues.installmentText}
• Prazo estimado de entrega: ${deliveryDays} dias (até ${calculations.deliveryDate})

Observações: ${observations || "-"}
        `.trim();
    }, [clientName, consultant, observations, deliveryDays, calculations, formattedValues]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(salesScript).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadTxt = () => {
        const blob = new Blob([salesScript], { type: "text/plain;charset=utf-8" });
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
        window.saveAs(blob, `Orcamento_Script_${timestamp}.txt`);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setTemplateFile(event.target.files[0]);
        } else {
            setTemplateFile(null);
        }
    };

    const handleGenerateDocx = () => {
        if (!templateFile) {
            alert("Por favor, carregue um arquivo de modelo .docx primeiro.");
            return;
        }

        // Check if the required libraries are loaded from the CDN
        if (typeof window.PizZip === 'undefined' || typeof window.docxtemplater === 'undefined' || typeof window.saveAs === 'undefined') {
            alert("Erro: As bibliotecas necessárias para gerar o DOCX não foram carregadas. Verifique sua conexão com a internet e tente recarregar a página.");
            console.error("PizZip, docxtemplater, or saveAs is not defined on the window object.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result;
                if (!content) throw new Error("Falha ao ler o arquivo.");
                
                // Use window.PizZip and window.docxtemplater to avoid ReferenceError
                const zip = new window.PizZip(content);
                const doc = new window.docxtemplater(zip, {
                    paragraphLoop: true,
                    linebreaks: true,
                });

                const context = {
                    nome_cliente: clientName,
                    consultor: consultant,
                    observacoes: observations,
                    palavras: formattedValues.wordCount,
                    valor_palavra: brMoney(pricePerWord),
                    preco_base: formattedValues.basePrice,
                    desconto_percent: formattedValues.discountDisplay,
                    valor_desconto: formattedValues.discountValue,
                    preco_final: formattedValues.finalPrice,
                    num_parcelas: installments,
                    valor_parcela: formattedValues.installmentValue,
                    parcelamento_texto: formattedValues.installmentText,
                    prazo_dias: deliveryDays,
                    data_orcamento: calculations.budgetDate,
                    data_entrega: calculations.deliveryDate,
                };

                doc.render(context);

                const out = doc.getZip().generate({
                    type: "blob",
                    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                });
                
                const now = new Date();
                const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
                
                // Use window.saveAs for robustness
                window.saveAs(out, `Orcamento_Rev_${timestamp}.docx`);

            } catch (error: any) {
                console.error("Erro ao gerar DOCX:", error);
                 // Check for a specific error from docxtemplater about missing tags
                if (error.properties && error.properties.id === 'template_error') {
                    alert(`Ocorreu um erro no modelo: ${error.message}\n\nVerifique se todos os placeholders (ex: {nome_cliente}) estão corretos no seu arquivo .docx.`);
                } else {
                    alert(`Ocorreu um erro ao processar o arquivo: ${error.message}`);
                }
            }
        };
        reader.onerror = (error) => {
             console.error("Erro ao ler o arquivo:", error);
             alert("Não foi possível ler o arquivo selecionado.");
        };
        reader.readAsArrayBuffer(templateFile);
    };


    return (
        <>
            <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 print:hidden">
                <div className="max-w-7xl mx-auto">
                    <header className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-slate-900">📝 Gerador de Orçamento</h1>
                        <p className="text-lg text-slate-600 mt-2">Uma ferramenta moderna para criar orçamentos de revisão de forma rápida e profissional.</p>
                    </header>

                    <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Coluna de Entradas */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                            <form className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Dados do Orçamento</h2>
                                    <div className="space-y-4">
                                        <InputGroup label="Nome do cliente" id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex.: Prof. João Silva" />
                                        <InputGroup label="Consultor" id="consultant" value={consultant} onChange={(e) => setConsultant(e.target.value)} placeholder="Ex.: Lucas Martins" />
                                        <div className="flex flex-col">
                                            <label htmlFor="observations" className="mb-1.5 font-medium text-slate-700">Observações (opcional)</label>
                                            <textarea id="observations" value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} className="w-full px-4 py-2 text-slate-700 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200" placeholder="Ex.: Valores válidos por 7 dias."></textarea>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Parâmetros de Cálculo</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputGroup label="Contagem de palavras" id="wordCount" type="number" value={String(wordCount)} onChange={(e) => setWordCount(Number(e.target.value))} min="0" step="100" />
                                        <InputGroup label="Valor por palavra (R$)" id="pricePerWord" type="number" value={String(pricePerWord)} onChange={(e) => setPricePerWord(Number(e.target.value))} min="0.00" step="0.01" />
                                        <InputGroup label="Prazo de entrega (dias)" id="deliveryDays" type="number" value={String(deliveryDays)} onChange={(e) => setDeliveryDays(Number(e.target.value))} min="1" step="1" />
                                        <InputGroup label="Nº de parcelas" id="installments" type="number" value={String(installments)} onChange={(e) => setInstallments(Number(e.target.value))} min="1" max="12" step="1" />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Desconto</h2>
                                    <div className="flex items-center space-x-4">
                                        <ToggleSwitch enabled={applyDiscount} setEnabled={setApplyDiscount} />
                                        <div className={`flex-grow transition-opacity duration-300 ${applyDiscount ? 'opacity-100' : 'opacity-50'}`}>
                                            <InputGroup label="% de desconto" id="discountPercentage" type="number" value={String(discountPercentage)} onChange={(e) => setDiscountPercentage(Number(e.target.value))} min="0" max="100" step="1" disabled={!applyDiscount} />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Coluna de Resultados */}
                        <div className="lg:col-span-3 space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4">Resultados do Orçamento</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <MetricCard label="Preço Base" value={formattedValues.basePrice} />
                                    <MetricCard label="Desconto" value={formattedValues.discountValue} />
                                    <MetricCard label="Preço Final" value={formattedValues.finalPrice} isHighlighted />
                                </div>
                                <div className="bg-slate-100 p-4 rounded-lg space-y-2 text-slate-700">
                                    <p><strong>Data do orçamento:</strong> {calculations.budgetDate}</p>
                                    <p><strong>Desconto aplicado:</strong> {formattedValues.discountDisplay}</p>
                                    <p><strong>Condição de pagamento:</strong> {formattedValues.installmentText}</p>
                                    <p><strong>Prazo estimado:</strong> {deliveryDays} dias (entrega até {calculations.deliveryDate})</p>
                                </div>
                            </div>

                             <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-slate-800">Gerar Documentos</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="template-upload" className="block text-sm font-medium text-slate-700 mb-1">1. Carregar modelo .docx</label>
                                        <input id="template-upload" type="file" accept=".docx" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                                        <p className="text-xs text-slate-500 mt-1">Use placeholders como `&#123;nome_cliente&#125;`. <span className="font-semibold">Dica:</span> Insira a logo da sua editora diretamente no arquivo de modelo.</p>
                                    </div>
                                    <div className="flex space-x-3 pt-2">
                                        <button onClick={handleGenerateDocx} disabled={!templateFile} className="flex items-center justify-center w-36 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                            <DownloadIcon className="w-5 h-5 mr-2" />
                                            Gerar DOCX
                                        </button>
                                        <button onClick={handlePrint} className="flex items-center justify-center w-36 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                                            <PrinterIcon className="w-5 h-5 mr-2" />
                                            Gerar PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-slate-800">Script para Envio Rápido</h2>
                                    <div className="flex items-center space-x-3">
                                        <button onClick={handleCopyToClipboard} className="flex items-center justify-center w-32 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                                            {isCopied ? (
                                                <>
                                                    <CheckIcon className="w-5 h-5 mr-2" />
                                                    Copiado!
                                                </>
                                            ) : (
                                                <>
                                                    <CopyIcon className="w-5 h-5 mr-2" />
                                                    Copiar
                                                </>
                                            )}
                                        </button>
                                         <button onClick={handleDownloadTxt} className="flex items-center justify-center w-36 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                                            <FileTextIcon className="w-5 h-5 mr-2" />
                                            Baixar (.txt)
                                        </button>
                                    </div>
                                </div>
                                <textarea readOnly value={salesScript} rows={10} className="w-full p-4 font-mono text-sm bg-slate-100 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <div className="hidden print:block">
                 <PrintableBudget
                    clientName={clientName}
                    consultant={consultant}
                    observations={observations}
                    deliveryDays={deliveryDays}
                    calculations={calculations}
                    formattedValues={formattedValues}
                />
            </div>
        </>
    );
};

export default App;