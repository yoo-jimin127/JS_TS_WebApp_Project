const container = document.getElementById('root'); // find root tag
const ajax = new XMLHttpRequest(); // ajax 출력 결과 반환
const content = document.createElement('div');
const URL_ADDR = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'; // 해당 콘텐츠의 url

ajax.open('GET', URL_ADDR, false); // 동기적으로 서버 요청 값 처리
ajax.send(); // 데이터를 가져오는 작업

const newsFeed = JSON.parse(ajax.response); // json 데이터 객체 변환 후 리턴
const ul = document.createElement('ul'); // ul tag 생성

window.addEventListener('hashchange', function() {
    console.log('hash changed')
    console.log(location.hash); // location 객체의 hash 값 확인 #3029303929 와 같은 방식으로 값 반환

    const id = location.hash.substr(1); // # 이후의 내용 저장
    ajax.open('GET', CONTENT_URL.replace('@id', id), false);
    ajax.send(); // 데이터 가져오기

    const newsContent = JSON.parse(ajax.response);
    const title = document.createElement('h1');

    title.innerHTML = newsContent.title;
    content.appendChild(title);
    console.log(newsContent);
});

for (let i = 0; i < 10; i++) {
    const div = document.createElement('div');

    div.innerHTML = 
    `
    <li>
        <a href="#${newsFeed[i].id}">
            ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
    </li>
    `
    // ul.appendChild(div.children[0]);
    ul.appendChild(div.firstElementChild);
}

container.appendChild(ul);
container.appendChild(content);