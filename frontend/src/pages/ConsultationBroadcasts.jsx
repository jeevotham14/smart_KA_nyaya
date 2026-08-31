import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RequestAdvocateMatches, MyBroadcastRequests, AdvocateBroadcastInbox } from './broadcasts/BroadcastFeature.jsx';
import { isAdvocate as checkIsAdvocate } from '../utils/roleUtils.js';

export default function ConsultationBroadcasts() {
    const { i18n } = useTranslation();
    const isKn = i18n.language === 'kn';
    const role = localStorage.getItem('role');
    const isAdvocate = checkIsAdvocate(role);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSuccess = () => setRefreshTrigger(prev => prev + 1);

    if (role === 'citizen') {
        return (
            <div className="container mx-auto p-4 pt-32">
                <h1 className="text-2xl font-bold mb-4 text-slate-800">{isKn ? 'ಸಮಾಲೋಚನೆ ವಿನಂತಿಗಳು' : 'Consultation Broadcasts'}</h1>
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                    <div className="border border-slate-300 p-6 rounded-lg shadow-sm bg-white">
                        <RequestAdvocateMatches onSuccess={handleSuccess} />
                    </div>
                    <div className="border border-slate-300 p-6 rounded-lg shadow-sm bg-white">
                        <h2 className="text-xl font-bold mb-4">{isKn ? 'ನನ್ನ ವಿನಂತಿಗಳು' : 'My Broadcasts'}</h2>
                        <MyBroadcastRequests refreshTrigger={refreshTrigger} />
                    </div>
                </div>
            </div>
        );
    } else if (isAdvocate) {
        return (
            <div className="container mx-auto p-4 pt-32">
                <AdvocateBroadcastInbox />
            </div>
        );
    } else {
        return <div className="container mx-auto p-4 pt-32">{isKn ? 'ಈ ಪುಟವನ್ನು ವೀಕ್ಷಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.' : 'Please login to view this page.'}</div>;
    }
}
