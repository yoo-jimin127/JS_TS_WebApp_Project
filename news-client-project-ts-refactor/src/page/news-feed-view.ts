import View from '../core/view';
import { NewsFeedApi } from '../core/api';
import { NewsFeed } from '../types';
import { URL_ADDR } from '../config';

const template = `
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


export default class NewsFeedView extends View {
    private api: NewsFeedApi;
    private feeds: NewsFeed[];

    constructor(containerId: string) {
        super(containerId, template);

        this.feeds = store.feeds; // json 데이터 객체 변환 후 리턴
        this.api = new NewsFeedApi('GET', URL_ADDR, false); // NewsFeedApi class instance
    
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