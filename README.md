# dsh-locale-ko

**DSH Desktop(DeepSeek Harness) 비공식 한국어 언어팩**

> Unofficial Korean UI language pack for DSH Desktop / DeepSeek Harness, installed as a profile plugin. Not affiliated with DeepSeek or the DSH Desktop publisher.

DSH Desktop의 Harness 화면(채팅, 사이드바, 설정, 대화상자 등)을 한국어로 바꿔 주는 플러그인입니다.
앱 프로그램 파일은 건드리지 않고, DSH 사용자 프로필에 플러그인으로만 설치되기 때문에 언제든 깨끗하게 제거할 수 있습니다.

## 지원 버전

| 항목 | 버전 |
|---|---|
| DSH Desktop (Microsoft Store) | 0.2.15 |
| DeepSeek Harness | 0.1.1-rc.2 |

다른 버전에서는 일부 문구가 영어로 나오거나 동작하지 않을 수 있습니다.

## 설치

필요한 것: [Node.js](https://nodejs.org/) 18 이상, DSH Desktop을 한 번 이상 실행한 상태

1. 이 저장소를 내려받습니다(`Code` → `Download ZIP` 후 압축 해제, 또는 `git clone`).
2. 폴더 안에서 아래 명령을 실행합니다.

```bash
node install.mjs
```

3. DSH Desktop을 완전히 종료했다가 다시 실행합니다.

설정 → 일반 → 언어에 `한국어`가 추가되고 기본으로 선택됩니다. `中文`이나 `English`를 고르면 그 선택이 유지됩니다.

설치할 때 프로필의 `package.json`과 `cordis.patch.yml`을 처음 한 번 `.bak-<시각>` 파일로 백업합니다.

`cordis.patch.yml`을 직접 고쳐서 `[ ... ]` 형식으로 항목을 적어 둔 경우에는, 파일을 망가뜨리지 않도록 설치를 중단하고 직접 추가할 내용을 안내합니다.

### 다른 프로필에 설치

Microsoft Store 버전이 아니거나 다른 프로필을 쓰는 경우 프로필 폴더를 직접 지정합니다.

```bash
node install.mjs "<DSH_HOME>/profiles/web"
```

## 제거

```bash
node install.mjs --uninstall
```

제거 후 DSH Desktop을 다시 실행하면 원래 언어로 돌아갑니다.

## 번역 원칙

- 제품명, 모델명, 기능명, 모드명, 기술 용어는 원문 그대로 둡니다. 예: DeepSeek, Cordis, Standard·PTC·Minimal·Creator 모드, Plan 모드, Read Only, Workspace Write, Full access, Base URL, Context window, TTFT
- 원문으로 둔 표현에 음역이나 뜻풀이를 덧붙이지 않습니다.
- 일반적인 의미로 쓰인 단어는 문맥에 맞게 번역합니다.
- 대화 본문(AI 답변, 사용자 메시지, 추론 내용, 코드 블록)은 번역하지 않습니다.

## 구성

| 파일 | 역할 |
|---|---|
| `ko-dict.json` | 앱 번역 시스템에 등록된 문구(29개 네임스페이스, 714개 키)의 한국어 번역 |
| `ko-static.json` | 번역 시스템을 거치지 않는 하드코딩 문구(상세 패널, 명령어 설명 등)의 한국어 번역 |
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

- DSH의 클라이언트 번역 런타임(`@deepseek-ai/dsh-client-locale`)에 `ko` 로케일을 추가하고, 문구를 찾을 때 한국어 사전을 먼저 보도록 합니다.
- 번역 시스템을 거치지 않는 일부 하드코딩 문구는, 화면에 표시된 텍스트가 정확히 일치할 때만 한국어로 바꿉니다.

## 한계

- **Controller 창**(DSH Desktop — Controller: 실행 상태, 로그, 업데이트, 플러그인 마켓 버튼)은 실행 파일 안에 내장된 화면이라 번역할 수 없습니다. 이 창은 영어/中文만 지원합니다.
- 앱 내부 구조에 기대는 방식이라, DSH가 업데이트되면 새 문구가 영어로 나오거나 언어팩이 동작하지 않을 수 있습니다.
- 서버에서 내려오는 일부 문구(도구 이름, 플러그인 이름, 오류 원문 등)는 영어로 남을 수 있습니다.

## 라이선스

[MIT](LICENSE)

번역의 원문은 MIT 라이선스로 배포되는 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)(Copyright (c) 2026 DeepSeek)의 UI 문구입니다. 자세한 내용은 [NOTICE](NOTICE)를 보세요.
