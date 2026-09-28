import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Wrapper komponen untuk animasi fade
function PageWrapper({ children }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger fade in saat komponen mount
        const timer = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
            }}
        >
            {children}
        </div>
    );
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <PageWrapper>
                <App {...props} />
            </PageWrapper>
        );
    },
    progress: {
        color: '#185FA5',
    },
});