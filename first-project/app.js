const ajax = new XMLHttpRequest(); // ajax 출력 결과 반환

ajax.open('GET', 'https://api.hnpwa.com/v0/news/1.json', false); // 동기적으로 서버 요청 값 처리
ajax.send(); // 데이터를 가져오는 작업

console.log(ajax.response); // 가져온 데이터 확인

