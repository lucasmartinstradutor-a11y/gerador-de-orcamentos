import React, { useState, useMemo, useCallback } from 'react';
import { InputGroup } from './InputGroup';
import { SelectGroup } from './SelectGroup';
import { SliderGroup } from './SliderGroup';
import { ToggleSwitch } from './ToggleSwitch';

// Declare global variables from CDN scripts for TypeScript
declare global {
  interface Window {
    saveAs: (blob: Blob | string, filename: string) => void;
    PizZip: any;
    docxtemplater: any;
  }
}

const PACOTES = {
    "Básico":   { lista_pix: 1884.60, mensal_6x: 349.00, parcelas: 6 },
    "Especial": { lista_pix: 1938.60, mensal_6x: 359.00, parcelas: 6 },
    "Premium":  { lista_pix: 2694.60, mensal_6x: 499.00, parcelas: 6 },
};
type PacoteKey = keyof typeof PACOTES;
const FORMAS_PAGAMENTO = ["6x sem juros", "à vista (PIX)"] as const;
type FormaPagamento = typeof FORMAS_PAGAMENTO[number];
const PRONOMES_TRATAMENTO = ["Prof.", "Profa.", "Prof. Dr.", "Profa. Dra.", "Sr.", "Sra.", "Doutor", "Doutora"];


export const ElivBudget: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'dados' | 'universidade'>('dados');
    
    // === Main data states ===
    const [cliente, setCliente] = useState('Prof. João Silva');
    const [consultor, setConsultor] = useState('Lucas Martins');
    const [obra, setObra] = useState('DICIONÁRIO TEMÁTICO DE TURISMO E PATRIMÔNIO');
    const [paginas, setPaginas] = useState(250);
    const [pacote, setPacote] = useState<PacoteKey>('Especial');
    const [formaPag, setFormaPag] = useState<FormaPagamento>('6x sem juros');
    const [descontoPacPct, setDescontoPacPct] = useState(15);
    const [obs, setObs] = useState('');

    // === University data states ===
    const [modoUni, setModoUni] = useState(false);
    const [universidade, setUniversidade] = useState('Universidade Federal de Viçosa');
    const [tratamento, setTratamento] = useState('Profa.');
    const [contato, setContato] = useState('(31) 99999-0000');
    const [precoCapa, setPrecoCapa] = useState(75.00);
    const [tirQtd, setTirQtd] = useState(100);
    const [tirDescPct, setTirDescPct] = useState(30.0);
    const [ebookPreco, setEbookPreco] = useState(0.0);

    const brMoney = useCallback((value: number | null | undefined): string => {
        if (value === null || value === undefined) return "—";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }, []);

    const calculations = useMemo(() => {
        const base = PACOTES[pacote].lista_pix;
        const parcelas = PACOTES[pacote].parcelas;
        const totalComDesc = base * (1 - descontoPacPct / 100);
        const mensal = formaPag === "6x sem juros" ? totalComDesc / parcelas : null;

        const unitarioDesc = precoCapa * (1 - tirDescPct / 100);
        const totalTiragem = unitarioDesc * tirQtd;
        const totalGeral = totalComDesc + totalTiragem;

        return { base, parcelas, totalComDesc, mensal, unitarioDesc, totalTiragem, totalGeral };
    }, [pacote, descontoPacPct, formaPag, precoCapa, tirDescPct, tirQtd]);

    const tabClasses = (tabName: 'dados' | 'universidade') =>
        `px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
            activeTab === tabName
                ? 'bg-white text-indigo-700 shadow'
                : 'text-slate-600 hover:bg-slate-200'
        }`;
    
    const handleGenerateDocx = async (type: 'comum' | 'uni') => {
        const templatePath = type === 'comum' ? '/templates/ELIV_Comum.docx' : '/templates/ELIV_Universidade.docx';
        const fileName = type === 'comum' ? 'Orcamento_Comum_ELIV.docx' : 'Orcamento_Universidade_ELIV.docx';
        
        setIsLoading(true);
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Template não encontrado em '${templatePath}'. Por favor, crie uma pasta 'public' na raiz do seu projeto, dentro dela crie outra pasta chamada 'templates', e coloque seus arquivos .docx ('ELIV_Comum.docx', 'ELIV_Universidade.docx') lá.`);
            }
            const content = await response.arrayBuffer();
            
            const zip = new window.PizZip(content);
            const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            const today = new Date().toLocaleDateString('pt-BR');
            
            const commonContext = {
                data: today,
                cliente: cliente || "",
                consultor: consultor || "",
                obra: obra || "",
                paginas: paginas,
                pacote: pacote,
                forma_pag: formaPag,
                preco_lista: brMoney(calculations.base),
                desc_pac_pct: `${descontoPacPct.toFixed(0)}%`,
                valor_com_desconto: brMoney(calculations.totalComDesc),
                mensal_final: brMoney(calculations.mensal),
                observacoes: obs || "",
            };

            if (type === 'comum') {
                doc.render(commonContext);
            } else {
                 const uniContext = {
                    ...commonContext,
                    universidade: universidade || "",
                    contato: contato || "",
                    tratamento: tratamento || "",
                    autor: cliente || "",
                    preco_capa: brMoney(precoCapa),
                    desc_tiragem_pct: `${tirDescPct.toFixed(0)}%`,
                    preco_unitario: brMoney(calculations.unitarioDesc),
                    tiragem_qtd: tirQtd,
                    total_tiragem: brMoney(calculations.totalTiragem),
                    ebook_preco: brMoney(ebookPreco),
                    total_geral: brMoney(calculations.totalGeral),
                };
                doc.render(uniContext);
            }
            
            const out = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            window.saveAs(out, fileName);

        } catch (error) {
            console.error("Erro ao gerar DOCX:", error);
            alert((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <div className="flex justify-center mb-6">
                 <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl border">
                    <button onClick={() => setActiveTab('dados')} className={tabClasses('dados')}>Dados principais</button>
                    <button onClick={() => setActiveTab('universidade')} className={tabClasses('universidade')}>Universidade (opcional)</button>
                </div>
            </div>

            {/* Aba de Dados Principais */}
            <div className={activeTab === 'dados' ? 'block' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InputGroup label="Nome do cliente" id="eliv_cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Ex.: Prof. João Silva" />
                    <InputGroup label="Consultor" id="eliv_consultor" value={consultor} onChange={(e) => setConsultor(e.target.value)} placeholder="Ex.: Lucas Martins" />
                    <InputGroup label="Título da obra" id="eliv_obra" value={obra} onChange={(e) => setObra(e.target.value)} placeholder="Ex.: DICIONÁRIO TEMÁTICO..." />
                    <InputGroup label="Nº de páginas" id="eliv_paginas" type="number" value={paginas} onChange={(e) => setPaginas(Number(e.target.value))} min="20" max="2000" step="10" />
                    <SelectGroup label="Pacote ELIV" id="eliv_pacote" value={pacote} onChange={(e) => setPacote(e.target.value as PacoteKey)}>
                        {Object.keys(PACOTES).map(p => <option key={p} value={p}>{p}</option>)}
                    </SelectGroup>
                    <SelectGroup label="Forma de pagamento" id="eliv_fpag" value={formaPag} onChange={(e) => setFormaPag(e.target.value as FormaPagamento)}>
                        {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
                    </SelectGroup>
                    <div className="md:col-span-2">
                        <SliderGroup label="% de desconto no pacote" id="eliv_desc_pac" value={descontoPacPct} displayValue={`${descontoPacPct}%`} onChange={(e) => setDescontoPacPct(Number(e.target.value))} min="0" max="40" step="1" />
                    </div>
                </div>
                <div className="mt-6 bg-green-50 text-green-800 p-4 rounded-lg border border-green-200 text-center font-medium">
                    Pacote <strong>{pacote}</strong> | <strong>{formaPag}</strong> | Com desconto: <strong>{brMoney(calculations.totalComDesc)}</strong>
                    {calculations.mensal && ` (${calculations.parcelas}x de ${brMoney(calculations.mensal)})`}
                </div>
                <hr className="my-8" />
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Gerar DOCX – Comum</h3>
                <div className="flex flex-col mb-4">
                    <label htmlFor="eliv_obs" className="mb-1.5 font-medium text-slate-700">Observações (opcional)</label>
                    <textarea id="eliv_obs" value={obs} onChange={(e) => setObs(e.target.value)} rows={3} className="w-full px-4 py-2 text-slate-700 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"></textarea>
                </div>
                <button onClick={() => handleGenerateDocx('comum')} disabled={isLoading} className="w-full sm:w-auto px-6 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-indigo-400 disabled:cursor-wait">
                    {isLoading ? 'Gerando...' : 'Gerar DOCX – Comum'}
                </button>
            </div>

            {/* Aba de Universidade */}
            <div className={activeTab === 'universidade' ? 'block' : 'hidden'}>
                <div className="bg-slate-50 border-l-4 border-indigo-500 text-slate-700 p-4 mb-6 rounded-r-lg">
                    <p>Ative esta seção <strong>apenas</strong> quando o orçamento for para Universidade. O nome do <strong>autor/responsável</strong> será o <em>nome do cliente</em> informado na aba anterior.</p>
                </div>
                 <div className="flex items-center space-x-4 mb-6">
                    <span className="font-medium text-slate-700">Orçamento para Universidade?</span>
                    <ToggleSwitch enabled={modoUni} setEnabled={setModoUni} />
                </div>
                
                <div className={`transition-opacity duration-500 ${modoUni ? 'opacity-100 space-y-6' : 'opacity-40 pointer-events-none'}`}>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                        <InputGroup label="Universidade" id="uni_nome" value={universidade} onChange={(e) => setUniversidade(e.target.value)} placeholder="Ex.: Universidade Federal de Viçosa" disabled={!modoUni} />
                         <SelectGroup label="Pronome de tratamento" id="uni_trat" value={tratamento} onChange={(e) => setTratamento(e.target.value)} disabled={!modoUni}>
                            {PRONOMES_TRATAMENTO.map(p => <option key={p} value={p}>{p}</option>)}
                        </SelectGroup>
                        <InputGroup label="Contato (telefone/email)" id="uni_contato" value={contato} onChange={(e) => setContato(e.target.value)} placeholder="Ex.: (31) 99999-0000" disabled={!modoUni} />
                    </div>
                    <hr/>
                    <h3 className="text-lg font-semibold text-slate-800">Tiragem da universidade</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                        <InputGroup label="Preço de capa (R$)" type="number" id="uni_capa" value={precoCapa} onChange={(e) => setPrecoCapa(Number(e.target.value))} min="10" step="0.5" disabled={!modoUni} />
                        <InputGroup label="Quantidade" type="number" id="uni_tir_qtd" value={tirQtd} onChange={(e) => setTirQtd(Number(e.target.value))} min="10" step="10" disabled={!modoUni} />
                        <InputGroup label="% de desconto na tiragem" type="number" id="uni_tir_desc" value={tirDescPct} onChange={(e) => setTirDescPct(Number(e.target.value))} min="0" step="1" disabled={!modoUni} />
                        <InputGroup label="Preço do e-book (R$)" type="number" id="uni_ebookp" value={ebookPreco} onChange={(e) => setEbookPreco(Number(e.target.value))} min="0" step="1" disabled={!modoUni} />
                    </div>
                    <div className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200 text-center font-medium">
                        Unitário com desconto: {brMoney(calculations.unitarioDesc)} | Total tiragem ({tirQtd}): <strong>{brMoney(calculations.totalTiragem)}</strong>
                    </div>
                    <hr className="my-8" />
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Gerar DOCX – Universidade</h3>
                    <button onClick={() => handleGenerateDocx('uni')} disabled={isLoading || !modoUni} className="w-full sm:w-auto px-6 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        {isLoading ? 'Gerando...' : 'Gerar DOCX – Universidade'}
                    </button>
                </div>
            </div>
        </div>
    );
};