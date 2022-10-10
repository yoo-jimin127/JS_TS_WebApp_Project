class Router {
    routeTable: RouteInfo[];
    defaultRoute : RouteInfo | null;

    constructor() {
        window.addEventListener('hashchange', this.route.bind(this)); // 등록 시점의 this context 고정

        this.routeTable= [];
        this.defaultRoute = null;
    }

    /** view update */
    addRoutePath(path: string, page: View): void {
        this.routeTable.push({ path, page });
    }

    /** default page set */
    setDefaultPage(page: View): void {
        this.defaultRoute = { path: '', page };
    }

    /** route execute function */
    route() {
        const routePath = location.hash;

        if (routePath === '' && this.defaultRoute) {
            this.defaultRoute.page.render();
        }

        for (const routeInfo of this.routeTable) {
            if (routePath.indexOf(routeInfo.path) >= 0) {
                routeInfo.page.render();
                break;
            }
        }
    }
}