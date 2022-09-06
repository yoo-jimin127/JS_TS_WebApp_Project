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
        <div>
        <h1>Hacker News</h1>
            <ul>
                {{__news_feed__}}
            </ul>
            <div>
                <a href="#/page/{{__prev_page__}}">이전 페이지</a>
                <a href="#/page/{{__next_page__}}">다음 페이지</a>
            </div>
        </div>
    `;
    
    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
        newsList.push(
        `
        <li>
            <a href="#/show/${newsFeed[i].id}">
                ${newsFeed[i].title} (${newsFeed[i].comments_count})
            </a>
        </li>
        `);
    }

    // 배열의 내용을 하나의 문자열로 합쳐주는 함수 join() 사용, 기본 구분자 제거
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

    container.innerHTML = `
        <h1>${newsContent.title}</h1>

        <div>
            <a href="#/page/${store.currentPage}">목록으로</a>
        </div>
    `;
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