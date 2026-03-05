export type RouteType = {
    route: string,
    title?: string,
    filePathTemplate?: string,
    useLayout?: string | false,
    load: () => void
    styles?: string[],
}