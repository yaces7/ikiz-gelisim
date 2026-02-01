'use client';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                {/* Keeping ChakraProvider since it was in the original project, just in case legacy components need it */}
                <ChakraProvider>
                    {children}
                </ChakraProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
