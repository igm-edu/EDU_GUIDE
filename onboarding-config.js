/* ============================================================================
   온보딩 연동 설정
   ----------------------------------------------------------------------------
   구글 시트 + Apps Script 연동을 켜려면 아래 값을 채우세요.
   (설정 방법은 README.md 의 "구글 시트 연동" 참고)

   · apiUrl   : Apps Script 웹앱 배포 URL (…/exec 로 끝남). 비우면 로컬 전용 모드.
   · apiToken : 쓰기 보호용 공유 토큰. Apps Script 코드의 TOKEN 과 반드시 동일하게.
   · hubPassword : 허브(index.html) 진입 암호. 빈 문자열("")이면 잠금 해제.

   ※ 정적 사이트라 이 파일은 누구나 열어볼 수 있습니다. 토큰·암호는
     "실수 방지/가벼운 차단" 수준이며 강력한 보안이 아닙니다.
   ============================================================================ */

window.ONBOARDING_CONFIG = {
  apiUrl:      "https://script.google.com/macros/s/AKfycbywYMOZ7Sf01caKC2WrfAi00tHhdFKk9yDIRsmAGTbKYudPfy4QOpYCDeXY_aDf3by8/exec",          // 예) https://script.google.com/macros/s/AKfyc.../exec
  apiToken:    "igm2026",          // 예) igm-onboarding-2026
  hubPassword: "igm2026"
};
