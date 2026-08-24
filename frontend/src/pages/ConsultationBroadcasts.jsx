import React from 'react';
import { RequestAdvocateMatches, MyBroadcastRequests, AdvocateBroadcastInbox } from './broadcasts/BroadcastFeature.jsx';

export default function ConsultationBroadcasts() {
    const role = localStorage.getItem('role');

    if (role === 'citizen') {
        return (
            <div className="container mx-auto p-4 pt-32">
                <h1 className="text-2xl font-bold mb-4 text-slate-800">Consultation Broadcasts</h1>
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                    <div className="border border-slate-300 p-6 rounded-lg shadow-sm bg-white">
                        <RequestAdvocateMatches />
                    </div>
                    <div className="border border-slate-300 p-6 rounded-lg shadow-sm bg-white">
                        <h2 className="text-xl font-bold mb-4">My Broadcasts</h2>
                        <MyBroadcastRequests />
                    </div>
                </div>
            </div>
        );
    } else if (role === 'advocate') {
        return (
            <div className="container mx-auto p-4 pt-32">
                <AdvocateBroadcastInbox />
            </div>
        );
    } else {
        return <div className="container mx-auto p-4 pt-32">Please login to view this page.</div>;
    }
}
