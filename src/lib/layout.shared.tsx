import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            title: 'Barangay Konek',
            url: '/',
        },
        links: [
            {
                text: 'Documentation',
                url: '/docs',
                active: 'nested-url',
            },
        ],
    };
}