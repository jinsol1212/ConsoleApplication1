# 라인콜 (lol-helper)

리그 오브 레전드 기본 상식 · 챔피언 정보 · 전투 피해/쿨타임 계산 웹앱.

## 기능

- **기본 상식**: 탑 2/3렙 타이밍, 웨이브, XP, 방어 공식, 스킬 가속 등
- **전투 계산**: 내 챔 vs 상대 — 레벨·아이템·스킬 랭크 기준 평타/스킬 실피해·쿨타임
- **챔피언**: Data Dragon 한글 패치 데이터 (스킬 설명·팁·기본 스탯)

## 데이터 출처

- [Riot Data Dragon](https://developer.riotgames.com/docs/lol) — 패치 버전, 한글 이름/아이콘/스킬 텍스트
- [Meraki Analytics](https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/) — 파싱된 스킬 수치·계수

비공식 팬 툴입니다. Riot Games와 무관합니다.

## 실행

```bash
cd lol-helper
npm install
npm run dev
```

```bash
npm run build
npm run preview
```
