const container = document.getElementById('root'); // find root tag
const ajax = new XMLHttpRequest(); // ajax 출력 결과 반환
const content = document.createElement('div');
const URL_ADDR = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'; // 해당 콘텐츠의 url

// 공유 자원 관리
const store = {
    currentPage : 1,
};

function getData(method, url, async) {
    ajax.open(method, url, async); // 동기 or 비동기 방식으로 서버 요청 값 처리
    ajax.send(); // 데이터를 가져오는 작업

    return JSON.parse(ajax.response);
}

function getNewsFeed() {
    const newsFeed = getData('GET', URL_ADDR, false); // json 데이터 객체 변환 후 리턴
    const newsList = []; // empty array
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
    
    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
        newsList.push(
        `
        <div class="p-6 bg-white mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
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
    template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage - 1 : 1); // prev page 
    template = template.replace('{{__next_page__}}', store.currentPage + 1); // next page
    
    container.innerHTML = template; 
}

function newsDetail() {
    console.log('hash changed')
    console.log(location.hash); // location 객체의 hash 값 확인 #3029303929 와 같은 방식으로 값 반환
    const id = location.hash.substr(7); // # 이후의 내용 저장
    const newsContent = getData('GET', CONTENT_URL.replace('@id', id), false);
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

    /** comment function */
    function makeComment(comments) {
        const commentString = []; //comment array

        for (let i = 0; i < comments.length; i++) {
            commentString.push(`
                <div style="padding-left: 40px;" class="mt-4">
                    <div class="text-gray-400">
                        <i class="fa fa-sort-up mr-2"></i>
                        <strong>${comments[i].user}</strong> ${comments[i].time_ago}
                    </div>
                    <p class="text-gray-700">${comments[i].content}</p>
                </div>
            `);
            
            // 대댓글 처리
            if (comments[i].comments.length > 0) {
                commentString.push(makeComment(comments[i].comments));
            }
        }

        return commentString.join('');
    }

    container.innerHTML = template.replace('{{__comments__}}', makeComment(newsContent.comments));
}

function router() {
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
        newsDetail();
    }
}

window.addEventListener('hashchange', router); // router : hash의 변경마다 보여줌
router();