import React from 'react';
import Button from '@mui/material/Button';
import Layout from '../Layout';
import { Box } from '@mui/material';

export default function Welcome(): React.ReactElement {
    return (
        <Layout>
            <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
                <div className="min-h-screen bg-linear-to-br from-indigo-600 to-indigo-900 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-white mb-4">
                            Inertia + React + TypeScript
                        </h1>
                        <p className="text-xl text-indigo-100 mb-8">
                            Client-Side Rendering SPA 🚀
                        </p>
                        <p className="text-indigo-200">
                            YEYEYE LALALA
                            <Button variant="contained" color="primary">
                                Hello World
                            </Button>
                        </p>
                    </div>
                </div>
            </Box>
        </Layout>
    );
}
