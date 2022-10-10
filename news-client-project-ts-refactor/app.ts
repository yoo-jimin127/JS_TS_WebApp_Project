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

const ajax: XMLHttpRequest = new XMLHttpRequest(); // ajax 출력 결과 반환
// const content = document.createElement('div');
const URL_ADDR: string = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL: string = 'https://api.hnpwa.com/v0/item/@id.json'; // 해당 콘텐츠의 url

/** 공유 자원 관리 */
const store: Store  = {
    currentPage: 1,
    feeds: [],
};

// mixin
function applyApiMixins(targetClass: any, baseClasses: any) {
    baseClasses.forEach(baseClass => {
        Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
            const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

            if (descriptor) {
                Object.defineProperty(targetClass.prototype, name, descriptor);
            }
        });
    });
}

class Api {
    getRequest<AjaxResponse>(method: string, url: string, async: boolean): AjaxResponse {
        const ajax = new XMLHttpRequest();
        ajax.open(method, url, async);
        ajax.send();
    
        return JSON.parse(ajax.response);
    }
}

class NewsFeedApi {
    getData(): NewsFeed[] {
        return this.getRequest<NewsFeed[]>( 'GET', URL_ADDR, false);
    }
}

class NewsDetailApi {
    getData(id: string): NewsDetail {
        return this.getRequest<NewsDetail>('GET', CONTENT_URL.replace('@id', id), false);
    }
}

/** 공통 요소 클래스 */
abstract class View {
    private template: string;
    private renderTemplate: string;
    private container: HTMLElement;
    private htmlList: string[]; // empty array -> html list append

    constructor(containerId: string, template: string) {
        const containerElement = document.getElementById(containerId);

        if (!containerElement) {
            throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.'
        }

        this.container = containerElement;
        this.template = template;
        this.renderTemplate = template;
        this.htmlList = [];
    }

    protected updateView(): void {
        this.container.innerHTML= this.renderTemplate;
        this.renderTemplate = this.template; // UI 업데이트 작업 후 원본 템플릿으로 복원
    }

    /** html 문자열 추가 함수 */
    protected addHtml(htmlString: string): void {
        this.htmlList.push(htmlString);
    }

    /** 문자열 병합 값 리턴 함수 */
    protected getHtml(): string {
        const snapshot = this.htmlList.join('');
        this.clearHtmlList(); // html list clear
        return snapshot;
    }

    /** template 내용 대체 함수 */
    protected setTemplateData(key: string, value: string):void {
        this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
    }

    /** html list clear 함수 */
    private clearHtmlList(): void {
        this.htmlList = [];
    }

    abstract render(): void; // abstract method
}

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

class NewsFeedView extends View {
    private api: NewsFeedApi;
    private feeds: NewsFeed[];

    constructor(containerId: string) {
        let template = `
        <div class="bg-gray-600 min-h-screen">
            <div class="bg-white text-xl">
                <div class="mx-auto px-4">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex justify-start">
                            <h1 class="font-extrabold">Hacker News</h1>
                        </div>
                        <div class="item-center justify-end">
                            <a href="#/page/{{__prev_page__}}" class="text-gray-500">Previous</a>
                            <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">Next</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 text-2xl text-gray-700">{{__news_feed__}}</div>
        </div>
        `;

        super(containerId, template);

        this.feeds = store.feeds; // json 데이터 객체 변환 후 리턴
        this.api = new NewsFeedApi(); // NewsFeedApi class instance
    
        // 최초 접근의 경우
        if (this.feeds.length === 0) {
            this.feeds = store.feeds = this.api.getData();
            this.makeFeeds();
        }
    }

    /** 뉴스 목록 호출 함수 */
    public render(): void {
        // 디폴트 페이징 예외 처리
        store.currentPage = Number(location.hash.substr(7) || 1);

        for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
            const {read, id, title, comments_count, user, points, time_ago} = this.feeds[i];

            this.addHtml(
            `
            <div class="p-6 ${read ? 'bg-gray-400' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
                <div class="flex">
                    <div class="flex-auto">
                        <a href="#/show/${id}">${title}</a>
                    </div>
                    <div class="text-center text-sm">
                    <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">
                            ${comments_count}
                        </div>
                    </div>
                </div>
                <div class="flex mt-3">
                    <div class="grid gird-cols-3 text-sm text-gray-500">
                        <div><i class="fas fa-user mr-1"></i>${user}</div>
                        <div><i class="fas fa-heart mr-1"></i>${points}</div>
                        <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
                    </div>
                </div>
            </div>
            `);
        }

        this.setTemplateData('news_feed', this.getHtml()); // template replace - news list content
        this.setTemplateData('prev_page', String(store.currentPage > 1 ? store.currentPage - 1 : 1)); // prev page 
        this.setTemplateData('next_page', String(store.currentPage + 1)); // next page
        
        this.updateView();
    }

    /** 방문 페이지 상태 관리 함수 */
    private makeFeeds(): void {
        for (let i = 0; i < this.feeds.length; i++) {
            this.feeds[i].read = false;
        }
    }
}

class NewsDetailView extends View {
    constructor(containerId: string) {    
        let template = `
        <div class="bg-gray-600 min-h-screen pb-8">
            <div class="bg-white text-xl">
                <div class="mx-auto px-4">
                    <div class="flex justify-between tiems-center py-6">
                        <div class="flex justify-start">
                            <h1 class="font-extrabold">Hacker News</h1>
                        </div>
                        <div class="items-center justify-end">
                            <a href="#/page/{{__currentPage__}}" class="text-gray-500">
                                <i class="fa fa-times"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="h-full border rounded-xl bg-white m-6 p-4">
                <h2>{{__title__}}</h2>
                <div class="text-gray-400 h-20">
                    {{__content__}}
                </div>

                {{__comments__}}
            </div>
        </div>
        `;

        super(containerId, template);
    }

    render(): void {
        console.log('hash changed')
        console.log(location.hash); // location 객체의 hash 값 확인 #3029303929 와 같은 방식으로 값 반환

        const id = location.hash.substr(7); // # 이후의 내용 저장
        const api = new NewsDetailApi(); // class instance 생성
        const newsDetail: NewsDetail = api.getData(id);

        // 피드 방문 처리
        for (let i = 0; i < store.feeds.length; i++) {
            if (store.feeds[i].id === Number(id)) {
                store.feeds[i].read = true;
                break;
            }
        }
            
        this.setTemplateData('comments', this.makeComment(newsDetail.comments));
        this.setTemplateData('currentPage', String(store.currentPage));
        this.setTemplateData('title', newsDetail.title);
        this.setTemplateData('content', newsDetail.content);

        this.updateView();
    }

    /** 댓글 및 대댓글 생성 함수 */
    makeComment(comments: NewsComment[]): string {
        for (let i = 0; i < comments.length; i++) {
            const comment: NewsComment = comments[i];

            this.addHtml(`
                <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
                    <div class="text-gray-400">
                        <i class="fa fa-sort-up mr-2"></i>
                        <strong>${comment.user}</strong> ${comment.time_ago}
                    </div>
                    <p class="text-gray-700">${comment.content}</p>
                </div>
            `);
        
            // 대댓글 처리
            if (comments[i].comments.length > 0) {
                this.addHtml(this.makeComment(comment.comments));
            }
        }

        return this.getHtml();
    }
}

// apply mixin
interface NewsFeedApi extends Api{};
interface NewsDetailApi extends Api{};

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);

/** 기사별 세부 페이지 함수 */
function getNewsDetail(): void {
    console.log('hash changed')
    console.log(location.hash); // location 객체의 hash 값 확인 #3029303929 와 같은 방식으로 값 반환

    const id = location.hash.substr(7); // # 이후의 내용 저장
    const api = new NewsDetailApi(); // class instance 생성
    const newsContent = api.getData(id);
    
    let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
            <div class="mx-auto px-4">
                <div class="flex justify-between tiems-center py-6">
                    <div class="flex justify-start">
                        <h1 class="font-extrabold">Hacker News</h1>
                    </div>
                    <div class="items-center justify-end">
                        <a href="#/page/${store.currentPage}" class="text-gray-500">
                            <i class="fa fa-times"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="h-full border rounded-xl bg-white m-6 p-4">
            <h2>${newsContent.title}</h2>
            <div class="text-gray-400 h-20">
                ${newsContent.content}
            </div>

            {{__comments__}}
        </div>
    </div>
    `;

    // 피드 방문 처리
    for (let i = 0; i < store.feeds.length; i++) {
        if (store.feeds[i].id === Number(id)) {
            store.feeds[i].read = true;
            break;
        }
    }
    
    this.getHtml('comments', this.makeComment(newsContent.comments));
    this.updateView();
}

const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView); // default page set

router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route(); // 실행