const ajax = new XMLHttpRequest(); // ajax 출력 결과 반환
const URL_ADDR = 'https://api.hnpwa.com/v0/news/1.json';

ajax.open('GET', URL_ADDR, false); // 동기적으로 서버 요청 값 처리
ajax.send(); // 데이터를 가져오는 작업

// console.log(ajax.response);

const newsFeed = JSON.parse(ajax.response); // json 데이터 객체 변환 후 리턴
// console.log(newsFeed);

const ul = document.createElement('ul'); // ul tag 생성

for (let i = 0; i < 10; i++) {
    const li = document.createElement('li');
    li.innerHTML = `<li>${newsFeed[i].title}</li>`
    ul.appendChild(li);
}

document.getElementById('root').appendChild(ul);