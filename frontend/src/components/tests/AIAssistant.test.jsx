import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AIAssistant from '../AIAssistant';

// Mock the API service
vi.mock('../services/api', () => ({
    default: {
        get: vi.fn(() => Promise.resolve({ data: [] }))
    }
}));

describe('AIAssistant Component', () => {
    it('renders the floating toggle button initially', () => {
        render(<AIAssistant />);
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toBeInTheDocument();
    });

    it('opens the chat interface when toggle button is clicked', () => {
        render(<AIAssistant />);
        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);
        expect(screen.getByRole('heading', { name: /STOCKIFY AI/i })).toBeInTheDocument();
    });

    it('closes the chat interface when close button is clicked', () => {
        render(<AIAssistant />);
        // Open
        fireEvent.click(screen.getByRole('button'));
        // Close
        const closeButton = screen.getByRole('button', { name: /close chat/i });
        fireEvent.click(closeButton);
        expect(screen.queryByRole('heading', { name: /STOCKIFY AI/i })).not.toBeInTheDocument();
    });

    it('allows typing and sending a message', async () => {
        render(<AIAssistant />);
        fireEvent.click(screen.getByRole('button'));
        
        const input = screen.getByPlaceholderText(/Ask me anything.../i);
        fireEvent.change(input, { target: { value: 'help' } });
        fireEvent.submit(screen.getByRole('form', { name: /AI Chat Form/i }));

        expect(input.value).toBe('');
    });
});
