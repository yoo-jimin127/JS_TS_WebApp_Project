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