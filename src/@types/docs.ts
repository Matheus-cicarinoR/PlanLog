import type { LazyExoticComponent } from 'react'

export type DocRouteNav = {
    path: string
    label: string
    component: LazyExoticComponent<() => React.ReactNode>
}

export type DocumentationRoute = {
    groupName: string
    nav: DocRouteNav[]
}
