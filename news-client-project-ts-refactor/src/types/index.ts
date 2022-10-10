interface Store {
    currentPage: number;
    feeds: NewsFeed[];
}

interface News {
    readonly id: number;
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

interface NewsFeed extends News {
    readonly comments_count: number;
    readonly points: number;
    read?: boolean;
}

interface NewsDetail extends News {
    readonly comments: [];
}

interface NewsComment extends News {
    readonly comments: [];
    readonly level: number;
}

interface RouteInfo {
    path: string;
    page: View;
}