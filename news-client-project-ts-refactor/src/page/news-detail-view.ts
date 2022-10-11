import View from '../core/view';
import { NewsDetailApi } from '../core/api';
import { NewsDetail, NewsComment } from '../types';
import { CONTENT_URL } from '../config';

const template = `
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

export default class NewsDetailView extends View {
    constructor(containerId: string) {    

        super(containerId, template);
    }

    render(): void {
        console.log('hash changed')
        console.log(location.hash); // location 객체의 hash 값 확인 #3029303929 와 같은 방식으로 값 반환

        const id = location.hash.substr(7); // # 이후의 내용 저장
        const api = new NewsDetailApi('GET', CONTENT_URL, false); // class instance 생성
        const newsDetail: NewsDetail = api.getData(id);

        // 피드 방문 처리
        for (let i = 0; i < window.store.feeds.length; i++) {
            if (window.store.feeds[i].id === Number(id)) {
                window.store.feeds[i].read = true;
                break;
            }
        }
            
        this.setTemplateData('comments', this.makeComment(newsDetail.comments));
        this.setTemplateData('currentPage', String(window.store.currentPage));
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

/** 기사별 세부 페이지 함수 */
function getNewsDetail(): void {
    console.log('hash changed')
    console.log(location.hash); // location 객체의 hash 값 확인 #3029303929 와 같은 방식으로 값 반환

    const id = location.hash.substr(7); // # 이후의 내용 저장
    const api = new NewsDetailApi('GET', CONTENT_URL, false); // class instance 생성
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
                        <a href="#/page/${window.store.currentPage}" class="text-gray-500">
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
    for (let i = 0; i < window.store.feeds.length; i++) {
        if (window.store.feeds[i].id === Number(id)) {
            window.store.feeds[i].read = true;
            break;
        }
    }
    
    this.getHtml('comments', this.makeComment(newsContent.comments));
    this.updateView();
}