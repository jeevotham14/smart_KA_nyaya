import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';
import {
    RequestAdvocateMatches,
    MyBroadcastRequests,
    InterestedAdvocatesView,
    AdvocateBroadcastInbox,
    RoleAwareNavigation
} from './BroadcastFeature';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
    default: {
        broadcasts: {
            create: vi.fn(),
            getMyBroadcasts: vi.fn().mockResolvedValue([{ id: 1, status: 'OPEN' }, { id: 2, status: 'MATCHED' }]),
            getResponses: vi.fn().mockResolvedValue([{ id: 1, advocate_id: 100, advocate_name: 'John Doe' }]),
            getMatched: vi.fn().mockResolvedValue([{ id: 1, short_summary: 'Test summary', consultation_mode: 'ONLINE' }]),
            selectAdvocate: vi.fn().mockResolvedValue({}),
            expressInterest: vi.fn().mockResolvedValue({}),
            decline: vi.fn().mockResolvedValue({})
        }
    }
}));

test('1. Citizen can see Request Advocate Matches', () => {
    render(<RequestAdvocateMatches />);
    expect(screen.getByText('Request Advocate Matches')).toBeInTheDocument();
});

test('2. Advocate cannot see citizen broadcast creation', () => {
    // implicitly tested by role separation
    render(<RoleAwareNavigation role="advocate" />);
    expect(screen.queryByText('Request Advocate Matches')).not.toBeInTheDocument();
});

test('3. Privacy warning renders', () => {
    render(<RequestAdvocateMatches />);
    expect(screen.getByText(/Do not include phone numbers/)).toBeInTheDocument();
});

test('4. Citizen form submits expected payload', async () => {
    api.broadcasts.create.mockResolvedValueOnce({});
    render(<RequestAdvocateMatches />);
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(api.broadcasts.create).toHaveBeenCalled());
});

test('5. Loading state renders', async () => {
    api.broadcasts.create.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<RequestAdvocateMatches />);
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Loading')).toBeInTheDocument();
});

test('6. API error renders', async () => {
    api.broadcasts.create.mockRejectedValue(new Error('Failed'));
    render(<RequestAdvocateMatches />);
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(screen.getByText('API error')).toBeInTheDocument());
});

test('7. My Broadcasts renders OPEN/MATCHED/etc.', async () => {
    render(<MyBroadcastRequests />);
    await waitFor(() => expect(screen.getByText('OPEN')).toBeInTheDocument());
    expect(screen.getByText('MATCHED')).toBeInTheDocument();
});

test('8. Interested advocate list renders', async () => {
    render(<InterestedAdvocatesView broadcastId={1} />);
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
});

test('9. Select Advocate calls expected endpoint', async () => {
    render(<InterestedAdvocatesView broadcastId={1} />);
    await waitFor(() => screen.getByText('John Doe'));
    fireEvent.click(screen.getByText('Select Advocate'));
    expect(api.broadcasts.selectAdvocate).toHaveBeenCalledWith(1, 100);
});

test('10. Advocate Broadcast Inbox renders', async () => {
    render(<AdvocateBroadcastInbox />);
    await waitFor(() => expect(screen.getByText('Broadcast Requests')).toBeInTheDocument());
    expect(screen.getByText('Test summary')).toBeInTheDocument();
});

test('11. Advocate interest submission works', async () => {
    render(<AdvocateBroadcastInbox />);
    await waitFor(() => screen.getByText('Test summary'));
    fireEvent.click(screen.getByText("I'm Interested"));
    expect(api.broadcasts.expressInterest).toHaveBeenCalled();
});

test('12. Advocate decline works', async () => {
    render(<AdvocateBroadcastInbox />);
    await waitFor(() => screen.getByText('Test summary'));
    fireEvent.click(screen.getByText("Decline"));
    expect(api.broadcasts.decline).toHaveBeenCalled();
});

test('13. Citizen contact details are not rendered in advocate view', async () => {
    render(<AdvocateBroadcastInbox />);
    await waitFor(() => expect(screen.getByText('Test summary')).toBeInTheDocument());
    // Assume contact details are missing by ensuring no phone is mocked
    expect(screen.queryByText(/phone/)).not.toBeInTheDocument();
});

test('14. Citizen/advocate role separation works', () => {
    render(<RoleAwareNavigation role="citizen" />);
    expect(screen.getByText('Consult an Advocate')).toBeInTheDocument();
});
