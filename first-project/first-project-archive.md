## Hacker News client app 구현 과정 archiving
- 목표 : 
    1. parcel-bundler를 사용해 순수 javascript로 웹앱 구현
    2. 프레임워크 & 라이브러리의 사용을 최소화하여 개발하는 능력 함양

- `dist` : `paecel FILE_NAME`으로 웹앱을 실행하였을 때 생성되는 폴더
    - ex) app.js -> app.c32xxxx.js로 변환해 다른 파일로 브라우저 상에서 로딩되도록 작업

- html 내 데이터를 불러오기 위해 `document.getElementById`로 html 조작
- `ajax` : 네트워크 너머의 데이터를 가져오는 도구
    - `const ajax = new XMLHttpRequest();` : 객체와 서버 간 상호작용을 위해 사용
        - XHR 사용을 통해 페이지의 새로고침 없이 url에서 데이터 get 가능
        - ajax 프로그래밍에 자주 사용

    - `ajax.open('GET', 'https://api.hnpwa.com/v0/news/1.json', false);`
        - `ajax.open(method, url, async, user(option), psw(option))` : 요청 내용 구체화
            - method (필수) : 요청 방식 `get` or `post`
            - url (필수) : 불러올 파일 주소
            - async (필수) : true(비동기), false(동기)
                - 서버 요청 : true(비동기)로 보낼 것
                    - 비동기로 서버 요청 전송 시 javascript에서 서버 응답을 기다리지 않고 작업 수행 후 서버 응답이 준비될 경우 응답 처리 수행 
    
    - `ajax.send();` : 데이터를 가져오는 작업
    - `ajax.response` : ajax로부터 불러온 데이터가 저장된 위치

- javascript 상에서 html 코드 추가 : `document.getElementById('root').innerHTML`
    - ex) ```js
    document.getElementById('root').innerHTML = 
        `<ul>
            <li>${newsFeed[0].title}</li>
            <li>${newsFeed[1].title}</li>
            <li>${newsFeed[2].title}</li>
        </ul>`;
    ```

