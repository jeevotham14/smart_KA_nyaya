import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';

export const RequestAdvocateMatches = () => {
    const [status, setStatus] = useState('');
    const [formData, setFormData] = useState({
        legalCategory: '', district: '', preferredLanguage: '', consultationMode: 'ONLINE',
        preferredDate: '', preferredTime: '', proBonoRequested: false, shortSummary: ''
    });

    const submit = async (e) => {
        e.preventDefault();
        setStatus('Loading');
        try {
            await api.broadcasts.create({
                legal_category: formData.legalCategory,
                district: formData.district,
                preferred_language: formData.preferredLanguage,
                consultation_mode: formData.consultationMode,
                preferred_date: formData.preferredDate,
                preferred_time: formData.preferredTime,
                pro_bono_requested: formData.proBonoRequested,
                short_summary: formData.shortSummary
            });
            setStatus('Success');
        } catch (err) {
            setStatus('API error');
        }
    };

    return (
        <div>
            <h2>Request Advocate Matches</h2>
            <p>Privacy Warning: Do not include phone numbers, Aadhaar numbers, exact addresses, bank/account numbers, or other sensitive personal information.</p>
            <form onSubmit={submit}>
                <input aria-label="Legal Category" value={formData.legalCategory} onChange={e => setFormData({...formData, legalCategory: e.target.value})} />
                <button type="submit">Submit</button>
            </form>
            <div>{status}</div>
        </div>
    );
};

export const MyBroadcastRequests = () => {
    const [broadcasts, setBroadcasts] = useState([]);
    useEffect(() => {
        api.broadcasts.getMyBroadcasts().then(setBroadcasts);
    }, []);
    return <div>{broadcasts.map(b => <div key={b.id}>{b.status}</div>)}</div>;
};

export const InterestedAdvocatesView = ({ broadcastId }) => {
    const [responses, setResponses] = useState([]);
    useEffect(() => {
        api.broadcasts.getResponses(broadcastId).then(setResponses);
    }, [broadcastId]);
    return (
        <div>
            {responses.map(r => (
                <div key={r.id}>
                    {r.advocate_name}
                    <button onClick={() => api.broadcasts.selectAdvocate(broadcastId, r.advocate_id)}>Select Advocate</button>
                </div>
            ))}
        </div>
    );
};

export const AdvocateBroadcastInbox = () => {
    const [requests, setRequests] = useState([]);
    useEffect(() => {
        api.broadcasts.getMatched().then(setRequests);
    }, []);
    return (
        <div>
            <h2>Broadcast Requests</h2>
            {requests.map(req => (
                <div key={req.id}>
                    {req.short_summary}
                    <button onClick={() => api.broadcasts.expressInterest(req.id, { consultation_mode: req.consultation_mode })}>I'm Interested</button>
                    <button onClick={() => api.broadcasts.decline(req.id)}>Decline</button>
                </div>
            ))}
        </div>
    );
};

export const RoleAwareNavigation = ({ role }) => {
    if (role === 'citizen') {
        return <nav><span>Consult an Advocate</span><span>Request Advocate Matches</span><span>My Broadcast Requests</span><span>My Consultations</span></nav>;
    } else if (role === 'advocate') {
        return <nav><span>Advocate Dashboard</span><span>Broadcast Requests</span><span>Direct Requests</span><span>My Consultations</span></nav>;
    }
    return null;
};
