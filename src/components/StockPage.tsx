import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Download, Upload, X } from 'lucide-react';

interface StockProduct {
    id: string;
    name: string;
    price: number;
    qty: number;
}

interface StockPageProps {
    totalBuyAmount: number;
    totalInUSDFromMoney: number;
}

const PRODUCTS = [
    'កក់សក់ស្ពៃ',
    'ដុសខ្លួនស្ពៃ',
    'ដុសខ្លួនម្នាស់',
    'ដុសខ្លួនជីរអង្កាម',
    'ហ្វូមដុសមុខ',
    'សាប៊ូដុំដុសមុខ',
    'ក្រែមបន្ទក់សក់',
    'អប់ស្បែកអង្ករតំណើប',
    'ទឹកឃ្មុំ+ពោធិ៍សាត់',
    'លាងចានវីនតូច',
    'បោកខោអាវ OKA ធំ(៣លីត្រ)',
    'បោកខោអាវ OKA តូច(១លីត្រ)',
];

const formatRiel = (amount: number): string => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}៛`;
};

const formatUSD = (amount: number): string => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$`;
};

export const StockPage: React.FC<StockPageProps> = ({ totalBuyAmount, totalInUSDFromMoney }) => {
    const [products, setProducts] = useState<StockProduct[]>(() => {
        const saved = localStorage.getItem('stockProducts');
        return saved ? JSON.parse(saved) : [{ id: '1', name: '', price: 0, qty: 0 }];
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        localStorage.setItem('stockProducts', JSON.stringify(products));
    }, [products]);

    const addProduct = () => {
        const newId = (Math.max(...products.map(p => parseInt(p.id)), 0) + 1).toString();
        setProducts([...products, { id: newId, name: '', price: 0, qty: 0 }]);
    };

    const confirmDelete = (id: string) => {
        setProductToDelete(id);
        setShowDeleteModal(true);
    };

    const removeProduct = () => {
        if (productToDelete && products.length > 1) {
            setProducts(products.filter(p => p.id !== productToDelete));
        }
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    const updateProduct = (id: string, field: keyof StockProduct, value: string | number) => {
        setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const downloadJSON = () => {
        const dataToSave = {
            products,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stock-data-${new Date().toISOString().split('T')[0]}.json`;
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
                if (data.products && Array.isArray(data.products)) {
                    setProducts(data.products);
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

    const totalStockValueRiel = products.reduce((sum, p) => sum + (p.price * p.qty), 0);
    const totalStockValueUSD = totalStockValueRiel / 4000;
    const totalProfit = (totalStockValueUSD + totalInUSDFromMoney) - totalBuyAmount;

    const getProductName = (id: string) => {
        const product = products.find(p => p.id === id);
        return product?.name || 'this product';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 pb-20">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-lg font-bold text-center mb-4 text-gray-800">Stock Management</h1>

                <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-semibold text-gray-800">Products</h2>
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
                            <button
                                onClick={addProduct}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                                <Plus size={14} />
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {products.map((product, index) => (
                            <div key={product.id} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                                    {products.length > 1 && (
                                        <button
                                            onClick={() => confirmDelete(product.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <select
                                        value={product.name}
                                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select product...</option>
                                        {PRODUCTS.map((p, idx) => (
                                            <option key={idx} value={p}>{p}</option>
                                        ))}
                                    </select>

                                    <div className="grid grid-cols-2 gap-1.5">
                                        <div>
                                            <label className="block text-[10px] text-gray-600 mb-0.5">Price (៛)</label>
                                            <input
                                                type="number"
                                                value={product.price || ''}
                                                onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                                className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                min="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] text-gray-600 mb-0.5">Qty</label>
                                            <input
                                                type="number"
                                                value={product.qty || ''}
                                                onChange={(e) => updateProduct(product.id, 'qty', parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                                className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-medium text-gray-700">Total Stock Value (៛):</span>
                            <span className="text-sm font-semibold text-gray-800">{formatRiel(totalStockValueRiel)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-medium text-gray-700">Total Stock Value (USD):</span>
                            <span className="text-sm font-semibold text-gray-800">{formatUSD(totalStockValueUSD)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t-2 border-gray-300">
                            <span className="text-sm font-bold text-gray-800">Total Profit:</span>
                            <span className={`text-base font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatUSD(totalProfit)}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                            <p className="mb-1">Calculation:</p>
                            <p>(Stock: {formatUSD(totalStockValueUSD)} + Sales: {formatUSD(totalInUSDFromMoney)}) - Buy: {formatUSD(totalBuyAmount)} = {formatUSD(totalProfit)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-base font-bold text-gray-800">Confirm Delete</h3>
                            <button onClick={cancelDelete} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-gray-600 mb-1">Are you sure you want to delete:</p>
                            <p className="text-sm font-semibold text-gray-800 mb-3">
                                {productToDelete ? getProductName(productToDelete) : 'this product'}?
                            </p>
                            <p className="text-xs text-red-600">This action cannot be undone.</p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex gap-2 justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={removeProduct}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockPage;