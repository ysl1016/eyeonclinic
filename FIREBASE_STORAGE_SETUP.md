# Firebase Storage 설정 가이드 - 웹 환경 업로드 문제 해결

## 문제 진단
CORS 오류와 함께 이미지 업로드가 0%에서 멈추는 현상

## Firebase Console에서 확인해야 할 사항

### 1. 정확한 Storage Bucket URL 확인
1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택 → 좌측 메뉴에서 "Storage" 클릭
3. 상단에 표시되는 `gs://` URL 확인
   - 예: `gs://eyeon-clinic-notice.firebasestorage.app`
   - 이 URL에서 `gs://`를 제외한 부분이 storageBucket 값

### 2. Storage 보안 규칙 업데이트
Firebase Console → Storage → Rules 탭에서:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // notices 폴더는 인증된 사용자만 업로드 가능
    match /notices/{allPaths=**} {
      allow read: if true;  // 모든 사용자가 읽기 가능
      allow write: if request.auth != null;  // 인증된 사용자만 쓰기 가능
    }
  }
}
```

### 3. Firebase 프로젝트 설정 확인
Project Settings → General 탭에서:
- Web API Key 확인
- Authorized domains 목록 확인 및 추가:
  - `localhost`
  - 실제 배포 도메인 (예: `eyeonclinic.com`)

### 4. Firebase Authentication 설정
Authentication → Settings → Authorized domains에서:
- 사용할 도메인들이 모두 추가되어 있는지 확인

## 코드 수정 사항

### 1. Storage 초기화 개선
이미 적용된 코드에 추가로 다음을 고려:

```javascript
// Storage 초기화 시 명시적 설정
const storage = getStorage(app);
// 또는 버킷을 명시적으로 지정
// const storage = getStorage(app, 'gs://eyeon-clinic-notice.firebasestorage.app');
```

### 2. 업로드 메타데이터 추가
```javascript
const metadata = {
    contentType: file.type,
    customMetadata: {
        'uploadedBy': currentUser.email,
        'uploadedAt': new Date().toISOString()
    }
};

currentUploadTask = uploadBytesResumable(storageRef, file, metadata);
```

## 대체 솔루션: Base64 업로드

CORS 문제가 지속되는 경우, 이미지를 Base64로 변환하여 Firestore에 직접 저장하는 방법:

```javascript
const handleImageUploadAlternative = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // 파일을 Base64로 변환
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result;
        
        // Firestore에 저장 (작은 이미지만 권장)
        if (base64String.length < 1048487) { // ~1MB 제한
            // 게시물과 함께 저장하거나 별도 컬렉션에 저장
            const imageDoc = await addDoc(collection(db, "images"), {
                data: base64String,
                fileName: file.name,
                uploadedAt: serverTimestamp()
            });
            
            // 에디터에 이미지 삽입
            const imageMarkdown = `\n![${file.name}](data:${file.type};base64,${base64String.split(',')[1]})\n`;
            // SimpleMDE에 삽입...
        }
    };
    reader.readAsDataURL(file);
};
```

## 웹 호스팅 환경별 설정

### GitHub Pages
- HTTPS 자동 제공
- CORS 문제 없음

### Netlify/Vercel
- 자동 HTTPS
- `_redirects` 또는 `vercel.json`에서 헤더 설정 가능

### 일반 웹 호스팅
- HTTPS 인증서 필수
- `.htaccess` 파일로 CORS 헤더 추가:
```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>
```

## 테스트 방법

### 1. 온라인 테스트 (추천)
- [CodePen](https://codepen.io) 또는 [JSFiddle](https://jsfiddle.net)에서 테스트
- GitHub Pages에 임시 배포하여 테스트

### 2. Firebase Hosting 사용
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 초기화
firebase init hosting

# 배포
firebase deploy --only hosting
```

Firebase Hosting을 사용하면 같은 도메인에서 실행되므로 CORS 문제가 발생하지 않습니다.

## 추가 디버깅

브라우저 개발자 도구에서:
1. Network 탭 확인 - 실패한 요청의 상세 정보
2. Console에서 상세 로그 확인
3. Application 탭 → Storage → IndexedDB에서 Firebase 관련 데이터 확인

이 가이드를 따라 설정하면 웹 환경에서도 이미지 업로드가 정상 작동합니다.
