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

const container: HTMLElement | null = document.getElementById('root'); // find root tag
const ajax: XMLHttpRequest = new XMLHttpRequest(); // ajax 출력 결과 반환
const content = document.createElement('div');
const URL_ADDR = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'; // 해당 콘텐츠의 url

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

// apply mixin
applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);

/** 방문 페이지 상태 관리 함수 */
function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
    for (let i = 0; i < feeds.length; i++) {
        feeds[i].read = false;
    }
    return feeds;
}

/** view 업데이트 함수 */
function updateView(html: string): void {
    if (container != null) {
        container.innerHTML = html;
    } else {
        console.log('최상위 컨테이너가 없어 UI를 진행하지 못합니다.');
    }
}

/** 뉴스 목록 호출 함수 */
function getNewsFeed(): void {
    let newsFeed: NewsFeed[] = store.feeds; // json 데이터 객체 변환 후 리턴
    const newsList: string[] = []; // empty array
    // NewsFeedApi class instance
    const api = new NewsFeedApi();

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
    
    // 최초 접근의 경우
    if (newsFeed.length === 0) {
        newsFeed = store.feeds = makeFeeds(api.getData());
    }

    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
        newsList.push(
        `
        <div class="p-6 ${newsFeed[i].read ? 'bg-gray-400' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
            <div class="flex">
                <div class="flex-auto">
                    <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>
                </div>
                <div class="text-center text-sm">
                    <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">
                        ${newsFeed[i].comments_count}
                    </div>
                </div>
            </div>
            <div class="flex mt-3">
                <div class="grid gird-cols-3 text-sm text-gray-500">
                    <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
                    <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
                    <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
                </div>
            </div>
        </div>
        `);
    }

    template = template.replace('{{__news_feed__}}', newsList.join('')); // template replace - news list content
    template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1)); // prev page 
    template = template.replace('{{__next_page__}}', String(store.currentPage + 1)); // next page
    
    updateView(template);
}

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
    
    updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
}

/** 댓글 및 대댓글 생성 함수 */
function makeComment(comments: NewsComment[]): string {
    const commentString: string[] = []; //comment array

    for (let i = 0; i < comments.length; i++) {
        const comment: NewsComment = comments[i];

        commentString.push(`
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
            commentString.push(makeComment(comment.comments));
        }
    }

    return commentString.join('');
}

function router(): void {
    const routePath = location.hash;

    if(routePath === '') {
        // location.hash === # 일 경우 빈 값 반환
        getNewsFeed();
    }
    else if (routePath.indexOf('#/page/') >= 0) {
        store.currentPage = Number(routePath.substr(7));
        getNewsFeed();
    }
    else {
        getNewsDetail();
    }
}

window.addEventListener('hashchange', router); // router : hash의 변경마다 보여줌
router();