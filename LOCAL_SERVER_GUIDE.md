# EYEON CLINIC 로컬 서버 실행 가이드

## 문제 상황
Firebase Storage 이미지 업로드 시 CORS 오류가 발생하는 이유는 HTML 파일을 `file://` 프로토콜로 직접 열어서 실행했기 때문입니다.
브라우저 보안 정책상 `file://` 프로토콜에서는 외부 API 호출이 제한됩니다.

## 해결 방법: 로컬 서버 실행

### 방법 1: Python 사용 (가장 간단)
```bash
# Python 3가 설치되어 있는 경우
python server.py

# 또는
python3 server.py

# 또는 Python 내장 서버 직접 사용
python -m http.server 8080
```

### 방법 2: Node.js 사용
```bash
# Node.js가 설치되어 있는 경우
node server.js
```

### 방법 3: Live Server 확장 (VS Code 사용자)
1. VS Code에서 "Live Server" 확장 설치
2. HTML 파일에서 우클릭 → "Open with Live Server" 선택

### 방법 4: npm의 http-server 사용
```bash
# 전역 설치
npm install -g http-server

# 실행
http-server -p 8080
```

## 서버 실행 후
1. 브라우저에서 `http://localhost:8080/notice.html` 접속
2. 관리자 로그인 후 이미지 업로드 테스트

## Firebase Storage 설정 확인사항

### 1. Storage 버킷 URL 확인
- Firebase Console → Project Settings → General
- Storage bucket이 `eyeon-clinic-notice.appspot.com` 형식인지 확인
- 코드에서 이미 수정됨: `storageBucket: "eyeon-clinic-notice.appspot.com"`

### 2. Storage 보안 규칙 설정
Firebase Console → Storage → Rules에서 다음과 같이 설정:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // 인증된 사용자만 읽기/쓰기 허용
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. CORS 설정 (필요한 경우)
Google Cloud Console에서 CORS 설정이 필요할 수 있습니다:
1. `cors.json` 파일 생성:
```json
[
  {
    "origin": ["http://localhost:8080", "https://yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

2. gsutil 명령어로 적용:
```bash
gsutil cors set cors.json gs://eyeon-clinic-notice.appspot.com
```

## 배포 시 주의사항
- 실제 도메인으로 배포 시 Firebase의 승인된 도메인 목록에 추가
- Firebase Console → Authentication → Settings → Authorized domains
- HTTPS를 사용해야 함 (Firebase 요구사항)
