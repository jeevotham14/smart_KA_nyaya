export default function FeeResult({ result }) {
  return (
    <div className="mt-8 p-6 bg-navy-50 rounded-2xl border border-legalGold/20">
      <h3 className="text-lg font-bold text-navy-900 mb-2">Estimated Court Fee</h3>
      <div className="text-3xl font-extrabold text-legalGold mb-4">
        ₹{result?.estimatedFee || result?.fee || 0}
      </div>
      <p className="text-sm text-slate-600">
        {result?.details || 'This is an estimated fee based on standard rates. Actual fees may vary.'}
      </p>
    </div>
  );
}
