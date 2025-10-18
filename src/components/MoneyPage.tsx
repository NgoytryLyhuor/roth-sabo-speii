import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Download, Upload } from 'lucide-react';

interface MoneyRow {
    id: string;
    amount: number;
}

interface MoneyPageProps {
    onDataChange: (totalBuyAmount: number, totalInUSD: number) => void;
}

const formatRiel = (amount: number): string => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}៛`;
};

const formatUSD = (amount: number): string => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$`;
};

export const MoneyPage: React.FC<MoneyPageProps> = ({ onDataChange }) => {
    // Load from localStorage on initial render
    const [totalBuyAmount, setTotalBuyAmount] = useState(() => {
        const saved = localStorage.getItem('totalBuyAmount');
        return saved ? parseFloat(saved) : 0;
    });
    
    const [rows, setRows] = useState<MoneyRow[]>(() => {
        const saved = localStorage.getItem('moneyRows');
        return saved ? JSON.parse(saved) : [{ id: '1', amount: 0 }];
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-save totalBuyAmount to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('totalBuyAmount', totalBuyAmount.toString());
    }, [totalBuyAmount]);

    // Auto-save rows to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('moneyRows', JSON.stringify(rows));
    }, [rows]);

    const addRow = () => {
        const newId = (Math.max(...rows.map(r => parseInt(r.id)), 0) + 1).toString();
        setRows([...rows, { id: newId, amount: 0 }]);
    };

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(rows.filter(r => r.id !== id));
        }
    };

    const updateRow = (id: string, amount: number) => {
        setRows(rows.map(r => r.id === id ? { ...r, amount } : r));
    };

    const downloadJSON = () => {
        const dataToSave = {
            totalBuyAmount,
            rows,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `money-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                
                if (data.rows && Array.isArray(data.rows)) {
                    setRows(data.rows);
                    setTotalBuyAmount(data.totalBuyAmount || 0);
                    alert('Data loaded successfully! ✅');
                } else {
                    alert('Invalid file format! ❌');
                }
            } catch (error) {
                alert('Error reading file. Please make sure it\'s a valid JSON file. ❌');
            }
        };
        reader.readAsText(file);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const totalInRiel = rows.reduce((sum, row) => sum + row.amount, 0);
    const totalInUSD = totalInRiel / 4000;
    const profit = totalInUSD - totalBuyAmount;

    // Notify parent component whenever data changes
    useEffect(() => {
        onDataChange(totalBuyAmount, totalInUSD);
    }, [totalBuyAmount, totalInUSD, onDataChange]);

    return (
        <div className="min-h-screen bg-gray-50 p-3 pb-20">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-lg font-bold text-gray-800">Money Management</h1>
                    <div className="flex gap-1.5">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={triggerFileInput}
                            className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            title="Load from JSON file"
                        >
                            <Upload size={14} />
                            Load
                        </button>
                        <button
                            onClick={downloadJSON}
                            className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                            title="Save to JSON file"
                        >
                            <Download size={14} />
                            Save
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Total Buy Amount (USD)</label>
                    <input
                        type="number"
                        value={totalBuyAmount || ''}
                        onChange={(e) => setTotalBuyAmount(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-semibold text-gray-800">Sales Entries</h2>
                        <button
                            onClick={addRow}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                            <Plus size={14} />
                            Add Row
                        </button>
                    </div>

                    <div className="space-y-2">
                        {rows.map((row, index) => (
                            <div key={row.id} className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600 w-8">{index + 1}</span>
                                <input
                                    type="number"
                                    value={row.amount || ''}
                                    onChange={(e) => updateRow(row.id, parseFloat(e.target.value) || 0)}
                                    placeholder="Amount (៛)"
                                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    min="0"
                                />
                                {rows.length > 1 && (
                                    <button
                                        onClick={() => removeRow(row.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-medium text-gray-700">Total in Riel:</span>
                            <span className="text-sm font-semibold text-gray-800">{formatRiel(totalInRiel)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-medium text-gray-700">Total in USD:</span>
                            <span className="text-sm font-semibold text-gray-800">{formatUSD(totalInUSD)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t-2 border-gray-300">
                            <span className="text-sm font-bold text-gray-800">Profit:</span>
                            <span className={`text-base font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatUSD(profit)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};