import { useState } from 'react';
import { FileText, DollarSign, Package } from 'lucide-react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview'; 
import { StockPage } from './components/StockPage';
import { MoneyPage } from './components/MoneyPage'; 
import { Invoice } from './types/invoice';

type TabType = 'invoice' | 'money' | 'stock';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('invoice');
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Money page data shared with Stock page
  const [moneyData, setMoneyData] = useState({ 
    totalBuyAmount: 0, 
    totalInUSD: 0 
  });

  const handlePreview = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setShowPreview(true);
  };

  const handleBack = () => {
    setShowPreview(false);
  };

  const handleMoneyDataChange = (totalBuyAmount: number, totalInUSD: number) => {
    setMoneyData({ totalBuyAmount, totalInUSD });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation - Only show when not in preview mode */}
      {!showPreview && (
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex">
            <button
              onClick={() => setActiveTab('invoice')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'invoice'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText size={18} />
              Invoice
            </button>
            <button
              onClick={() => setActiveTab('money')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'money'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <DollarSign size={18} />
              Money
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'stock'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package size={18} />
              Stock
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {showPreview && currentInvoice ? (
        <InvoicePreview invoice={currentInvoice} onBack={handleBack} />
      ) : (
        <>
          {activeTab === 'invoice' && <InvoiceForm onPreview={handlePreview} />}
          {activeTab === 'money' && <MoneyPage onDataChange={handleMoneyDataChange} />}
          {activeTab === 'stock' && (
            <StockPage
              totalBuyAmount={moneyData.totalBuyAmount}
              totalInUSDFromMoney={moneyData.totalInUSD}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;