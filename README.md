# dsh-locale-ko

**DeepSeek Harness(DSH) 비공식 한국어 언어팩**

> Unofficial Korean UI language pack for DeepSeek Harness (DSH), installed as a profile plugin. Not affiliated with DeepSeek or the DSH Desktop community publisher.

DeepSeek Harness의 화면(채팅, 사이드바, 설정, 플러그인, 자동화 작업, 파일 미리보기, 대화상자 등)을 한국어로 바꿔 주는 플러그인입니다.
앱 프로그램 파일은 건드리지 않고, DSH 사용자 프로필에 플러그인으로만 설치되기 때문에 언제든 깨끗하게 제거할 수 있습니다.

## 지원 버전

| 앱 | 버전 | 방식 |
|---|---|---|
| DeepSeek Harness 공식 데스크톱 앱 | 0.2.1-rc.2 | DSH 공식 언어팩 API(`addLanguage`) |
| `dsh web` (명령줄) | 0.2.1-rc.2 | DSH 공식 언어팩 API(`addLanguage`) |
| DSH Desktop (Microsoft Store 커뮤니티판) | 0.2.15 (harness 0.1.1-rc.2) | 번역 런타임 확장 (0.1.x에는 언어팩 API가 없음) |

다른 버전에서는 일부 문구가 영어로 나오거나 동작하지 않을 수 있습니다.

## 설치

필요한 것: [Node.js](https://nodejs.org/) 18 이상, DeepSeek Harness를 한 번 이상 실행한 상태

1. 이 저장소를 내려받습니다(`Code` → `Download ZIP` 후 압축 해제, 또는 `git clone`).
2. 폴더 안에서 아래 명령을 실행합니다.

```bash
node install.mjs
```

3. 공식 데스크톱 앱은 보통 바로 적용됩니다. 적용되지 않으면 앱을 완전히 종료했다가 다시 실행하세요.

설치 스크립트는 아래 순서로 프로필을 찾아 처음 발견한 곳에 설치합니다.

1. `$DSH_HOME/profiles/desktop` (공식 데스크톱 앱, `DSH_HOME` 기본값은 `~/.dsh`)
2. `$DSH_HOME/profiles/web` (`dsh web`)
3. Microsoft Store 커뮤니티판 DSH Desktop의 프로필

설정 → 일반 → 언어에서 `한국어`를 고를 수 있습니다. 운영체제 언어가 한국어이고 따로 고른 언어가 없으면 자동으로 한국어가 선택됩니다.

설치할 때 프로필의 `package.json`과 `cordis.patch.yml`을 처음 한 번 `.bak-<시각>` 파일로 백업합니다.

`cordis.patch.yml`을 직접 고쳐서 `[ ... ]` 형식으로 항목을 적어 둔 경우에는, 파일을 망가뜨리지 않도록 설치를 중단하고 직접 추가할 내용을 안내합니다.

### 다른 프로필에 설치

프로필 폴더를 직접 지정할 수도 있습니다.

```bash
node install.mjs "<DSH_HOME>/profiles/<프로필 이름>"
```

## 제거

```bash
node install.mjs --uninstall
```

제거 후 앱을 다시 실행하면 원래 언어로 돌아갑니다.

## 번역 원칙

- 제품명, 모델명, 기능명, 모드명, 등급명, 기술 용어는 원문 그대로 둡니다. 예: DeepSeek, Cordis, Standard·PTC·Minimal·Creator 모드, Plan 모드, Read Only, Workspace Write, Full access, Auto review, Agent Teams, Base URL, Context window, TTFT, Schema, Payload
- 원문으로 둔 표현에 음역이나 뜻풀이를 덧붙이지 않습니다.
- 일반적인 의미로 쓰인 단어는 문맥에 맞게 번역합니다.
- 대화 본문(AI 답변, 사용자 메시지, 추론 내용, 코드 블록)은 번역하지 않습니다.

## 구성

| 파일 | 역할 |
|---|---|
| `ko-dict.json` | 앱 번역 시스템에 등록된 문구의 한국어 번역 (0.2.1 기준 56개 네임스페이스, 2,566개 키 + 0.1.x 전용 키) |
| `ko-static.json` | 번역 시스템을 거치지 않는 문구(플러그인 설명, 일부 하드코딩 문구 등)의 한국어 번역 |
| `client.template.js` | 플러그인 본체 템플릿 |
| `build.mjs` | 위 파일들로 `dsh-plugin-locale-ko/lib/client.js`를 생성 |
| `install.mjs` | 프로필에 설치/제거 |
| `dsh-plugin-locale-ko/` | 빌드된 플러그인 (바로 설치 가능) |

## 번역 수정하기

`ko-dict.json` 또는 `ko-static.json`을 고친 뒤 빌드하고 다시 설치하세요.

```bash
node build.mjs
```

```bash
node install.mjs
```

오역이나 빠진 문구는 Issue나 Pull Request로 알려 주세요.

## 동작 방식

- **0.2 이상**: DSH가 제공하는 언어팩 API로 `ko` 언어(대체 언어 `en`)를 추가하고, 네임스페이스별 한국어 사전을 등록합니다. 언어 선택은 DSH가 직접 설정에 저장합니다.
- **0.1.x**: 언어팩 API가 없어서 번역 런타임에 `ko`를 끼워 넣습니다. 언어 선택은 브라우저 저장소에 보관합니다.
- 번역 시스템을 거치지 않는 일부 문구는, 화면에 표시된 텍스트가 정확히 일치할 때만 한국어로 바꿉니다. 다른 언어로 바꾸면 즉시 원래 문구로 돌아갑니다.

## 한계

- 앱 자체에 내장된 화면은 번역할 수 없습니다. 공식 데스크톱 앱의 창 메뉴(Application, Edit 등), Microsoft Store 커뮤니티판의 Controller 창이 여기에 해당합니다.
- 설정 → 기본 제공 플러그인 목록의 패키지 설명은 각 패키지의 개발자용 설명이라 공식 중국어판에서도 영어로 나오며, 이 언어팩도 번역하지 않습니다.
- 외부 플러그인과 서버에서 내려오는 일부 문구(도구 이름, 오류 원문 등)는 영어로 남을 수 있습니다.
- 앱이 업데이트되면 새 문구가 영어로 나올 수 있습니다.

## 라이선스

[MIT](LICENSE)

번역의 원문은 MIT 라이선스로 배포되는 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)(Copyright (c) 2026 DeepSeek)의 UI 문구입니다. 자세한 내용은 [NOTICE](NOTICE)를 보세요.
