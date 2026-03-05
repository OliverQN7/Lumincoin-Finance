interface Bootstrap {
    Modal: any;
}

declare global {
    interface Window {
        bootstrap: Bootstrap;
    }
    const bootstrap: Bootstrap;
}

export {};