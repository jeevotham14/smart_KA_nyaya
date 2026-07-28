import { useState } from 'react';
import { Calculator } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { legalApi } from '../services/api.js';
import FeeCalculatorForm from '../components/FeeCalculatorForm.jsx';
import FeeResult from '../components/FeeResult.jsx';

export default function CourtFeeCalculator() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const data = await legalApi.calculateCourtFee(values);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to calculate court fee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 mb-4">
              <Calculator className="h-8 w-8 text-legalGold" />
            </div>
            <SectionHeader title="Court Fee Calculator">
              Calculate estimated court fees for different case types in Karnataka.
            </SectionHeader>
          </div>
          
          <div className="card-premium p-6 md:p-8">
            <FeeCalculatorForm onSubmit={handleCalculate} loading={loading} />
            {error && <div className="mt-4 text-alertRed text-sm">{error}</div>}
            {result && <FeeResult result={result} />}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
